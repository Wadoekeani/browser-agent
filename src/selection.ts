// 頁面上選取的文字：輸入框聚焦、側邊欄取得焦點、切換分頁、送出前各讀一次（不加常駐 content script）。
// 讀不到的頁面（內建頁、商店）安靜略過；擴充功能自己的 PDF 檢視頁不能注入腳本，直接讀它的 window。
import { S, emit } from "./store";
import { activeTab, inPage } from "./tools";
import { isPdfUrl } from "./pdf";

// 按 × 移除的那段：同一段選取不再跳出來，選了別的才重新出現；送出過的也算（追問時不重複附上）
let dismissed = "";

export async function refreshSelection() {
  let text = "", pdf: string | null = null;
  try {
    const tab = await activeTab();
    const view = chrome.extension.getViews({ tabId: tab.id }).find((v) => v.location.pathname.endsWith("/viewer.html"));
    if (view) text = view.getSelection()?.toString() ?? "";
    else {
      const r = await inPage(tab.id!, () => ({ text: getSelection()?.toString() ?? "", pdf: document.contentType === "application/pdf" })).catch(() => null);
      text = r?.text ?? "";
      // 注入失敗或文件本身是 PDF：Chrome 內建檢視器開的 PDF 選不到字，提示改用我們的檢視頁
      if ((!r || r.pdf) && (await isPdfUrl(tab.url))) pdf = tab.url!;
    }
  } catch { /* 沒有分頁 */ }
  text = text.trim();
  if (text !== dismissed) dismissed = "";
  const selection = text && text !== dismissed ? text : null;
  if (selection === S.selection && pdf === S.pdfTab) return;
  S.selection = selection;
  S.pdfTab = pdf;
  emit();
}

export function dismissSelection() {
  dismissed = S.selection ?? "";
  S.selection = null;
  emit();
}

// 送出時取走：這則訊息附上，之後同一段不再自動附
export async function takeSelection(): Promise<string | null> {
  await refreshSelection();
  const s = S.selection;
  if (s) dismissSelection();
  return s;
}
