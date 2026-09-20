<div align="center">

<img src="docs/logo.svg" width="72" alt="Logotipo do Browser Agent">

# Browser Agent

**Um agente de IA no painel lateral do Chrome que lê e age na sua aba — com sua própria chave ou seu próprio modelo local.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · Português (Brasil) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="Seleciona um parágrafo e usa /explain para explicá-lo, compara preços de notebooks em um CSV, depois o agente pergunta antes de clicar em Place order e o usuário nega">

</div>

## Por que

- **Funciona na página que você já está.** Resuma, extraia uma tabela, preencha um formulário ou navegue por algumas páginas — sem copiar e colar em outra aba de chat.
- **Use o modelo que quiser.** Anthropic, OpenAI, Gemini, OpenRouter, ou qualquer serviço que fale a API da OpenAI — incluindo Ollama, LM Studio e vLLM na sua própria máquina.
- **Sem servidor no meio.** As requisições vão direto do seu navegador para o provedor escolhido. Sua chave, conversas e memórias ficam em `chrome.storage.local`. Sem analytics, sem conta.
- **Ações arriscadas esperam sua confirmação.** Cliques e envios de formulário que parecem irreversíveis param até você clicar em *Permitir* no painel lateral. Essa verificação é imposta pelo código da extensão, não apenas pedida educadamente ao modelo.

## Funcionalidades

**Agindo na página**
- Ferramentas: ler a página, clicar, digitar (incluindo menus `<select>`), rolar, abrir uma URL. O modelo recebe uma lista numerada de elementos interativos e clica em `ref: 12` em vez de adivinhar seletores CSS.
- Selecione um texto na página e pergunte só sobre ele; a seleção é anexada à sua mensagem em vez da aba inteira.
- PDF: o texto é extraído com pdf.js. Um visualizador integrado permite selecionar texto em um PDF como em qualquer página. PDFs escaneados (sem camada de texto) podem ser enviados à Anthropic como documento, após você confirmar o custo.

**Na conversa**
- Respostas em Markdown em streaming, com tabelas e blocos de código, além de resumos de raciocínio recolhíveis (Anthropic).
- Cartões de pergunta (`ask_user`): quando o modelo precisa de uma decisão, ele pergunta com opções clicáveis em vez de adivinhar.
- Cartões de arquivo: resultados como arquivos `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics` ou `vcf` para baixar, com cópia e pré-visualização.
- Toda resposta mostra o consumo de tokens; cada tarefa para após 30 etapas de ferramentas.

**Fica com você**
- Memória: diga "lembre-se de..." e ela guarda fatos curtos sobre você entre conversas. Veja, edite ou desligue em Configurações.
- Histórico: as últimas 30 conversas, agrupadas por data. Reabra uma e continue, ou exporte como Markdown.
- 12 skills integradas e comandos `/`; escreva as suas no mesmo formato `SKILL.md` do Claude Code.
- Interface em 15 idiomas; tema claro e escuro seguem o do seu sistema.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Seletor de provedor: Anthropic, OpenAI, Google Gemini, OpenRouter, Personalizado (compatível com OpenAI)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Digitar / abre o menu de skills"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="Um cartão de pergunta com três opções, uma delas recomendada"></td>
  </tr>
  <tr>
    <td align="center">Escolha um provedor</td>
    <td align="center">Digite <code>/</code> para skills</td>
    <td align="center">Ele pergunta em vez de adivinhar</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Visualizador de PDF integrado com uma frase selecionada, e o painel lateral explicando-a">

## Começando

O Browser Agent ainda não está na Chrome Web Store (em breve). Até lá, instale o build de release — sem necessidade de Node.js ou etapa de build. Requer Chrome 122+.

