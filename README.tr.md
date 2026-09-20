<div align="center">

<img src="docs/logo.svg" width="72" alt="Browser Agent logosu">

# Browser Agent

**Chrome'un yan panelinde çalışan, sekmenizi okuyup üzerinde işlem yapan bir AI ajanı — kendi API anahtarınızla veya kendi yerel modelinizle.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · [Bahasa Indonesia](README.id.md) · [ไทย](README.th.md) · Türkçe

<img src="docs/demo.gif" width="900" alt="Bir paragraf seçip /explain komutu çalıştırma, laptop fiyatlarını bir CSV'de karşılaştırma, ardından ajanın Place order'a tıklamadan önce sorması ve kullanıcının bunu reddetmesi">

</div>

## Neden

- **Zaten üzerinde olduğunuz sayfada çalışır.** Özetle, bir tablo çıkar, bir formu doldur veya birkaç sayfa arasında gezin — bir sohbet sekmesine kopyala-yapıştır yapmadan.
- **Kendi modelinizi kullanın.** Anthropic, OpenAI, Gemini, OpenRouter veya OpenAI API'siyle konuşan herhangi bir şey — kendi makinenizdeki Ollama, LM Studio ve vLLM dahil.
- **Arada sunucu yok.** İstekler tarayıcınızdan doğrudan seçtiğiniz sağlayıcıya gider. Anahtarınız, sohbetleriniz ve hafızalarınız yalnızca `chrome.storage.local`'da kalır. Analitik yok, hesap yok.
- **Riskli işlemler sizi bekler.** Geri alınamaz görünen tıklamalar ve form gönderimleri, yan panelde *İzin ver*'e basana kadar durur. Bu kontrol modele nazikçe rica ederek değil, eklentinin kodu tarafından zorunlu kılınır.

## Özellikler

**Sayfa üzerinde işlem yapma**
- Araçlar: sayfayı okuma, tıklama, yazma (`<select>` açılır menüleri dahil), kaydırma, bir URL açma. Modele numaralandırılmış etkileşimli öğeler listesi verilir ve CSS seçicisi tahmin etmek yerine `ref: 12` şeklinde tıklar.
- Sayfada metin seçip sadece onunla ilgili soru sorun; seçim, tüm sekme yerine mesajınıza eklenir.
- PDF'ler: metin pdf.js ile çıkarılır. Yerleşik görüntüleyici, bir PDF'de tıpkı normal bir sayfada olduğu gibi metin seçmenizi sağlar. Taranmış PDF'ler (metin katmanı olmayan) maliyeti onayladıktan sonra bir belge olarak Anthropic'e gönderilebilir.

**Sohbet içinde**
- Tablolar ve kod bloklarıyla akan Markdown yanıtları, ayrıca daraltılabilir düşünme özetleri (Anthropic).
- Soru kartları (`ask_user`): model bir karar vermeye ihtiyaç duyduğunda, tahmin etmek yerine tıklanabilir seçeneklerle sorar.
- Dosya kartları: sonuçlar indirilebilir `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics` veya `vcf` dosyaları olarak, kopyalama ve önizlemeyle birlikte.
- Her yanıt kendi token kullanımını gösterir; her görev 30 araç adımından sonra durur.

**Size ait, saklanır**
- Hafıza: "şunu hatırla …" deyin, sohbetler arasında sizinle ilgili kısa bilgileri saklar. Ayarlar'da görüntüleyin, düzenleyin veya kapatın.
- Geçmiş: son 30 konuşma, tarihe göre gruplanmış. Birini yeniden açıp devam edin veya Markdown olarak dışa aktarın.
- 12 yerleşik beceri ve `/` komutları; kendinizinkini Claude Code ile aynı `SKILL.md` formatında yazın.
- 15 dilde arayüz; açık ve koyu tema sisteminizi takip eder.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Sağlayıcı seçici: Anthropic, OpenAI, Google Gemini, OpenRouter, Özel (OpenAI uyumlu)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Yazarken / beceri menüsünü açar"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="Biri önerilen üç seçenekli bir soru kartı"></td>
  </tr>
  <tr>
    <td align="center">Bir sağlayıcı seçin</td>
    <td align="center">Beceriler için <code>/</code> yazın</td>
    <td align="center">Tahmin etmek yerine sorar</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Seçili bir cümleyle yerleşik PDF görüntüleyici, ve onu açıklayan yan panel">

## Hızlı başlangıç

Browser Agent henüz Chrome Web Store'da değil (yakında geliyor). O zamana kadar, sürüm build'ini kurun — Node.js veya build adımına gerek yok. Chrome 122+ gerektirir.

