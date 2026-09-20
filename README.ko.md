<div align="center">

<img src="docs/logo.svg" width="72" alt="Browser Agent 로고">

# Browser Agent

**Chrome 사이드 패널에서 동작하는 AI 에이전트로, 현재 탭을 읽고 직접 작업을 수행합니다 — 여러분의 API 키 또는 직접 구축한 로컬 모델로.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · 한국어 · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="문단을 선택해 /explain으로 설명을 요청하고, 노트북 가격을 CSV로 정리한 뒤, 에이전트가 'Place order'를 클릭하기 전에 확인 카드를 띄우자 사용자가 거부하는 모습">

</div>

## 왜 만들었나

- **지금 보고 있는 페이지에서 바로 작업합니다.** 요약하고, 표를 뽑아내고, 폼을 채우고, 여러 페이지를 클릭해 넘어가는 일을 — 채팅 탭에 복사해서 붙여넣을 필요 없이 해결합니다.
- **모델은 원하는 대로 선택하세요.** Anthropic, OpenAI, Gemini, OpenRouter, 혹은 OpenAI API를 지원하는 모든 서비스 — 직접 구동하는 Ollama, LM Studio, vLLM도 포함됩니다.
- **중간에 서버가 없습니다.** 요청은 여러분의 브라우저에서 선택한 프로바이더로 곧바로 전송됩니다. API 키, 대화, 메모리는 모두 `chrome.storage.local`에만 저장됩니다. 분석 도구도, 계정도 필요 없습니다.
- **위험한 작업은 여러분의 확인을 기다립니다.** 되돌리기 어려워 보이는 클릭이나 폼 제출은 사이드 패널에서 **허용**을 누르기 전까지 실행되지 않습니다. 이 확인 절차는 모델에게 부탁하는 것이 아니라 확장 프로그램 코드 자체가 강제합니다.

## 주요 기능

**페이지 위에서 동작**
- 도구: 페이지 읽기, 클릭, 입력(`<select>` 드롭다운 포함), 스크롤, URL 열기. 모델은 상호작용 가능한 요소의 번호 목록을 받아 CSS 셀렉터를 추측하는 대신 `ref: 12`처럼 클릭합니다.
- 페이지에서 텍스트를 선택하면 그 부분에 대해서만 질문할 수 있습니다. 전체 탭이 아니라 선택한 내용만 메시지에 첨부됩니다.
- PDF: pdf.js로 텍스트를 추출합니다. 내장 뷰어에서는 일반 페이지처럼 PDF 안의 텍스트를 선택할 수 있습니다. 텍스트 레이어가 없는 스캔 PDF는 비용을 확인한 뒤 문서로 Anthropic에 전송할 수 있습니다.

**대화 안에서**
- 표와 코드 블록을 지원하는 스트리밍 Markdown 답변, 그리고 접었다 펼 수 있는 생각 과정 요약(Anthropic)까지 제공합니다.
- 질문 카드(`ask_user`): 모델이 판단을 내려야 할 때 추측 대신 클릭 가능한 선택지로 물어봅니다.
- 파일 카드: 결과를 `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics`, `vcf` 파일로 내려받을 수 있으며, 복사와 미리보기도 지원합니다.
- 모든 답변에 토큰 사용량이 표시되며, 각 작업은 도구 호출 30단계 후 자동으로 멈춥니다.

