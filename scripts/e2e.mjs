// npm run test:e2e — 載入擴充功能、把 Anthropic API 換成預先寫好的回應，驗證頁面工具、確認框、步數上限、對話歷史。不需要金鑰、不花錢。
import { chromium } from "playwright";
import http from "node:http";
import assert from "node:assert/strict";
import os from "node:os"; import fs from "node:fs"; import path from "node:path";
import { fileURLToPath } from "node:url";

const EXT = fileURLToPath(new URL("../extension", import.meta.url));
const FIXTURE = `<!doctype html><meta charset=utf-8><title>fixture</title>
<body style="margin:0">
<div id=out></div>
<button onclick="out.textContent+='clicked;'">送出測試</button>
<button style="display:none">隱藏按鈕</button>
<a href="#x">一般連結</a>
<label>方案 <select id=sel><option value=a>第一項</option><option value=b>第二項</option></select></label>
<input type=checkbox id=cb aria-label="同意條款">
<div id=card style="cursor:pointer;padding:8px" onclick="out.textContent+='card;'"><span>卡片</span></div>
<button onclick="out.textContent+='deleted;'">刪除帳號</button>
<form id=search onsubmit="event.preventDefault();out.textContent+='search;'"><input name=q placeholder="搜尋"></form>
<form id=login onsubmit="event.preventDefault();out.textContent+='login;'"><input name=u placeholder="帳號"><input type=password name=p placeholder="密碼"><button>登入</button></form>
<div style="height:3000px"></div>
<button>最下面的按鈕</button>
</body>`;
const server = http.createServer((q, r) => { r.setHeader("content-type", "text/html; charset=utf-8"); r.end(FIXTURE); }).listen(0, "127.0.0.1"); // 0＝讓系統挑空的 port
await new Promise((r) => server.once("listening", r));
const PORT = server.address().port;

