<div align="center">

<img src="docs/logo.svg" width="72" alt="Browser Agent 图标">

# Browser Agent

**常驻 Chrome 侧边栏的 AI agent：读取并操作你当前的标签页——用你自己的密钥，或你自己搭的本地模型。**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · 简体中文 · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="选中一段文字后用 /explain 解释；把笔记本电脑价格整理成 CSV；agent 在点击「Place order」前弹出确认卡片，用户拒绝了这次操作">

</div>

## 为什么做这个

- **直接在你正在看的页面上干活。** 生成摘要、把内容抽成表格、填表单、连续点开好几个页面——不用把内容复制粘贴到另一个聊天窗口。
- **模型任你选。** Anthropic、OpenAI、Gemini、OpenRouter，或任何兼容 OpenAI API 的服务，包括跑在你自己电脑上的 Ollama、LM Studio、vLLM。
- **中间没有服务器。** 请求从你的浏览器直接发到你选的服务商。密钥、对话记录、记忆都只存在 `chrome.storage.local` 里。没有埋点分析，也不需要账号。
- **高风险操作会等你确认。** 看起来不可逆的点击和表单提交,要你在侧边栏点「允许」才会执行。这道检查写死在扩展程序的代码里,不是靠提示词跟模型商量。

## 功能

**在页面上操作**
- 工具:读取页面、点击、输入(包括 `<select>` 下拉框)、滚动、打开网址。模型拿到的是页面上可交互元素的编号列表,点 `ref: 12` 就行,不用猜 CSS 选择器。
- 选中页面上的文字,就只针对这段内容提问;发送的是你选中的内容,不是整个页面。
- PDF:用 pdf.js 提取文字。内置阅读器让你在 PDF 里像看普通网页一样选中文字。没有文字层的扫描件,在你确认费用之后可以整份发给 Anthropic 识别。

**对话体验**
- 流式输出的 Markdown 回复,支持表格和代码块,还有可折叠的思考过程摘要(Anthropic)。
- 问题卡片(`ask_user`):模型需要你做决定时,会给出可点击的选项让你选,而不是自己瞎猜。
- 文件卡片:结果可以下载成 `csv`、`json`、`md`、`txt`、`tsv`、`xml`、`yaml`、`ics` 或 `vcf` 文件,支持复制和预览。
- 每条回复都会显示消耗的 token 数;单次任务最多执行 30 个工具步骤。

**属于你自己的东西**
- 记忆:说一句「记住……」,它就会在跨对话时记住关于你的简短信息。可以在设置里查看、编辑或关闭。
- 历史记录:最近 30 次对话,按日期分组。可以打开继续聊,也能导出成 Markdown。
- 12 个内置技能和 `/` 指令;自己写的技能用和 Claude Code 一样的 `SKILL.md` 格式。
- 界面支持 15 种语言;浅色/深色主题跟随系统。

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="服务商选择:Anthropic、OpenAI、Google Gemini、OpenRouter、自定义(兼容 OpenAI)"></td>
    <td width="33%"><img src="docs/skills.png" alt="输入 / 打开技能菜单"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="一张带三个选项的问题卡片,其中一个被标为推荐"></td>
  </tr>
  <tr>
    <td align="center">选一个服务商</td>
    <td align="center">输入 <code>/</code> 调出技能</td>
    <td align="center">拿不准就问你,不瞎猜</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="内置 PDF 阅读器选中了一句话,侧边栏正在解释这句话的意思">

## 快速开始

Browser Agent 还没上架 Chrome 网上应用店(即将上线)。在那之前,直接装 Release 版就行——不需要 Node.js,也不用自己构建。需要 Chrome 122 及以上版本。

