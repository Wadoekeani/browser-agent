<div align="center">

<img src="docs/logo.svg" width="72" alt="Browser Agent 標誌">

# Browser Agent

**住在 Chrome 側邊欄的 AI agent：讀取並操作你目前的分頁——用你自己的金鑰，或你自己架的本機模型。**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · 繁體中文 · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="選取一段文字後用 /explain 解釋；把筆電價格整理成 CSV；agent 要按「Place order」前先跳出確認卡，使用者按拒絕">

</div>

## 為什麼

- **直接在你正在看的頁面上做事。** 摘要、抽成表格、填表、連點好幾頁——不用把內容複製貼到另一個聊天分頁。
- **模型自己選。** Anthropic、OpenAI、Gemini、OpenRouter，或任何講 OpenAI API 的服務，包含跑在你自己電腦上的 Ollama、LM Studio、vLLM。
- **中間沒有伺服器。** 請求從你的瀏覽器直接送到你選的供應商。金鑰、對話、記憶都存在 `chrome.storage.local`。沒有分析、沒有帳號。
- **高風險動作會等你點頭。** 看起來不可逆的點擊與表單送出，要你在側邊欄按「允許」才會執行。這道檢查寫在擴充功能的程式碼裡，不是靠提示詞拜託模型。

## 功能

**操作頁面**
- 工具：讀取頁面、點擊、輸入（含 `<select>` 下拉選單）、捲動、開啟網址。模型拿到的是可互動元素的編號清單，點 `ref: 12`，不用猜 CSS selector。
- 在頁面上選取文字，就只針對那段發問；送出時附上的是選取內容，不是整頁。
- PDF：用 pdf.js 抽文字。內建檢視器讓你在 PDF 裡像一般網頁一樣選取文字。沒有文字層的掃描檔，在你確認費用後可以整份送給 Anthropic 讀。

**對話裡**
- 串流顯示 Markdown 回覆（表格、程式碼區塊），以及可展開的思考摘要（Anthropic）。
- 問題卡片（`ask_user`）：需要你做決定時，它用可點的選項問你，而不是自己猜。
- 檔案卡片：結果可下載成 `csv`、`json`、`md`、`txt`、`tsv`、`xml`、`yaml`、`ics`、`vcf`，也能複製、預覽。
- 每則回覆顯示用了多少 token；單次任務最多 30 個工具步驟。

**留在你手上的**
- 記憶：說「記住……」，它會跨對話記得關於你的簡短事實。在設定裡查看、編輯或關閉。
- 歷史：最近 30 則對話，依日期分組。可以打開接著聊，或匯出成 Markdown。
- 12 個內建技能與 `/` 指令；自己寫的技能用跟 Claude Code 一樣的 `SKILL.md` 格式。
- 介面 15 種語言；淺色／深色跟著系統。

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="供應商選單：Anthropic、OpenAI、Google Gemini、OpenRouter、自訂（OpenAI 相容）"></td>
    <td width="33%"><img src="docs/skills.png" alt="輸入 / 打開技能選單"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="有三個選項、其中一個標示建議的問題卡片"></td>
  </tr>
  <tr>
    <td align="center">選供應商</td>
    <td align="center">輸入 <code>/</code> 叫出技能</td>
    <td align="center">不確定就問你</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="內建 PDF 檢視器選取一句話，側邊欄解釋它的意思">

（截圖為英文介面。）

## 快速開始

Browser Agent 還沒上架 Chrome 線上應用程式商店（即將推出）。在那之前，直接裝 Release 版本就好——不用 Node.js，也不用自己 build。需要 Chrome 122 以上。

