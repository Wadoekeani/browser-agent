// 模型供應商：Anthropic 走 @anthropic-ai/sdk（agent.ts）；其他全部走 OpenAI 相容的 Chat Completions（這個檔案，用 fetch＋SSE 自己寫）。
// 內部訊息維持 Anthropic 格式（歷史、匯出不變）：送出時轉成 OpenAI 格式，回應再轉回 Anthropic 形狀的 content blocks。
//
// 查證（2026-09-19，官方文件）：
// - Gemini：https://ai.google.dev/gemini-api/docs/openai — base URL https://generativelanguage.googleapis.com/v1beta/openai/，
//   Bearer 金鑰，支援 /models（回傳 id 不帶 "models/" 前綴）。文件沒寫 stream_options.include_usage 支不支援。
// - OpenRouter：https://openrouter.ai/docs/quickstart — base URL https://openrouter.ai/api/v1，GET /models。
// - Ollama：https://docs.ollama.com/openai — http://localhost:11434/v1，支援 /v1/models、tools、串流、stream_options.include_usage；金鑰會被忽略。
//   https://docs.ollama.com/faq — 預設只允許 127.0.0.1／0.0.0.0 的 Origin，擴充功能要設 OLLAMA_ORIGINS=chrome-extension://*
//   （macOS：launchctl setenv 後重開 Ollama）。
// - LM Studio：https://lmstudio.ai/docs/developer/openai-compat — http://localhost:1234/v1，支援 /v1/models 與 tools；
//   https://lmstudio.ai/docs/cli/server-start — `lms server start --cors` 開 CORS（預設關）。
// - OpenAI 串流：https://developers.openai.com/api/reference/resources/chat/subresources/completions/streaming-events —
//   delta.tool_calls[] 有 index、id、type、function.name、function.arguments（片段，要依 index 串起來）；
//   finish_reason：stop／length／tool_calls／content_filter；include_usage 時最後一個 chunk 的 choices 可能是空的、帶 usage。
import type { BetaTool } from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { S } from "./store";
import type { Block, Message } from "./history";
import { t, type Key } from "./i18n";

export type ProviderId = "anthropic" | "openai" | "gemini" | "openrouter" | "custom";
export type ProviderConf = { key?: string; baseURL?: string; model?: string };

// 品牌名不翻譯；custom 的名稱走 i18n
export const PROVIDERS: Record<ProviderId, { name: string; baseURL: string; keyURL?: string; keyPlaceholder?: string }> = {
  anthropic: { name: "Anthropic", baseURL: "https://api.anthropic.com", keyURL: "https://console.anthropic.com/settings/keys", keyPlaceholder: "sk-ant-…" },
  openai: { name: "OpenAI", baseURL: "https://api.openai.com/v1", keyURL: "https://platform.openai.com/api-keys", keyPlaceholder: "sk-…" },
  gemini: { name: "Google Gemini", baseURL: "https://generativelanguage.googleapis.com/v1beta/openai", keyURL: "https://aistudio.google.com/apikey", keyPlaceholder: "AIza…" },
  openrouter: { name: "OpenRouter", baseURL: "https://openrouter.ai/api/v1", keyURL: "https://openrouter.ai/keys", keyPlaceholder: "sk-or-…" },
  custom: { name: "", baseURL: "" },
};
export const PROVIDER_IDS = Object.keys(PROVIDERS) as ProviderId[];
export const providerName = (id: ProviderId) => (id === "custom" ? t("provider.custom") : PROVIDERS[id].name);

export const ANTHROPIC_MODELS = [
  { value: "claude-sonnet-5", label: "Sonnet 5", hint: "model.hint.sonnet" },
  { value: "claude-opus-5", label: "Opus 5", hint: "model.hint.opus" },
  { value: "claude-haiku-4-5", label: "Haiku 4.5", hint: "model.hint.haiku" },
] as const satisfies readonly { value: string; label: string; hint: Key }[];

// Haiku 4.5 不支援 effort 與自適應思考
export const isHaiku = (model: string) => model.startsWith("claude-haiku");

