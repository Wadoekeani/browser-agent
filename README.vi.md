<div align="center">

<img src="docs/logo.svg" width="72" alt="Logo Browser Agent">

# Browser Agent

**Một tác nhân AI trong bảng bên của Chrome, đọc và thao tác trên tab của bạn — bằng khóa API của riêng bạn hoặc mô hình cục bộ của riêng bạn.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · Tiếng Việt · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="Chọn một đoạn văn và dùng /explain để giải thích, so sánh giá laptop vào một file CSV, sau đó tác nhân hỏi trước khi nhấn Đặt hàng và người dùng từ chối">

</div>

## Vì sao

- **Hoạt động ngay trên trang bạn đang xem.** Tóm tắt, trích xuất bảng dữ liệu, điền biểu mẫu, hoặc bấm qua vài trang — không cần sao chép dán vào tab trò chuyện khác.
- **Dùng mô hình của riêng bạn.** Anthropic, OpenAI, Gemini, OpenRouter, hoặc bất kỳ thứ gì nói được API của OpenAI — kể cả Ollama, LM Studio và vLLM trên máy của bạn.
- **Không có máy chủ trung gian.** Yêu cầu đi thẳng từ trình duyệt của bạn đến nhà cung cấp bạn đã chọn. Khóa, cuộc trò chuyện và bộ nhớ của bạn được lưu trong `chrome.storage.local`. Không phân tích dữ liệu, không tài khoản.
- **Hành động rủi ro sẽ chờ bạn xác nhận.** Các cú nhấp chuột và gửi biểu mẫu có vẻ không thể hoàn tác sẽ dừng lại cho đến khi bạn nhấn *Cho phép* trên bảng bên. Việc kiểm tra này do chính mã nguồn của tiện ích thực thi, không phải bằng cách nhờ mô hình tự giác.

## Tính năng

**Thao tác trên trang**
- Công cụ: đọc trang, nhấp chuột, gõ chữ (kể cả danh sách xổ xuống `<select>`), cuộn trang, mở URL. Mô hình nhận một danh sách đánh số các phần tử tương tác và nhấp `ref: 12` thay vì đoán các bộ chọn CSS.
- Chọn văn bản trên trang và hỏi riêng về phần đó; phần chọn sẽ được đính kèm vào tin nhắn của bạn thay vì cả tab.
- PDF: văn bản được trích xuất bằng pdf.js. Trình xem tích hợp cho phép bạn chọn văn bản trong PDF như trên bất kỳ trang nào. PDF quét (không có lớp văn bản) có thể được gửi đến Anthropic dưới dạng tài liệu, sau khi bạn xác nhận chi phí.

**Trong cuộc trò chuyện**
- Trả lời dạng Markdown phát trực tiếp với bảng và khối mã, cùng bản tóm tắt suy luận có thể thu gọn (Anthropic).
- Thẻ câu hỏi (`ask_user`): khi mô hình cần một quyết định, nó hỏi bằng các lựa chọn có thể nhấp thay vì đoán.
- Thẻ tệp: kết quả dưới dạng tệp có thể tải xuống `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics` hoặc `vcf`, kèm sao chép và xem trước.
- Mỗi câu trả lời hiển thị số token đã dùng; mỗi tác vụ dừng lại sau 30 bước công cụ.