1. 從[最新版 Release](https://github.com/Wadoekeani/browser-agent/releases/latest) 下載 `browser-agent-<版本>.zip` 並解壓縮。
2. 打開 `chrome://extensions`，開啟右上角的 **開發人員模式**。
3. 按 **載入未封裝項目**，選剛解壓縮的資料夾。
4. 點工具列的圖示打開側邊欄，同意簡短的資料說明，選供應商並貼上金鑰（或填本機端點）。

要更新時，下載新的 zip、把內容覆蓋進**同一個資料夾**，再按擴充功能卡片上的重新載入圖示。設定、對話與記憶都會保留。從不同的資料夾載入會變成另一份獨立安裝，裡面是空的。

### 從原始碼 build

需要 Node.js 22 以上。

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

接著照第 3 步用 **載入未封裝項目** 選 `extension/` 資料夾。

## 供應商

| 供應商 | 需要什麼 | 備註 |
|---|---|---|
| Anthropic | [API 金鑰](https://console.anthropic.com/settings/keys) | Sonnet 5、Opus 5、Haiku 4.5；可選思考強度；思考摘要；掃描 PDF |
| OpenAI | [API 金鑰](https://platform.openai.com/api-keys) | 模型清單向供應商即時取得 |
| Google Gemini | [API 金鑰](https://aistudio.google.com/apikey) | 走 Gemini 的 OpenAI 相容端點 |
| OpenRouter | [API 金鑰](https://openrouter.ai/keys) | OpenRouter 上支援工具呼叫的模型都能用 |
| 自訂（OpenAI 相容） | 基底網址，金鑰可省略 | Ollama、LM Studio、vLLM、llama.cpp——有 `/chat/completions` 的都行 |

本機伺服器預設會擋擴充功能：

- **Ollama：** 設定 `OLLAMA_ORIGINS=chrome-extension://*` 後重開 Ollama（macOS：`launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`）。基底網址 `http://localhost:11434/v1`。
- **LM Studio：** 用 `lms server start --cors` 開 CORS 啟動伺服器。基底網址 `http://localhost:1234/v1`。

請選支援工具呼叫（tool calling）的模型，不然它沒辦法操作頁面。費用由供應商向你收；擴充功能本身免費。

## 技能

在輸入框打 `/` 挑一個，或讓模型在適合時自己載入。

| 指令 | 用途 |
|---|---|
| `/summarize` | 把目前頁面整理成一句話結論＋重點＋可行動事項 |
| `/translate` | 把頁面翻成你的語言，保留標題與段落結構 |
| `/extract` | 把頁面資料抽成 Markdown 表格；資料多時另給 CSV 或 JSON 檔 |
| `/compare` | 把價格、方案或規格做成比較表，標出關鍵差異 |
| `/explain` | 用白話解釋這一頁，或頁面上的某個術語、某段程式碼 |
| `/thread` | 整理留言串：主要論點、正反方、共識、值得看的留言 |
| `/reply` | 讀懂頁面上的信件或訊息並草擬回覆；可以填進回覆框，絕不替你送出 |
| `/fill-form` | 用你的資料填表；缺的先問你，送出前一定停下來 |
| `/review-pr` | 審查 GitHub PR，依嚴重度列出問題並指出檔案與行號 |
| `/checklist` | 把教學文件轉成可以逐項打勾的步驟清單 |
| `/decide` | 列出選項，一題一題問你的條件，最後給建議與理由 |
| `/grill-me` | 用一次一題的選擇題拷問你的計畫（或頁面上的提案） |

`/clear` 開始新對話。

### 自己寫技能

技能就是一份 Markdown：開頭是 `name` 與 `description` 的 frontmatter，後面寫指示：

```markdown
---
name: meeting-notes
description: 把會議頁面整理成決議、待辦事項與負責人
---

1. 用 read_page 讀完整頁。
2. 列出決議，再用表格列出待辦事項、負責人與期限。
```

在 **設定 → 技能** 管理：新增、編輯、匯入 `.md`、匯出。Claude Code 的 `SKILL.md` 可以直接匯入。可選的 `model:`（例如 `model: haiku`）讓這個技能在使用 Anthropic 時改用較便宜的 Claude 模型。

系統提示詞裡只放名稱與說明；模型需要時呼叫 `use_skill` 載入完整指示，你打 `/名稱` 則直接附上。技能就是提示詞——匯入前先讀過。

## 安全與隱私

**資料流向。** 你的瀏覽器只連一個地方：你設定的供應商或端點。一次請求包含你的訊息、agent 讀到的頁面內容（或只有你的選取、或 PDF）、你存的記憶與技能名稱。API 金鑰、對話、記憶、技能只存在 `chrome.storage.local`。沒有 Browser Agent 伺服器、沒有分析、沒有遠端程式碼。第一次使用時你同意資料說明之前，不會送出任何東西。完整說明見[隱私權政策](store/privacy-policy.md)。

**要你按「允許」的動作。** 以下動作會在側邊欄跳出確認卡，你按「允許」之前不會執行。卡片在擴充功能自己的頁面裡，網頁沒辦法替你按：

- 看起來不可逆的點擊與表單送出：按鈕的文字、`aria-label`、title 或 value 像付款、購買、下單、刪除、送出、傳送、發布、授權、儲存、分享、安裝等（15 種介面語言都涵蓋）；有多個欄位或密碼欄的表單；表單裡只有圖示的按鈕；在不屬於任何表單的欄位按 Enter（聊天框）。按鈕的文字和 `aria-label` 不一致時，卡片會警告；
- 前往其他網站（navigate 或點連結都算），除非是任務開始時的網站、你在訊息裡提到的網站，或這次任務已經允許過的。卡片顯示完整網址，包含查詢字串；
- 對話裡已經有網頁內容（讀過的頁面、PDF、選取文字）之後寫入記憶。

首頁建議點了直接送出。依頁面產生的建議是讀過網頁內容才寫的，網頁可以影響它：它提到的網站不算你指定的，觸發的動作照樣要過上面的確認卡。回覆裡的連結旁邊會標示真正的網域。

**輸出與檔案。** 模型回覆用 DOMPurify 消毒後才顯示，圖片、媒體、SVG、iframe、表單、行內樣式一律拿掉，網頁沒辦法誘導模型用圖片網址把對話外洩。產生的檔案只限純文字格式（`csv`、`json`、`md`……），CSV／TSV 裡看起來像試算表公式開頭的儲存格會被中和。

### 已知限制

- **Prompt injection 沒有被解決。** 這個 agent 用你的登入狀態讀取並操作網站。惡意網頁可能誘導它把你的對話、記憶或其他網站的資料送出去，或替你做事。確認卡只涵蓋上面列的高風險動作，不是完整防護。
- 開著網銀、信箱、公司後台的分頁時，不要讓它處理不信任的網頁；任務進行中請看著它。
- 高風險點擊的判斷是關鍵字加表單形狀的規則，一定有漏掉的按鈕。
- 在同一個網站的欄位裡輸入不會問。惡意網頁可以讀到 agent 打的字（例如用 `input` 事件監聽）並送到自己的伺服器。
- 匯入的 `SKILL.md` 等同受信任的指令，只匯入你讀過的。
- 記憶與對話以明文存在瀏覽器本機，並會隨每次請求送給你選的供應商。
- 單次任務最多 30 個工具步驟、每則回覆都顯示 token 用量，失控的迴圈有上限也看得見。

## 介面語言

English、繁體中文、简体中文、日本語、한국어、Español、Français、Deutsch、Português (Brasil)、Italiano、Русский、Tiếng Việt、Bahasa Indonesia、ไทย、Türkçe。預設跟著瀏覽器語言，可在 **設定 → 語言** 切換。模型用介面語言回答，除非你用別的語言發問。

## 開發

```bash
npm run watch      # 存檔自動重新打包；之後在擴充功能卡片按重新載入
npm run typecheck  # tsc --noEmit
npm run check      # 單元自我檢查：技能、記憶、歷史、檔案、供應商、i18n
npm run test:e2e   # 打包後用 Playwright 載入擴充功能，模型 API 用假回應
```

側邊欄是 React + TypeScript，由 esbuild 打包進 `extension/`。沒有後端：`src/agent.ts` 在側邊欄裡跑 agent 迴圈，Anthropic 走官方 SDK，其他 OpenAI 相容 API 走 `src/providers.ts`。`src/tools.ts` 的工具透過 `chrome.scripting` 在目前分頁執行；`src/elements.ts` 產生元素編號清單與不可逆動作判斷。E2E 測試不需要金鑰、不花錢。

各檔案的用途見英文版 [Development](README.md#development) 的表格。新增工具：在 `src/shared.ts` 的 `tools` 加 schema，並在 `src/tools.ts` 的 `runTool` 加一個 `case`。

### 翻譯

把 `src/i18n/locales/en.ts` 複製成例如 `nl.ts`，宣告成 `const nl: Dict = { … }`，翻譯字串值（每個 `{placeholder}` 都要保留），再加進 `src/i18n/index.ts` 的 `LANGS` 與載入表。少 key 或多 key 時 `npm run typecheck` 會失敗；placeholder 對不上時 `npm run check` 會失敗。送給模型的提示詞與工具說明刻意維持單一語言。商店的名稱與說明放在 `extension/_locales/<code>/messages.json`（Chrome 用底線，例如 `pt_BR`）。

## 參與貢獻

歡迎開 issue 與 PR，請見 [CONTRIBUTING.md](CONTRIBUTING.md)。PR 盡量小，跑過上面三項檢查，測試沒涵蓋的部分請寫你怎麼手動測的。

## 授權

[MIT](LICENSE)。Browser Agent 是獨立專案，與 Anthropic、OpenAI、Google 無隸屬或背書關係。

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supported by io Software" height="32"></a></p>
