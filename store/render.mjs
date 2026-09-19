// 產生 Chrome Web Store 上架用的圖：logo 候選、比較圖、宣傳圖塊、截圖。可重跑，只寫 store/ 底下。
//   node store/render.mjs                 全部
//   node store/render.mjs icons|promo|screens
//   node store/render.mjs promo --logo=a  宣傳圖塊／截圖外框用哪個候選（a|b|c；不給＝灰色佔位）
// screens 需要先 `npm run build`（載入 extension/ 的真實 UI，Anthropic API 用假的 SSE 回應，不需要金鑰）。
import { chromium } from "playwright";
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { fileURLToPath } from "node:url";

const STORE = path.dirname(fileURLToPath(import.meta.url));
const EXT = path.join(STORE, "../extension");
const CAND = path.join(STORE, "icons/candidates");
const args = process.argv.slice(2);
const only = args.find((a) => !a.startsWith("--"));
const logoArg = args.find((a) => a.startsWith("--logo="))?.slice(7);
const LOGOS = { a: "a-panel-cursor", b: "b-page-dot", c: "c-chat-cursor" };
const svg = (k) => fs.readFileSync(path.join(CAND, `${LOGOS[k]}.svg`), "utf8");
const dataUri = (file) => `data:image/png;base64,${fs.readFileSync(file).toString("base64")}`;
const logoSvg = logoArg ? svg(logoArg) : `<svg viewBox="0 0 96 96"><rect width="96" height="96" rx="22" fill="#CBD5E1"/><text x="48" y="58" font-size="26" text-anchor="middle" fill="#64748B" font-family="sans-serif">LOGO</text></svg>`;
const FONT = `font-family: Inter, "SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif;`;

const browser = await chromium.launch();
const shoot = async (html, w, h, out, { transparent = false } = {}) => {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  await p.setContent(html, { waitUntil: "load" });
  await p.screenshot({ path: out, omitBackground: transparent });
  await p.close();
  console.log("wrote", path.relative(STORE, out));
};

// ---------- 1. logo 候選 ----------
// 128px 照官方規格：96x96 圖形＋每邊 16px 透明留白。小尺寸沒有這條規則，留白縮小讓圖形夠大。
const PAD = { 128: 16, 48: 3, 32: 2, 16: 1 };
async function icons() {
  for (const k of Object.keys(LOGOS)) for (const [size, pad] of Object.entries(PAD)) {
    const html = `<style>html,body{margin:0;background:transparent}svg{position:absolute;left:${pad}px;top:${pad}px;width:${size - 2 * pad}px;height:${size - 2 * pad}px}</style>${svg(k)}`;
    await shoot(html, +size, +size, path.join(CAND, `${LOGOS[k]}-${size}.png`), { transparent: true });
  }
  // 比較圖：每個候選 × 淺／深底，實際大小 128/48/32/16，加上 16px 放大 8 倍（像素邊界看得到）與假工具列
  const cell = (k, bg, fg) => {
    const f = (s) => dataUri(path.join(CAND, `${LOGOS[k]}-${s}.png`));
    return `<div class="cell" style="background:${bg};color:${fg}">
      <div class="row">${[128, 48, 32, 16].map((s) => `<figure><img src="${f(s)}" width="${s}" height="${s}"><figcaption>${s}</figcaption></figure>`).join("")}</div>
      <div class="row"><figure><img class="px" src="${f(16)}" width="128" height="128"><figcaption>16px ×8</figcaption></figure>
        <figure><div class="bar" style="background:${bg === "#fff" ? "#F1F3F4" : "#35363A"}"><span></span><span></span><img src="${f(16)}" width="16" height="16"><span></span></div><figcaption>toolbar (actual size)</figcaption></figure></div></div>`;
  };
  const names = { a: "A · Side panel + cursor", b: "B · Page with indicator dot", c: "C · Chat bubble + cursor" };
  const html = `<style>body{margin:0;${FONT}background:#E5E7EB}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:24px}
    h2{font-size:18px;margin:0 0 8px}.cell{padding:20px;border-radius:12px;margin-bottom:12px}.row{display:flex;gap:20px;align-items:flex-end;margin-bottom:14px}
    figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px}figcaption{font-size:11px;opacity:.7}
    .px{image-rendering:pixelated}.bar{display:flex;gap:10px;align-items:center;padding:8px 12px;border-radius:8px}.bar span{width:16px;height:16px;border-radius:50%;background:#9AA0A6;opacity:.6}</style>
    <div class="grid">${Object.keys(LOGOS).map((k) => `<div><h2>${names[k]}</h2>${cell(k, "#fff", "#111")}${cell(k, "#202124", "#eee")}</div>`).join("")}</div>`;
  await shoot(html, 1500, 820, path.join(CAND, "comparison.png"));
}

