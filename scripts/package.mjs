// npm run package — build the extension and zip it for the Chrome Web Store.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const extensionDir = path.join(root, "extension");
const distDir = path.join(root, "dist");

const { version } = JSON.parse(readFileSync(path.join(extensionDir, "manifest.json"), "utf8"));

execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit" });

mkdirSync(distDir, { recursive: true });
const zipPath = path.join(distDir, `browser-agent-${version}.zip`);
rmSync(zipPath, { force: true }); // zip -r 會把檔案加進既有的壓縮檔，舊版殘留的檔案會混進去

// zip root must be manifest.json itself (Chrome Web Store requirement), so zip from inside extension/.
execFileSync(
  "zip",
  ["-r", "-X", zipPath, ".", "-x", ".DS_Store", "-x", "*/.DS_Store"],
  { cwd: extensionDir, stdio: "inherit" }
);

const { size } = statSync(zipPath);
console.log(`\n${zipPath} (${(size / 1024).toFixed(1)} KB)`);
