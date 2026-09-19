// Agent 模式的本機 server：用 Claude Agent SDK（沿用本機 Claude Code 的登入／訂閱）跑 agent，
// 瀏覽器工具以 SDK MCP server 提供，實際操作轉回擴充功能執行。
//
// 協定（NDJSON，一行一個 JSON）：
//   POST /turn        {text, sessionId?, model?} → {type:"text"|"tool_call"|"done"|"error"|"ping", ...}
//   POST /tool-result {id, content, isError}     ← 擴充功能回傳 tool_call 的結果
//   GET  /health
import http from "node:http";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { query, createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { SYSTEM, tools as TOOL_SPECS } from "../src/shared.js";

const PORT = Number(process.env.PORT ?? 8787);
const TOOL_TIMEOUT_MS = 60_000;
// cwd 必須在 repo 外：在 git repo 內 CLI 會把專案脈絡塞進系統提示（reading-agent 實測 +90k token/輪）
const CWD = path.join(os.tmpdir(), "browser-agent-cwd");
fs.mkdirSync(CWD, { recursive: true });

const pending = new Map(); // tool call id → finish(text, isError)

// shared.js 的 JSON schema（只有 string / boolean）→ SDK tool() 要的 zod shape
function zodShape(schema) {
  const required = new Set(schema.required ?? []);
  return Object.fromEntries(Object.entries(schema.properties).map(([key, prop]) => {
    let t = prop.type === "boolean" ? z.boolean() : z.string();
    if (prop.description) t = t.describe(prop.description);
    return [key, required.has(key) ? t : t.optional()];
  }));
}

function browserTools(send, signal) {
  return createSdkMcpServer({
    name: "browser",
    version: "1.0.0",
    tools: TOOL_SPECS.map((spec) => tool(spec.name, spec.description, zodShape(spec.input_schema), (input) =>
      new Promise((resolve) => {
        const id = randomUUID();
        const finish = (text, isError = false) => {
          clearTimeout(timer);
          pending.delete(id);
          resolve({ content: [{ type: "text", text }], isError });
        };
        const timer = setTimeout(() => finish("擴充功能沒有在時限內回傳結果", true), TOOL_TIMEOUT_MS);
        signal.addEventListener("abort", () => finish("已中止", true), { once: true });
        pending.set(id, finish);
        send({ type: "tool_call", id, name: spec.name, input });
      }))),
  });
}

async function handleTurn({ text, sessionId, model }, res) {
  res.writeHead(200, { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" });
  const send = (obj) => { try { res.write(JSON.stringify(obj) + "\n"); } catch {} };
  const ac = new AbortController();
  res.on("close", () => ac.abort()); // 擴充功能按停止／關掉面板 → 連 CLI 子程序一起停
  const ping = setInterval(() => send({ type: "ping" }), 15_000);

  // SDK MCP 工具需要串流輸入；收到 result 前不能結束輸入流
  let endInput;
  const inputDone = new Promise((r) => (endInput = r));
  async function* prompt() {
    yield { type: "user", message: { role: "user", content: text }, parent_tool_use_id: null };
    await inputDone;
  }

  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY; // 走 Claude Code 登入／CLAUDE_CODE_OAUTH_TOKEN，不要意外改用 API 計費

  try {
    const q = query({
      prompt: prompt(),
      options: {
        cwd: CWD,
        env,
        model: model || undefined,
        systemPrompt: SYSTEM,
        settingSources: [], // 不載入使用者的 ~/.claude 設定與 CLAUDE.md
        tools: [], // 關掉所有內建工具（全套 schema 約 30k token/輪），只留瀏覽器工具
        mcpServers: { browser: browserTools(send, ac.signal) },
        allowedTools: TOOL_SPECS.map((t) => `mcp__browser__${t.name}`),
        includePartialMessages: true,
        abortController: ac,
        maxTurns: 50,
        ...(sessionId ? { resume: sessionId } : {}),
      },
    });
    for await (const m of q) {
      if (m.type === "stream_event" && m.event.type === "content_block_delta" && m.event.delta.type === "text_delta") {
        send({ type: "text", text: m.event.delta.text });
      } else if (m.type === "result") {
        endInput();
        const u = m.usage ?? {};
        console.log(`[turn] ${m.subtype} turns=${m.num_turns} in=${u.input_tokens} cache_read=${u.cache_read_input_tokens} cache_write=${u.cache_creation_input_tokens} out=${u.output_tokens}`);
        if (m.subtype === "success") send({ type: "done", sessionId: m.session_id });
        else send({ type: "error", sessionId: m.session_id, error: m.errors?.join("\n") || m.subtype });
      }
    }
  } catch (err) {
    if (!ac.signal.aborted) send({ type: "error", error: err.message });
  } finally {
    endInput();
    clearInterval(ping);
    res.end();
  }
}

function json(res, status, obj) {
  res.writeHead(status, { "content-type": "application/json" }).end(JSON.stringify(obj));
}

http.createServer(async (req, res) => {
  // 只收擴充功能（或本機 curl）的請求：擋掉任何網頁偷打 localhost 盜用你的訂閱
  const origin = req.headers.origin;
  if (origin && !origin.startsWith("chrome-extension://")) return json(res, 403, { error: "forbidden origin" });

  if (req.method === "GET" && req.url === "/health") return json(res, 200, { ok: true, pendingTools: pending.size });
  if (req.method !== "POST") return json(res, 404, { error: "not found" });

  let body;
  try {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    body = JSON.parse(raw);
  } catch {
    return json(res, 400, { error: "bad json" });
  }

  if (req.url === "/turn") {
    if (typeof body.text !== "string" || !body.text) return json(res, 400, { error: "text required" });
    return handleTurn(body, res);
  }
  if (req.url === "/tool-result") {
    const finish = pending.get(body.id);
    if (!finish) return json(res, 404, { error: "unknown tool call" });
    finish(String(body.content), !!body.isError);
    return json(res, 200, { ok: true });
  }
  json(res, 404, { error: "not found" });
}).listen(PORT, "127.0.0.1", () => console.log(`Browser Agent server：http://127.0.0.1:${PORT}`));
