<div align="center">

<img src="docs/logo.svg" width="72" alt="Logo de Browser Agent">

# Browser Agent

**Un agent IA dans le panneau latéral de Chrome qui lit et agit sur votre onglet — avec votre propre clé ou votre propre modèle local.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · Français · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="Sélection d'un paragraphe puis /explain pour l'expliquer, comparaison de prix d'ordinateurs portables dans un CSV, puis l'agent demande confirmation avant de cliquer sur Place order et l'utilisateur refuse">

</div>

## Pourquoi

- **Il agit sur la page que vous avez déjà ouverte.** Résumez, extrayez un tableau, remplissez un formulaire ou enchaînez quelques pages — sans copier-coller dans un onglet de chat séparé.
- **Choisissez votre modèle.** Anthropic, OpenAI, Gemini, OpenRouter, ou tout service qui parle l'API OpenAI — y compris Ollama, LM Studio et vLLM sur votre propre machine.
- **Aucun serveur intermédiaire.** Les requêtes vont directement de votre navigateur au fournisseur choisi. Votre clé, vos conversations et vos souvenirs restent dans `chrome.storage.local`. Pas d'analytique, pas de compte.
- **Les actions risquées attendent votre accord.** Les clics et envois de formulaires qui semblent irréversibles s'arrêtent jusqu'à ce que vous cliquiez sur *Autoriser* dans le panneau latéral. Cette vérification est imposée par le code de l'extension, pas simplement demandée au modèle.

## Fonctionnalités

**Agir sur la page**
- Outils : lire la page, cliquer, saisir du texte (y compris les listes déroulantes `<select>`), faire défiler, ouvrir une URL. Le modèle reçoit une liste numérotée d'éléments interactifs et clique sur `ref: 12` au lieu de deviner des sélecteurs CSS.
- Sélectionnez du texte sur la page et posez une question dessus uniquement ; c'est la sélection qui est jointe à votre message, pas tout l'onglet.
- PDF : le texte est extrait avec pdf.js. Une visionneuse intégrée permet de sélectionner du texte dans un PDF comme sur n'importe quelle page. Les PDF scannés (sans couche de texte) peuvent être envoyés à Anthropic comme document, après confirmation du coût.

**Dans la conversation**
- Réponses Markdown diffusées en continu, avec tableaux et blocs de code, plus des résumés de raisonnement dépliables (Anthropic).
- Cartes de question (`ask_user`) : quand le modèle a besoin d'une décision, il pose la question avec des options cliquables au lieu de deviner.
- Cartes de fichier : les résultats sont téléchargeables en `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics` ou `vcf`, avec copie et aperçu.
- Chaque réponse affiche sa consommation de tokens ; chaque tâche s'arrête après 30 étapes d'outils.

**Ce qui reste à vous**
- Mémoire : dites « souviens-toi… » et l'agent garde de courts faits sur vous d'une conversation à l'autre. Consultez, modifiez ou désactivez-la dans les Paramètres.
- Historique : les 30 dernières conversations, groupées par date. Rouvrez-en une pour continuer, ou exportez-la en Markdown.
- 12 compétences intégrées et des commandes `/` ; écrivez les vôtres au même format `SKILL.md` que Claude Code.
- Interface disponible en 15 langues ; le thème clair et sombre suit celui de votre système.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Sélecteur de fournisseur : Anthropic, OpenAI, Google Gemini, OpenRouter, personnalisé (compatible OpenAI)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Taper / ouvre le menu des compétences"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="Une carte de question avec trois options, dont une recommandée"></td>
  </tr>
  <tr>
    <td align="center">Choisissez un fournisseur</td>
    <td align="center">Tapez <code>/</code> pour les compétences</td>
    <td align="center">Il demande plutôt que de deviner</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Visionneuse PDF intégrée avec une phrase sélectionnée, et le panneau latéral qui l'explique">

## Démarrage rapide

Browser Agent n'est pas encore sur le Chrome Web Store (bientôt disponible). En attendant, installez la version publiée — pas besoin de Node.js ni d'étape de build. Nécessite Chrome 122+.