// ---------- 2. 宣傳圖塊（官方建議：飽和色、填滿、少字、縮一半還看得懂） ----------
async function promo() {
  const badge = fs.readFileSync(path.join(STORE, "../docs/supported-by-iosoftware.svg"), "utf8").replaceAll("#6b7280", "#fff");
  const bg = "linear-gradient(135deg,#1E3A8A 0%,#2563EB 55%,#0EA5E9 100%)";
  const panelShot = path.join(STORE, "screenshots/_panel-summary.png");
  const hasPanel = fs.existsSync(panelShot);
  const small = `<style>body{margin:0;width:440px;height:280px;background:${bg};${FONT}color:#fff;display:flex;flex-direction:column;justify-content:center;padding:0 36px;box-sizing:border-box}
    .logo svg{width:72px;height:72px}h1{font-size:40px;margin:14px 0 6px;letter-spacing:-.5px}p{font-size:19px;margin:0;opacity:.92}.badge{position:absolute;left:36px;bottom:20px;opacity:.8}.badge svg{display:block;height:18px;width:auto}</style>
    <div class="logo">${logoSvg}</div><h1>Browser Agent</h1><p>AI that reads and works on your tab</p>
    <div class="badge">${badge}</div>`;
  await shoot(small, 440, 280, path.join(STORE, "promo/small-440x280.png"));
  const marquee = `<style>body{margin:0;width:1400px;height:560px;background:${bg};${FONT}color:#fff;overflow:hidden;position:relative}
    .l{position:absolute;left:96px;top:0;bottom:0;width:640px;display:flex;flex-direction:column;justify-content:center}
    .logo svg{width:96px;height:96px}h1{font-size:68px;margin:22px 0 12px;letter-spacing:-1px}p{font-size:28px;margin:0;opacity:.92;line-height:1.35}
    .shot{position:absolute;right:96px;top:56px;width:400px;border-radius:14px;box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden;background:#fff}
    .shot img{display:block;width:400px}.badge{position:absolute;left:96px;bottom:40px;opacity:.8}.badge svg{display:block;height:28px;width:auto}</style>
    <div class="l"><div class="logo">${logoSvg}</div><h1>Browser Agent</h1><p>Chat in the side panel. It reads, clicks and fills in the page for you — with your own AI key.</p></div><div class="badge">${badge}</div>
    ${hasPanel ? `<div class="shot"><img src="${dataUri(panelShot)}"></div>` : ""}`;
  await shoot(marquee, 1400, 560, path.join(STORE, "promo/marquee-1400x560.png"));
}

// ---------- 3. 截圖：真的擴充功能 UI（假 Anthropic SSE）＋示範網頁，合成成 1280x800 ----------
const PANEL_W = 400, CHROME_H = 80, W = 1280, H = 800, PANEL_HEAD = 40;
const PAGE_W = W - PANEL_W, PAGE_H = H - CHROME_H, PANEL_H = PAGE_H - PANEL_HEAD;
const DEMO = {
  "https://dailyledger.example/": fs.readFileSync(path.join(STORE, "src/demo-article.html"), "utf8"),
  "https://parcelpine.example/laptops": fs.readFileSync(path.join(STORE, "src/demo-shop.html"), "utf8"),
  "https://parcelpine.example/checkout": fs.readFileSync(path.join(STORE, "src/demo-checkout.html"), "utf8"),
};
const sse = (blocks, stop, usage = { in: 3180, out: 214 }) => {
  const ev = (type, data) => `event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`;
  let s = ev("message_start", { message: { id: "m", type: "message", role: "assistant", model: "claude-sonnet-5", content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: usage.in, output_tokens: 1 } } });
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
  s += ev("message_delta", { delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: usage.out } });
  return s + ev("message_stop", {});
};

