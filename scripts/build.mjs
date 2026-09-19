// npm run build（--watch 持續重建）：側邊欄與 PDF 檢視頁兩個 entry；pdf.js 只在碰到 PDF 時動態 import，
// 被 esbuild 切成 extension/chunks/ 裡的獨立檔案，平常不載入。worker、CMap、標準字型照原樣複製到 extension/pdfjs/。
import * as esbuild from "esbuild";
import { cpSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const pdfjs = `${root}node_modules/pdfjs-dist/`;
const ext = `${root}extension/`;

rmSync(`${ext}chunks`, { recursive: true, force: true }); // 舊 hash 的 chunk 不留
cpSync(`${pdfjs}build/pdf.worker.min.mjs`, `${ext}pdfjs/pdf.worker.min.mjs`);
cpSync(`${pdfjs}cmaps`, `${ext}pdfjs/cmaps`, { recursive: true }); // 中日韓字型的 CMap：沒有它抽出來的中文會是亂碼
cpSync(`${pdfjs}standard_fonts`, `${ext}pdfjs/standard_fonts`, { recursive: true });
// ponytail: wasm（JPEG2000／JBIG2 影像解碼）沒複製，檢視頁遇到這類掃描圖會畫不出來；要支援再複製 wasm/ 並設 wasmUrl

const watch = process.argv.includes("--watch");
const opts = {
  entryPoints: [`${root}src/sidepanel.tsx`, `${root}src/viewer.ts`],
  // chrome122：pdfjs-dist 6 的非 legacy build 在模組頂層用了全域 Iterator（Iterator helpers，
  // Chrome 122 才有，見 https://v8.dev/features/iterator-helpers），沒有 try/catch，舊版直接 ReferenceError。
  // 也對得上 manifest 的 minimum_chrome_version。
  bundle: true, splitting: true, format: "esm", target: "chrome122",
  outdir: ext, chunkNames: "chunks/[name]-[hash]",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
  minify: !watch, // watch 模式不 minify，rebuild 快；上架用的 build／package 都會 minify
};
if (watch) await (await esbuild.context(opts)).watch();
else await esbuild.build(opts);