1. [En son sürümden](https://github.com/Wadoekeani/browser-agent/releases/latest) `browser-agent-<version>.zip` dosyasını indirin ve açın.
2. `chrome://extensions` sayfasını açın ve **Developer mode**'u (Geliştirici modu, sağ üstte) etkinleştirin.
3. **Load unpacked**'e (Paketlenmemiş öğe yükle) tıklayın ve açtığınız klasörü seçin.
4. Yan paneli açmak için araç çubuğu simgesine tıklayın, kısa veri bildirimini kabul edin, bir sağlayıcı seçin ve bir anahtar (veya yerel bir endpoint) yapıştırın.

Güncellemek için yeni zip dosyasını indirin, aynı klasörün içeriğini değiştirin ve eklenti kartındaki yeniden yükle simgesine tıklayın. Ayarlarınız, sohbetleriniz ve hafızalarınız korunur. Farklı bir klasörden yüklemek, boş başlayan ayrı bir kopya kurar.

### Kaynaktan build alma

Node.js 22+ gerekir.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Ardından `extension/` klasörünü 3. adımdaki gibi **Load unpacked** ile yükleyin.

## Sağlayıcılar

| Sağlayıcı | İhtiyacınız olan | Notlar |
|---|---|---|
| Anthropic | [API anahtarı](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; effort seçici; düşünme özetleri; taranmış PDF'ler |
| OpenAI | [API anahtarı](https://platform.openai.com/api-keys) | Model listesi sağlayıcıdan çekilir |
| Google Gemini | [API anahtarı](https://aistudio.google.com/apikey) | Gemini'nin OpenAI uyumlu endpoint'ini kullanır |
| OpenRouter | [API anahtarı](https://openrouter.ai/keys) | OpenRouter'daki araç kullanabilen herhangi bir model |
| Özel (OpenAI uyumlu) | Base URL, anahtar isteğe bağlı | Ollama, LM Studio, vLLM, llama.cpp — `/chat/completions` olan her şey |

Yerel sunucular varsayılan olarak tarayıcı eklentilerini engeller:

- **Ollama:** `OLLAMA_ORIGINS=chrome-extension://*` ayarlayın ve Ollama'yı yeniden başlatın (macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). Base URL: `http://localhost:11434/v1`.
- **LM Studio:** sunucuyu CORS açık olarak başlatın, `lms server start --cors`. Base URL: `http://localhost:1234/v1`.

Araç çağırmayı destekleyen bir model seçin; ajan bu olmadan sayfa üzerinde işlem yapamaz. Kullanım sağlayıcınız tarafından faturalandırılır; eklenti ücretsizdir.

## Beceriler

Bir tanesini seçmek için mesaj kutusuna `/` yazın, ya da uygun olduğunda modelin kendisinin yüklemesine izin verin.

| Komut | Ne yapar |
|---|---|
| `/summarize` | Mevcut sayfa için tek satırlık özet, ana noktalar ve yapılacaklar |
| `/translate` | Sayfayı başlıkları ve paragrafları koruyarak kendi dilinize çevirir |
| `/extract` | Sayfadaki verileri bir Markdown tablosuna çeker; çok fazla veri varsa bir CSV veya JSON dosyası olarak |
| `/compare` | Fiyatların, planların veya özelliklerin karşılaştırma tablosunu oluşturur ve farkları vurgular |
| `/explain` | Sayfayı, bir terimi veya bir kod parçasını sade bir dille açıklar |
| `/thread` | Bir yorum başlığını özetler: ana argümanlar, her bir taraf, fikir birliği, okumaya değer yorumlar |
| `/reply` | Sayfadaki e-posta veya mesaja bir yanıt taslağı hazırlar; yanıt kutusunu doldurabilir, asla göndermez |
| `/fill-form` | Formu bilgilerinizle doldurur; eksik olan her şeyi sorar, göndermeden önce durur |
| `/review-pr` | Bir GitHub pull request'ini inceler ve sorunları önem derecesine göre, dosya ve satırıyla listeler |
| `/checklist` | Bir eğitimi adım adım bir kontrol listesine dönüştürür |
| `/decide` | Seçenekleri ortaya koyar, ihtiyaçlarınızı birer birer sorar, sonra birini önerir |
| `/grill-me` | Planınızı (veya sayfadaki teklifi) her seferinde bir çoktan seçmeli soruyla test eder |

`/clear` yeni bir konuşma başlatır.

### Kendi becerinizi yazın

Bir beceri, `name` ve `description` frontmatter'ına sahip, ardından talimatlar içeren bir Markdown dosyasıdır:

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Becerileri **Settings → Skills**'de (Ayarlar → Beceriler) yönetin: oluşturun, düzenleyin, `.md` dosyaları içe aktarın, dışa aktarın. Claude Code'un `SKILL.md` dosyaları olduğu gibi içe aktarılır. İsteğe bağlı bir `model:` satırı (örneğin `model: haiku`), Anthropic kullandığınızda o beceriyi daha ucuz bir Claude modelinde çalıştırır.

Sistem prompt'una yalnızca isimler ve açıklamalar girer; model, ihtiyaç duyduğunda tam talimatları yüklemek için `use_skill`'i çağırır, `/isim` yazmak ise onları doğrudan ekler. Beceriler birer prompt'tur — içe aktarmadan önce okuyun.

## Güvenlik ve gizlilik

**Veri akışı.** Tarayıcınız yalnızca tek bir yerle konuşur: yapılandırdığınız sağlayıcı veya endpoint. Bir istek; mesajlarınızı, ajanın okuduğu sayfa içeriğini (veya sadece seçiminizi, ya da PDF'i), kayıtlı hafızalarınızı ve beceri adlarınızı içerir. API anahtarınız, konuşmalarınız, hafızalarınız ve becerileriniz yalnızca `chrome.storage.local`'da saklanır. Bir Browser Agent sunucusu, analitik veya uzak kod yoktur. İlk çalıştırma veri bildirimini kabul etmeden hiçbir şey gönderilmez. Tam ayrıntılar: [gizlilik politikası](store/privacy-policy.md).

***İzin ver*'inizi gerektiren şeyler.** Bu işlemler yan panelde bir kart gösterir ve siz *İzin ver*'e basana kadar çalışmaz. Kart, bir web sitesinin sizin adınıza tıklayamayacağı, eklentinin kendi sayfasında bulunur:

- geri alınamaz görünen tıklamalar ve form gönderimleri: düğmenin görünür metni, `aria-label`'ı, title'ı veya value'su öde, satın al, sipariş ver, sil, gönder, yayınla, yetkilendir, kaydet, paylaş, yükle ve benzerleri gibi okunuyorsa (15 arayüz dilinin tümünde); birden fazla alanı veya bir şifre alanı olan bir form; bir form içindeki yalnızca simgeli bir düğme; bir form içinde olmayan bir alanda (sohbet kutuları) Enter'a basmak. Bir düğmenin görünür metni ile `aria-label`'ı uyuşmuyorsa, kart sizi uyarır;
- görevin başladığı site, mesajınızda belirttiğiniz bir site veya bu görevde zaten izin verdiğiniz bir site olmadıkça, gezinerek veya bir bağlantıya tıklayarak başka bir siteye gitmek. Kart, sorgu dizesi dahil tam URL'yi gösterir;
- konuşma web içeriği içerdiğinde (okuduğu bir sayfa, bir PDF, bir seçim) bir hafıza kaydetmek.

Bir öneriye tıklamak onu hemen gönderir. Sayfadan üretilen öneriler sayfa içeriği okunduktan sonra yazılır, dolayısıyla bir sayfa bunları etkileyebilir: bahsettikleri siteler sizin belirttiğiniz siteler sayılmaz ve tetikledikleri şey yine aynı onay kartlarından geçer. Yanıtlardaki bağlantılar metnin yanında gerçek alan adlarını gösterir.

**Çıktı ve dosyalar.** Model yanıtları DOMPurify ile render edilir. Görseller, medya, SVG, iframe'ler, formlar ve satır içi stiller çıkarılır, böylece bir sayfa modeli bir görsel URL'si üzerinden konuşmanızı sızdırmaya zorlayamaz. Üretilen dosyalar yalnızca düz metin formatlarıdır (`csv`, `json`, `md`, …) ve bir e-tablo formülü gibi başlayan CSV/TSV hücreleri etkisiz hale getirilir.

### Bilinen sınırlamalar

- **Prompt injection çözülmüş değildir.** Ajan, oturum açtığınız web sitelerini okur ve üzerinde işlem yapar. Kötü niyetli bir sayfa, konuşmanızı, hafızalarınızı veya diğer sitelerden gelen verileri bir yere göndermesi ya da sizin adınıza bir şeyler yapması için onu yönlendirmeye çalışabilir. Onay kartları yukarıdaki yüksek riskli işlemleri kapsar; bunlar tam bir koruma değildir.
- Bankanız, e-postanız veya şirket yönetici panelinizle ilgili sekmeler açıkken güvenilmeyen sayfalarda çalıştırmayın ve bir görev çalışırken onu izleyin.
- Riskli tıklamaları tespit etmek anahtar kelime ve form şekli sezgisine dayanır. Bazı düğmeleri kaçırabilir.
- Aynı sitedeki bir alana yazmak sormaz. Kötü niyetli bir sayfa, ajanın yazdıklarını okuyabilir (örneğin bir `input` dinleyicisiyle) ve kendi sunucusuna gönderebilir.
- İçe aktarılan bir `SKILL.md`, güvenilir talimatlardır. Yalnızca okuduğunuz becerileri içe aktarın.
- Hafızalar ve konuşmalar tarayıcınızda şifrelenmeden saklanır ve her isteğin parçası olarak seçtiğiniz sağlayıcıya gönderilir.
- Her görev 30 araç adımından sonra durur ve her yanıt kendi token kullanımını gösterir, böylece kontrolden çıkan bir döngü sınırlı ve görünür kalır.

## Diller

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. Varsayılan, tarayıcınızı takip eder; **Settings → Language**'den (Ayarlar → Dil) değiştirin. Model, siz başka bir dilde yazmadıkça arayüz dilinizde yanıt verir.

## Geliştirme

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

Yan panel, esbuild tarafından `extension/` içine paketlenen React + TypeScript'tir. Arka uç yoktur: `src/agent.ts`, yan panelde ajan döngüsünü çalıştırır, Anthropic'i resmi SDK üzerinden veya `src/providers.ts` aracılığıyla OpenAI uyumlu herhangi bir API'yi çağırır. `src/tools.ts` içindeki araçlar, `chrome.scripting` ile aktif sekmede çalışır; `src/elements.ts`, numaralandırılmış öğe listesini ve geri alınamaz işlem kontrolünü oluşturur. e2e test paketi bir API anahtarına ihtiyaç duymaz ve hiçbir şey harcamaz.

| Yol | Ne için |
|---|---|
| `src/sidepanel.tsx` | Giriş noktası ve ana UI (onboarding, sohbet, mesaj kutusu, `/` menüsü) |
| `src/agent.ts` | Ajan döngüsü, ayarların yüklenmesi, varsayılan beceriler, geçmişi kaydetme/geri yükleme |
| `src/providers.ts` | Sağlayıcı listesi ve OpenAI uyumlu adaptör |
| `src/tools.ts` | Araç uygulamaları (`runTool`) ve onay kapısı |
| `src/shared.ts` | Sistem prompt'u ve araç tanımları |
| `src/elements.ts` | Numaralandırılmış etkileşimli öğeler (`data-ba` referansları) ve risk kontrolü |
| `src/log.tsx` | Sohbet günlüğü, kartlar, DOMPurify ile Markdown render'ı |
| `src/pages.tsx` | Ayarlar, geçmiş ve beceri düzenleyici |
| `src/pdf.ts`, `src/viewer.ts` | PDF metin çıkarma ve yerleşik görüntüleyici |
| `src/selection.ts` | Seçili metin çipi |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | `SKILL.md` ayrıştırma, hafıza, geçmiş, dosya kartları |
| `src/i18n/` | `t()` ve 15 sözlük (`en.ts` referans kaynaktır) |
| `extension/` | Manifest, `_locales/`, HTML, service worker — bu klasörü Chrome'a yükleyin |

Bir araç eklemek için: şemasını `src/shared.ts` içindeki `tools`'a ve `src/tools.ts` içindeki `runTool`'a bir `case` ekleyin.

### Çeviri yapmak

`src/i18n/locales/en.ts` dosyasını örneğin `nl.ts` olarak kopyalayın, `const nl: Dict = { … }` şeklinde tanımlayın, değerleri çevirin (her `{placeholder}`'ı koruyun) ve `src/i18n/index.ts` içindeki `LANGS`'a ve yükleyicilere ekleyin. `npm run typecheck`, eksik veya fazla bir anahtar olduğunda başarısız olur; `npm run check`, eşleşmeyen bir placeholder olduğunda başarısız olur. Modele gönderilen prompt'lar ve araç açıklamaları kasıtlı olarak tek bir dilde kalır. Chrome Web Store adı ve açıklaması için `extension/_locales/<code>/messages.json` ekleyin (Chrome alt çizgi kullanır, örneğin `pt_BR`).

## Katkıda bulunma

Issue'lar ve PR'lar memnuniyetle karşılanır — bkz. [CONTRIBUTING.md](CONTRIBUTING.md). PR'ları küçük tutun, yukarıdaki üç kontrolü çalıştırın ve bunların kapsamadığı şeyleri nasıl test ettiğinizi belirtin.

## Lisans

[MIT](LICENSE). Browser Agent bağımsız bir projedir, Anthropic, OpenAI veya Google ile bağlantılı değildir.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="io Software desteğiyle" height="32"></a></p>
