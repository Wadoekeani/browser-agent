// create_file 的檢查：內容可能是被網頁誘導寫出來的，只准純文字／資料格式（不給 html、js、svg 這類打開就會執行的）。
// 回傳的錯誤訊息是給模型看的，維持繁體中文。

export const FILE_EXTS = ["txt", "md", "csv", "tsv", "json", "xml", "yaml", "yml", "ics", "vcf"];
export const MAX_FILE_BYTES = 1024 * 1024;

// 去掉路徑與控制字元、Windows 不准的字元、開頭的點；過長時保留副檔名截斷
export function sanitizeFilename(raw: unknown): string {
  let name = String(raw ?? "").split(/[/\\]/).pop()!
    .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, "").trim().replace(/^\.+/, "");
  if (name.length > 100) {
    const dot = name.lastIndexOf(".");
    const ext = dot > 0 ? name.slice(dot) : "";
    name = name.slice(0, 100 - ext.length) + ext;
  }
  return name;
}

export function checkFile(input: { filename?: unknown; content?: unknown }): { filename: string; content: string } {
  const filename = sanitizeFilename(input.filename);
  const ext = filename.includes(".") ? filename.split(".").pop()!.toLowerCase() : "";
  if (!filename || !ext) throw new Error("檔名要有副檔名，例如 data.csv");
  if (!FILE_EXTS.includes(ext)) throw new Error(`不支援 .${ext}。只能建立這些純文字格式：${FILE_EXTS.join("、")}`);
  if (typeof input.content !== "string") throw new Error("content 要是字串");
  if (new TextEncoder().encode(input.content).length > MAX_FILE_BYTES) throw new Error("檔案超過 1 MB 上限，請精簡內容或拆成幾個檔案");
  const sep = ext === "csv" ? "," : ext === "tsv" ? "\t" : null;
  return { filename, content: sep ? neutralizeFormulas(input.content, sep) : input.content };
}

// CSV／TSV 公式注入：儲存格以 = + - @ tab CR LF 開頭，Excel／試算表會當公式執行（=HYPERLINK 把資料帶出去）。
// 照 OWASP 建議在開頭補一個 '（https://community.owasp.org/attacks/CSV_Injection ，2026-09-20 查證）。
// 引號包住的儲存格補在引號裡面；純數字（-3.5、+1e3）不動
const DANGER = /^[=+\-@\t\r\n]/;
const NUMBER = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/;
export function neutralizeFormulas(text: string, sep: string): string {
  let out = "", i = 0;
  const fix = (v: string) => (DANGER.test(v) && !NUMBER.test(v.trim()) ? `'${v}` : v);
  while (i <= text.length) {
    // 一個儲存格的開頭
    if (text[i] === '"') {
      let j = i + 1, v = "";
      while (j < text.length) {
        if (text[j] === '"' && text[j + 1] === '"') { v += '""'; j += 2; continue; }
        if (text[j] === '"') break;
        v += text[j++];
      }
      out += `"${fix(v)}"`;
      i = j + 1;
      // 收尾引號後面到分隔符／換行之間的東西（不合規的 CSV）原樣保留
      while (i < text.length && text[i] !== sep && text[i] !== "\n" && text[i] !== "\r") out += text[i++];
    } else {
      let j = i;
      while (j < text.length && text[j] !== sep && text[j] !== "\n" && text[j] !== "\r") j++;
      out += fix(text.slice(i, j));
      i = j;
    }
    if (i >= text.length) break;
    // 分隔符或換行（\r\n 當一個）
    if (text[i] === "\r" && text[i + 1] === "\n") { out += "\r\n"; i += 2; } else out += text[i++];
    if (i === text.length) break; // 結尾換行後沒有儲存格
  }
  return out;
}
