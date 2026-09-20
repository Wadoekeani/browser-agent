<div align="center">

<img src="docs/logo.svg" width="72" alt="Logo Browser Agent">

# Browser Agent

**Agen AI di side panel Chrome yang membaca dan bekerja di tab Anda — dengan kunci API Anda sendiri atau model lokal Anda sendiri.**

[![CI](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Wadoekeani/browser-agent/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/Wadoekeani/browser-agent)](https://github.com/Wadoekeani/browser-agent/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Chrome 122+](https://img.shields.io/badge/Chrome-122%2B-4285F4?logo=googlechrome&logoColor=white)

[English](README.md) · [繁體中文](README.zh-TW.md) · [简体中文](README.zh-CN.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Português (Brasil)](README.pt-BR.md) · [Italiano](README.it.md) · [Русский](README.ru.md) · [Tiếng Việt](README.vi.md) · Bahasa Indonesia · [ไทย](README.th.md) · [Türkçe](README.tr.md)

<img src="docs/demo.gif" width="900" alt="Memilih satu paragraf dan menjalankan /explain, membandingkan harga laptop ke dalam CSV, lalu agen bertanya sebelum mengklik Place order dan pengguna menolaknya">

</div>

## Kenapa

- **Bekerja langsung di halaman yang sedang Anda buka.** Meringkas, menarik data ke tabel, mengisi formulir, atau mengeklik beberapa halaman — tanpa perlu copy-paste ke tab chat.
- **Bawa model Anda sendiri.** Anthropic, OpenAI, Gemini, OpenRouter, atau apa pun yang mendukung OpenAI API — termasuk Ollama, LM Studio, dan vLLM di komputer Anda sendiri.
- **Tidak ada server di tengah.** Permintaan langsung dari browser Anda ke penyedia yang Anda pilih. Kunci, percakapan, dan memori Anda tetap tersimpan di `chrome.storage.local`. Tanpa analitik, tanpa akun.
- **Aksi berisiko menunggu izin Anda.** Klik dan pengiriman formulir yang terlihat tak bisa dibatalkan akan berhenti sampai Anda menekan *Izinkan* di side panel. Pemeriksaan ini dijalankan oleh kode ekstensi, bukan sekadar meminta model dengan baik-baik.

## Fitur

**Beraksi di halaman**
- Alat: membaca halaman, mengklik, mengetik (termasuk dropdown `<select>`), menggulir, membuka URL. Model mendapat daftar bernomor elemen interaktif dan mengklik `ref: 12`, bukan menebak-nebak CSS selector.
- Pilih teks di halaman dan tanyakan hanya tentang itu; seleksi tersebut dilampirkan ke pesan Anda, bukan seluruh tab.
- PDF: teks diekstrak dengan pdf.js. Penampil bawaan memungkinkan Anda memilih teks dalam PDF seperti di halaman biasa. PDF hasil pindai (tanpa lapisan teks) dapat dikirim ke Anthropic sebagai dokumen, setelah Anda mengonfirmasi biayanya.

**Dalam percakapan**
- Balasan Markdown secara streaming dengan tabel dan blok kode, plus ringkasan pemikiran yang dapat dilipat (Anthropic).
- Kartu pertanyaan (`ask_user`): saat model perlu membuat keputusan, ia bertanya dengan opsi yang bisa diklik, bukan menebak.
- Kartu file: hasil sebagai file `csv`, `json`, `md`, `txt`, `tsv`, `xml`, `yaml`, `ics`, atau `vcf` yang bisa diunduh, dengan opsi salin dan pratinjau.
- Setiap balasan menampilkan penggunaan token; setiap tugas berhenti setelah 30 langkah alat.

**Milik Anda untuk disimpan**
- Memori: katakan "ingat …" dan ia akan menyimpan fakta singkat tentang Anda lintas percakapan. Lihat, edit, atau matikan di Pengaturan.
- Riwayat: 30 percakapan terakhir, dikelompokkan berdasarkan tanggal. Buka kembali dan lanjutkan, atau ekspor sebagai Markdown.
- 12 skill bawaan dan perintah `/`; tulis skill Anda sendiri dengan format `SKILL.md` yang sama seperti Claude Code.
- Antarmuka dalam 15 bahasa; tema terang dan gelap mengikuti sistem Anda.

<table>
  <tr>
    <td width="33%"><img src="docs/providers.png" alt="Pemilih penyedia: Anthropic, OpenAI, Google Gemini, OpenRouter, Kustom (kompatibel OpenAI)"></td>
    <td width="33%"><img src="docs/skills.png" alt="Mengetik / membuka menu skill"></td>
    <td width="33%"><img src="docs/ask-user.png" alt="Kartu pertanyaan dengan tiga opsi, satu direkomendasikan"></td>
  </tr>
  <tr>
    <td align="center">Pilih penyedia</td>
    <td align="center">Ketik <code>/</code> untuk skill</td>
    <td align="center">Ia bertanya, bukan menebak</td>
  </tr>
</table>

<img src="docs/pdf-viewer.png" alt="Penampil PDF bawaan dengan satu kalimat terpilih, dan side panel menjelaskannya">

## Mulai cepat

Browser Agent belum ada di Chrome Web Store (segera hadir). Sementara itu, instal build rilis — tidak perlu Node.js atau proses build. Membutuhkan Chrome 122+.

1. Unduh `browser-agent-<version>.zip` dari [rilis terbaru](https://github.com/Wadoekeani/browser-agent/releases/latest) dan ekstrak.
2. Buka `chrome://extensions` dan aktifkan **Developer mode** (Mode pengembang, di kanan atas).
3. Klik **Load unpacked** (Muat yang belum dikemas) dan pilih folder hasil ekstrak.
4. Klik ikon di toolbar untuk membuka side panel, setujui pemberitahuan data singkat, pilih penyedia, dan tempel kunci API (atau endpoint lokal).

Untuk memperbarui, unduh zip baru, ganti isi folder yang sama, lalu klik ikon reload pada kartu ekstensi. Pengaturan, percakapan, dan memori Anda tetap tersimpan. Memuatnya dari folder berbeda akan menginstal salinan terpisah yang mulai dari kosong.

### Build dari sumber

Anda memerlukan Node.js 22+.

```bash
git clone https://github.com/Wadoekeani/browser-agent.git
cd browser-agent
npm ci
npm run build
```

Lalu muat folder `extension/` dengan **Load unpacked** seperti pada langkah 3.

## Penyedia

| Penyedia | Yang Anda perlukan | Catatan |
|---|---|---|
| Anthropic | [Kunci API](https://console.anthropic.com/settings/keys) | Sonnet 5, Opus 5, Haiku 4.5; pemilih effort; ringkasan pemikiran; PDF hasil pindai |
| OpenAI | [Kunci API](https://platform.openai.com/api-keys) | Daftar model diambil dari penyedia |
| Google Gemini | [Kunci API](https://aistudio.google.com/apikey) | Menggunakan endpoint Gemini yang kompatibel dengan OpenAI |
| OpenRouter | [Kunci API](https://openrouter.ai/keys) | Model apa pun di OpenRouter yang mendukung tool calling |
| Kustom (kompatibel OpenAI) | Base URL, kunci opsional | Ollama, LM Studio, vLLM, llama.cpp — apa pun dengan `/chat/completions` |

Server lokal memblokir ekstensi browser secara default:

- **Ollama:** atur `OLLAMA_ORIGINS=chrome-extension://*` dan mulai ulang Ollama (macOS: `launchctl setenv OLLAMA_ORIGINS "chrome-extension://*"`). Base URL `http://localhost:11434/v1`.
- **LM Studio:** jalankan server dengan CORS aktif, `lms server start --cors`. Base URL `http://localhost:1234/v1`.

Pilih model yang mendukung tool calling; agen tidak bisa beraksi di halaman tanpanya. Penggunaan ditagih oleh penyedia Anda; ekstensinya sendiri gratis.

## Skill

Ketik `/` di kotak pesan untuk memilih salah satu, atau biarkan model memuatnya sendiri saat cocok.

| Perintah | Fungsinya |
|---|---|
| `/summarize` | Ringkasan satu baris, poin utama, dan hal yang perlu ditindaklanjuti dari halaman saat ini |
| `/translate` | Terjemahkan halaman ke bahasa Anda, mempertahankan struktur judul dan paragraf |
| `/extract` | Tarik data di halaman ke tabel Markdown; jadi file CSV atau JSON jika datanya banyak |
| `/compare` | Buat tabel perbandingan harga, paket, atau spesifikasi dan soroti perbedaannya |
| `/explain` | Jelaskan halaman, istilah, atau potongan kode dengan bahasa sederhana |
| `/thread` | Rangkum utas komentar: argumen utama, masing-masing pihak, konsensus, komentar yang layak dibaca |
| `/reply` | Susun draf balasan untuk email atau pesan di halaman; bisa mengisi kotak balasan, tapi tidak pernah mengirim |
| `/fill-form` | Isi formulir dengan data Anda; menanyakan apa pun yang kurang, berhenti sebelum mengirim |
| `/review-pr` | Tinjau pull request GitHub dan daftar masalah berdasarkan tingkat keparahan, dengan file dan baris |
| `/checklist` | Ubah tutorial menjadi daftar periksa langkah-langkah |
| `/decide` | Uraikan pilihan yang ada, tanyakan kebutuhan Anda satu per satu, lalu rekomendasikan salah satu |
| `/grill-me` | Uji ketahanan rencana Anda (atau proposal di halaman) dengan satu pertanyaan pilihan ganda setiap kali |

`/clear` memulai percakapan baru.

### Tulis sendiri

Skill adalah file Markdown dengan frontmatter `name` dan `description`, diikuti instruksi:

```markdown
---
name: meeting-notes
description: Turn a meeting page into decisions, action items and owners
---

1. Read the whole page with read_page.
2. List decisions, then a table of action items with owner and due date.
```

Kelola skill di **Settings → Skills** (Pengaturan → Skill): buat, edit, impor file `.md`, ekspor. File `SKILL.md` dari Claude Code diimpor apa adanya. Baris opsional `model:` (misalnya `model: haiku`) menjalankan skill tersebut dengan model Claude yang lebih murah saat Anda menggunakan Anthropic.

Hanya nama dan deskripsi yang masuk ke system prompt; model memanggil `use_skill` untuk memuat instruksi lengkap saat diperlukan, dan mengetik `/nama` langsung melampirkannya. Skill adalah prompt — bacalah sebelum mengimpornya.

## Keamanan & privasi

**Alur data.** Browser Anda hanya berbicara ke satu tempat: penyedia atau endpoint yang Anda konfigurasi. Sebuah permintaan berisi pesan Anda, konten halaman yang dibaca agen (atau hanya seleksi Anda, atau PDF-nya), memori tersimpan Anda, dan nama skill Anda. Kunci API, percakapan, memori, dan skill Anda hanya disimpan di `chrome.storage.local`. Tidak ada server Browser Agent, tidak ada analitik, dan tidak ada kode jarak jauh. Tidak ada yang dikirim sebelum Anda menyetujui pemberitahuan data saat pertama kali dijalankan. Detail lengkap: [kebijakan privasi](store/privacy-policy.md).

**Yang memerlukan *Izinkan* Anda.** Aksi berikut menampilkan kartu di side panel dan tidak berjalan sampai Anda menekan *Izinkan*. Kartu ini berada di halaman milik ekstensi sendiri, yang tidak bisa diklikkan oleh situs web untuk Anda:

- klik dan pengiriman formulir yang terlihat tak bisa dibatalkan: teks yang terlihat pada tombol, `aria-label`, title, atau value terbaca seperti bayar, beli, pesan, hapus, kirim, publikasikan, otorisasi, simpan, bagikan, instal, dan sejenisnya (dalam semua 15 bahasa antarmuka); formulir dengan beberapa kolom atau kolom kata sandi; tombol hanya-ikon di dalam formulir; menekan Enter di kolom yang bukan bagian formulir (kotak chat). Jika teks tombol yang terlihat dan `aria-label`-nya tidak sesuai, kartu akan memperingatkan Anda;
- pergi ke situs lain, baik dengan navigasi maupun mengeklik tautan, kecuali itu situs tempat tugas dimulai, situs yang Anda sebut dalam pesan Anda, atau yang sudah Anda izinkan dalam tugas ini. Kartu menampilkan URL lengkap, termasuk query string;
- menyimpan memori setelah percakapan berisi konten web (halaman yang dibaca, PDF, atau seleksi).

Mengklik saran akan langsung mengirimkannya. Saran yang dihasilkan dari halaman ditulis setelah membaca konten halaman, jadi sebuah halaman bisa memengaruhinya: situs yang disebutkan di dalamnya tidak dianggap sebagai situs yang Anda sebut sendiri, dan apa pun yang dipicunya tetap melalui kartu konfirmasi yang sama. Tautan dalam balasan menampilkan domain aslinya di samping teksnya.

**Output dan file.** Balasan model dirender dengan DOMPurify. Gambar, media, SVG, iframe, formulir, dan inline style dihapus, sehingga sebuah halaman tidak bisa membuat model membocorkan percakapan Anda lewat URL gambar. File yang dihasilkan hanya format teks biasa (`csv`, `json`, `md`, …), dan sel CSV/TSV yang dimulai seperti rumus spreadsheet akan dinetralkan.

### Keterbatasan yang diketahui

- **Prompt injection belum terselesaikan.** Agen membaca dan beraksi di situs web dengan sesi login Anda. Halaman berbahaya bisa mencoba mengarahkannya untuk mengirim percakapan, memori, atau data dari situs lain ke suatu tempat, atau melakukan sesuatu atas nama Anda. Kartu konfirmasi menutupi aksi berisiko tinggi di atas; itu bukan perlindungan yang lengkap.
- Jangan jalankan di halaman yang tidak tepercaya saat tab bank, email, atau admin perusahaan Anda sedang terbuka, dan awasi saat tugas berjalan.
- Deteksi klik berisiko adalah heuristik kata kunci dan bentuk formulir. Ia bisa melewatkan beberapa tombol.
- Mengetik di kolom pada situs yang sama tidak akan bertanya. Halaman berbahaya bisa membaca apa yang diketik agen (misalnya dengan listener `input`) dan mengirimkannya ke servernya sendiri.
- `SKILL.md` yang diimpor adalah instruksi yang dipercaya. Hanya impor skill yang sudah Anda baca.
- Memori dan percakapan disimpan tanpa enkripsi di browser Anda dan dikirim ke penyedia yang Anda pilih sebagai bagian dari setiap permintaan.
- Setiap tugas berhenti setelah 30 langkah alat, dan setiap balasan menampilkan penggunaan token-nya, sehingga loop yang tak terkendali tetap terbatas dan terlihat.

## Bahasa

English, 繁體中文, 简体中文, 日本語, 한국어, Español, Français, Deutsch, Português (Brasil), Italiano, Русский, Tiếng Việt, Bahasa Indonesia, ไทย, Türkçe. Bahasa default mengikuti browser Anda; ubah di **Settings → Language** (Pengaturan → Bahasa). Model menjawab dalam bahasa antarmuka Anda kecuali Anda menulis dalam bahasa lain.

## Pengembangan

```bash
npm run watch      # rebuild on save; then click reload on the extension card
npm run typecheck  # tsc --noEmit
npm run check      # unit self-checks: skills, memory, history, files, providers, i18n
npm run test:e2e   # builds, loads the extension in Playwright against mocked model APIs
```

Side panel-nya adalah React + TypeScript yang dibundel oleh esbuild ke dalam `extension/`. Tidak ada backend: `src/agent.ts` menjalankan loop agen di side panel, memanggil Anthropic lewat SDK resminya atau API kompatibel OpenAI apa pun lewat `src/providers.ts`. Alat di `src/tools.ts` berjalan di tab aktif dengan `chrome.scripting`; `src/elements.ts` membangun daftar elemen bernomor dan pemeriksaan aksi tak-bisa-dibatalkan. Rangkaian tes e2e tidak memerlukan kunci API dan tidak mengeluarkan biaya sama sekali.

| Path | Fungsinya |
|---|---|
| `src/sidepanel.tsx` | Entry point dan UI utama (onboarding, chat, kotak pesan, menu `/`) |
| `src/agent.ts` | Loop agen, pemuatan pengaturan, skill bawaan, simpan/pulihkan riwayat |
| `src/providers.ts` | Daftar penyedia dan adapter kompatibel OpenAI |
| `src/tools.ts` | Implementasi alat (`runTool`) dan gerbang konfirmasi |
| `src/shared.ts` | System prompt dan definisi alat |
| `src/elements.ts` | Elemen interaktif bernomor (referensi `data-ba`) dan pemeriksaan risiko |
| `src/log.tsx` | Log chat, kartu, rendering Markdown dengan DOMPurify |
| `src/pages.tsx` | Pengaturan, riwayat, dan editor skill |
| `src/pdf.ts`, `src/viewer.ts` | Ekstraksi teks PDF dan penampil bawaan |
| `src/selection.ts` | Chip teks terpilih |
| `src/skills.ts`, `src/memory.ts`, `src/history.ts`, `src/files.ts` | Parsing `SKILL.md`, memori, riwayat, kartu file |
| `src/i18n/` | `t()` dan 15 kamus bahasa (`en.ts` adalah sumber kebenarannya) |
| `extension/` | Manifest, `_locales/`, HTML, service worker — muat folder ini di Chrome |

Untuk menambah alat: tambahkan skemanya ke `tools` di `src/shared.ts` dan sebuah `case` di `runTool` pada `src/tools.ts`.

### Menerjemahkan

Salin `src/i18n/locales/en.ts` menjadi mis. `nl.ts`, deklarasikan sebagai `const nl: Dict = { … }`, terjemahkan nilainya (pertahankan setiap `{placeholder}`), lalu tambahkan ke `LANGS` dan loader di `src/i18n/index.ts`. `npm run typecheck` akan gagal jika ada key yang hilang atau berlebih; `npm run check` akan gagal jika ada placeholder yang tidak cocok. Prompt dan deskripsi alat yang dikirim ke model sengaja dibiarkan dalam satu bahasa. Untuk nama dan deskripsi di Chrome Web Store, tambahkan `extension/_locales/<code>/messages.json` (Chrome memakai garis bawah, misalnya `pt_BR`).

## Kontribusi

Issue dan PR sangat diterima — lihat [CONTRIBUTING.md](CONTRIBUTING.md). Buat PR seringkas mungkin, jalankan tiga pemeriksaan di atas, dan jelaskan bagaimana Anda menguji hal-hal yang tidak tercakup olehnya.

## Lisensi

[MIT](LICENSE). Browser Agent adalah proyek independen, tidak berafiliasi dengan Anthropic, OpenAI, atau Google.

---

<p align="center"><a href="https://iosoftware.ai"><img src="docs/supported-by-iosoftware.svg" alt="Didukung oleh io Software" height="32"></a></p>