**Của riêng bạn**
- Bộ nhớ: nói "hãy nhớ …" và nó sẽ ghi nhớ những thông tin ngắn gọn về bạn qua các cuộc trò chuyện. Xem, chỉnh sửa hoặc tắt trong Cài đặt.
- Lịch sử: 30 cuộc trò chuyện gần nhất, được nhóm theo ngày. Mở lại một cuộc và tiếp tục, hoặc xuất ra dạng Markdown.
- 12 skill tích hợp sẵn và lệnh `/`; viết skill của riêng bạn theo cùng định dạng `SKILL.md` như Claude Code.
- Giao diện có 15 ngôn ngữ; giao diện sáng và tối theo hệ thống của bạn.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Bộ chọn nhà cung cấp: Anthropic, OpenAI, Google Gemini, OpenRouter, Tùy chỉnh (tương thích OpenAI)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Gõ / mở menu skill"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="Một thẻ câu hỏi với ba lựa chọn, một lựa chọn được đề xuất"></td>
  </tr>
  <tr>
    <td align="center">Chọn nhà cung cấp</td>
    <td align="center">Gõ <code>/</code> để xem skill</td>
    <td align="center">Nó hỏi thay vì đoán</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Trình xem PDF tích hợp với một câu đã chọn, và bảng bên đang giải thích câu đó">

## Bắt đầu nhanh

Browser Agent chưa có trên Chrome Web Store (sắp ra mắt). Trong lúc chờ, hãy cài bản build phát hành — không cần Node.js hay bước build nào. Yêu cầu Chrome 122+.

