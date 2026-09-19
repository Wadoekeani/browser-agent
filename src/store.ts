// 全域狀態：一個可變物件 S＋版本號。改完 S 呼叫 emit()，React 元件用 useStore() 訂閱後直接讀 S。
// ponytail: 整棵樹一起重繪，串流時每幀最多一次（emitSoon）；對話很長變慢再改成分區訂閱
import { useSyncExternalStore } from "react";
import type { Skill } from "./skills";
import type { Chat, Message } from "./history";
import type { ProviderId, ProviderConf } from "./providers";

export type UserItem = { id: number; kind: "user"; text: string; selection?: string }; // selection：這則附帶的頁面選取內容
export type NoteItem = { id: number; kind: "error" | "note"; text: string };
export type StatsItem = { id: number; kind: "stats"; text: string; title: string };
export type MdItem = { id: number; kind: "md"; text: string; done: boolean };
export type ThinkingItem = { id: number; kind: "thinking"; text: string; state: "running" | "done" | "interrupted"; seconds: number };
export type ToolItem = { id: number; kind: "tool"; name: string; input: unknown; state: "running" | "ok" | "error"; error?: string };
export type PendingItem = { id: number; kind: "pending" };
// 對話裡的卡片。reply／decide 只在等待使用者時存在（React 元件呼叫它們把答案交回 tools.ts）
export type AskOption = { label: string; description?: string; recommended?: boolean };
export type AskInput = { question: string; options: AskOption[]; multiSelect?: boolean };
export type AskItem = { id: number; kind: "ask"; input: AskInput; state: "waiting" | "answered" | "cancelled"; answer?: string; picked?: string[]; reply?: (text: string, picked: string[]) => void };
export type FileItem = { id: number; kind: "file"; filename: string; content: string; description?: string };
// text：不是點擊／送出的確認（例如掃描 PDF 要整份送出），直接給卡片內文
export type ConfirmItem = { id: number; kind: "confirm"; label: string; submitting: boolean; host: string; text?: string; aria?: string; mismatch?: boolean; detail?: string; state: "waiting" | "allowed" | "denied"; decide?: (ok: boolean) => void };
export type MemoryItem = { id: number; kind: "memory"; op: "remember" | "forget"; text: string; undone?: boolean };
export type PageItem = { id: number; kind: "page"; title: string; url: string; tabId: number };
export type Item = UserItem | NoteItem | StatsItem | MdItem | ThinkingItem | ToolItem | PendingItem | AskItem | FileItem | ConfirmItem | MemoryItem | PageItem;

export type Suggestion = { title: string; subtitle: string; prompt: string };

export const S = {
  view: "consent" as "chat" | "onboard" | "consent",
  consent: false, // 醒目揭露同意（Chrome Web Store User Data 政策）：同意前不進 chat／onboard，也不送任何模型請求
  provider: "anthropic" as ProviderId,
  providers: {} as Partial<Record<ProviderId, ProviderConf>>, // 各供應商的金鑰、base URL、模型；見 providers.ts
  effort: "high",
  pageChars: 8000, // 讀頁一次最多回傳的字數。中文約 1 字 1 token：整頁維基 5.5 萬字＝5 萬 token，一次摘要就要好幾塊台幣
  suggestOn: false,
  memoryOn: true,
  memories: [] as string[],
  skills: [] as Skill[],
  chats: [] as Chat[], // 對話歷史，見 history.ts
  chatId: null as string | null, // 目前這段對話在 chats 裡的 id；新對話在第一次存檔時才建立
  messages: [] as Message[], // 目前對話，送給 API 的格式
  log: [] as Item[], // 畫面上的對話紀錄
  busy: false,
  // 首頁建議：list 為 null＝顯示固定建議；sub 為 null＝預設副標
  suggest: { list: null as Suggestion[] | null, sub: null as string | null, loading: false },
  stickForce: false, // 下一次重繪強制捲到底（使用者送出訊息、還原歷史時）
  toast: null as { id: number; text: string; undo: () => void } | null, // 底部「已刪除 · 復原」，5 秒後消失
  asking: null as AskItem | null, // ask_user 等待回答中：這時在輸入框送出的文字就是答案
  selection: null as string | null, // 目前分頁上選取的文字（輸入框上方的標籤），見 selection.ts
  pdfTab: null as string | null, // 目前分頁是 Chrome 內建檢視器開的 PDF：顯示「在檢視器開啟」
  chatModel: "", // 這段對話最後用的模型名稱，存進歷史給匯出用
};

let version = 0;
const subs = new Set<() => void>();
export function emit() {
  version++;
  subs.forEach((f) => f());
}
let queued = false;
// 串流的文字增量：每幀最多重繪一次
export function emitSoon() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; emit(); });
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export const useStore = () => useSyncExternalStore(subscribe, () => version);

let seq = 0;
type NoId<T> = T extends unknown ? Omit<T, "id"> : never;
export function addItem<T extends Item>(data: NoId<T>): T {
  const item = { ...data, id: ++seq } as T;
  S.log.push(item);
  if (item.kind === "user") S.stickForce = true;
  emit();
  return item;
}
export function removeItem(item: Item) {
  S.log = S.log.filter((x) => x !== item);
  emit();
}

export async function setMemories(list: string[]) {
  S.memories = list;
  emit();
  await chrome.storage.local.set({ memories: list });
}

let toastSeq = 0;
export function showToast(text: string, undo: () => void) {
  S.toast = { id: ++toastSeq, text, undo };
  emit();
}
