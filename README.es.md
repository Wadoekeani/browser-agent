<div align="center">

<img src="docs/logo.svg" width="72" alt="Logotipo de Browser Agent">

# Browser Agent

**Un agente de IA en el panel lateral de Chrome que lee y actúa sobre tu pestaña, con tu propia clave o tu propio modelo local.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · Español · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="Selecciona un párrafo y usa /explain para explicarlo, compara precios de portátiles en un CSV; luego el agente pregunta antes de hacer clic en Place order y el usuario lo rechaza">

</div>

## Por qué

- **Funciona en la página que ya tienes abierta.** Resume, extrae una tabla, rellena un formulario o navega por varias páginas, sin copiar y pegar en otra pestaña de chat.
- **Usa el modelo que quieras.** Anthropic, OpenAI, Gemini, OpenRouter o cualquier servicio que hable la API de OpenAI, incluidos Ollama, LM Studio y vLLM en tu propio equipo.
- **Sin servidor intermedio.** Las peticiones van directamente de tu navegador al proveedor que elijas. Tu clave, tus chats y tus recuerdos se quedan en `chrome.storage.local`. Sin analítica, sin cuenta.
- **Las acciones arriesgadas esperan tu aprobación.** Los clics y envíos de formulario que parecen irreversibles se detienen hasta que pulsas *Permitir* en el panel lateral. Esa comprobación la impone el código de la extensión, no se le pide amablemente al modelo.

## Funciones

**Actuar sobre la página**
- Herramientas: leer la página, hacer clic, escribir (incluidos menús desplegables `<select>`), desplazarse, abrir una URL. El modelo recibe una lista numerada de elementos interactivos y hace clic en `ref: 12` en lugar de adivinar selectores CSS.
- Selecciona texto en la página y pregunta solo sobre eso; se adjunta la selección a tu mensaje en lugar de toda la pestaña.
- PDF: el texto se extrae con pdf.js. Un visor integrado te permite seleccionar texto en un PDF como en cualquier página. Los PDF escaneados (sin capa de texto) se pueden enviar a Anthropic como documento, tras confirmar el coste.

**En la conversación**
- Respuestas en Markdown por streaming, con tablas y bloques de código, más resúmenes de razonamiento plegables (Anthropic).
- Tarjetas de pregunta (`ask_user`): cuando el modelo necesita que decidas algo, te pregunta con opciones pulsables en lugar de adivinar.
- Tarjetas de archivo: los resultados se pueden descargar como `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics` o `vcf`, con copiar y previsualizar.
- Cada respuesta muestra su consumo de tokens; cada tarea se detiene a los 30 pasos de herramienta.

**Para quedarte**
- Memoria: di «recuerda…» y guardará datos breves sobre ti entre chats. Consúltala, edítala o desactívala en Ajustes.
- Historial: las últimas 30 conversaciones, agrupadas por fecha. Reábrelas para seguir hablando o expórtalas como Markdown.
- 12 habilidades integradas y comandos `/`; escribe las tuyas con el mismo formato `SKILL.md` que Claude Code.
- Interfaz en 15 idiomas; el tema claro y oscuro sigue al de tu sistema.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Selector de proveedor: Anthropic, OpenAI, Google Gemini, OpenRouter, personalizado (compatible con OpenAI)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Al escribir / se abre el menú de habilidades"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="Una tarjeta de pregunta con tres opciones, una de ellas recomendada"></td>
  </tr>
  <tr>
    <td align="center">Elige un proveedor</td>
    <td align="center">Escribe <code>/</code> para ver las habilidades</td>
    <td align="center">Pregunta en lugar de adivinar</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Visor de PDF integrado con una frase seleccionada, y el panel lateral explicándola">

## Primeros pasos

Browser Agent todavía no está en la Chrome Web Store (próximamente). Mientras tanto, instala la versión publicada: no hace falta Node.js ni compilar nada. Requiere Chrome 122 o superior.