export const conf = (id: ProviderId = S.provider) => (S.providers[id] ??= {});

// 只接受 http(s)，去掉結尾的 /；不合格回 null
export function cleanBaseURL(s: string | undefined): string | null {
  try {
    const u = new URL((s ?? "").trim());
    return /^https?:$/.test(u.protocol) ? u.href.replace(/\/+$/, "") : null;
  } catch { return null; }
}
export const baseURL = (id: ProviderId = S.provider) => (id === "custom" ? cleanBaseURL(conf(id).baseURL) : PROVIDERS[id].baseURL);

export function currentModel(id: ProviderId = S.provider) {
  const m = conf(id).model ?? "";
  if (id === "anthropic") return ANTHROPIC_MODELS.some((x) => x.value === m) ? m : "claude-sonnet-5";
  return m;
}

// 能不能開始用：自訂只要位址（本機伺服器不需要金鑰），其他要金鑰
export const ready = (id: ProviderId = S.provider) => (id === "custom" ? !!baseURL(id) : !!conf(id).key?.trim());

// ---------- 錯誤 ----------

export class ProviderError extends Error {
  constructor(message: string, public status?: number) { super(message); }
}

const isLocal = (url: string) => /^https?:\/\/(localhost|127\.|0\.0\.0\.0|\[::1\]|192\.168\.|10\.)/.test(url);

async function httpError(res: Response, url: string): Promise<ProviderError> {
  let msg = "";
  try {
    const text = await res.text();
    try { const j = JSON.parse(text); msg = j?.error?.message ?? j?.error ?? j?.message ?? text; } catch { msg = text; }
  } catch { /* 讀不到 body 就只看狀態碼 */ }
  msg = String(msg).slice(0, 300);
  if ([400, 404, 422].includes(res.status) && /\btools?\b|tool[_ ]?(use|call)|function[_ ]?call/i.test(msg)) return new ProviderError(t("error.noTools"));
  if (res.status === 403 && isLocal(url)) return new ProviderError(t("error.originBlocked"), 403);
  if ([401, 402, 429, 500].includes(res.status)) return new ProviderError(t(`error.${res.status}` as Key), res.status);
  if (res.status === 503 || res.status === 529) return new ProviderError(t("error.529"), res.status);
  return new ProviderError(`HTTP ${res.status}${msg ? `：${msg}` : ""}`, res.status);
}

// 金鑰只放在打給這個供應商 base URL 的請求上
async function call(url: string, init: RequestInit & { key?: string }): Promise<Response> {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (init.key) headers.authorization = `Bearer ${init.key}`;
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers });
  } catch (e: any) {
    if (e?.name === "AbortError") throw e;
    throw new ProviderError(isLocal(url) ? t("error.localOffline", { url: new URL(url).origin }) : t("error.network"));
  }
  if (!res.ok) throw await httpError(res, url);
  return res;
}

// ---------- 模型清單 ----------

export async function listModels(id: ProviderId = S.provider, signal?: AbortSignal): Promise<string[]> {
  const base = baseURL(id);
  if (!base) throw new ProviderError(t("error.badBaseURL"));
  const res = await call(`${base}/models`, { key: conf(id).key?.trim(), signal });
  const j = await res.json();
  return [...new Set<string>((j?.data ?? j?.models ?? []).map((m: any) => String(m.id ?? m.name ?? "")).filter(Boolean))].sort();
}

// ---------- 格式轉換 ----------

export function toolsToOpenAI(tools: BetaTool[]) {
  return tools.map((x) => ({ type: "function", function: { name: x.name, description: x.description, parameters: x.input_schema } }));
}

const str = (c: unknown) => (typeof c === "string" ? c : Array.isArray(c) ? c.map((b: any) => b.text ?? "").join("") : JSON.stringify(c ?? ""));