**온전히 여러분의 것**
- 메모리: "기억해줘"라고 말하면 대화가 바뀌어도 여러분에 대한 짧은 정보를 계속 기억합니다. 설정에서 확인, 수정, 끄기가 가능합니다.
- 기록: 최근 대화 30개를 날짜별로 묶어 보여줍니다. 다시 열어서 이어가거나 Markdown으로 내보낼 수 있습니다.
- 내장 스킬 12개와 `/` 명령어. 직접 만드는 스킬도 Claude Code와 동일한 `SKILL.md` 형식을 사용합니다.
- 인터페이스는 15개 언어를 지원하며, 라이트/다크 테마는 시스템 설정을 따릅니다.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="프로바이더 선택 화면: Anthropic, OpenAI, Google Gemini, OpenRouter, 커스텀(OpenAI 호환)"></td>
    <td width="33%"><img src="docs/skills.png" alt="/를 입력하면 스킬 메뉴가 열림"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="세 가지 선택지가 있고 그중 하나가 추천으로 표시된 질문 카드"></td>
  </tr>
  <tr>
    <td align="center">프로바이더 선택하기</td>
    <td align="center"><code>/</code>를 입력해 스킬 열기</td>
    <td align="center">추측 대신 먼저 물어봄</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="내장 PDF 뷰어에서 한 문장을 선택하고, 사이드 패널이 그 의미를 설명하는 모습">

## 빠른 시작

Browser Agent는 아직 Chrome 웹 스토어에 등록되지 않았습니다(곧 등록 예정). 그때까지는 릴리스 빌드를 그대로 설치하면 됩니다 — Node.js도, 빌드 과정도 필요 없습니다. Chrome 122 이상이 필요합니다.

