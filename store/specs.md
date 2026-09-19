# Chrome Web Store 上架規格（官方文件查證）

查詢日期：**2026-09-19**（台灣時間，跨夜到 09-20）。每一項都附官方網址與該頁標示的「Last updated」。
文件之間互相矛盾或查不到的地方另外標出，**不用訓練記憶補數字**。

## 圖示

| 項目 | 規格 | 出處 |
|---|---|---|
| 商店圖示 | 128×128 PNG；圖形本體 96×96，每邊 16px 透明留白；要在淺色與深色背景都成立；不要自己加外框、避免大陰影；偏暗的圖示可加淡白色外光 | [Supplying images](https://developer.chrome.com/docs/webstore/images)（Last updated 2018-06-11） |
| 擴充功能圖示（manifest `icons`） | 16（擴充功能頁面 favicon、右鍵選單）、32（Windows 常用）、48（擴充功能管理頁）、128（安裝時與商店）；建議 PNG，**manifest 不支援 SVG** | [Configure extension icons](https://developer.chrome.com/docs/extensions/develop/ui/configure-icons)（Last updated 2024-02-16） |
| 小尺寸留白 | 官方只對 128px 規定 96+16 留白，16/32/48 沒有規定；本套件用 1/2/3px 留白讓圖形夠大（自訂，不是官方規則） | 同上兩頁 |

## 截圖與宣傳圖

| 項目 | 規格 | 出處 |
|---|---|---|
| 截圖 | 1280×800 或 640×400（偏好 1280×800）；**至少 1 張、最多 5 張**；直角、不留邊（full bleed） | [Supplying images](https://developer.chrome.com/docs/webstore/images)；[Listing tab](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)（Last updated 2020-12-07） |
| 小型宣傳圖塊 | 440×280，PNG 或 JPEG，**必填**（沒有的話排序在有的後面） | 同上兩頁 |
| 大型宣傳圖塊（marquee） | 1400×560，PNG 或 JPEG，選填；沒有就不會被放進首頁輪播 | 同上兩頁 |
| 宣傳圖設計建議 | 縮到一半還看得懂、假設放在淺灰底上、用飽和色、少用白與淺灰、填滿整個區域、邊緣清楚；**宣傳圖不能依語系替換**，多語系產品建議少放文字 | [Supplying images](https://developer.chrome.com/docs/webstore/images) |
| 宣傳影片 | Listing tab 頁把「YouTube 影片連結」寫在「must provide」那一段；但 Supplying images 頁寫「只有圖示、小型宣傳圖、截圖是必填」。**兩頁矛盾，以 dashboard 實際畫面為準**（我沒有後台可以驗） | 上面兩頁 |

## 文字欄位

| 欄位 | 上限 | 出處 |
|---|---|---|
| 名稱（manifest `name`） | 75 字元，純文字 | [Manifest – name](https://developer.chrome.com/docs/extensions/reference/manifest/name)（Last updated 2013-05-12） |
| 摘要（manifest `description`＝商店搜尋結果看到的那一句） | **132 字元**，純文字 | [Manifest – description](https://developer.chrome.com/docs/extensions/reference/manifest/description)（2013-05-12）；[Creating a great listing page](https://developer.chrome.com/docs/webstore/best-listing)（2024-08-02） |
| 完整說明（Listing tab 的 Description） | **官方文件沒寫字數上限**（我查的四頁都沒有）；只要求第一句是精簡的功能說明、不違反 keyword spam 政策（同一關鍵字重複超過 5 次、無意義的品牌／網站清單都算） | [Listing tab](https://developer.chrome.com/docs/webstore/cws-dashboard-listing)；[Program policies](https://developer.chrome.com/docs/webstore/program-policies/policies)（2025-05-22） |
| 摘要寫法 | 不要「best / fastest」這類形容詞、不要點名競品 | [Creating a great listing page](https://developer.chrome.com/docs/webstore/best-listing) |

## Privacy practices 分頁

來源：[Fill out the privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)（Last updated 2020-06-12）

1. **Single purpose description**：單一、窄、容易懂的用途。
2. **Permissions justification**：manifest 裡每個權限一個欄位寫理由；要求比需要更廣的權限可能被拒。
3. **Remote code**：是否執行遠端程式碼；MV3 不能載入遠端程式檔。
4. **Data usage**：第一組勾選「收集哪些類型的資料」，第二組勾選「證明遵守各項揭露聲明」（Limited Use）。
5. **Privacy policy URL**：必填欄位。

補充政策：
- **只要產品處理任何使用者資料就必須有隱私權政策**，並揭露所有會收到資料的對象。[Privacy Policies](https://developer.chrome.com/docs/webstore/program-policies/privacy)（2022-11-01）
- **只在本機處理／儲存也要揭露**。使用者資料的例子包含：個人識別資訊、財務與付款資訊、健康資訊、驗證資訊（登入、密碼、cookie）、網站內容與資源、表單資料、瀏覽活動（含網址）、個人通訊、使用者產生的內容。[User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)（2016-04-23）
- **醒目揭露（prominent disclosure）**：要在產品介面內、使用者開始使用前揭露會收集與使用哪些資料並取得明確同意；**只寫在隱私權政策或商店說明不算**。同上 FAQ 第 10 題。
- **Limited Use 聲明**要放在屬於該擴充功能的網站上（例如隱私權政策頁），範例句：「The use of information received from Google APIs will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.」[Limited Use](https://developer.chrome.com/docs/webstore/program-policies/limited-use)（2022-11-01）
- **最小權限**、**單一用途**、**不得侵犯商標或假冒他人**：[Program policies](https://developer.chrome.com/docs/webstore/program-policies/policies)（2025-05-22）

## 查不到／沒驗證的

- Data usage 第一組勾選框在 dashboard 上的**確切分類名稱**：文件只有上面那份「使用者資料例子」，沒有列出勾選框清單。`privacy-practices.md` 的勾選建議是照 FAQ 的分類寫的，上後台時請對照實際選項名稱。
- 完整說明的字數上限：文件沒寫。