1. 从[最新 Release](https://github.com/Wadoekeani/browser-agent/releases/latest) 下载 `browser-agent-<版本号>.zip` 并解压。
2. 打开 `chrome://extensions`,开启右上角的**开发者模式**。
3. 点击**加载已解压的扩展程序**,选中刚解压出来的文件夹。
4. 点击工具栏上的图标打开侧边栏,同意简短的数据说明,选一个服务商并粘贴密钥(或者填写本地端点地址)。

要更新时,下载新的 zip 包,覆盖同一个文件夹里的内容,然后点扩展程序卡片上的刷新图标。你的设置、对话和记忆都会保留。如果从别的文件夹加载,会变成另一份独立安装,里面是空的。

### 从源码构建

需要 Node.js 22 及以上版本。

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

然后照第 3 步,用**加载已解压的扩展程序**选中 `extension/` 文件夹。

## 服务商

| 服务商 | 需要什么 | 备注 |
|---|---|---|
| Anthropic | [API 密钥](https://console.anthropic.com/settings/keys) | Sonnet 5、Opus 5、Haiku 4.5;可调节思考强度;思考过程摘要;支持扫描版 PDF |
| OpenAI | [API 密钥](https://platform.openai.com/api-keys) | 模型列表实时从服务商那里获取 |
| Google Gemini | [API 密钥](https://aistudio.google.com/apikey) | 走 Gemini 兼容 OpenAI 的接口 |
| OpenRouter | [API 密钥](https://openrouter.ai/keys) | OpenRouter 上任何支持工具调用的模型都能用 |
| 自定义(兼容 OpenAI) | 基础 URL,密钥可选 | Ollama、LM Studio、vLLM、llama.cpp——只要有 `/chat/completions` 接口都行 |

本地服务器默认会拦截浏览器扩展的请求:

- **Ollama:** 设置 `OLLAMA_ORIGINS=chrome-extension://*` 后重启 Ollama(macOS:`launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`)。基础 URL 填 `http://localhost:11434/v1`。
- **LM Studio:** 用 `lms server start --cors` 开启 CORS 启动服务。基础 URL 填 `http://localhost:1234/v1`。

请选择支持工具调用(tool calling)的模型,否则它没法操作页面。费用由服务商向你收取;扩展程序本身免费。

## 技能

在输入框里打 `/` 挑一个,或者让模型在合适的时候自己加载。

| 指令 | 作用 |
|---|---|
| `/summarize` | 把当前页面整理成一句话结论、要点和待办事项 |
| `/translate` | 把页面翻译成你的语言,保留标题和段落结构 |
| `/extract` | 把页面上的数据抽成 Markdown 表格;数据量大时另外生成 CSV 或 JSON 文件 |
| `/compare` | 把价格、方案或规格整理成对比表,标出关键差异 |
| `/explain` | 用大白话解释这个页面,或页面上的某个术语、某段代码 |
| `/thread` | 总结一个评论区:主要论点、正反双方、共识、值得一看的评论 |
| `/reply` | 读懂页面上的邮件或消息,起草一份回复;可以直接填进回复框,但绝不会替你发送 |
| `/fill-form` | 用你的信息填表单;缺什么就问你,提交前一定会停下来确认 |
| `/review-pr` | 审查 GitHub PR,按严重程度列出问题,并标出文件和行号 |
| `/checklist` | 把一篇教程转成可以逐项打勾的步骤清单 |
| `/decide` | 列出所有选项,一次问一个问题了解你的需求,最后给出推荐 |
| `/grill-me` | 用一次一道选择题的方式,拷问你的计划(或页面上的提案) |

`/clear` 开始一段新对话。

### 自己写技能

技能就是一份 Markdown 文件:开头是带 `name` 和 `description` 的 frontmatter,后面接具体指示:

```markdown
---
name: meeting-notes
description: 把会议页面整理成决议、待办事项和负责人
---

1. 用 read_page 读完整个页面。
2. 列出决议事项,再用表格列出待办事项、负责人和截止日期。
```

在**设置 → 技能**里管理:新建、编辑、导入 `.md` 文件、导出。Claude Code 的 `SKILL.md` 文件可以直接导入。可选的 `model:` 一行(比如 `model: haiku`)能让这个技能在使用 Anthropic 时切换到更便宜的 Claude 模型。

系统提示词里只放技能的名称和描述;模型需要用到某个技能时会调用 `use_skill` 加载完整指示,而你输入 `/名称` 则会直接把内容附加进去。技能本质上就是提示词——导入别人的技能之前先读一遍。

## 安全与隐私

**数据流向。** 你的浏览器只和一个地方通信:你配置的服务商或端点。一次请求包含你的消息、agent 读到的页面内容(或者只有你选中的部分,或 PDF)、你保存的记忆和技能名称。API 密钥、对话记录、记忆和技能只存在 `chrome.storage.local` 里。没有 Browser Agent 自己的服务器,没有数据分析,也没有远程代码。在你同意首次使用的数据说明之前,不会发送任何内容。完整细节见[隐私政策](store/privacy-policy.md)。

**哪些操作需要你点「允许」。** 下面这些操作会在侧边栏弹出确认卡片,你点「允许」之前不会执行。卡片存在于扩展程序自己的页面里,网页没法替你点击:

- 看起来不可逆的点击和表单提交:按钮上可见的文字、`aria-label`、title 或 value 像是付款、购买、下单、删除、提交、发送、发布、授权、保存、分享、安装等含义的(覆盖全部 15 种界面语言);有多个字段或密码字段的表单;表单里只有图标的按钮;在不属于任何表单的字段里按回车(比如聊天框)。如果按钮的可见文字和 `aria-label` 对不上,卡片会给出警告;
- 跳转到其他网站(无论是导航还是点链接),除非是任务开始时所在的网站、你在消息里提到过的网站,或者这次任务里已经允许过的网站。卡片会显示完整网址,包括查询字符串;
- 在对话里已经出现网页内容(读过的页面、PDF、选中文字)之后再保存记忆。

首页的建议一点击就会立即发送。这些根据页面生成的建议是在读取页面内容之后写出来的,所以页面内容可以影响它们:建议里提到的网站不算你自己指定的,它触发的操作仍然要过一遍同样的确认卡片。回复里的链接旁边会标出它真实指向的域名。

**输出和文件。** 模型的回复会先经过 DOMPurify 净化再渲染,图片、媒体、SVG、iframe、表单和行内样式都会被去掉,所以网页没法诱导模型用图片链接把你的对话内容泄露出去。生成的文件只限纯文本格式(`csv`、`json`、`md` 等),CSV/TSV 里看起来像电子表格公式开头的单元格会被中和处理。

### 已知局限

- **没有彻底解决 prompt injection 问题。** 这个 agent 是用你已登录的会话去读取并操作网站的。恶意页面有可能诱导它把你的对话、记忆或其他网站的数据发送出去,或者替你做一些事。上面提到的确认卡片覆盖了高风险操作,但不是完整的防护。
- 打开着网银、邮箱、公司后台这类标签页时,不要让它处理不信任的页面;任务执行期间请留意它在做什么。
- 高风险点击的判断靠的是关键词加表单形状的启发式规则,肯定会漏掉一些按钮。
- 在同一个网站的输入框里打字不会触发确认。恶意页面可以读到 agent 输入的内容(比如通过监听 `input` 事件)并发送到自己的服务器。
- 导入的 `SKILL.md` 等同于受信任的指令,只导入你读过的技能。
- 记忆和对话在浏览器本地以明文存储,并且会随每次请求发送给你选择的服务商。
- 单次任务最多执行 30 个工具步骤,每条回复都会显示 token 用量,所以失控的循环有明确上限,而且看得见。

## 界面语言

English、繁體中文、简体中文、日本語、한국어、Español、Français、Deutsch、Português (Brasil)、Italiano、Русский、Tiếng Việt、Bahasa Indonesia、ไทย、Türkçe。默认跟随浏览器语言,可以在**设置 → 语言**里切换。模型会用界面语言回答,除非你用其他语言提问。

## 开发

```bash
npm run watch      # 保存后自动重新打包;之后在扩展程序卡片上点刷新
npm run typecheck  # tsc --noEmit
npm run check      # 单元自检:技能、记忆、历史、文件、服务商、i18n
npm run test:e2e   # 构建后用 Playwright 加载扩展程序,模型接口用假数据模拟
```

侧边栏用 React + TypeScript 写成,由 esbuild 打包进 `extension/`。没有后端:`src/agent.ts` 在侧边栏里运行 agent 循环,调用 Anthropic 走官方 SDK,其他兼容 OpenAI 的接口走 `src/providers.ts`。`src/tools.ts` 里的工具通过 `chrome.scripting` 在当前标签页里执行;`src/elements.ts` 负责生成编号元素列表和不可逆操作的判断。E2E 测试不需要密钥,也不产生费用。

| 路径 | 作用 |
|---|---|
| `src/sidepanel.tsx` | 入口和主界面(引导流程、聊天、输入框、`/` 菜单) |
| `src/agent.ts` | Agent 循环、设置加载、默认技能、历史记录的保存与恢复 |
| `src/providers.ts` | 服务商列表和兼容 OpenAI 的适配器 |
| `src/tools.ts` | 工具的具体实现(`runTool`)和确认门控 |
| `src/shared.ts` | 系统提示词和工具定义 |
| `src/elements.ts` | 编号可交互元素(`data-ba` refs)和风险判断 |
| `src/log.tsx` | 聊天记录、卡片、用 DOMPurify 渲染 Markdown |
| `src/pages.tsx` | 设置、历史记录和技能编辑器 |
| `src/pdf.ts`、`src/viewer.ts` | PDF 文字提取和内置阅读器 |
| `src/selection.ts` | 选中文字的标签 |
| `src/skills.ts`、`src/memory.ts`、`src/history.ts`、`src/files.ts` | `SKILL.md` 解析、记忆、历史记录、文件卡片 |
| `src/i18n/` | `t()` 函数和 15 份语言字典(`en.ts` 是唯一的真实来源) |
| `extension/` | Manifest、`_locales/`、HTML、service worker——在 Chrome 里加载这个文件夹 |

要新增一个工具:在 `src/shared.ts` 的 `tools` 里加上它的 schema,再在 `src/tools.ts` 的 `runTool` 里加一个 `case`。

### 翻译

把 `src/i18n/locales/en.ts` 复制成比如 `nl.ts`,声明成 `const nl: Dict = { … }`,翻译每个字符串值(保留所有 `{placeholder}`),再把它加进 `src/i18n/index.ts` 的 `LANGS` 和加载表里。少了 key 或多了 key,`npm run typecheck` 会报错;placeholder 对不上,`npm run check` 会失败。发给模型的提示词和工具描述是故意只保留一种语言的。Chrome 网上应用店的名称和描述要放在 `extension/_locales/<code>/messages.json` 里(Chrome 用下划线,比如 `pt_BR`)。

## 参与贡献

欢迎提 issue 和 PR,详见 [CONTRIBUTING.md](CONTRIBUTING.md)。PR 尽量保持小巧,跑一遍上面提到的三项检查,测试没覆盖到的部分请说明你是怎么手动测试的。

## 许可协议

[MIT](LICENSE)。Browser Agent 是一个独立项目,与 Anthropic、OpenAI 或 Google 没有从属或背书关系。

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supported by io Software" height="32"></a></p>