1. [최신 릴리스](https://github.com/Wadoekeani/browser-agent/releases/latest)에서 `browser-agent-<버전>.zip`을 내려받아 압축을 풉니다.
2. `chrome://extensions`를 열고 오른쪽 위의 **개발자 모드**를 켭니다.
3. **압축해제된 확장 프로그램을 로드합니다**를 클릭하고 방금 압축을 푼 폴더를 선택합니다.
4. 툴바 아이콘을 클릭해 사이드 패널을 열고, 간단한 데이터 안내에 동의한 뒤 프로바이더를 선택하고 키를 붙여넣습니다(또는 로컬 엔드포인트를 입력합니다).

업데이트하려면 새 zip 파일을 내려받아 같은 폴더의 내용을 덮어쓴 다음, 확장 프로그램 카드의 새로고침 아이콘을 클릭하세요. 설정, 대화, 메모리는 그대로 유지됩니다. 다른 폴더에서 불러오면 완전히 별개의, 비어 있는 사본이 설치됩니다.

### 소스에서 직접 빌드하기

Node.js 22 이상이 필요합니다.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

이후 3단계와 같은 방법으로 **압축해제된 확장 프로그램을 로드합니다**에서 `extension/` 폴더를 선택하세요.

## 프로바이더

| 프로바이더 | 필요한 것 | 비고 |
|---|---|---|
| Anthropic | [API 키](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; 사고 강도 조절; 생각 과정 요약; 스캔 PDF 지원 |
| OpenAI | [API 키](https://platform.openai.com/api-keys) | 모델 목록을 프로바이더에서 실시간으로 가져옴 |
| Google Gemini | [API 키](https://aistudio.google.com/apikey) | Gemini의 OpenAI 호환 엔드포인트를 사용 |
| OpenRouter | [API 키](https://openrouter.ai/keys) | OpenRouter에서 도구 호출을 지원하는 모델이라면 무엇이든 |
| 커스텀(OpenAI 호환) | 베이스 URL, 키는 선택 사항 | Ollama, LM Studio, vLLM, llama.cpp 등 `/chat/completions`를 제공하는 모든 것 |

로컬 서버는 기본적으로 브라우저 확장 프로그램의 접근을 차단합니다:

- **Ollama:** `OLLAMA_ORIGINS=chrome-extension://*`를 설정하고 Ollama를 재시작하세요(macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). 베이스 URL은 `http://localhost:11434/v1`입니다.
- **LM Studio:** `lms server start --cors`로 CORS를 켠 채 서버를 시작하세요. 베이스 URL은 `http://localhost:1234/v1`입니다.

도구 호출(tool calling)을 지원하는 모델을 선택하세요. 그렇지 않으면 에이전트가 페이지를 조작할 수 없습니다. 사용 요금은 프로바이더가 청구하며, 확장 프로그램 자체는 무료입니다.

## 스킬

입력창에 `/`를 입력해 선택하거나, 상황에 맞으면 모델이 알아서 불러오게 둘 수도 있습니다.

| 명령어 | 하는 일 |
|---|---|
| `/summarize` | 현재 페이지를 한 줄 요약, 핵심 포인트, 실행 항목으로 정리 |
| `/translate` | 제목과 단락 구조를 유지한 채 페이지를 여러분의 언어로 번역 |
| `/extract` | 페이지의 데이터를 Markdown 표로 추출. 데이터가 많으면 CSV나 JSON 파일도 생성 |
| `/compare` | 가격, 요금제, 사양을 비교표로 만들고 차이점을 강조 |
| `/explain` | 페이지나 용어, 코드 일부를 쉬운 말로 설명 |
| `/thread` | 댓글 스레드를 정리: 주요 논점, 각 입장, 합의점, 읽어볼 만한 댓글 |
| `/reply` | 페이지의 이메일이나 메시지에 대한 답장 초안 작성. 답장 입력란에 채워 넣을 수도 있지만 절대 전송하지 않음 |
| `/fill-form` | 여러분의 정보로 폼을 채움. 빠진 부분은 물어보고, 제출 전에는 반드시 멈춤 |
| `/review-pr` | GitHub 풀 리퀘스트를 검토하고 문제를 심각도별로 파일 및 줄 번호와 함께 나열 |
| `/checklist` | 튜토리얼을 단계별 체크리스트로 변환 |
| `/decide` | 선택지를 정리하고, 필요한 조건을 하나씩 물어본 뒤 하나를 추천 |
| `/grill-me` | 여러분의 계획(또는 페이지에 있는 제안)을 한 번에 한 문항씩 객관식으로 집요하게 검증 |

`/clear`는 새 대화를 시작합니다.

### 직접 스킬 만들기

스킬은 `name`과 `description` frontmatter로 시작하고 이어서 지시사항이 나오는 Markdown 파일입니다:

```markdown
---
name: meeting-notes
description: 회의 페이지를 결정 사항, 실행 항목, 담당자로 정리
---

1. read_page로 페이지 전체를 읽는다.
2. 결정 사항을 나열하고, 이어서 실행 항목을 담당자와 기한이 포함된 표로 정리한다.
```

스킬은 **설정 → 스킬**에서 관리합니다: 생성, 편집, `.md` 파일 가져오기, 내보내기. Claude Code의 `SKILL.md` 파일은 그대로 가져올 수 있습니다. 선택 사항인 `model:` 줄(예: `model: haiku`)을 추가하면 Anthropic을 사용할 때 해당 스킬만 더 저렴한 Claude 모델로 실행됩니다.

시스템 프롬프트에는 이름과 설명만 들어갑니다. 모델은 필요할 때 `use_skill`을 호출해 전체 지시사항을 불러오고, `/이름`을 입력하면 바로 첨부됩니다. 스킬은 곧 프롬프트이므로 가져오기 전에 먼저 내용을 읽어보세요.

## 보안과 개인정보 보호

**데이터 흐름.** 여러분의 브라우저는 단 한 곳, 여러분이 설정한 프로바이더나 엔드포인트하고만 통신합니다. 요청에는 여러분의 메시지, 에이전트가 읽은 페이지 내용(또는 선택한 부분만, 혹은 PDF), 저장된 메모리, 스킬 이름이 담깁니다. API 키, 대화, 메모리, 스킬은 오직 `chrome.storage.local`에만 저장됩니다. Browser Agent 자체 서버도, 분석 도구도, 원격 코드도 없습니다. 최초 실행 시 데이터 안내에 동의하기 전까지는 아무것도 전송되지 않습니다. 자세한 내용은 [개인정보처리방침](store/privacy-policy.md)을 참고하세요.

**"허용"이 필요한 작업.** 다음 작업들은 사이드 패널에 카드를 띄우며, **허용**을 누르기 전까지 실행되지 않습니다. 카드는 확장 프로그램 자체의 페이지 안에 있어서 웹사이트가 대신 클릭할 수 없습니다:

- 되돌리기 어려워 보이는 클릭과 폼 제출: 버튼에 보이는 텍스트, `aria-label`, title, value가 결제, 구매, 주문, 삭제, 제출, 전송, 게시, 승인, 저장, 공유, 설치 등으로 읽히는 경우(지원하는 15개 인터페이스 언어 모두 해당); 필드가 여러 개이거나 비밀번호 필드가 있는 폼; 폼 안의 아이콘만 있는 버튼; 폼에 속하지 않은 입력란(채팅창 등)에서 Enter를 누르는 경우. 버튼의 표시 텍스트와 `aria-label`이 서로 다르면 카드에 경고가 표시됩니다.
- 다른 사이트로 이동(내비게이션이든 링크 클릭이든): 작업을 시작한 사이트, 메시지에서 직접 언급한 사이트, 혹은 이번 작업 중 이미 허용한 사이트는 예외입니다. 카드에는 쿼리 문자열을 포함한 전체 URL이 표시됩니다.
- 대화에 웹 콘텐츠(읽은 페이지, PDF, 선택한 텍스트)가 포함된 이후에 메모리를 저장하는 경우.

홈 화면의 제안을 클릭하면 바로 전송됩니다. 페이지를 기반으로 생성된 제안은 페이지 내용을 읽은 뒤 작성되므로, 페이지가 그 내용에 영향을 줄 수 있습니다. 제안에서 언급된 사이트는 여러분이 직접 지정한 사이트로 취급되지 않으며, 그로 인해 촉발되는 동작도 동일한 확인 카드를 거칩니다. 답변 속 링크 옆에는 실제 도메인이 표시됩니다.

**출력과 파일.** 모델의 답변은 DOMPurify로 정제한 뒤 렌더링됩니다. 이미지, 미디어, SVG, iframe, 폼, 인라인 스타일은 모두 제거되므로 페이지가 이미지 URL을 통해 모델이 여러분의 대화를 유출하게 만들 수 없습니다. 생성되는 파일은 순수 텍스트 형식(`csv`, `json`, `md` 등)으로 제한되며, 스프레드시트 수식처럼 시작하는 CSV/TSV 셀은 무력화됩니다.

### 알려진 한계

- **프롬프트 인젝션 문제는 해결되지 않았습니다.** 이 에이전트는 여러분이 로그인한 세션으로 웹사이트를 읽고 조작합니다. 악의적인 페이지가 여러분의 대화, 메모리, 다른 사이트의 데이터를 어딘가로 보내도록 유도하거나 여러분을 대신해 어떤 작업을 하도록 유도할 수 있습니다. 위에서 설명한 확인 카드는 고위험 작업을 다루지만 완전한 보호책은 아닙니다.
- 은행, 이메일, 회사 관리자 페이지 탭이 열려 있을 때는 신뢰할 수 없는 페이지에서 실행하지 마세요. 작업이 진행되는 동안은 지켜보세요.
- 위험한 클릭을 감지하는 방식은 키워드와 폼 형태에 기반한 휴리스틱입니다. 일부 버튼은 놓칠 수 있습니다.
- 같은 사이트 안의 입력란에 타이핑하는 것은 확인을 요청하지 않습니다. 악의적인 페이지는 (예: `input` 이벤트 리스너로) 에이전트가 입력하는 내용을 읽어 자신의 서버로 보낼 수 있습니다.
- 가져온 `SKILL.md`는 신뢰할 수 있는 지시로 취급됩니다. 직접 읽어본 스킬만 가져오세요.
- 메모리와 대화는 브라우저에 암호화되지 않은 채로 저장되며, 매 요청마다 여러분이 선택한 프로바이더로 전송됩니다.
- 각 작업은 도구 호출 30단계 후 멈추고, 모든 답변에 토큰 사용량이 표시되므로 폭주하는 루프에도 한계가 있고 눈에 보입니다.

## 지원 언어

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. 기본값은 브라우저 언어를 따르며, **설정 → 언어**에서 바꿀 수 있습니다. 다른 언어로 직접 쓰지 않는 한 모델은 인터페이스 언어로 답합니다.

## 개발

```bash
npm run watch      # 저장할 때마다 다시 빌드; 이후 확장 프로그램 카드에서 새로고침 클릭
npm run typecheck  # tsc --noEmit
npm run check      # 유닛 자체 점검: 스킬, 메모리, 기록, 파일, 프로바이더, i18n
npm run test:e2e   # 빌드 후 모킹된 모델 API를 대상으로 Playwright로 확장 프로그램을 로드해 테스트
```

사이드 패널은 React + TypeScript로 작성되어 esbuild가 `extension/`으로 번들링합니다. 백엔드는 없습니다: `src/agent.ts`가 사이드 패널 안에서 에이전트 루프를 실행하며, Anthropic은 공식 SDK로, 그 외 OpenAI 호환 API는 `src/providers.ts`를 통해 호출합니다. `src/tools.ts`의 도구는 `chrome.scripting`으로 현재 탭에서 실행됩니다. `src/elements.ts`는 번호가 매겨진 요소 목록과 되돌릴 수 없는 작업 판단 로직을 만듭니다. e2e 테스트는 API 키가 필요 없고 비용도 들지 않습니다.

| 경로 | 내용 |
|---|---|
| `src/sidepanel.tsx` | 진입점과 메인 UI(온보딩, 채팅, 입력창, `/` 메뉴) |
| `src/agent.ts` | 에이전트 루프, 설정 로딩, 기본 스킬, 기록 저장/복원 |
| `src/providers.ts` | 프로바이더 목록과 OpenAI 호환 어댑터 |
| `src/tools.ts` | 도구 구현(`runTool`)과 확인 게이트 |
| `src/shared.ts` | 시스템 프롬프트와 도구 정의 |
| `src/elements.ts` | 번호가 매겨진 상호작용 요소(`data-ba` refs)와 위험도 판단 |
| `src/log.tsx` | 채팅 로그, 카드, DOMPurify를 이용한 Markdown 렌더링 |
| `src/pages.tsx` | 설정, 기록, 스킬 편집기 |
| `src/pdf.ts`, `src/viewer.ts` | PDF 텍스트 추출과 내장 뷰어 |
| `src/selection.ts` | 선택한 텍스트 칩 |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | `SKILL.md` 파싱, 메모리, 기록, 파일 카드 |
| `src/i18n/` | `t()`와 15개 언어 사전(`en.ts`가 유일한 원본) |
| `extension/` | 매니페스트, `_locales/`, HTML, 서비스 워커 — Chrome에는 이 폴더를 로드 |

도구를 추가하려면: `src/shared.ts`의 `tools`에 스키마를 추가하고, `src/tools.ts`의 `runTool`에 `case`를 하나 추가하세요.

### 번역하기

`src/i18n/locales/en.ts`를 예를 들어 `nl.ts`로 복사하고, `const nl: Dict = { … }`로 선언한 뒤 값을 번역합니다(모든 `{placeholder}`는 그대로 유지). 그런 다음 `src/i18n/index.ts`의 `LANGS`와 로더에 추가합니다. 키가 빠지거나 남으면 `npm run typecheck`가 실패하고, placeholder가 맞지 않으면 `npm run check`가 실패합니다. 모델에 전달되는 프롬프트와 도구 설명은 의도적으로 한 가지 언어로 유지됩니다. Chrome 웹 스토어에 표시할 이름과 설명은 `extension/_locales/<code>/messages.json`에 추가하세요(Chrome은 밑줄을 사용합니다. 예: `pt_BR`).

## 기여하기

이슈와 PR을 환영합니다 — [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요. PR은 작게 유지하고, 위의 세 가지 검사를 실행한 뒤, 검사가 다루지 못하는 부분은 어떻게 테스트했는지 적어주세요.

## 라이선스

[MIT](LICENSE). Browser Agent는 독립적인 프로젝트이며 Anthropic, OpenAI, Google 중 어디와도 제휴하거나 소속되어 있지 않습니다.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supported by io Software" height="32"></a></p>