const CSV = `Model,Price (USD),Weight (kg),Battery (h),Screen\nTrailbook Air 13,999,1.12,18,13.6" 2560x1664\nTrailbook Pro 14,1499,1.48,15,14.2" 3024x1964\nSummit 15 Studio,1299,1.71,11,15.3" 2880x1864\n`;
const SCENES = [
  { name: "1-summary", url: "https://dailyledger.example/", prompt: "Summarize this article in a few bullet points", script: [
    { type: "tool_use", id: "s1", name: "read_page", input: {} },
    { type: "text", text: "**Night trains are back — here's the short version:**\n\n- **Demand doubled** since 2021: sleeper routes now carry about 1.4 million passengers a year across 11 countries.\n- **Why now:** travelers want to skip short-haul flights, and a night train saves a hotel night.\n- **The bottleneck is rolling stock** — only two factories build new sleeper cars, so most routes run on refurbished 1990s coaches.\n- **Prices** start at €39 for a seat and €119 for a private cabin, but popular summer routes sell out weeks ahead.\n- **Next:** three new routes (Berlin–Stockholm, Paris–Rome, Vienna–Split) launch in 2027.\n\nWant me to find tickets for one of these routes?" },
  ], wait: ".msg.stats" },
  { name: "2-skills", url: "https://dailyledger.example/", slash: true, wait: "#slash .slash-item" },
  { name: "3-ask", url: "https://parcelpine.example/laptops", prompt: "Which of these laptops should I get for traveling?", script: [
    { type: "tool_use", id: "a0", name: "read_page", input: {} },
    { type: "tool_use", id: "a1", name: "ask_user", input: { question: "What matters most to you on the road?", options: [
      { label: "Battery life", description: "Work a full day unplugged", recommended: true },
      { label: "Light weight", description: "Under 1.2 kg in your bag" },
      { label: "Bigger screen", description: "Room for side-by-side windows" },
    ] } },
  ], wait: ".ask-card" },
  { name: "4-confirm", url: "https://parcelpine.example/checkout", prompt: "Place the order for the Trailbook Air 13", script: [
    { type: "tool_use", id: "c1", name: "read_page", input: { elements: true } },
    (last) => ({ type: "tool_use", id: "c2", name: "click", input: { ref: +last.match(/\[(\d+)\][^\n]*"Place order/)[1] } }),
  ], wait: ".confirm-card[data-state=waiting]" },
  { name: "5-csv", url: "https://parcelpine.example/laptops", prompt: "Compare the three laptops in a table and give me a CSV", script: [
    { type: "tool_use", id: "f0", name: "read_page", input: {} },
    { type: "tool_use", id: "f1", name: "create_file", input: { filename: "laptops.csv", content: CSV, description: "Price, weight, battery and screen for the 3 laptops" } },
    { type: "text", text: "| Model | Price | Weight | Battery |\n|---|---|---|---|\n| Trailbook Air 13 | $999 | 1.12 kg | 18 h |\n| Trailbook Pro 14 | $1,499 | 1.48 kg | 15 h |\n| Summit 15 Studio | $1,299 | 1.71 kg | 11 h |\n\nThe **Air 13** is the lightest and lasts longest; the **Pro 14** has the sharpest screen. The CSV above opens in Excel or Google Sheets." },
  ], wait: ".file-card" },
];

async function screens() {
  if (!fs.existsSync(path.join(EXT, "sidepanel.js"))) throw new Error("先跑 npm run build");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ba-store-"));
  const ctx = await chromium.launchPersistentContext(dir, { channel: "chromium", headless: true, locale: "en-US", colorScheme: "light", args: ["--lang=en-US", `--disable-extensions-except=${EXT}`, `--load-extension=${EXT}`] });
  try {
    let [sw] = ctx.serviceWorkers(); if (!sw) sw = await ctx.waitForEvent("serviceworker");
    const id = new URL(sw.url()).host;
    await ctx.route(/\.example\//, (r) => r.fulfill({ contentType: "text/html; charset=utf-8", body: DEMO[r.request().url()] ?? "not found" }));
    let script = [], calls = 0, lastResult = "";
    await ctx.route("https://api.anthropic.com/**", async (route) => {
      const body = JSON.parse(route.request().postData());
      const m = body.messages.at(-1);
      const r = Array.isArray(m.content) && m.content.find((c) => c.type === "tool_result");
      if (r) lastResult = typeof r.content === "string" ? r.content : JSON.stringify(r.content);
      const next = script[calls++];
      const block = typeof next === "function" ? next(lastResult) : next;
      const out = !block ? sse([{ type: "text", text: "Done." }], "end_turn") : sse([block], block.type === "tool_use" ? "tool_use" : "end_turn");
      await route.fulfill({ status: 200, headers: { "content-type": "text/event-stream" }, body: out });
    });
    const page = await ctx.newPage(); await page.setViewportSize({ width: PAGE_W, height: PAGE_H });
    const panel = await ctx.newPage(); await panel.setViewportSize({ width: PANEL_W, height: PANEL_H });
    await panel.addInitScript(() => { const q = chrome.tabs.query.bind(chrome.tabs); chrome.tabs.query = () => q({ url: "https://*.example/*" }); });
    await panel.goto(`chrome-extension://${id}/sidepanel.html`);
    await panel.evaluate(() => chrome.storage.local.set({ consent: true, key: "sk-ant-demo", model: "claude-sonnet-5", suggestOn: false, lang: "en", memories: [] }));
    for (const sc of SCENES) {
      await page.goto(sc.url);
      await panel.reload();
      script = sc.script ?? []; calls = 0;
      if (sc.slash) await panel.locator("#input").pressSequentially("/");
      else { await panel.fill("#input", sc.prompt); await panel.click("#send"); }
      await panel.locator(sc.wait).first().waitFor({ state: "visible", timeout: 15000 });
      await panel.waitForTimeout(600);
      await panel.evaluate(() => { const l = document.querySelector("#log"); l?.scrollTo?.(0, l.scrollHeight); });
      await panel.waitForTimeout(300);
      const text = await panel.locator("body").innerText();
      if (/error|failed|invalid/i.test(text.slice(0, 4000)) && !sc.slash) console.warn(`⚠ ${sc.name}: panel text contains an error word — check the image`);
      const pShot = path.join(dir, `${sc.name}-panel.png`), wShot = path.join(dir, `${sc.name}-page.png`);
      await panel.screenshot({ path: pShot }); await page.screenshot({ path: wShot });
      if (sc.name === "1-summary") fs.copyFileSync(pShot, path.join(STORE, "screenshots/_panel-summary.png"));
      await compose(sc, wShot, pShot);
      if (sc.name === "4-confirm") await panel.locator(".confirm-deny").click();
      await panel.waitForTimeout(300);
    }
  } finally { await ctx.close(); fs.rmSync(dir, { recursive: true, force: true }); }
}

// 中性的瀏覽器外框（不是任何真實瀏覽器的品牌外觀）＋左邊網頁＋右邊側邊欄
async function compose(sc, pageShot, panelShot) {
  const host = new URL(sc.url).host + new URL(sc.url).pathname.replace(/\/$/, "");
  const html = `<style>body{margin:0;width:${W}px;height:${H}px;${FONT}background:#DEE1E6;overflow:hidden}
    .tabs{height:40px;display:flex;align-items:flex-end;padding-left:80px;gap:4px}.dots{position:absolute;left:16px;top:14px;display:flex;gap:8px}.dots i{width:12px;height:12px;border-radius:50%;background:#B9BEC6;display:block}
    .tab{background:#fff;height:32px;width:220px;border-radius:10px 10px 0 0;font-size:12px;display:flex;align-items:center;padding:0 12px;color:#3C4043;gap:8px}
    .tab b{width:14px;height:14px;border-radius:3px;background:#94A3B8;display:block}.tab.off{background:transparent}
    .bar{height:40px;background:#fff;display:flex;align-items:center;gap:12px;padding:0 12px;border-bottom:1px solid #E3E5E8}
    .url{flex:1;height:28px;border-radius:14px;background:#F1F3F4;display:flex;align-items:center;padding:0 14px;font-size:13px;color:#3C4043}
    .ext{width:18px;height:18px}.ext svg{width:18px;height:18px}.nav{color:#9AA0A6;font-size:15px;letter-spacing:10px}
    .main{display:flex;height:${PAGE_H}px}.pg{width:${PAGE_W}px;height:${PAGE_H}px;display:block}
    .side{width:${PANEL_W}px;border-left:1px solid #DADCE0;background:#fff}.head{height:${PANEL_HEAD}px;display:flex;align-items:center;gap:8px;padding:0 12px;font-size:13px;font-weight:600;color:#3C4043;border-bottom:1px solid #EEF0F2}
    .head svg{width:18px;height:18px}.head .x{margin-left:auto;color:#9AA0A6;font-weight:400}.side img{display:block}</style>
    <div class="dots"><i></i><i></i><i></i></div>
    <div class="tabs"><div class="tab"><b></b>${DEMO[sc.url].match(/<title>(.*?)<\/title>/)[1]}</div><div class="tab off"><b></b>New tab</div></div>
    <div class="bar"><span class="nav">‹ › ↻</span><div class="url">${host}</div><span class="ext">${logoSvg}</span></div>
    <div class="main"><img class="pg" src="${dataUri(pageShot)}"><div class="side"><div class="head">${logoSvg}Browser Agent<span class="x">✕</span></div><img src="${dataUri(panelShot)}" width="${PANEL_W}" height="${PANEL_H}"></div></div>`;
  await shoot(html, W, H, path.join(STORE, `screenshots/${sc.name}.png`));
}

try {
  if (!only || only === "icons") await icons();
  if (!only || only === "screens") await screens();
  if (!only || only === "promo") await promo();
} finally { await browser.close(); }
