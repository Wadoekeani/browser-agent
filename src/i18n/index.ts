// 介面語言：t(key, vars) 取字串，{name} 插值。字典在 locales/，型別以 en.ts 為準。
// en 同步打包進主程式（永遠可用的 fallback）；其餘 14 種語言各自切成獨立 chunk，用 import() 動態載入
// （esbuild splitting，見 scripts/build.mjs）。t() 在字典還沒載完前先回英文；loadDict() resolve 後
// 會呼叫 emit() 讓畫面重繪一次換上正確字典，所以在設定頁切語言不用重整頁面。
import { emit } from "../store";
import en, { type Dict } from "./locales/en";

// 代碼 → [自己語言的名稱（設定頁下拉）, 英文名稱（給模型的「用什麼語言回答」）]
export const LANGS = {
  en: ["English", "English"],
  "zh-TW": ["繁體中文", "Traditional Chinese"],
  "zh-CN": ["简体中文", "Simplified Chinese"],
  ja: ["日本語", "Japanese"],
  ko: ["한국어", "Korean"],
  es: ["Español", "Spanish"],
  fr: ["Français", "French"],
  de: ["Deutsch", "German"],
  "pt-BR": ["Português (Brasil)", "Brazilian Portuguese"],
  it: ["Italiano", "Italian"],
  ru: ["Русский", "Russian"],
  vi: ["Tiếng Việt", "Vietnamese"],
  id: ["Bahasa Indonesia", "Indonesian"],
  th: ["ไทย", "Thai"],
  tr: ["Türkçe", "Turkish"],
} as const;
export type Lang = keyof typeof LANGS;
export type Key = keyof Dict;

const LOADERS: Record<Exclude<Lang, "en">, () => Promise<{ default: Dict }>> = {
  "zh-TW": () => import("./locales/zh-TW"),
  "zh-CN": () => import("./locales/zh-CN"),
  ja: () => import("./locales/ja"),
  ko: () => import("./locales/ko"),
  es: () => import("./locales/es"),
  fr: () => import("./locales/fr"),
  de: () => import("./locales/de"),
  "pt-BR": () => import("./locales/pt-BR"),
  it: () => import("./locales/it"),
  ru: () => import("./locales/ru"),
  vi: () => import("./locales/vi"),
  id: () => import("./locales/id"),
  th: () => import("./locales/th"),
  tr: () => import("./locales/tr"),
};

// 還沒載到的語言用英文（t() 的 fallback）。載入過的語言留在這裡不會重複 import。
const DICTS: Partial<Record<Lang, Dict>> = { en };
export const dictionaries = DICTS; // agent.ts 用來跨語言比對舊版預設技能名稱／內容，見 loadAllDicts()

async function loadDict(l: Lang): Promise<Dict> {
  if (l === "en") return en;
  if (!DICTS[l]) DICTS[l] = (await LOADERS[l]()).default;
  return DICTS[l]!;
}
// ponytail: 舊版預設技能的跨語言改名比對（agent.ts）需要一次看到全部字典，所以開機時老實等全部載完，
// 不是只等目前語言那一份——這裡沒有真的省到啟動時間，省到的是主程式 bundle 的初始大小。
// 之後如果啟動速度变重要，可以把這段搬成背景載入、migration 延後跑。
export async function loadAllDicts(): Promise<void> {
  await Promise.all((Object.keys(LANGS) as Lang[]).map(loadDict));
}
// 目前語言的字典載入完成：viewer.ts 這類沒有訂閱 emit() 重繪機制的進入點，畫面上的字要等它才能保證翻對
export const currentDictReady = () => loadDict(lang);

const isLang = (s: string): s is Lang => Object.hasOwn(LANGS, s);

// 瀏覽器語言對到支援清單：zh-HK/zh-MO/zh-Hant → zh-TW；其餘 zh → zh-CN；pt → pt-BR；其他取主語言，找不到用 en
export function browserLang(tag: string): Lang {
  const exact = (Object.keys(LANGS) as Lang[]).find((l) => l.toLowerCase() === tag.toLowerCase());
  if (exact) return exact;
  const parts = tag.toLowerCase().split(/[-_]/);
  if (parts[0] === "zh") return parts.some((p) => p === "tw" || p === "hk" || p === "mo" || p === "hant") ? "zh-TW" : "zh-CN";
  if (parts[0] === "pt") return "pt-BR";
  return isLang(parts[0]) ? parts[0] : "en";
}

// pref：使用者在設定選的語言代碼，"auto"（或沒設）＝跟隨瀏覽器
let pref = "auto";
let lang: Lang = browserLang(globalThis.navigator?.language ?? "en");

export function setLangPref(p: string | undefined) {
  pref = p && isLang(p) ? p : "auto";
  lang = pref === "auto" ? browserLang(globalThis.navigator?.language ?? "en") : (pref as Lang);
  void loadDict(lang).then(() => emit());
}
export const langPref = () => pref;
export const currentLang = () => lang;
export const langEnglishName = () => LANGS[lang][1];

export function t(key: Key, vars?: Record<string, string | number>): string {
  const s = DICTS[lang]?.[key] ?? en[key];
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s;
}
