// 介面用的線條圖示（16×16）
import type { ReactNode } from "react";

// cap／join：原本的圖示各自有沒有圓角端點／轉角
const Svg = ({ children, sw = 1.4, cap = true, join = false }: { children: ReactNode; sw?: number; cap?: boolean; join?: boolean }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap={cap ? "round" : undefined} strokeLinejoin={join ? "round" : undefined}>{children}</svg>
);

// 品牌 logo（候選 C：對話框＋游標，紫藍漸層），同一份圖也用在 manifest icons／商店素材（store/render.mjs）
export const IconLogo = () => (
  <svg viewBox="0 0 96 96">
    <defs><linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A855F7" /><stop offset="1" stopColor="#4F46E5" /></linearGradient></defs>
    <path d="M26 8H70a20 20 0 0 1 20 20V56a20 20 0 0 1-20 20H42L20 92 23 76A20 20 0 0 1 6 56V28A20 20 0 0 1 26 8Z" fill="url(#logo-g)" />
    <path transform="translate(37 21) scale(1.45)" d="M0 0V26L6.5 19.5 11 29 16 26.8 11.6 17.5H20Z" fill="#fff" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);
export const IconHistory = () => <Svg><circle cx="8" cy="8" r="5.8" /><path d="M8 4.8V8l2.2 1.4" /></Svg>;
export const IconPlus = () => <Svg sw={1.5}><path d="M8 3.5v9M3.5 8h9" /></Svg>;
export const IconGear = () => (
  <Svg><circle cx="8" cy="8" r="2" /><path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M3.6 12.4l1.1-1.1M11.3 4.7l1.1-1.1" /></Svg>
);
export const IconClose = () => <Svg sw={1.5}><path d="M4 4l8 8M12 4l-8 8" /></Svg>;
export const IconChevron = () => <Svg sw={1.6} join><path d="M6 3.5L10.5 8 6 12.5" /></Svg>;
export const IconSend = () => <svg className="i-send" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M8 13V3M3.5 7.5L8 3l4.5 4.5" /></svg>;
export const IconStop = () => <svg className="i-stop" viewBox="0 0 16 16" fill="currentColor"><rect x="4" y="4" width="8" height="8" rx="1.5" /></svg>;
export const IconCopy = () => (
  <Svg cap={false}><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v5A1.5 1.5 0 004 10.5h1.5" /></Svg>
);
export const IconOk = () => <Svg sw={2} join><path d="M3.5 8.5l3 3 6-7" /></Svg>;
export const IconErr = () => <Svg sw={2}><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" /></Svg>;
export const IconDownload = () => <Svg sw={1.5} join><path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" /></Svg>;
export const IconTrash = () => <Svg sw={1.5}><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" /></Svg>;
export const IconSpark = () => <Svg join><path d="M8 2l1.3 3.7L13 7l-3.7 1.3L8 12l-1.3-3.7L3 7l3.7-1.3z" /></Svg>;
export const IconLines = () => <Svg join><path d="M3 4h10M3 8h10M3 12h6" /></Svg>;
export const IconTranslate = () => <Svg join><path d="M2.5 4h7M6 2.5V4M4 4c.5 2.5 2.5 4.5 5 5.5M8 4c-.5 2.5-2.5 4.5-5 5.5M9 13.5l2.5-6 2.5 6M10 11.5h3" /></Svg>;
export const IconTable = () => <Svg join><rect x="2.5" y="2.5" width="11" height="11" rx="2" /><path d="M2.5 6.5h11M6.5 6.5v7" /></Svg>;
export const IconBack = () => <Svg sw={1.6} join><path d="M10 3.5L5.5 8 10 12.5" /></Svg>;
export const IconMore = () => <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.3" /><circle cx="8" cy="8" r="1.3" /><circle cx="12.5" cy="8" r="1.3" /></svg>;
export const IconSearch = () => <Svg sw={1.5}><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5L13.5 13.5" /></Svg>;
export const IconFile = () => <Svg join><path d="M4 1.8h5l3 3v9.4H4z" /><path d="M9 1.8v3h3" /></Svg>;
export const IconShield = () => <Svg join><path d="M8 1.8l5 2v4c0 3-2.2 5.2-5 6.4-2.8-1.2-5-3.4-5-6.4v-4z" /><path d="M8 5.5v3M8 10.8v.2" /></Svg>;
export const IconBookmark = () => <Svg join><path d="M4.5 2h7v12L8 11.2 4.5 14z" /></Svg>;
export const IconGlobe = () => <Svg><circle cx="8" cy="8" r="6" /><path d="M2 8h12M8 2c1.7 1.8 2.5 3.8 2.5 6S9.7 12.2 8 14c-1.7-1.8-2.5-3.8-2.5-6S6.3 3.8 8 2z" /></Svg>;
export const IconQuestion = () => <Svg><circle cx="8" cy="8" r="6" /><path d="M6.2 6.2a1.9 1.9 0 013.6.7c0 1.3-1.8 1.6-1.8 2.8M8 11.6v.1" /></Svg>;
