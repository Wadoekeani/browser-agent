# Browser Agent Privacy Policy

Last updated: [DATE]

Browser Agent is an open-source Chrome extension (MIT license). It has **no server of its own**: we, the developers, never receive your data.

## What is stored, and where

Everything below is stored only in your browser, in `chrome.storage.local`, on your computer:

- **Your API key(s)** and the endpoint address you configure
- **Your conversations** (the last 30), including text from web pages that was part of them and files the assistant created
- **Memories**: short facts you asked it to remember
- **Skills** and settings (model, language, theme, etc.)

You can delete conversations and memories in the extension at any time. Removing the extension deletes all of it.

## What is sent, and to whom

Browser Agent sends data only to **the AI model provider you choose** (for example Anthropic, OpenAI, Google Gemini or OpenRouter) or to **an endpoint you configure yourself** (for example a model running on your own computer). Requests go directly from your browser to that provider.

A request can contain:

- Your messages and the conversation so far
- Content of the current tab (text, the list of buttons and fields on it, the page title and address) that the assistant reads to carry out your request
- Text you selected on the page, if you asked about a selection instead of the whole tab
- The content of a PDF you asked it to read. A scanned PDF with no text layer is sent as images to **Anthropic specifically** (the only provider that can read it), and only after you click "Allow" on a confirmation card that tells you it will cost more than reading text — no other provider receives scanned PDFs
- Your saved memories and the names and descriptions of your skills (included so the assistant can use them)
- Your API key, which the provider uses to authenticate you

**Home suggestions:** this setting is off by default. If you turn it on in Settings, opening the side panel on a new conversation sends the current page's title, address and first ~800 characters to your chosen provider to suggest three things you could ask.

Otherwise, page content is only read and sent when you ask the assistant to do something.

What the provider does with the data is governed by **that provider's own privacy policy and terms**. If you use a self-hosted endpoint, the data stays wherever that endpoint runs.

## Before you start

The first time you open Browser Agent — including if you already had an API key from an older version — it shows a short screen summarizing what's above (what's sent, what stays local, that irreversible actions are confirmed first) and asks you to click "Agree and start". Nothing is sent to any model provider, including home-suggestion requests, until you agree.

## What we do not do

- No analytics, telemetry, crash reporting, ads or tracking
- No accounts and no sign-in
- We don't sell or share your data with anyone; we never receive it in the first place
- No remote code: all of the extension's code ships inside the package

## Limited Use

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## Contact

Questions: https://github.com/Wadoekeani/browser-agent/issues

---

# Browser Agent 隱私權政策

最後更新：[日期]

Browser Agent 是開放原始碼（MIT 授權）的 Chrome 擴充功能，**沒有自己的伺服器**：我們（開發者）不會收到你的任何資料。

## 存了什麼、存在哪裡

以下資料只存在你電腦上的瀏覽器裡（`chrome.storage.local`）：

- **你的 API 金鑰**與你設定的端點網址
- **你的對話**（最近 30 則），包含對話中出現的網頁文字，以及助理幫你產生的檔案
- **記憶**：你要它記住的簡短事實
- **技能**與設定（模型、語言、主題等）

你隨時可以在擴充功能裡刪除對話與記憶；移除擴充功能就會全部刪除。

## 送出什麼、送給誰

Browser Agent 只會把資料送到**你選擇的 AI 模型供應商**（例如 Anthropic、OpenAI、Google Gemini、OpenRouter），或**你自己設定的端點**（例如在你電腦上跑的模型）。請求從你的瀏覽器直接送到該供應商。

一次請求可能包含：

- 你的訊息與目前為止的對話
- 助理為了完成你的要求而讀取的目前分頁內容（文字、頁面上的按鈕與欄位清單、頁面標題與網址）
- 你選取的文字（如果你是針對選取內容發問，而不是整頁）
- 你要求它讀取的 PDF 內容。沒有文字層的掃描 PDF 會以圖片整份**只送給 Anthropic**（唯一讀得懂的供應商），而且一定要等你在確認卡片按下「允許」之後才會送——卡片會先告訴你這比讀文字貴；其他供應商完全不會收到掃描 PDF
- 你存的記憶，以及技能的名稱與說明（讓助理知道可以用）
- 你的 API 金鑰，供應商用它確認你的身分

**首頁建議：** 這個設定預設關閉。如果你在設定裡打開它，在新對話打開側邊欄，會把目前頁面的標題、網址與開頭約 800 字送給你選的供應商，用來產生三個建議。

除此之外，只有在你要求助理做事時，才會讀取並送出頁面內容。

供應商如何處理這些資料，依**該供應商自己的隱私權政策與條款**。使用自架端點時，資料就留在那個端點所在的地方。

## 開始之前

第一次打開 Browser Agent 時——就算你是已經有 API 金鑰的舊使用者也一樣——會先看到一個畫面，摘要說明上面這些內容（會送出什麼、什麼只留在本機、不可逆動作會先問過你），並請你按「同意並開始」。同意之前，不會有任何請求送到任何模型供應商，包括首頁建議的請求。

## 我們不做的事

- 沒有分析、遙測、當機回報、廣告或追蹤
- 沒有帳號、不用登入
- 不會出售或分享你的資料——我們根本收不到
- 沒有遠端程式碼：擴充功能的程式全部包在安裝檔裡

## Limited Use（有限使用）

The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.
（從 Google API 取得的資訊，其使用將遵守 Chrome 線上應用程式商店使用者資料政策，包括「有限使用」規定。）

## 聯絡方式

問題請洽：https://github.com/Wadoekeani/browser-agent/issues
