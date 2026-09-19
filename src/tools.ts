// 工具實作：操作分頁。工具定義在 shared.ts。
// 工具回傳（成功或錯誤訊息）是給模型看的，維持繁體中文、不走 i18n；只有使用者會看到的確認框走 t()。
import { listElements, inspectTarget } from "./elements";
import { addMemory, forgetMemory } from "./memory";
import { checkFile } from "./files";
import { fetchPdf, openPdf, pdfText, isScanned, isPdfUrl, viewerFile, toBase64, PdfError, MAX_SCAN_PAGES, MAX_SCAN_BYTES } from "./pdf";
import { S, emit, addItem, setMemories, type AskItem, type AskInput, type ConfirmItem, type NoteItem } from "./store";
import type { Block } from "./history";
import { displayUrl, type Task } from "./shared";
import { t } from "./i18n";

export async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab) throw new Error(t("error.noTab"));
  return tab;
}

export async function inPage<A extends unknown[], R>(tabId: number, func: (...args: A) => R, args?: A): Promise<Awaited<R> | undefined> {
  try {
    const [res] = await chrome.scripting.executeScript({ target: { tabId }, func, args: (args ?? []) as A });
    return res?.result as Awaited<R> | undefined;
  } catch (e: any) {
    const m = String(e?.message ?? e);
    if (/Cannot access|cannot be scripted|chrome:\/\/|extensions gallery|webstore/i.test(m)) {
      throw new Error("這個頁面（瀏覽器內建頁、擴充功能商店、PDF 檢視器等）不允許擴充功能讀取或操作，請告訴使用者換到一般網頁");
    }
    if (/Frame .*removed|No frame|document.*unloaded|navigat/i.test(m)) throw new Error("頁面正在換頁，等一下再 read_page 看結果");
    throw e;
  }
}