const sse = (blocks, stop) => {
  const ev = (type, data) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
  let s = ev("message_start", { message: { id: "m", type: "message", role: "assistant", model: "claude-haiku-4-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 1, output_tokens: 1 } } });
  blocks.forEach((b, index) => {
    if (b.type === "tool_use") {
      s += ev("content_block_start", { index, content_block: { type: "tool_use", id: b.id, name: b.name, input: {} } });
      s += ev("content_block_delta", { index, delta: { type: "input_json_delta", partial_json: JSON.stringify(b.input) } });
    } else {
      s += ev("content_block_start", { index, content_block: { type: "text", text: "" } });
      s += ev("content_block_delta", { index, delta: { type: "text_delta", text: b.text } });
    }
    s += ev("content_block_stop", { index });
  });
  s += ev("message_delta", { delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 1 } });
  return s + ev("message_stop", {});
};

const results = []; // 每一步收到的 tool_result
let list = "";
const ref = (label) => { const m = list.match(new RegExp(`\\[(\\d+)\\][^\\n]*"${label}"`)); assert.ok(m, `清單裡找不到 ${label}\n${list}`); return +m[1]; };
const steps = [
  () => ({ name: "read_page", input: { elements: true } }),
  () => { list = results.at(-1); return { name: "click", input: { ref: ref("送出測試") } }; },
  () => ({ name: "type", input: { ref: ref("方案") , text: "第二項" } }),
  () => ({ name: "type", input: { ref: ref("方案"), text: "不存在" } }),
  () => ({ name: "click", input: { ref: ref("卡片") } }),
  () => ({ name: "click", input: { ref: ref("同意條款") } }),
  () => ({ name: "scroll", input: { direction: "down" } }),
  () => ({ name: "click", input: { ref: 999 } }),
  () => ({ name: "click", input: { ref: ref("刪除帳號") } }),
  () => ({ name: "type", input: { ref: ref("搜尋"), text: "貓", submit: true } }),
  () => ({ name: "type", input: { ref: ref("密碼"), text: "x", submit: true } }),
];
let mode = "script", loopCalls = 0, lastToolChoice = null;

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ba-e2e-"));
const ctx = await chromium.launchPersistentContext(dir, { channel: "chromium", headless: !process.env.HEADED, args: [`--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`] });
try {
  let [sw] = ctx.serviceWorkers(); if (!sw) sw = await ctx.waitForEvent("serviceworker");
  const id = new URL(sw.url()).host;
  const test = await ctx.newPage(); await test.goto(`http://127.0.0.1:${PORT}/`);

  await ctx.route("https://api.anthropic.com/**", async (route) => {
    const body = JSON.parse(route.request().postData());
    const last = body.messages.at(-1);
    if (Array.isArray(last.content)) for (const c of last.content) if (c.type === "tool_result") results.push((c.is_error ? "ERR:" : "") + (typeof c.content === "string" ? c.content : JSON.stringify(c.content)));
    if (mode === "loop") {
      loopCalls++; lastToolChoice = body.tool_choice ?? null;
      const t = body.tool_choice?.type === "none" ? sse([{ type: "text", text: "做到一半" }], "end_turn") : sse([{ type: "tool_use", id: `L${loopCalls}`, name: "scroll", input: { direction: "down" } }], "tool_use");
      return route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: t });
    }
    const n = body.messages.filter((m) => m.role === "assistant").length;
    const step = steps[n];
    const text = step ? sse([{ type: "tool_use", id: `t${n}`, ...step() }], "tool_use") : sse([{ type: "text", text: "完成" }], "end_turn");
    await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: text });
  });

  const panel = await ctx.newPage();
  await panel.addInitScript((port) => {
    const orig = chrome.tabs.query.bind(chrome.tabs);
    chrome.tabs.query = () => orig({ url: `http://127.0.0.1:${port}/*` });
  }, PORT);
  const dialogs = [];
  panel.on("dialog", (d) => { dialogs.push(d.message()); d.message().includes("「刪除帳號」") ? d.dismiss() : d.accept(); });
  await panel.goto(`chrome-extension://${id}/sidepanel.html`);
  await panel.evaluate(() => chrome.storage.local.set({ key: "sk-ant-test", model: "claude-haiku-4-5", suggestOn: false }));
  await panel.reload();
  await panel.fill("#input", "測試");
  await panel.click("#send");
  for (let i = 0; i < 60 && results.length < steps.length; i++) await panel.waitForTimeout(250);
  await panel.waitForTimeout(500);

  console.log("---- element list ----\n" + list + "\n----");
  results.forEach((r, i) => console.log(i, r.slice(0, 120).replace(/\n/g, " ⏎ ")));
  assert.equal(results.length, steps.length, "每一步都有 tool_result");
  assert.ok(!list.includes("隱藏按鈕"), "隱藏元素不列");
  assert.ok(list.indexOf("畫面外") < list.indexOf("最下面的按鈕") && list.includes("畫面外"), "畫面外元素排後面");
  assert.ok(!/"卡片"[^\n]*\n[^\n]*"卡片"/.test(list), "卡片只列一次（內層 span 不重複）");
  assert.match(results[3], /^ERR:沒有「不存在」這個選項/);
  assert.match(results[6], /目前在 [1-9]\d*% 處/);
  assert.match(results[7], /^ERR:找不到編號 999/);
  assert.match(results[8], /^ERR:使用者拒絕/);
  console.log("dialogs:", dialogs.map((d) => d.split("\n")[0]));
  assert.equal(dialogs.length, 3, "送出測試、刪除帳號、登入表單各問一次；搜尋框不問");
  assert.ok(dialogs[0].includes("送出測試") && dialogs[1].includes("刪除帳號") && dialogs[2].includes("登入"));
  const state = await test.evaluate(() => ({ out: out.textContent, sel: sel.value, cb: cb.checked }));
  console.log(state);
  assert.deepEqual(state, { out: "clicked;card;search;login;", sel: "b", cb: true });
  const stats1 = await panel.locator(".msg.stats").last().textContent();
  console.log("stats:", stats1);
  assert.match(stats1, /^11 步 · 輸入 12 · 輸出 12 token$/);

  // 步數上限：模型永遠要捲動，第 30 步之後應該改成 tool_choice none、只回文字
  mode = "loop";
  await panel.click("#reset");
  await panel.fill("#input", "loop"); await panel.click("#send");
  for (let i = 0; i < 120 && !(await panel.locator(".msg.stats").count()); i++) await panel.waitForTimeout(250);
  console.log("loopCalls:", loopCalls, "last tool_choice:", lastToolChoice);
  assert.equal(loopCalls, 31);
  assert.deepEqual(lastToolChoice, { type: "none" });
  assert.match(await panel.locator(".msg.stats").textContent(), /^30 步/);

  // 預設技能：新安裝兩個都有；已有技能的舊使用者補上 grill-me、刪掉後不再加回
  const names = async () => (await panel.evaluate(async () => (await chrome.storage.local.get("skills")).skills)).map((x) => x.name);
  assert.deepEqual(await names(), ["頁面摘要", "grill-me"]);
  await panel.evaluate(() => chrome.storage.local.set({ skills: [{ name: "頁面摘要", description: "", body: "x" }], seededSkills: undefined }));
  await panel.evaluate(() => chrome.storage.local.remove("seededSkills"));
  await panel.reload();
  assert.deepEqual(await names(), ["頁面摘要", "grill-me"], "舊使用者補上新的預設技能");
  await panel.evaluate(() => chrome.storage.local.set({ skills: [] }));
  await panel.reload();
  assert.deepEqual(await names(), [], "刪掉的預設技能不會再加回來");

  // 對話歷史：關掉重開側邊欄，從歷史點回來要看得到原本的對話
  const chats = await panel.evaluate(async () => (await chrome.storage.local.get("chats")).chats);
  assert.equal(chats.length, 2);
  assert.deepEqual(chats.map((c) => c.title), ["loop", "測試"]);
  await panel.reload();
  assert.equal(await panel.locator("#log > *").count(), 0, "重開是新對話");
  await panel.click("#open-history");
  await panel.locator("#history-list .skill-row", { hasText: "測試" }).click();
  assert.equal(await panel.locator(".msg.user").first().textContent(), "測試");
  assert.equal(await panel.locator("details.tool").count(), 11);
  assert.equal(await panel.locator('details.tool[data-state="error"]').count(), 3);
  // 還原後接著聊：送出的 messages 要包含原本的歷史
  mode = "script"; steps.length = 0;
  let sentLen = 0;
  await ctx.route("https://api.anthropic.com/**", async (route) => {
    sentLen = JSON.parse(route.request().postData()).messages.length;
    await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: sse([{ type: "text", text: "接著聊" }], "end_turn") });
  });
  await panel.fill("#input", "還記得嗎"); await panel.click("#send");
  for (let i = 0; i < 40 && !sentLen; i++) await panel.waitForTimeout(250);
  assert.equal(sentLen, chats[1].messages.length + 1);
  await panel.waitForTimeout(500);
  const after = await panel.evaluate(async () => (await chrome.storage.local.get("chats")).chats);
  assert.equal(after.length, 2, "接著聊是更新同一筆，不是新增");
  assert.equal(after[0].title, "測試");

  console.log("E2E: all checks passed");
} finally { await ctx.close(); server.close(); fs.rmSync(dir, { recursive: true, force: true }); }