1. Téléchargez `browser-agent-<version>.zip` depuis la [dernière version](https://github.com/Wadoekeani/browser-agent/releases/latest) et décompressez-la.
2. Ouvrez `chrome://extensions` et activez le **Mode développeur** (en haut à droite).
3. Cliquez sur **Charger l'extension non empaquetée** et sélectionnez le dossier décompressé.
4. Cliquez sur l'icône dans la barre d'outils pour ouvrir le panneau latéral, acceptez le court avis sur les données, choisissez un fournisseur et collez une clé (ou un point de terminaison local).

Pour mettre à jour, téléchargez le nouveau zip, remplacez le contenu du même dossier, puis cliquez sur l'icône de rechargement de la carte de l'extension. Vos paramètres, conversations et souvenirs sont conservés. Charger l'extension depuis un dossier différent installe une copie séparée qui démarre vide.

### Compiler depuis les sources

Il vous faut Node.js 22+.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Puis chargez le dossier `extension/` avec **Charger l'extension non empaquetée** comme à l'étape 3.

## Fournisseurs

| Fournisseur | Ce qu'il vous faut | Remarques |
|---|---|---|
| Anthropic | [Clé API](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5 ; sélecteur d'effort ; résumés de raisonnement ; PDF scannés |
| OpenAI | [Clé API](https://platform.openai.com/api-keys) | La liste des modèles est récupérée auprès du fournisseur |
| Google Gemini | [Clé API](https://aistudio.google.com/apikey) | Utilise le point de terminaison de Gemini compatible OpenAI |
| OpenRouter | [Clé API](https://openrouter.ai/keys) | N'importe quel modèle compatible outils sur OpenRouter |
| Personnalisé (compatible OpenAI) | URL de base, clé facultative | Ollama, LM Studio, vLLM, llama.cpp — tout ce qui expose `/chat/completions` |

Les serveurs locaux bloquent les extensions de navigateur par défaut :

- **Ollama :** définissez `OLLAMA_ORIGINS=chrome-extension://*` et redémarrez Ollama (macOS : `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). URL de base `http://localhost:11434/v1`.
- **LM Studio :** démarrez le serveur avec CORS activé, `lms server start --cors`. URL de base `http://localhost:1234/v1`.

Choisissez un modèle qui prend en charge les appels d'outils (tool calling) ; sans cela, l'agent ne peut pas agir sur la page. L'usage est facturé par votre fournisseur ; l'extension est gratuite.

## Compétences

Tapez `/` dans le compositeur pour en choisir une, ou laissez le modèle en charger une quand c'est pertinent.

| Commande | Ce qu'elle fait |
|---|---|
| `/summarize` | Conclusion en une ligne, points clés et actions à mener pour la page actuelle |
| `/translate` | Traduit la page dans votre langue, en gardant titres et paragraphes |
| `/extract` | Extrait les données de la page dans un tableau Markdown ; un fichier CSV ou JSON s'il y en a beaucoup |
| `/compare` | Construit un tableau comparatif de prix, d'offres ou de caractéristiques et met en évidence les différences |
| `/explain` | Explique la page, un terme ou un extrait de code en mots simples |
| `/thread` | Résume un fil de commentaires : arguments principaux, chaque camp, consensus, commentaires à lire |
| `/reply` | Rédige une réponse à l'e-mail ou au message de la page ; peut remplir la zone de réponse, mais ne l'envoie jamais |
| `/fill-form` | Remplit le formulaire avec vos informations ; demande ce qui manque, s'arrête avant l'envoi |
| `/review-pr` | Passe en revue une pull request GitHub et liste les problèmes par gravité, avec fichier et ligne |
| `/checklist` | Transforme un tutoriel en liste d'étapes à cocher |
| `/decide` | Expose les options, pose vos besoins une question à la fois, puis recommande un choix |
| `/grill-me` | Met votre plan (ou la proposition de la page) à l'épreuve avec une question à choix multiple à la fois |

`/clear` démarre une nouvelle conversation.

### Écrivez les vôtres

Une compétence est un fichier Markdown avec un frontmatter `name` et `description`, suivi d'instructions :

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Gérez les compétences dans **Paramètres → Compétences** : créer, modifier, importer des fichiers `.md`, exporter. Les fichiers `SKILL.md` de Claude Code s'importent tels quels. Une ligne optionnelle `model:` (par exemple `model: haiku`) exécute cette compétence sur un modèle Claude moins cher lorsque vous utilisez Anthropic.

Seuls les noms et descriptions vont dans le system prompt ; le modèle appelle `use_skill` pour charger les instructions complètes quand il en a besoin, et taper `/nom` les joint directement. Les compétences sont des prompts — lisez-en une avant de l'importer.

## Sécurité et confidentialité

**Flux de données.** Votre navigateur ne parle qu'à un seul endroit : le fournisseur ou le point de terminaison que vous avez configuré. Une requête contient vos messages, le contenu de la page lu par l'agent (ou juste votre sélection, ou le PDF), vos souvenirs enregistrés et les noms de vos compétences. Votre clé API, vos conversations, souvenirs et compétences sont stockés uniquement dans `chrome.storage.local`. Il n'y a pas de serveur Browser Agent, pas d'analytique, pas de code distant. Rien n'est envoyé avant que vous acceptiez l'avis sur les données au premier lancement. Détails complets : [politique de confidentialité](store/privacy-policy.md).

**Ce qui nécessite votre *Autoriser*.** Ces actions affichent une carte dans le panneau latéral et ne s'exécutent pas tant que vous n'avez pas cliqué sur *Autoriser*. La carte vit dans la page propre de l'extension, qu'un site web ne peut pas cliquer à votre place :

- les clics et envois de formulaires qui semblent irréversibles : le texte visible du bouton, son `aria-label`, son titre ou sa valeur ressemble à payer, acheter, commander, supprimer, envoyer, publier, autoriser, enregistrer, partager, installer et similaires (dans les 15 langues de l'interface) ; un formulaire avec plusieurs champs ou un champ de mot de passe ; un bouton avec seulement une icône dans un formulaire ; appuyer sur Entrée dans un champ qui n'est pas dans un formulaire (zones de chat). Si le texte visible d'un bouton et son `aria-label` ne concordent pas, la carte vous avertit ;
- aller sur un autre site, en naviguant ou en cliquant sur un lien, sauf s'il s'agit du site où la tâche a commencé, d'un site que vous avez nommé dans votre message, ou d'un site déjà autorisé dans cette tâche. La carte affiche l'URL complète, chaîne de requête incluse ;
- enregistrer un souvenir une fois que la conversation contient du contenu web (une page lue, un PDF, une sélection).

Cliquer sur une suggestion l'envoie immédiatement. Les suggestions générées à partir de la page sont écrites après lecture du contenu de la page, donc une page peut les influencer : les sites qu'elles mentionnent ne comptent pas comme des sites que vous avez nommés, et ce qu'elles déclenchent passe quand même par les mêmes cartes de confirmation. Les liens dans les réponses affichent leur vrai domaine à côté du texte.

**Sortie et fichiers.** Les réponses du modèle sont rendues avec DOMPurify. Images, médias, SVG, iframes, formulaires et styles en ligne sont supprimés, donc une page ne peut pas amener le modèle à divulguer votre conversation via l'URL d'une image. Les fichiers générés sont uniquement au format texte brut (`csv`, `json`, `md`, …), et les cellules CSV/TSV qui commencent comme une formule de tableur sont neutralisées.

### Limites connues

- **L'injection de prompt n'est pas résolue.** L'agent lit et agit sur des sites web avec votre session connectée. Une page malveillante peut tenter de le pousser à envoyer votre conversation, vos souvenirs ou des données d'autres sites quelque part, ou à agir en votre nom. Les cartes de confirmation couvrent les actions à haut risque ci-dessus ; ce n'est pas une protection complète.
- Ne l'utilisez pas sur des pages non fiables tant que des onglets vers votre banque, votre messagerie ou l'administration de votre entreprise sont ouverts, et surveillez-le pendant qu'une tâche est en cours.
- La détection des clics risqués repose sur une heuristique de mots-clés et de forme de formulaire. Elle ratera certains boutons.
- Taper dans un champ du même site ne demande pas de confirmation. Une page malveillante peut lire ce que l'agent tape (par exemple avec un écouteur `input`) et l'envoyer à son propre serveur.
- Un `SKILL.md` importé constitue des instructions de confiance. N'importez que des compétences que vous avez lues.
- Les souvenirs et conversations sont stockés en clair dans votre navigateur et envoyés au fournisseur choisi dans le cadre de chaque requête.
- Chaque tâche s'arrête après 30 étapes d'outils, et chaque réponse affiche sa consommation de tokens, donc une boucle incontrôlée est bornée et visible.

## Langues

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. La langue par défaut suit celle de votre navigateur ; changez-la dans **Paramètres → Langue**. Le modèle répond dans la langue de votre interface, sauf si vous écrivez dans une autre.

## Développement

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

Le panneau latéral est en React + TypeScript, empaqueté par esbuild dans `extension/`. Il n'y a pas de backend : `src/agent.ts` exécute la boucle de l'agent dans le panneau latéral, en appelant Anthropic via le SDK officiel ou n'importe quelle API compatible OpenAI via `src/providers.ts`. Les outils dans `src/tools.ts` s'exécutent dans l'onglet actif avec `chrome.scripting` ; `src/elements.ts` construit la liste numérotée des éléments et la vérification des actions irréversibles. La suite e2e ne nécessite aucune clé API et ne coûte rien.

| Chemin | Description |
|---|---|
| `src/sidepanel.tsx` | Point d'entrée et interface principale (accueil, chat, compositeur, menu `/`) |
| `src/agent.ts` | Boucle de l'agent, chargement des paramètres, compétences par défaut, sauvegarde/restauration de l'historique |
| `src/providers.ts` | Liste des fournisseurs et l'adaptateur compatible OpenAI |
| `src/tools.ts` | Implémentations des outils (`runTool`) et la barrière de confirmation |
| `src/shared.ts` | System prompt et définitions des outils |
| `src/elements.ts` | Éléments interactifs numérotés (références `data-ba`) et la vérification des risques |
| `src/log.tsx` | Journal du chat, cartes, rendu Markdown avec DOMPurify |
| `src/pages.tsx` | Paramètres, historique et éditeur de compétences |
| `src/pdf.ts`, `src/viewer.ts` | Extraction de texte PDF et la visionneuse intégrée |
| `src/selection.ts` | Puce de texte sélectionné |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | Analyse de `SKILL.md`, mémoire, historique, cartes de fichier |
| `src/i18n/` | `t()` et les 15 dictionnaires (`en.ts` fait foi) |
| `extension/` | Manifest, `_locales/`, HTML, service worker — chargez ce dossier dans Chrome |

Pour ajouter un outil : ajoutez son schéma à `tools` dans `src/shared.ts` et un `case` dans `runTool` dans `src/tools.ts`.

### Traduire

Copiez `src/i18n/locales/en.ts` en, par exemple, `nl.ts`, déclarez-le comme `const nl: Dict = { … }`, traduisez les valeurs (conservez chaque `{placeholder}`), puis ajoutez-le à `LANGS` et aux chargeurs dans `src/i18n/index.ts`. `npm run typecheck` échoue si une clé manque ou est en trop ; `npm run check` échoue si un placeholder ne correspond pas. Les prompts et descriptions d'outils envoyés au modèle restent volontairement dans une seule langue. Pour le nom et la description sur le Chrome Web Store, ajoutez `extension/_locales/<code>/messages.json` (Chrome utilise des tirets bas, par exemple `pt_BR`).

## Contribuer

Les issues et PR sont les bienvenues — voir [CONTRIBUTING.md](CONTRIBUTING.md). Gardez les PR petites, exécutez les trois vérifications ci-dessus, et indiquez comment vous avez testé ce qu'elles ne couvrent pas.

## Licence

[MIT](LICENSE). Browser Agent est un projet indépendant, non affilié à Anthropic, OpenAI ou Google.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Supported by io Software" height="32"></a></p>
