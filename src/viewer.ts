// 擴充功能自己的 PDF 檢視頁（viewer.html?file=原網址）：Chrome 內建檢視器不能注入腳本，
// 在這裡用 pdf.js 畫頁面＋文字層，使用者才選得到字、側邊欄才讀得到選取內容（selection.ts 直接讀這個 window）。
import type { PDFPageProxy } from "pdfjs-dist";
import { fetchPdf, openPdf, pdfjs, PdfError } from "./pdf";
import { t, setLangPref, currentLang, currentDictReady } from "./i18n";

const $ = (id: string) => document.getElementById(id)!;
const pagesBox = $("pages");
const status = $("status");

setLangPref((await chrome.storage.local.get("lang")).lang as string | undefined);
await currentDictReady(); // 這頁不像側邊欄有 emit() 重繪：字典要先等到，才輪到下面用 t() 畫字
document.documentElement.lang = currentLang();
for (const [id, key] of [["zoom-out", "viewer.zoomOut"], ["zoom-in", "viewer.zoomIn"], ["fit", "viewer.fitWidth"]] as const) {
  $(id).title = t(key);
  $(id).setAttribute("aria-label", t(key));
}
$("fit").textContent = t("viewer.fitWidth");

const file = new URLSearchParams(location.search).get("file") ?? "";
const fail = (text: string) => { status.textContent = text; status.dataset.error = ""; };

async function main() {
  if (!/^(https?|file):/i.test(file)) return fail(t("viewer.noFile"));
  const name = decodeURIComponent(new URL(file).pathname.split("/").pop() || file);
  document.title = $("title").textContent = name;
  status.textContent = t("viewer.loading");
  let data: ArrayBuffer;
  try { data = await fetchPdf(file); } catch (e) {
    return fail(e instanceof PdfError && e.code === "fileAccess" ? t("pdf.fileAccess") : t("viewer.failed", { error: (e as Error).message }));
  }
  const [lib, doc] = await Promise.all([pdfjs(), openPdf(data)]);
  const pages: PDFPageProxy[] = [];
  for (let n = 1; n <= doc.numPages; n++) pages.push(await doc.getPage(n));
  status.remove();

  let scale = 1, gen = 0;
  const slots = pages.map((page, i) => {
    const div = document.createElement("div");
    div.className = "page";
    div.dataset.page = String(i + 1);
    pagesBox.append(div);
    return { div, page, drawn: -1 };
  });

  // 看得到才畫：長文件不用一次畫幾百頁。縮放時 gen 加一，舊的畫到一半的結果丟掉
  async function draw(slot: (typeof slots)[number]) {
    if (slot.drawn === gen) return;
    const mine = (slot.drawn = gen);
    const viewport = slot.page.getViewport({ scale });
    const dpr = devicePixelRatio || 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    const text = document.createElement("div");
    text.className = "textLayer";
    await slot.page.render({ canvas, viewport, transform: dpr === 1 ? undefined : [dpr, 0, 0, dpr, 0, 0] }).promise.catch(() => {});
    if (mine !== gen) return;
    slot.div.replaceChildren(canvas, text);
    await new lib.TextLayer({ textContentSource: slot.page.streamTextContent(), container: text, viewport }).render().catch(() => {});
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) draw(slots.find((s) => s.div === e.target)!);
  }, { root: pagesBox, rootMargin: "100% 0px" });

  function layout(next: number) {
    scale = Math.min(4, Math.max(0.25, next));
    gen++;
    $("zoom").textContent = `${Math.round(scale * 100)}%`;
    for (const s of slots) {
      const v = s.page.getViewport({ scale });
      s.div.style.cssText = `width:${v.width}px;height:${v.height}px;--scale-factor:${scale}`;
      s.div.replaceChildren();
      io.unobserve(s.div);
      io.observe(s.div); // 重新觀察才會對目前看得到的頁面再觸發一次
    }
  }
  const fitWidth = () => layout((pagesBox.clientWidth - 32) / pages[0].getViewport({ scale: 1 }).width);
  $("zoom-in").onclick = () => layout(scale * 1.2);
  $("zoom-out").onclick = () => layout(scale / 1.2);
  $("fit").onclick = fitWidth;
  fitWidth();
}

main().catch((e) => fail(t("viewer.failed", { error: e?.message ?? String(e) })));
