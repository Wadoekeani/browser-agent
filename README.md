# Browser Agent

Chrome 側邊欄裡的 Claude agent：填入 Anthropic API Key 就能用，會讀取並操作目前分頁。

## 安裝

```bash
npm install
npm run build      # 產出 extension/sidepanel.js；開發時用 npm run watch
```

Chrome → `chrome://extensions` → 開「開發人員模式」→「載入未封裝項目」→ 選 `extension/` 資料夾。
點工具列的圖示打開側邊欄，在「設定」填入 API Key。

## 兩種模式（在側邊欄「設定」切換）

| 模式 | 認證 | 怎麼跑 |
|---|---|---|
| API Key | Anthropic API Key，按用量計費 | 瀏覽器直接呼叫 Messages API，不需要 server |
| Agent | 本機 Claude Code 的登入（訂閱），或環境變數 `CLAUDE_CODE_OAUTH_TOKEN`（`claude setup-token` 產生） | 另開終端機 `npm run agent`，在本機跑 Claude Agent SDK |

Agent 模式的架構（照 pq-s-workflow reading-agent 的做法）：
`server/agent-server.mjs` 用 `query()` 搭配串流輸入，瀏覽器工具透過 `createSdkMcpServer` 提供；
模型叫工具時，server 經 NDJSON 串流把 `tool_call` 送給擴充功能，擴充功能在分頁上執行後 `POST /tool-result` 回傳。
多輪對話靠 `resume`（session 存在 Claude Code 的預設目錄）。為了壓 token：cwd 放在 repo 外、`tools: []` 關掉內建工具、
`settingSources: []` 不載入 `~/.claude` 設定 —— 實測一輪的基底 context 約 5.4k token。
server 只綁 127.0.0.1，並拒絕非擴充功能來源的請求（避免網頁偷打 localhost 用你的訂閱）。

## 工具

| 工具 | 作用 |
|---|---|
| `read_page` | 讀目前分頁的文字或 HTML（可指定 selector） |
| `navigate` | 前往網址（只接受 http/https） |
| `click` | 點擊 CSS selector 對應的元素 |
| `type` | 在輸入框填字，可選擇送出 |

工具定義在 `src/shared.js`（兩種模式共用），實作在 `src/sidepanel.js` 的 `runTool`。加新工具兩邊各加一段即可；schema 目前只支援 string / boolean 參數（server 端轉 zod 的限制）。