export function messagesToOpenAI(system: string, messages: Message[]) {
  const out: any[] = [{ role: "system", content: system }];
  for (const m of messages) {
    if (typeof m.content === "string") { out.push({ role: m.role, content: m.content }); continue; }
    if (m.role === "user") {
      // tool 訊息要緊接在帶 tool_calls 的 assistant 後面；同一則裡的文字（例如步數上限提示）放在它們之後
      for (const b of m.content) if (b.type === "tool_result") out.push({ role: "tool", tool_call_id: b.tool_use_id, content: str(b.content) });
      const text = m.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
      if (text) out.push({ role: "user", content: text });
      continue;
    }
    const text = m.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    const calls = m.content.filter((b) => b.type === "tool_use").map((b) => ({ id: b.id, type: "function", function: { name: b.name, arguments: JSON.stringify(b.input ?? {}) } }));
    out.push({ role: "assistant", content: text || (calls.length ? null : ""), ...(calls.length ? { tool_calls: calls } : {}) });
  }
  return out;
}

// ---------- 串流 ----------

export type Turn = { content: Block[]; stop_reason: string; usage: { input: number; cached: number; output: number } };
type Sink = { text: (d: string) => void; thinking: (d: string) => void };

const STOP: Record<string, string> = { stop: "end_turn", length: "max_tokens", tool_calls: "tool_use", function_call: "tool_use", content_filter: "refusal" };

// Anthropic 的 tool_use id 只能是 [A-Za-z0-9_-]：之後換回 Anthropic 接著聊也送得出去
const safeId = (id: string | undefined, i: number) => (id ?? "").replace(/[^\w-]/g, "_") || `call_${i}`;

export async function streamChat(p: { system: string; tools: BetaTool[]; messages: Message[]; model: string; noTools: boolean; signal: AbortSignal }, sink: Sink): Promise<Turn> {
  const base = baseURL();
  if (!base) throw new ProviderError(t("error.badBaseURL"));
  const res = await call(`${base}/chat/completions`, {
    method: "POST", key: conf().key?.trim(), signal: p.signal,
    body: JSON.stringify({
      model: p.model, stream: true, stream_options: { include_usage: true },
      messages: messagesToOpenAI(p.system, p.messages),
      tools: toolsToOpenAI(p.tools),
      ...(p.noTools ? { tool_choice: "none" } : {}),
    }),
  });

  let text = "", finish = "";
  const calls: { id?: string; name?: string; args: string }[] = [];
  const usage = { input: 0, cached: 0, output: 0 };
  const onChunk = (j: any) => {
    if (j.error) throw new ProviderError(String(j.error.message ?? j.error));
    if (j.usage) {
      usage.input = j.usage.prompt_tokens ?? 0;
      usage.cached = j.usage.prompt_tokens_details?.cached_tokens ?? 0;
      usage.output = j.usage.completion_tokens ?? 0;
    }
    const c = j.choices?.[0];
    if (!c) return;
    const d = c.delta ?? {};
    const think = d.reasoning_content ?? d.reasoning; // DeepSeek／OpenRouter／Ollama 的推理模型
    if (typeof think === "string" && think) sink.thinking(think);
    if (typeof d.content === "string" && d.content) { text += d.content; sink.text(d.content); }
    for (const tc of d.tool_calls ?? []) {
      const x = (calls[tc.index ?? calls.length] ??= { args: "" });
      if (tc.id) x.id = tc.id;
      if (tc.function?.name) x.name = tc.function.name;
      if (tc.function?.arguments) x.args += tc.function.arguments;
    }
    if (c.finish_reason) finish = c.finish_reason;
  };

  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  outer: while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    const lines = buf.split(/\r?\n/);
    buf = lines.pop()!;
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") break outer;
      if (data) onChunk(JSON.parse(data));
    }
  }
  reader.cancel().catch(() => {});

  const content: Block[] = [];
  if (text) content.push({ type: "text", text });
  calls.forEach((c, i) => {
    if (!c?.name) return;
    let input: unknown = {};
    try { input = c.args ? JSON.parse(c.args) : {}; } catch { /* 參數不是 JSON：交給工具回錯誤 */ }
    content.push({ type: "tool_use", id: safeId(c.id, i), name: c.name, input });
  });
  return { content, stop_reason: STOP[finish] ?? (content.some((b) => b.type === "tool_use") ? "tool_use" : "end_turn"), usage };
}
