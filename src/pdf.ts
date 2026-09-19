// PDF：Chrome 內建的 PDF 檢視器不能注入腳本，改由擴充功能自己抓原檔、用 pdf.js 抽文字。
// pdf.js 很大（主程式＋worker 約 1.6 MB），只在真的碰到 PDF 時才動態 import（esbuild 切成獨立 chunk）。
//
// 查證（2026-09-20）：
// - pdfjs-dist 6.3.289（npm latest）：getDocument({ data, cMapUrl, standardFontDataUrl })；
//   GlobalWorkerOptions.workerSrc 指到打包進 extension/ 的 worker（見 scripts/build.mjs），用 chrome.runtime.getURL 取網址。
// - Claude API PDF：https://platform.claude.com/docs/en/build-with-claude/pdf-support —
//   { type:"document", source:{ type:"base64", media_type:"application/pdf", data } }；整個請求上限 32 MB、
//   100 頁（context 不到 1M 時）；每頁同時當文字與圖片處理，約 1,500–3,000 token＋圖片的費用。
//   https://platform.claude.com/docs/en/agents-and-tools/tool-use/handle-tool-calls — tool_result 的 content 可以放 document block。
import type { PDFDocumentProxy } from "pdfjs-dist";

export const MAX_SCAN_PAGES = 100;
export const MAX_SCAN_BYTES = 20 * 1024 * 1024; // base64 後約 27 MB，留空間給對話其他內容（請求上限 32 MB）

export class PdfError extends Error {
  constructor(message: string, public code: "fileAccess" | "fetch") { super(message); }
}

const viewerURL = () => chrome.runtime.getURL("viewer.html");
export const viewerFor = (url: string) => `${viewerURL()}?file=${encodeURIComponent(url)}`;

// 擴充功能自己的檢視頁 → 它開的那份 PDF 網址
export function viewerFile(url = ""): string | null {
  if (!url.startsWith(viewerURL())) return null;
  return new URL(url).searchParams.get("file");
}

const sniffed = new Map<string, boolean>();
// 網址是不是 PDF：.pdf 結尾直接算；其他 http(s) 問一次 Content-Type（arxiv.org/pdf/… 這類沒有副檔名）
export async function isPdfUrl(url = ""): Promise<boolean> {
  if (viewerFile(url)) return true;
  let u: URL;
  try { u = new URL(url); } catch { return false; }
  if (/\.pdf$/i.test(u.pathname)) return /^(https?|file):$/.test(u.protocol);
  if (!/^https?:$/.test(u.protocol)) return false;
  if (!sniffed.has(url)) {
    const type = await fetch(url, { method: "HEAD", credentials: "include" }).then((r) => r.headers.get("content-type") ?? "", () => "");
    sniffed.set(url, /application\/pdf/i.test(type));
  }
  return sniffed.get(url)!;
}

// file:// 要使用者在擴充功能詳細資料頁打開「允許存取檔案網址」；fetch 不支援 file:，用 XHR
export async function fetchPdf(url: string): Promise<ArrayBuffer> {
  if (url.startsWith("file:")) {
    if (!(await chrome.extension.isAllowedFileSchemeAccess())) throw new PdfError("file access off", "fileAccess");
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open("GET", url);
      x.responseType = "arraybuffer";
      x.onload = () => (x.response ? resolve(x.response) : reject(new PdfError("讀不到這個本機檔案", "fetch")));
      x.onerror = () => reject(new PdfError("讀不到這個本機檔案", "fetch"));
      x.send();
    });
  }
  const res = await fetch(url, { credentials: "include" }).catch(() => null);
  if (!res?.ok) throw new PdfError(`下載 PDF 失敗${res ? `（HTTP ${res.status}）` : ""}`, "fetch");
  return res.arrayBuffer();
}

export async function pdfjs() {
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL("pdfjs/pdf.worker.min.mjs");
  return lib;
}

export async function openPdf(data: ArrayBuffer): Promise<PDFDocumentProxy> {
  const lib = await pdfjs();
  return lib.getDocument({
    data: new Uint8Array(data.slice(0)), // pdf.js 會把 buffer 轉移給 worker，留一份原檔給掃描檔用
    cMapUrl: chrome.runtime.getURL("pdfjs/cmaps/"), cMapPacked: true,
    standardFontDataUrl: chrome.runtime.getURL("pdfjs/standard_fonts/"),
  }).promise;
}

// 每頁前面標「[第 N 頁]」，模型才講得出出處
export async function pdfText(doc: PDFDocumentProxy): Promise<string> {
  const out: string[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const { items } = await page.getTextContent();
    const text = items.map((i) => ("str" in i ? i.str + (i.hasEOL ? "\n" : "") : "")).join("");
    out.push(`[第 ${n} 頁]\n${text.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()}`);
    page.cleanup();
  }
  return out.join("\n\n");
}

// 沒有文字層＝掃描檔（掃描檔抽出來通常是 0 字）。ponytail: 平均每頁不到 10 個字就算，封面有字＋內頁是掃描的混合檔案會被當成有文字
export const isScanned = (text: string, pages: number) => text.replace(/\[第 \d+ 頁\]|\s/g, "").length < 10 * pages;

export function toBase64(data: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ""));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(new Blob([data]));
  });
}