function waitLoad(tabId: number, ms = 15000) {
  return new Promise<void>((resolve) => {
    const done = () => { clearTimeout(timer); chrome.tabs.onUpdated.removeListener(onUpdated); resolve(); };
    const onUpdated = (id: number, info: { status?: string }) => { if (id === tabId && info.status === "complete") done(); };
    const timer = setTimeout(done, ms);
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ELEMENT_LIMIT = 150; // 一行約 15 token，150 個約 2k token

type Input = Record<string, any>;

// ref 是 listElements 寫進頁面的 data-ba 編號
function target(input: Input): string {
  if (input.ref != null) return `[data-ba="${Math.floor(input.ref)}"]`;
  if (input.selector) return input.selector;
  throw new Error("要給 ref 或 selector");
}
const notFound = (input: Input) => new Error(input.ref != null
  ? `找不到編號 ${input.ref} 的元素，頁面可能已變動，請重新 read_page elements=true`
  : `找不到元素：${input.selector}`);

// 在對話裡放一張卡片等使用者操作。setup 把「交回答案」的函式掛到卡片上；
// 按停止（signal 中止）時用 onAbort 的值結束，卡片不會一直停在等待中
function waitUser<T>(signal: AbortSignal | undefined, setup: (done: (v: T) => void) => void, onAbort: () => T): Promise<T> {
  return new Promise<T>((resolve) => {
    let finished = false;
    const done = (v: T) => {
      if (finished) return;
      finished = true;
      signal?.removeEventListener("abort", abort);
      resolve(v);
    };
    const abort = () => done(onAbort());
    if (signal?.aborted) return abort();
    signal?.addEventListener("abort", abort);
    setup(done);
  });
}

// 確認卡：卡片在擴充功能自己的頁面裡，網頁碰不到它；沒按「允許」一律不執行（按停止＝拒絕）
async function confirm(card: Omit<ConfirmItem, "id" | "kind" | "state">, signal?: AbortSignal): Promise<boolean> {
  const item = addItem<ConfirmItem>({ kind: "confirm", ...card, state: "waiting" });
  const ok = await waitUser<boolean>(signal, (done) => { item.decide = done; }, () => false);
  item.state = ok ? "allowed" : "denied";
  delete item.decide;
  emit();
  return ok;
}
const DENIED = "使用者拒絕了這個動作。不要換方法重試，停下來問使用者要怎麼做。";

// 可能不可逆的點擊／送出先在對話裡問使用者；判斷在 elements.ts 的 inspectTarget
async function guard(tabId: number, input: Input, submitting: boolean, url: string | undefined, signal?: AbortSignal) {
  const info = await inPage(tabId, inspectTarget, [target(input), submitting]);
  if (!info) throw notFound(input);
  if (!info.risky) return info;
  const ok = await confirm({
    label: info.label || t(submitting ? "confirm.form" : "confirm.noText"), submitting, host: hostOf(url),
    aria: info.aria && info.aria !== info.label ? info.aria : undefined, mismatch: info.mismatch || undefined,
    // 按 Enter 送出：把要送出去的字也給使用者看
    detail: submitting && typeof input.text === "string" ? input.text : undefined,
  }, signal);
  if (!ok) throw new Error(DENIED);
  return info;
}

const hostOf = (url = "") => { try { return new URL(url).hostname; } catch { return url; } };

// 長內容分段回傳：一次最多 S.pageChars 字，後面還有就附註 offset
function slice(body: string, offset: number) {
  const part = body.slice(offset, offset + S.pageChars);
  const end = offset + part.length;
  const note = end < body.length
    ? `\n\n[第 ${offset}–${end} 字，全文 ${body.length} 字。一般摘要讀到這裡就夠；確實需要後面的內容才用 offset=${end} 繼續讀。]`
    : offset > 0 ? `\n\n[第 ${offset}–${end} 字，已讀到結尾。]` : "";
  return part + note;
}

// 這個分頁顯示的是不是 PDF：我們的檢視頁、.pdf 網址、文件型別是 PDF，或注入失敗時問一次 Content-Type
async function pdfSource(tab: chrome.tabs.Tab): Promise<string | null> {
  const url = tab.url ?? "";
  const file = viewerFile(url);
  if (file) return file;
  if (!/^(https?|file):/.test(url)) return null;
  const type = await inPage(tab.id!, () => document.contentType).catch(() => null);
  if (type === "application/pdf" || /\.pdf$/i.test(new URL(url).pathname)) return url;
  return type == null && (await isPdfUrl(url)) ? url : null;
}

const fmtMB = (n: number) => (n < 1048576 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1048576).toFixed(1)} MB`);
const fileName = (url: string) => decodeURIComponent(new URL(url).pathname.split("/").pop() || url);
let pdfCache: { url: string; text: string } | null = null; // 用 offset 接著讀時不用重新下載

// 錯誤同時給使用者看（介面語言）與給模型（繁中）
function userError(text: string, forModel: string): never {
  addItem<NoteItem>({ kind: "error", text });
  throw new Error(forModel);
}

async function readPdf(url: string, title: string, offset: number, signal?: AbortSignal): Promise<string | Block[]> {
  const head = `標題：${title}\n網址：${url}\n（這是 PDF，已抽出文字；每頁以 [第 N 頁] 標記開頭）\n\n`;
  if (pdfCache?.url === url) return head + slice(pdfCache.text, offset);
  let data: ArrayBuffer;
  try {
    data = await fetchPdf(url);
  } catch (e) {
    if (e instanceof PdfError && e.code === "fileAccess") userError(t("pdf.fileAccess"), "擴充功能沒有讀取本機檔案的權限，使用者要到 chrome://extensions 打開「允許存取檔案網址」。已經告訴使用者了，停下來等他設定");
    throw e;
  }
  const doc = await openPdf(data);
  try {
    const text = await pdfText(doc);
    if (!isScanned(text, doc.numPages)) {
      pdfCache = { url, text };
      return head + slice(text, offset);
    }
    // 掃描檔：沒有文字層，只有 Anthropic 能直接吃 PDF（每頁當圖片看，比較貴）
    if (S.provider !== "anthropic") userError(t("pdf.scanUnsupported"), "這是掃描檔（沒有文字層），目前的模型讀不了。已經告訴使用者了，不要再重試");
    if (doc.numPages > MAX_SCAN_PAGES || data.byteLength > MAX_SCAN_BYTES) {
      userError(t("pdf.scanTooLarge", { pages: MAX_SCAN_PAGES, size: fmtMB(MAX_SCAN_BYTES) }), "掃描檔太大，送不出去。已經告訴使用者了");
    }
    const ok = await confirm({
      label: fileName(url), submitting: false, host: hostOf(url) || fileName(url),
      text: t("pdf.scanConfirm", { pages: doc.numPages, size: fmtMB(data.byteLength) }),
    }, signal);
    if (!ok) throw new Error("使用者不同意把掃描檔整份送出。告訴使用者這份 PDF 沒有文字層，沒辦法用便宜的方式讀");
    return [
      { type: "text", text: `標題：${title}\n網址：${url}\n這份 PDF 是掃描檔（${doc.numPages} 頁，沒有文字層），原檔附在下面。` },
      { type: "document", source: { type: "base64", media_type: "application/pdf", data: await toBase64(data) } } as Block,
    ];
  } finally {
    doc.loadingTask.destroy();
  }
}

function askUser(input: Input, signal?: AbortSignal): Promise<string> {
  const q = typeof input.question === "string" ? input.question.trim() : "";
  const options = Array.isArray(input.options) ? input.options.filter((o: any) => typeof o?.label === "string" && o.label.trim()) : [];
  if (!q) throw new Error("question 不能是空的");
  if (options.length < 2 || options.length > 4) throw new Error("options 要有 2–4 個，每個都要有 label");
  const card = addItem<AskItem>({ kind: "ask", input: { question: q, options, multiSelect: !!input.multiSelect } as AskInput, state: "waiting" });
  S.asking = card;
  emit();
  return waitUser<string>(signal, (done) => {
    card.reply = (text, picked) => {
      card.state = "answered";
      card.answer = text;
      card.picked = picked;
      done(picked.length ? `使用者選了：${picked.join("、")}` : `使用者回答：${text}`);
    };
  }, () => { card.state = "cancelled"; return "使用者中斷了"; }).finally(() => {
    delete card.reply;
    if (S.asking === card) S.asking = null;
    emit();
  });
}

// tabId 是這次任務開始時的分頁：使用者中途切到別的分頁，agent 也不會跑去操作那一頁
export async function runTool(name: string, input: Input, tabId: number, task: Task, signal?: AbortSignal): Promise<string | Block[]> {
  const tab = await chrome.tabs.get(tabId).catch(() => {
    throw new Error("任務開始時的分頁已經被關掉了，停止操作並告訴使用者");
  });
  switch (name) {
    case "ask_user":
      return askUser(input, signal);
    case "create_file": {
      const file = checkFile(input);
      addItem({ kind: "file", ...file, description: typeof input.description === "string" ? input.description : undefined });
      return `已建立檔案 ${file.filename}，使用者可以在對話裡的檔案卡片下載`;
    }
    case "remember":
    case "forget": {
      const before = S.memories;
      const { list, result } = (name === "remember" ? addMemory : forgetMemory)(before, input.text);
      // 讀過網頁內容之後才要寫記憶：可能是網頁誘導的（記憶會跟著之後每一次對話），先給使用者看要記的那句
      if (name === "remember" && list !== before && task.tainted) {
        const text = list.find((m) => !before.includes(m))!;
        if (!(await confirm({ label: text, submitting: false, host: hostOf(tab.url), text: t("confirm.remember"), detail: text }, signal))) {
          throw new Error("使用者不同意記下這句。不要再嘗試記住它");
        }
        if (S.memories !== before) return "記憶在等待確認時被改過了，請重新呼叫 remember"; // 等待期間在設定頁改過
      }
      if (list !== before) {
        await setMemories(list);
        // 記了／忘了哪一句：新增的是 list 多出來的那條，刪掉的是 before 少掉的那條
        const text = name === "remember" ? list.find((m) => !before.includes(m)) : before.find((m) => !list.includes(m));
        if (text) addItem({ kind: "memory", op: name, text });
      }
      return result;
    }
    case "use_skill": {
      const skill = S.skills.find((s) => s.name === input.name);
      if (!skill) throw new Error(`沒有名為「${input.name}」的技能，可用的有：${S.skills.map((s) => s.name).join("、") || "（無）"}`);
      return skill.body;
    }
    case "read_page": {
      task.tainted = true;
      const pdf = await pdfSource(tab);
      if (pdf) return readPdf(pdf, tab.title ?? "", Math.max(0, Math.floor(input.offset ?? 0)), signal);
      if (input.elements) return `標題：${tab.title}\n網址：${tab.url}\n\n${await inPage(tab.id!, listElements, [ELEMENT_LIMIT])}`;
      const body = await inPage(tab.id!, (sel: string | null, html: boolean) => {
        if (sel || html) {
          const el = sel ? document.querySelector(sel) : document.body;
          return el ? (html ? el.outerHTML : (el as HTMLElement).innerText) : null;
        }
        // 沒指定 selector：只取主要內容，去掉導覽、頁首頁尾、側欄、參考文獻這類雜訊
        const root = document.querySelector("article, main, [role=main], #content, #main") ?? document.body;
        const clone = root.cloneNode(true) as HTMLElement;
        clone.querySelectorAll([
          "script", "style", "noscript", "template", "svg", "nav", "header", "footer", "aside", "form",
          "[role=navigation]", "[role=banner]", "[role=contentinfo]", "[aria-hidden=true]", "[hidden]",
          ".navbox", ".reflist", ".references", "sup.reference", ".mw-editsection", ".mw-jump-link", ".catlinks",
        ].join(",")).forEach((n) => n.remove());
        // innerText 要有版面才會保留換行：暫時放到畫面外量完就移除
        clone.style.cssText = "position:absolute;left:-99999px;top:0;width:800px";
        document.body.append(clone);
        const text = clone.innerText;
        clone.remove();
        return text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
      }, [input.selector ?? null, !!input.html]);
      if (body == null) throw new Error(`找不到元素：${input.selector}`);
      return `標題：${tab.title}\n網址：${tab.url}\n\n${slice(body, Math.max(0, Math.floor(input.offset ?? 0)))}`;
    }
    case "navigate": {
      if (!/^https?:\/\//i.test(input.url)) throw new Error("只接受 http(s) 網址");
      let dest: URL;
      try { dest = new URL(input.url); } catch { throw new Error("網址格式不對"); }
      // 跨網站前往：網址本身就能把資料帶出去（?q=對話內容），不在允許清單就問使用者，卡片上顯示完整網址
      if (!task.origins.has(dest.origin)) {
        if (!(await confirm({ label: dest.hostname, submitting: false, host: dest.hostname, text: t("confirm.navigate"), detail: displayUrl(dest.href) }, signal))) throw new Error(DENIED);
        task.origins.add(dest.origin);
      }
      task.tainted = true;
      const loaded = waitLoad(tab.id!);
      await chrome.tabs.update(tab.id!, { url: input.url });
      await loaded;
      const now = await chrome.tabs.get(tab.id!).catch(() => null);
      addItem({ kind: "page", title: now?.title || input.url, url: now?.url || input.url, tabId: tab.id! });
      return `已前往 ${input.url}`;
    }
    case "click": {
      const info = await guard(tab.id!, input, false, tab.url, signal);
      // 點連結到別的網站跟 navigate 一樣能把資料帶出去（網頁可以先把 href 改成帶資料的網址）：同一套允許清單
      let dest: URL | null = null;
      try { dest = new URL(info.href ?? ""); } catch { /* 不是連結 */ }
      if (dest && /^https?:$/.test(dest.protocol) && !task.origins.has(dest.origin)) {
        if (!(await confirm({ label: dest.hostname, submitting: false, host: dest.hostname, text: t("confirm.navigate"), detail: displayUrl(dest.href) }, signal))) throw new Error(DENIED);
        task.origins.add(dest.origin);
      }
      const ok = await inPage(tab.id!, (sel: string) => {
        const el = document.querySelector(sel) as HTMLElement | null;
        if (!el) return false;
        el.scrollIntoView({ block: "center" });
        el.click();
        return true;
      }, [target(input)]);
      if (!ok) throw notFound(input);
      await sleep(800); // 讓點擊觸發的導頁 / 重繪有時間發生
      return "已點擊";
    }
    case "type": {
      if (input.submit) await guard(tab.id!, input, true, tab.url, signal);
      const ok = await inPage(tab.id!, (sel: string, text: string, submit: boolean) => {
        const el = document.querySelector(sel) as any;
        if (!el) return null;
        el.focus();
        if (el.isContentEditable) {
          el.textContent = text;
        } else {
          let value = text;
          if (el.tagName === "SELECT") {
            const t = text.trim();
            const opts = [...el.options] as HTMLOptionElement[];
            const opt = opts.find((o) => o.text.trim() === t || o.value === t) ?? opts.find((o) => o.text.includes(t));
            if (!opt) return `沒有「${t}」這個選項，可選：${opts.map((o) => o.text.trim()).join("、")}`;
            value = opt.value;
          }
          // 走原生 setter，React 等框架才收得到變更
          Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value")!.set!.call(el, value);
        }
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
        if (submit) el.form ? el.form.requestSubmit() : el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
        return true;
      }, [target(input), input.text, !!input.submit]);
      if (ok == null) throw notFound(input);
      if (typeof ok === "string") throw new Error(ok);
      if (input.submit) await sleep(800);
      return "已輸入";
    }
    case "scroll": {
      const pos = await inPage(tab.id!, (sel: string | null, up: boolean) => {
        if (sel) {
          const el = document.querySelector(sel);
          if (!el) return null;
          el.scrollIntoView({ block: "center" });
          return "已捲到該元素";
        }
        const pct = (top: number, max: number) => (max > 0 ? `目前在 ${Math.round((top / max) * 100)}% 處` : "頁面不能捲動");
        const before = scrollY;
        scrollBy(0, (up ? -0.8 : 0.8) * innerHeight);
        if (scrollY !== before) return pct(scrollY, document.documentElement.scrollHeight - innerHeight);
        // 視窗沒動：很多網頁應用是內層容器在捲，從畫面中央往上找可捲動的祖先
        for (let el = document.elementFromPoint(innerWidth / 2, innerHeight / 2); el; el = el.parentElement) {
          const oy = getComputedStyle(el).overflowY;
          if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight) {
            el.scrollBy(0, (up ? -0.8 : 0.8) * el.clientHeight);
            return pct(el.scrollTop, el.scrollHeight - el.clientHeight);
          }
        }
        return up ? "已在最上方" : "已在最下方";
      }, [input.ref != null || input.selector ? target(input) : null, input.direction === "up"]);
      if (pos == null) throw notFound(input);
      await sleep(500); // 給延遲載入的內容時間出現
      return pos;
    }
    default:
      throw new Error(`未知工具：${name}`);
  }
}