1. Tải `browser-agent-<version>.zip` từ [bản phát hành mới nhất](https://github.com/Wadoekeani/browser-agent/releases/latest) và giải nén.
2. Mở `chrome://extensions` và bật **Chế độ dành cho nhà phát triển** (góc trên bên phải).
3. Nhấp **Tải tiện ích đã giải nén** và chọn thư mục vừa giải nén.
4. Nhấp vào biểu tượng trên thanh công cụ để mở bảng bên, đồng ý với thông báo dữ liệu ngắn gọn, chọn nhà cung cấp và dán khóa API (hoặc một endpoint cục bộ).

Để cập nhật, tải file zip mới, thay thế nội dung trong cùng thư mục, rồi nhấp biểu tượng tải lại trên thẻ tiện ích. Cài đặt, cuộc trò chuyện và bộ nhớ của bạn sẽ được giữ nguyên. Tải từ một thư mục khác sẽ cài một bản sao riêng biệt bắt đầu từ trạng thái trống.

### Build từ mã nguồn

Bạn cần Node.js 22+.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Sau đó tải thư mục `extension/` bằng **Tải tiện ích đã giải nén** như ở bước 3.

## Nhà cung cấp

| Nhà cung cấp | Bạn cần gì | Ghi chú |
|---|---|---|
| Anthropic | [Khóa API](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; bộ chọn mức nỗ lực; tóm tắt suy luận; PDF quét |
| OpenAI | [Khóa API](https://platform.openai.com/api-keys) | Danh sách mô hình được lấy từ nhà cung cấp |
| Google Gemini | [Khóa API](https://aistudio.google.com/apikey) | Dùng endpoint tương thích OpenAI của Gemini |
| OpenRouter | [Khóa API](https://openrouter.ai/keys) | Bất kỳ mô hình nào hỗ trợ công cụ trên OpenRouter |
| Tùy chỉnh (tương thích OpenAI) | URL gốc, khóa tùy chọn | Ollama, LM Studio, vLLM, llama.cpp — bất kỳ thứ gì có `/chat/completions` |

Các máy chủ cục bộ mặc định chặn tiện ích trình duyệt:

- **Ollama:** đặt `OLLAMA_ORIGINS=chrome-extension://*` rồi khởi động lại Ollama (macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). URL gốc `http://localhost:11434/v1`.
- **LM Studio:** khởi động máy chủ với CORS bật, `lms server start --cors`. URL gốc `http://localhost:1234/v1`.

Hãy chọn một mô hình hỗ trợ gọi công cụ; tác nhân không thể thao tác trên trang nếu thiếu nó. Chi phí sử dụng do nhà cung cấp của bạn tính; tiện ích thì miễn phí.

## Skill

Gõ `/` trong ô soạn tin để chọn một skill, hoặc để mô hình tự nạp skill phù hợp.

| Lệnh | Chức năng |
|---|---|
| `/summarize` | Tóm tắt một dòng, các điểm chính và việc cần làm cho trang hiện tại |
| `/translate` | Dịch trang sang ngôn ngữ của bạn, giữ nguyên tiêu đề và cấu trúc đoạn văn |
| `/extract` | Trích xuất dữ liệu trên trang vào bảng Markdown; ra file CSV hoặc JSON khi dữ liệu nhiều |
| `/compare` | Lập bảng so sánh giá, gói dịch vụ hoặc thông số và làm nổi bật sự khác biệt |
| `/explain` | Giải thích trang, một thuật ngữ hoặc một đoạn mã bằng lời đơn giản |
| `/thread` | Tóm tắt một luồng bình luận: luận điểm chính, quan điểm mỗi bên, điểm đồng thuận, bình luận đáng đọc |
| `/reply` | Soạn thảo trả lời cho email hoặc tin nhắn trên trang; có thể điền vào ô trả lời, không bao giờ gửi |
| `/fill-form` | Điền biểu mẫu bằng thông tin của bạn; hỏi những gì còn thiếu, dừng lại trước khi gửi |
| `/review-pr` | Xem xét một pull request trên GitHub và liệt kê vấn đề theo mức độ nghiêm trọng, kèm file và dòng |
| `/checklist` | Chuyển một hướng dẫn thành danh sách các bước cần làm |
| `/decide` | Trình bày các lựa chọn, hỏi về nhu cầu của bạn từng cái một, rồi đề xuất một lựa chọn |
| `/grill-me` | Kiểm tra kế hoạch của bạn (hoặc đề xuất trên trang) bằng từng câu hỏi trắc nghiệm một |

`/clear` bắt đầu một cuộc trò chuyện mới.

### Viết skill của riêng bạn

Một skill là một file Markdown có frontmatter `name` và `description`, theo sau là hướng dẫn:

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Quản lý skill trong **Cài đặt → Kỹ năng**: tạo, chỉnh sửa, nhập file `.md`, xuất ra. Các file `SKILL.md` của Claude Code được nhập nguyên trạng. Một dòng `model:` tùy chọn (ví dụ `model: haiku`) sẽ chạy skill đó trên một mô hình Claude rẻ hơn khi bạn dùng Anthropic.

Chỉ tên và mô tả được đưa vào system prompt; mô hình gọi `use_skill` để nạp toàn bộ hướng dẫn khi cần, và gõ `/tên` sẽ đính kèm chúng trực tiếp. Skill là các prompt — hãy đọc một skill trước khi nhập nó.

## Bảo mật & quyền riêng tư

**Luồng dữ liệu.** Trình duyệt của bạn chỉ nói chuyện với một nơi duy nhất: nhà cung cấp hoặc endpoint bạn đã cấu hình. Một yêu cầu chứa tin nhắn của bạn, nội dung trang mà tác nhân đã đọc (hoặc chỉ phần bạn chọn, hoặc file PDF), bộ nhớ đã lưu của bạn và tên các skill của bạn. Khóa API, cuộc trò chuyện, bộ nhớ và skill của bạn chỉ được lưu trong `chrome.storage.local`. Không có máy chủ Browser Agent, không phân tích dữ liệu và không có mã từ xa. Không có gì được gửi đi trước khi bạn đồng ý với thông báo dữ liệu lần đầu. Chi tiết đầy đủ: [chính sách quyền riêng tư](store/privacy-policy.md).

**Điều gì cần bạn *Cho phép*.** Những hành động này hiển thị một thẻ trên bảng bên và không chạy cho đến khi bạn nhấn *Cho phép*. Thẻ này nằm trên trang riêng của tiện ích, mà một trang web không thể nhấp thay bạn:

- các cú nhấp và gửi biểu mẫu có vẻ không thể hoàn tác: văn bản hiển thị trên nút, `aria-label`, title hoặc value đọc giống như thanh toán, mua, đặt hàng, xóa, gửi, gửi đi, xuất bản, ủy quyền, lưu, chia sẻ, cài đặt và tương tự (trên cả 15 ngôn ngữ giao diện); một biểu mẫu có nhiều trường hoặc một trường mật khẩu; một nút chỉ có biểu tượng bên trong biểu mẫu; nhấn Enter trong một trường không nằm trong biểu mẫu (ô chat). Nếu văn bản hiển thị của nút và `aria-label` của nó không khớp nhau, thẻ sẽ cảnh báo bạn;
- chuyển sang trang khác, bằng cách điều hướng hoặc nhấp vào liên kết, trừ khi đó là trang mà tác vụ bắt đầu, một trang bạn đã nêu tên trong tin nhắn, hoặc một trang bạn đã cho phép trong tác vụ này. Thẻ hiển thị URL đầy đủ, bao gồm cả chuỗi truy vấn;
- lưu một bộ nhớ khi cuộc trò chuyện đã chứa nội dung web (một trang đã đọc, một PDF, một phần được chọn).

Nhấp vào một gợi ý sẽ gửi ngay lập tức. Các gợi ý được tạo ra từ trang được viết ra sau khi đọc nội dung trang, vì vậy một trang có thể ảnh hưởng đến chúng: các trang web được nhắc đến trong đó không được tính là trang bạn đã nêu tên, và bất cứ điều gì chúng kích hoạt vẫn phải qua cùng các thẻ xác nhận đó. Các liên kết trong câu trả lời hiển thị tên miền thật của chúng bên cạnh văn bản.

**Đầu ra và tệp.** Câu trả lời của mô hình được render bằng DOMPurify. Hình ảnh, media, SVG, iframe, biểu mẫu và style nội tuyến đều bị loại bỏ, vì vậy một trang không thể khiến mô hình làm rò rỉ cuộc trò chuyện của bạn qua URL hình ảnh. Các tệp được tạo ra chỉ ở định dạng văn bản thuần (`csv`, `json`, `md`, …), và các ô CSV/TSV bắt đầu giống công thức bảng tính sẽ bị vô hiệu hóa.

### Hạn chế đã biết

- **Chèn prompt (prompt injection) chưa được giải quyết triệt để.** Tác nhân đọc và thao tác trên các trang web bằng phiên đăng nhập của bạn. Một trang độc hại có thể cố lái nó gửi cuộc trò chuyện, bộ nhớ hoặc dữ liệu từ các trang khác của bạn đi đâu đó, hoặc khiến nó làm việc gì đó thay bạn. Các thẻ xác nhận bao phủ các hành động rủi ro cao nêu trên; chúng không phải là biện pháp bảo vệ hoàn chỉnh.
- Đừng chạy nó trên các trang không đáng tin khi các tab ngân hàng, email hoặc quản trị công ty của bạn đang mở, và hãy theo dõi nó khi một tác vụ đang chạy.
- Việc phát hiện cú nhấp rủi ro là một phương pháp suy đoán dựa trên từ khóa và hình dạng biểu mẫu. Nó sẽ bỏ sót một số nút.
- Gõ chữ vào một trường trên cùng trang web không yêu cầu xác nhận. Một trang độc hại có thể đọc những gì tác nhân gõ (ví dụ bằng một listener `input`) và gửi nó đến máy chủ riêng của nó.
- Một file `SKILL.md` được nhập vào là hướng dẫn đáng tin cậy. Chỉ nhập những skill bạn đã đọc.
- Bộ nhớ và cuộc trò chuyện được lưu không mã hóa trong trình duyệt của bạn và được gửi đến nhà cung cấp bạn đã chọn như một phần của mỗi yêu cầu.
- Mỗi tác vụ dừng lại sau 30 bước công cụ, và mỗi câu trả lời hiển thị số token đã dùng, nên một vòng lặp chạy hỏng sẽ bị giới hạn và có thể nhìn thấy được.

## Ngôn ngữ

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. Ngôn ngữ mặc định theo trình duyệt của bạn; đổi nó trong **Cài đặt → Ngôn ngữ**. Mô hình trả lời bằng ngôn ngữ giao diện của bạn trừ khi bạn viết bằng ngôn ngữ khác.

## Phát triển

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

Bảng bên được viết bằng React + TypeScript, được esbuild đóng gói vào `extension/`. Không có backend: `src/agent.ts` chạy vòng lặp tác nhân trên bảng bên, gọi Anthropic qua SDK chính thức hoặc bất kỳ API tương thích OpenAI nào qua `src/providers.ts`. Các công cụ trong `src/tools.ts` chạy trên tab đang hoạt động bằng `chrome.scripting`; `src/elements.ts` xây dựng danh sách phần tử đánh số và kiểm tra hành động không thể hoàn tác. Bộ test e2e không cần khóa API và không tốn chi phí gì.

| Đường dẫn | Nội dung |
|---|---|
| `src/sidepanel.tsx` | Điểm vào và giao diện chính (onboarding, chat, ô soạn tin, menu `/`) |
| `src/agent.ts` | Vòng lặp tác nhân, nạp cài đặt, skill mặc định, lưu/khôi phục lịch sử |
| `src/providers.ts` | Danh sách nhà cung cấp và bộ chuyển đổi tương thích OpenAI |
| `src/tools.ts` | Cài đặt các công cụ (`runTool`) và cổng xác nhận |
| `src/shared.ts` | System prompt và định nghĩa công cụ |
| `src/elements.ts` | Các phần tử tương tác đánh số (`data-ba` refs) và kiểm tra rủi ro |
| `src/log.tsx` | Nhật ký trò chuyện, thẻ, render Markdown bằng DOMPurify |
| `src/pages.tsx` | Cài đặt, lịch sử và trình chỉnh sửa skill |
| `src/pdf.ts`, `src/viewer.ts` | Trích xuất văn bản PDF và trình xem tích hợp |
| `src/selection.ts` | Chip văn bản đã chọn |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | Phân tích `SKILL.md`, bộ nhớ, lịch sử, thẻ tệp |
| `src/i18n/` | `t()` và 15 từ điển (`en.ts` là nguồn chính xác nhất) |
| `extension/` | Manifest, `_locales/`, HTML, service worker — nạp thư mục này vào Chrome |

Để thêm một công cụ: thêm schema của nó vào `tools` trong `src/shared.ts` và một `case` trong `runTool` trong `src/tools.ts`.

### Dịch thuật

Sao chép `src/i18n/locales/en.ts` thành ví dụ `nl.ts`, khai báo nó là `const nl: Dict = { … }`, dịch các giá trị (giữ nguyên mọi `{placeholder}`), rồi thêm nó vào `LANGS` và các loader trong `src/i18n/index.ts`. `npm run typecheck` sẽ báo lỗi nếu thiếu hoặc thừa key; `npm run check` sẽ báo lỗi nếu placeholder không khớp. Các prompt và mô tả công cụ gửi cho mô hình cố tình được giữ ở một ngôn ngữ duy nhất. Đối với tên và mô tả trên Chrome Web Store, hãy thêm `extension/_locales/<code>/messages.json` (Chrome dùng dấu gạch dưới, ví dụ `pt_BR`).

## Đóng góp

Chào đón issue và PR — xem [CONTRIBUTING.md](CONTRIBUTING.md). Giữ PR nhỏ gọn, chạy ba kiểm tra ở trên, và nói rõ bạn đã kiểm thử phần chúng không bao phủ như thế nào.

## Giấy phép

[MIT](LICENSE). Browser Agent là một dự án độc lập, không liên kết với Anthropic, OpenAI hay Google.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Được hỗ trợ bởi io Software" height="32"></a></p>