1. Descarga `browser-agent-<versión>.zip` desde la [última versión](https://github.com/Wadoekeani/browser-agent/releases/latest) y descomprímelo.
2. Abre `chrome://extensions` y activa el **Modo de desarrollador** (arriba a la derecha).
3. Haz clic en **Cargar descomprimida** y elige la carpeta descomprimida.
4. Haz clic en el icono de la barra de herramientas para abrir el panel lateral, acepta el breve aviso sobre datos, elige un proveedor y pega una clave (o un endpoint local).

Para actualizar, descarga el nuevo zip, sustituye el contenido de la misma carpeta y haz clic en el icono de recarga en la tarjeta de la extensión. Tus ajustes, chats y recuerdos se conservan. Cargarla desde una carpeta distinta instala una copia aparte que empieza vacía.

### Compilar desde el código fuente

Necesitas Node.js 22 o superior.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Luego carga la carpeta `extension/` con **Cargar descomprimida** como en el paso 3.

## Proveedores

| Proveedor | Qué necesitas | Notas |
|---|---|---|
| Anthropic | [Clave de API](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; selector de esfuerzo; resúmenes de razonamiento; PDF escaneados |
| OpenAI | [Clave de API](https://platform.openai.com/api-keys) | La lista de modelos se obtiene del proveedor |
| Google Gemini | [Clave de API](https://aistudio.google.com/apikey) | Usa el endpoint de Gemini compatible con OpenAI |
| OpenRouter | [Clave de API](https://openrouter.ai/keys) | Cualquier modelo de OpenRouter con soporte de herramientas |
| Personalizado (compatible con OpenAI) | URL base, clave opcional | Ollama, LM Studio, vLLM, llama.cpp: cualquiera con `/chat/completions` |

Los servidores locales bloquean las extensiones de navegador por defecto:

- **Ollama:** define `OLLAMA_ORIGINS=chrome-extension://*` y reinicia Ollama (macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). URL base `http://localhost:11434/v1`.
- **LM Studio:** inicia el servidor con CORS activado, `lms server start --cors`. URL base `http://localhost:1234/v1`.

Elige un modelo que admita llamadas a herramientas (tool calling); sin eso el agente no puede actuar sobre la página. El uso lo factura tu proveedor; la extensión es gratuita.

## Habilidades

Escribe `/` en el compositor para elegir una, o deja que el modelo cargue una cuando encaje.

| Comando | Qué hace |
|---|---|
| `/summarize` | Conclusión de una línea, puntos clave y acciones a realizar sobre la página actual |
| `/translate` | Traduce la página a tu idioma, conservando títulos y párrafos |
| `/extract` | Vuelca los datos de la página en una tabla Markdown; un archivo CSV o JSON cuando hay mucho contenido |
| `/compare` | Crea una tabla comparativa de precios, planes o especificaciones y resalta las diferencias |
| `/explain` | Explica la página, un término o un fragmento de código en palabras sencillas |
| `/thread` | Resume un hilo de comentarios: argumentos principales, cada postura, consenso, comentarios que vale la pena leer |
| `/reply` | Redacta una respuesta al correo o mensaje de la página; puede rellenar el cuadro de respuesta, pero nunca lo envía |
| `/fill-form` | Rellena el formulario con tus datos; pregunta por lo que falte y se detiene antes de enviarlo |
| `/review-pr` | Revisa un pull request de GitHub y enumera los problemas por gravedad, con archivo y línea |
| `/checklist` | Convierte un tutorial en una lista de comprobación de pasos |
| `/decide` | Expone las opciones, pregunta por tus necesidades una a una y luego recomienda una |
| `/grill-me` | Pon a prueba tu plan (o la propuesta de la página) con una pregunta de opción múltiple a la vez |

`/clear` empieza una conversación nueva.

### Escribe las tuyas

Una habilidad es un archivo Markdown con frontmatter `name` y `description`, seguido de instrucciones:

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Gestiona las habilidades en **Ajustes → Habilidades**: crea, edita, importa archivos `.md`, exporta. Los archivos `SKILL.md` de Claude Code se importan tal cual. Una línea opcional `model:` (por ejemplo `model: haiku`) ejecuta esa habilidad en un modelo Claude más económico cuando usas Anthropic.

Solo los nombres y descripciones entran en el system prompt; el modelo llama a `use_skill` para cargar las instrucciones completas cuando las necesita, y escribir `/nombre` las adjunta directamente. Las habilidades son prompts: léela antes de importarla.

## Seguridad y privacidad

**Flujo de datos.** Tu navegador habla con un solo sitio: el proveedor o endpoint que hayas configurado. Una petición contiene tus mensajes, el contenido de la página que leyó el agente (o solo tu selección, o el PDF), tus recuerdos guardados y los nombres de tus habilidades. Tu clave de API, conversaciones, recuerdos y habilidades se guardan solo en `chrome.storage.local`. No hay servidor de Browser Agent, ni analítica, ni código remoto. No se envía nada antes de que aceptes el aviso de datos del primer uso. Detalles completos: [política de privacidad](store/privacy-policy.md).

**Qué necesita tu *Permitir*.** Estas acciones muestran una tarjeta en el panel lateral y no se ejecutan hasta que pulsas *Permitir*. La tarjeta vive en la propia página de la extensión, que un sitio web no puede pulsar por ti:

- clics y envíos de formulario que parecen irreversibles: el texto visible del botón, `aria-label`, title o value suena a pagar, comprar, pedir, eliminar, enviar, publicar, autorizar, guardar, compartir, instalar y similares (en los 15 idiomas de la interfaz); un formulario con varios campos o un campo de contraseña; un botón solo con icono dentro de un formulario; pulsar Intro en un campo que no está dentro de un formulario (cuadros de chat). Si el texto visible de un botón y su `aria-label` no coinciden, la tarjeta te avisa;
- ir a otro sitio, ya sea navegando o haciendo clic en un enlace, salvo que sea el sitio donde empezó la tarea, uno que hayas nombrado en tu mensaje, o uno que ya hayas permitido en esta tarea. La tarjeta muestra la URL completa, con la cadena de consulta incluida;
- guardar un recuerdo una vez que la conversación contiene contenido web (una página leída, un PDF, una selección).

Hacer clic en una sugerencia la envía al instante. Las sugerencias generadas a partir de la página se escriben tras leer su contenido, así que una página puede influir en ellas: los sitios que mencionan no cuentan como sitios que tú nombraste, y lo que desencadenen sigue pasando por las mismas tarjetas de confirmación. Los enlaces en las respuestas muestran su dominio real junto al texto.

**Salida y archivos.** Las respuestas del modelo se procesan con DOMPurify. Se eliminan imágenes, medios, SVG, iframes, formularios y estilos en línea, así que una página no puede hacer que el modelo filtre tu conversación a través de la URL de una imagen. Los archivos generados son solo formatos de texto plano (`csv`, `json`, `md`, …), y las celdas de CSV/TSV que empiezan como una fórmula de hoja de cálculo se neutralizan.

### Limitaciones conocidas

- **La inyección de prompts no está resuelta.** El agente lee y actúa sobre sitios web con tu sesión iniciada. Una página maliciosa puede intentar llevarlo a enviar tu conversación, tus recuerdos o datos de otros sitios a algún lugar, o a hacer cosas en tu nombre. Las tarjetas de confirmación cubren las acciones de alto riesgo descritas arriba; no son una protección completa.
- No lo uses en páginas no confiables mientras tengas abiertas pestañas de tu banco, correo o administración de empresa, y vigílalo mientras una tarea está en marcha.
- Detectar clics arriesgados es una heurística de palabras clave y forma del formulario. Se le escaparán algunos botones.
- Escribir en un campo del mismo sitio no pregunta. Una página maliciosa puede leer lo que escribe el agente (por ejemplo con un listener de `input`) y enviarlo a su propio servidor.
- Un `SKILL.md` importado son instrucciones de confianza. Importa solo habilidades que hayas leído.
- Los recuerdos y conversaciones se guardan sin cifrar en tu navegador y se envían al proveedor que elegiste como parte de cada petición.
- Cada tarea se detiene a los 30 pasos de herramienta, y cada respuesta muestra su consumo de tokens, así que un bucle descontrolado tiene un límite y es visible.

## Idiomas

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. El idioma predeterminado sigue al de tu navegador; cámbialo en **Ajustes → Idioma**. El modelo responde en el idioma de tu interfaz, a menos que escribas en otro.

## Desarrollo

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

El panel lateral es React + TypeScript empaquetado con esbuild en `extension/`. No hay backend: `src/agent.ts` ejecuta el bucle del agente en el panel lateral, llamando a Anthropic mediante el SDK oficial o a cualquier API compatible con OpenAI mediante `src/providers.ts`. Las herramientas en `src/tools.ts` se ejecutan en la pestaña activa con `chrome.scripting`; `src/elements.ts` genera la lista numerada de elementos y la comprobación de acciones irreversibles. La suite e2e no necesita clave de API y no gasta nada.

| Ruta | Qué es |
|---|---|
| `src/sidepanel.tsx` | Punto de entrada e interfaz principal (incorporación, chat, compositor, menú `/`) |
| `src/agent.ts` | Bucle del agente, carga de ajustes, habilidades por defecto, guardado/restauración de historial |
| `src/providers.ts` | Lista de proveedores y el adaptador compatible con OpenAI |
| `src/tools.ts` | Implementaciones de herramientas (`runTool`) y la barrera de confirmación |
| `src/shared.ts` | System prompt y definiciones de herramientas |
| `src/elements.ts` | Elementos interactivos numerados (referencias `data-ba`) y la comprobación de riesgo |
| `src/log.tsx` | Registro del chat, tarjetas, renderizado de Markdown con DOMPurify |
| `src/pages.tsx` | Ajustes, historial y editor de habilidades |
| `src/pdf.ts`, `src/viewer.ts` | Extracción de texto de PDF y el visor integrado |
| `src/selection.ts` | Chip de texto seleccionado |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | Análisis de `SKILL.md`, memoria, historial, tarjetas de archivo |
| `src/i18n/` | `t()` y los 15 diccionarios (`en.ts` es la fuente de la verdad) |
| `extension/` | Manifest, `_locales/`, HTML, service worker: carga esta carpeta en Chrome |

Para añadir una herramienta: agrega su esquema a `tools` en `src/shared.ts` y un `case` en `runTool` en `src/tools.ts`.

### Traducción

Copia `src/i18n/locales/en.ts` como, por ejemplo, `nl.ts`, decláralo como `const nl: Dict = { … }`, traduce los valores (conserva cada `{placeholder}`) y añádelo a `LANGS` y a los cargadores en `src/i18n/index.ts`. `npm run typecheck` falla si falta o sobra alguna clave; `npm run check` falla si un placeholder no coincide. Los prompts y las descripciones de herramientas que se envían al modelo se mantienen en un solo idioma a propósito. Para el nombre y la descripción en la Chrome Web Store, añade `extension/_locales/<code>/messages.json` (Chrome usa guiones bajos, por ejemplo `pt_BR`).

## Contribuir

Se aceptan issues y PR; consulta [CONTRIBUTING.md](CONTRIBUTING.md). Mantén los PR pequeños, ejecuta las tres comprobaciones de arriba y explica cómo probaste lo que no cubren.

## Licencia

[MIT](LICENSE). Browser Agent es un proyecto independiente, no afiliado con Anthropic, OpenAI ni Google.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supported by io Software" height="32"></a></p>