1. Baixe `browser-agent-<versão>.zip` da [última release](https://github.com/Wadoekeani/browser-agent/releases/latest) e descompacte.
2. Abra `chrome://extensions` e ative o **Modo do desenvolvedor** (canto superior direito).
3. Clique em **Carregar sem compactação** e selecione a pasta descompactada.
4. Clique no ícone na barra de ferramentas para abrir o painel lateral, aceite o breve aviso de dados, escolha um provedor e cole uma chave (ou um endpoint local).

Para atualizar, baixe o novo zip, substitua o conteúdo da mesma pasta e clique no ícone de recarregar no cartão da extensão. Suas configurações, conversas e memórias são mantidas. Carregá-la de uma pasta diferente instala uma cópia separada que começa vazia.

### Compilar a partir do código-fonte

Você precisa do Node.js 22+.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Depois carregue a pasta `extension/` com **Carregar sem compactação** como no passo 3.

## Provedores

| Provedor | O que você precisa | Notas |
|---|---|---|
| Anthropic | [Chave de API](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; seletor de esforço; resumos de raciocínio; PDFs escaneados |
| OpenAI | [Chave de API](https://platform.openai.com/api-keys) | A lista de modelos é obtida do provedor |
| Google Gemini | [Chave de API](https://aistudio.google.com/apikey) | Usa o endpoint do Gemini compatível com OpenAI |
| OpenRouter | [Chave de API](https://openrouter.ai/keys) | Qualquer modelo com suporte a ferramentas no OpenRouter |
| Personalizado (compatível com OpenAI) | URL base, chave opcional | Ollama, LM Studio, vLLM, llama.cpp — qualquer um com `/chat/completions` |

Servidores locais bloqueiam extensões de navegador por padrão:

- **Ollama:** defina `OLLAMA_ORIGINS=chrome-extension://*` e reinicie o Ollama (macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). URL base `http://localhost:11434/v1`.
- **LM Studio:** inicie o servidor com CORS ativado, `lms server start --cors`. URL base `http://localhost:1234/v1`.

Escolha um modelo que suporte tool calling; sem isso o agente não consegue agir na página. O uso é cobrado pelo seu provedor; a extensão é gratuita.

## Skills

Digite `/` no campo de mensagem para escolher uma, ou deixe o modelo carregar uma quando fizer sentido.

| Comando | O que faz |
|---|---|
| `/summarize` | Conclusão em uma linha, pontos-chave e itens de ação para a página atual |
| `/translate` | Traduz a página para o seu idioma, mantendo títulos e parágrafos |
| `/extract` | Extrai os dados da página em uma tabela Markdown; um arquivo CSV ou JSON quando há muito conteúdo |
| `/compare` | Monta uma tabela comparativa de preços, planos ou especificações e destaca as diferenças |
| `/explain` | Explica a página, um termo ou um trecho de código em palavras simples |
| `/thread` | Resume uma thread de comentários: principais argumentos, cada lado, consenso, comentários que valem a leitura |
| `/reply` | Redige uma resposta ao e-mail ou mensagem da página; pode preencher a caixa de resposta, mas nunca envia |
| `/fill-form` | Preenche o formulário com seus dados; pergunta o que faltar, para antes de enviar |
| `/review-pr` | Revisa um pull request do GitHub e lista os problemas por gravidade, com arquivo e linha |
| `/checklist` | Transforma um tutorial em uma checklist de passos |
| `/decide` | Apresenta as opções, pergunta suas necessidades uma de cada vez e depois recomenda uma |
| `/grill-me` | Coloca seu plano (ou a proposta na página) à prova com uma pergunta de múltipla escolha por vez |

`/clear` inicia uma nova conversa.

### Escreva as suas

Uma skill é um arquivo Markdown com frontmatter `name` e `description`, seguido de instruções:

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Gerencie skills em **Configurações → Skills**: criar, editar, importar arquivos `.md`, exportar. Arquivos `SKILL.md` do Claude Code são importados como estão. Uma linha opcional `model:` (por exemplo `model: haiku`) executa essa skill em um modelo Claude mais barato quando você usa Anthropic.

Só nomes e descrições entram no system prompt; o modelo chama `use_skill` para carregar as instruções completas quando precisa, e digitar `/nome` as anexa diretamente. Skills são prompts — leia uma antes de importá-la.

## Segurança e privacidade

**Fluxo de dados.** Seu navegador fala com um único lugar: o provedor ou endpoint que você configurou. Uma requisição contém suas mensagens, o conteúdo da página que o agente leu (ou só sua seleção, ou o PDF), suas memórias salvas e os nomes das suas skills. Sua chave de API, conversas, memórias e skills ficam armazenadas somente em `chrome.storage.local`. Não há servidor do Browser Agent, nem analytics, nem código remoto. Nada é enviado antes de você aceitar o aviso de dados na primeira execução. Detalhes completos: [política de privacidade](store/privacy-policy.md).

**O que precisa do seu *Permitir*.** Estas ações mostram um cartão no painel lateral e não são executadas até você clicar em *Permitir*. O cartão vive na própria página da extensão, que um site não consegue clicar por você:

- cliques e envios de formulário que parecem irreversíveis: o texto visível do botão, `aria-label`, title ou value soa como pagar, comprar, pedir, excluir, enviar, publicar, autorizar, salvar, compartilhar, instalar e similares (nos 15 idiomas da interface); um formulário com vários campos ou um campo de senha; um botão só com ícone dentro de um formulário; apertar Enter em um campo que não está em um formulário (caixas de chat). Se o texto visível de um botão e seu `aria-label` não baterem, o cartão avisa;
- ir para outro site, seja navegando ou clicando em um link, a menos que seja o site onde a tarefa começou, um site que você nomeou na sua mensagem, ou um já permitido nesta tarefa. O cartão mostra a URL completa, incluindo a query string;
- salvar uma memória depois que a conversa passa a ter conteúdo web (uma página lida, um PDF, uma seleção).

Clicar em uma sugestão a envia na hora. Sugestões geradas a partir da página são escritas depois de ler o conteúdo da página, então uma página pode influenciá-las: sites que ela menciona não contam como sites nomeados por você, e o que elas disparam passa pelos mesmos cartões de confirmação. Links nas respostas mostram o domínio real ao lado do texto.

**Saída e arquivos.** As respostas do modelo são renderizadas com DOMPurify. Imagens, mídia, SVG, iframes, formulários e estilos inline são removidos, então uma página não consegue fazer o modelo vazar sua conversa por meio da URL de uma imagem. Arquivos gerados são só formatos de texto simples (`csv`, `json`, `md`, …), e células de CSV/TSV que começam como uma fórmula de planilha são neutralizadas.

### Limitações conhecidas

- **Prompt injection não está resolvido.** O agente lê e age em sites com sua sessão logada. Uma página maliciosa pode tentar levá-lo a enviar sua conversa, memórias ou dados de outros sites para algum lugar, ou fazer coisas em seu nome. Os cartões de confirmação cobrem as ações de alto risco acima; não são uma proteção completa.
- Não use em páginas não confiáveis enquanto abas do seu banco, e-mail ou administração da empresa estiverem abertas, e observe enquanto uma tarefa está em execução.
- Detectar cliques arriscados é uma heurística de palavras-chave e formato de formulário. Vai deixar passar alguns botões.
- Digitar em um campo do mesmo site não pergunta. Uma página maliciosa pode ler o que o agente digita (por exemplo com um listener de `input`) e enviar para o próprio servidor.
- Um `SKILL.md` importado é instrução confiável. Importe só skills que você leu.
- Memórias e conversas são armazenadas sem criptografia no seu navegador e enviadas ao provedor escolhido como parte de cada requisição.
- Cada tarefa para após 30 etapas de ferramentas, e toda resposta mostra o consumo de tokens, então um loop descontrolado tem limite e é visível.

## Idiomas

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. O padrão segue o do seu navegador; mude em **Configurações → Idioma**. O modelo responde no idioma da sua interface, a menos que você escreva em outro.

## Desenvolvimento

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

O painel lateral é React + TypeScript empacotado pelo esbuild em `extension/`. Não há backend: `src/agent.ts` roda o loop do agente no painel lateral, chamando a Anthropic pelo SDK oficial ou qualquer API compatível com OpenAI por `src/providers.ts`. As ferramentas em `src/tools.ts` rodam na aba ativa com `chrome.scripting`; `src/elements.ts` monta a lista numerada de elementos e a verificação de ações irreversíveis. A suíte e2e não precisa de chave de API e não gasta nada.

| Caminho | O que é |
|---|---|
| `src/sidepanel.tsx` | Ponto de entrada e UI principal (onboarding, chat, campo de mensagem, menu `/`) |
| `src/agent.ts` | Loop do agente, carregamento de configurações, skills padrão, salvar/restaurar histórico |
| `src/providers.ts` | Lista de provedores e o adaptador compatível com OpenAI |
| `src/tools.ts` | Implementações de ferramentas (`runTool`) e a barreira de confirmação |
| `src/shared.ts` | System prompt e definições de ferramentas |
| `src/elements.ts` | Elementos interativos numerados (referências `data-ba`) e a verificação de risco |
| `src/log.tsx` | Registro do chat, cartões, renderização de Markdown com DOMPurify |
| `src/pages.tsx` | Configurações, histórico e editor de skills |
| `src/pdf.ts`, `src/viewer.ts` | Extração de texto de PDF e o visualizador integrado |
| `src/selection.ts` | Chip de texto selecionado |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | Parsing de `SKILL.md`, memória, histórico, cartões de arquivo |
| `src/i18n/` | `t()` e os 15 dicionários (`en.ts` é a fonte da verdade) |
| `extension/` | Manifest, `_locales/`, HTML, service worker — carregue esta pasta no Chrome |

Para adicionar uma ferramenta: adicione o schema dela a `tools` em `src/shared.ts` e um `case` em `runTool` em `src/tools.ts`.

### Traduzindo

Copie `src/i18n/locales/en.ts` para, por exemplo, `nl.ts`, declare como `const nl: Dict = { … }`, traduza os valores (mantendo cada `{placeholder}`), e adicione a `LANGS` e aos carregadores em `src/i18n/index.ts`. `npm run typecheck` falha se faltar ou sobrar alguma chave; `npm run check` falha se um placeholder não bater. Prompts e descrições de ferramentas enviados ao modelo permanecem em um único idioma de propósito. Para o nome e a descrição na Chrome Web Store, adicione `extension/_locales/<code>/messages.json` (o Chrome usa underscore, por exemplo `pt_BR`).

## Contribuindo

Issues e PRs são bem-vindos — veja [CONTRIBUTING.md](CONTRIBUTING.md). Mantenha os PRs pequenos, rode as três verificações acima, e diga como você testou o que elas não cobrem.

## Licença

[MIT](LICENSE). Browser Agent é um projeto independente, sem afiliação com Anthropic, OpenAI ou Google.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supported by io Software" height="32"></a></p>
