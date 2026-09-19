// 側邊欄進入點：讀設定後掛上 React。狀態在 store.ts，agent 迴圈在 agent.ts，工具實作在 tools.ts。
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { S, emit, useStore, type Suggestion } from "./store";
import { init, send, resetChat, showView, persist, COMMANDS } from "./agent";
import { refreshSelection, dismissSelection } from "./selection";
import { viewerFor } from "./pdf";
import { activeTab } from "./tools";
import { PROVIDERS, PROVIDER_IDS, providerName, cleanBaseURL, conf, currentModel, isHaiku, type ProviderId } from "./providers";
import { Select } from "./select";
import { t, currentLang } from "./i18n";
import { LogList } from "./log";
import { HistoryPage, SettingsPage, ProviderPage, MemoryPage, SkillsPage, SkillEditorPage, SkillItem, Toast, ModelSelect, type Route, type Nav } from "./pages";
import {
  IconGear, IconHistory, IconLines, IconLogo, IconPlus, IconSend, IconSpark, IconStop, IconTable, IconTranslate,
} from "./icons";

const lines = (s: string) => s.split("\n").flatMap((line, i) => (i ? [<br key={i} />, line] : [line]));

function Header({ onHistory, onSettings, inert }: { onHistory: () => void; onSettings: () => void; inert: boolean }) {
  return (
    <header inert={inert}>
      <div className="brand">
        <div className="logo"><IconLogo /></div>
        Browser Agent
      </div>
      <button className="icon-btn" id="open-history" type="button" title={t("header.history")} aria-label={t("header.history")} onClick={onHistory}><IconHistory /></button>
      <button className="icon-btn" id="reset" type="button" title={t("header.newChat")} aria-label={t("header.newChat")} onClick={resetChat}><IconPlus /></button>
      <button className="icon-btn" id="open-settings" type="button" title={t("header.settings")} aria-label={t("header.settings")} onClick={onSettings}><IconGear /></button>
    </header>
  );
}

// 醒目揭露（Chrome Web Store User Data 政策）：任何人第一次打開都先看到這頁再進 chat／onboard，
// 同意前 runApi() 會擋下所有送給模型的請求（見 agent.ts）
function Consent() {
  return (
    <section id="consent">
      <div>
        <h1>{t("consent.title")}</h1>
      </div>
      <div className="card">
        <ul className="consent-list">
          <li>{t("consent.item1")}</li>
          <li>{t("consent.item2")}</li>
          <li>{t("consent.item3")}</li>
        </ul>
        <button className="btn btn-primary" id="consent-agree" type="button" onClick={async () => {
          S.consent = true;
          await persist({ consent: true });
          showView();
        }}>{t("consent.agree")}</button>
      </div>
    </section>
  );
}

// 首次使用：先選供應商，再填金鑰（自訂則填伺服器位址，金鑰選填）
function Onboard() {
  const [provider, setProvider] = useState<ProviderId>(S.provider);
  const [key, setKey] = useState("");
  const [base, setBase] = useState("");
  const [err, setErr] = useState("");
  const custom = provider === "custom";
  const info = PROVIDERS[provider];
  return (
    <section id="onboard">
      <div>
        <h1>{lines(t("onboard.title"))}</h1>
        <p style={{ marginTop: 8 }}>{t("onboard.subtitle")}</p>
      </div>
      <form className="card" id="onboard-form" onSubmit={async (e) => {
        e.preventDefault();
        const k = key.trim();
        const url = custom ? cleanBaseURL(base) : null;
        if (custom && !url) { setErr(t("error.badBaseURL")); return; }
        if (!custom && !k) { setErr(t("onboard.keyMissing")); return; }
        S.provider = provider;
        Object.assign(conf(provider), { key: k || undefined, ...(custom ? { baseURL: url } : {}) });
        await persist({ provider: S.provider, providers: S.providers });
        setKey("");
        setErr("");
        showView();
      }}>
        <label className="field-label" htmlFor="onboard-provider">{t("onboard.provider")}</label>
        <Select id="onboard-provider" variant="field" label={t("onboard.provider")} value={provider}
          options={PROVIDER_IDS.map((id) => ({ value: id, label: providerName(id) }))}
          onChange={(v) => { setProvider(v as ProviderId); setErr(""); }} />
        {custom && (
          <>
            <label className="field-label" htmlFor="onboard-base">{t("settings.baseURL")}</label>
            <input className="input" id="onboard-base" type="url" placeholder="http://localhost:11434/v1" autoComplete="off" spellCheck={false} value={base} onChange={(e) => { setBase(e.target.value); setErr(""); }} />
          </>
        )}
        <label className="field-label" htmlFor="onboard-key">{custom ? t("settings.keyOptional") : t("onboard.keyLabel")}</label>
        <input className="input" id="onboard-key" type="password" placeholder={info.keyPlaceholder ?? ""} autoComplete="off" spellCheck={false} value={key} onChange={(e) => { setKey(e.target.value); setErr(""); }} />
        <div className="form-error" id="onboard-error">{err}</div>
        <button className="btn btn-primary" type="submit">{t("onboard.start")}</button>
        {info.keyURL && <a className="text-link" href={info.keyURL} target="_blank" rel="noopener">{t("onboard.getKeyFrom", { name: info.name })}</a>}
        {custom && <div className="hint">{t("settings.localHint")}</div>}
        <div className="hint">{t("onboard.keyLocal")} {t("onboard.safety")}</div>
      </form>
    </section>
  );
}

// 固定建議（依頁面產生失敗、關閉或還沒產生時顯示）
const DEFAULT_SUGGESTIONS: { icon: ReactNode; key: "summary" | "translate" | "table" }[] = [
  { icon: <IconLines />, key: "summary" },
  { icon: <IconTranslate />, key: "translate" },
  { icon: <IconTable />, key: "table" },
];

// 依頁面產生的建議只差在圖示。點擊直接送出（使用者選的）；建議是看網頁內容產生的、網頁可以操弄它，
// 所以送出後照樣走 tools.ts 的確認卡（跨網站、不可逆動作），不因為是點建議就放行
function Empty() {
  const { list, sub, loading } = S.suggest;
  const items: (Suggestion & { icon: ReactNode })[] = list
    ? list.map((s) => ({ ...s, icon: <IconSpark /> }))
    : DEFAULT_SUGGESTIONS.map(({ icon, key }) => ({
      icon, title: t(`suggest.${key}.title`), subtitle: t(`suggest.${key}.subtitle`), prompt: t(`suggest.${key}.prompt`),
    }));
  return (
    <div id="empty" data-loading={loading ? "" : undefined}>
      <div><h2>{t("empty.title")}</h2></div>
      <p id="empty-sub">{sub ?? t("empty.canSee")}</p>
      <div id="suggestions" className="suggest-list">
        {items.map((s, i) => (
          <button key={i} type="button" className="suggest" title={s.prompt} onClick={() => send(s.prompt, { fromPage: !!list })}>
            {s.icon}
            <span>{s.title}<small>{s.subtitle}</small></span>
          </button>
        ))}
      </div>
    </div>
  );
}

type SlashItem = { name: string; description: string; run?: () => void };

// 輸入框開頭打 / 跳出選單（內建指令＋技能）：↑↓ 選、Enter／Tab 帶入、Esc 關閉
function Composer() {
  const [text, setText] = useState("");
  const [slash, setSlash] = useState<{ items: SlashItem[]; index: number } | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => { if (slash) menu.current?.children[slash.index]?.scrollIntoView({ block: "nearest" }); }, [slash]);

  // ask_user 等待回答時，輸入框送出的文字就是答案；沒打字時按鈕仍是「停止」
  const answering = !!S.asking?.reply && !!text.trim();
  const stopMode = S.busy && !answering;
  const submit = () => {
    if (answering) { S.asking!.reply!(text.trim(), []); setText(""); return; }
    if (!S.busy && text.trim()) setText("");
    send(text); // 執行中則是停止
  };
  const onChange = (v: string) => {
    setText(v);
    const m = v.match(/^\/(\S*)$/);
    if (!m) return setSlash(null);
    const q = m[1].toLowerCase();
    const all: SlashItem[] = [...COMMANDS.map((c) => ({ name: c.name, description: t(c.descKey), run: c.run })), ...S.skills];
    setSlash({ items: all.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)), index: 0 });
  };
  const pick = (s: SlashItem) => {
    setSlash(null);
    if (s.run) { setText(""); return s.run(); }
    setText(`/${s.name} `);
    input.current?.focus();
  };

  return (
    <form id="form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="slash" id="slash" role="listbox" hidden={!slash} ref={menu}>
        {slash && !slash.items.length && <div className="slash-empty">{t("slash.empty")}</div>}
        {slash?.items.map((s, i) => (
          <SkillItem key={s.name} cls={s.run ? "slash-item command" : "slash-item"} skill={s} role="option" aria-selected={i === slash.index}
            onMouseDown={(e) => { e.preventDefault(); pick(s); }} />
        ))}
      </div>
      {S.selection && (
        <div className="selection-chip" id="selection-chip">
          <span className="selection-text" title={S.selection.slice(0, 500)}>{t("selection.chip", { n: S.selection.length, text: S.selection.length > 40 ? `${S.selection.slice(0, 40)}…` : S.selection })}</span>
          <button type="button" className="selection-remove" aria-label={t("selection.remove")} title={t("selection.remove")} onClick={dismissSelection}>×</button>
        </div>
      )}
      {S.pdfTab && !S.selection && (
        <button type="button" className="selection-chip pdf-open" id="pdf-open" title={t("pdf.openViewerHint")}
          onClick={async () => { const tab = await activeTab(); if (S.pdfTab) chrome.tabs.update(tab.id!, { url: viewerFor(S.pdfTab) }); }}>
          {t("pdf.openViewer")}
        </button>
      )}
      <div className="composer">
        <textarea
          id="input" ref={input} rows={1} onFocus={refreshSelection} placeholder={S.asking ? t("composer.answerPlaceholder") : t("composer.placeholder")} value={text}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setSlash(null)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (slash) {
              if (e.key === "Escape") { setSlash(null); e.preventDefault(); return; }
              if (slash.items.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                const n = slash.items.length;
                setSlash({ ...slash, index: (slash.index + (e.key === "ArrowDown" ? 1 : -1) + n) % n });
                e.preventDefault();
                return;
              }
              if (slash.items.length && (e.key === "Enter" || e.key === "Tab")) { pick(slash.items[slash.index]); e.preventDefault(); return; }
            }
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          }}
        />
        <div className="composer-bar">
          <ModelSelect id="model" variant="bar" />
          {/* effort 是 Anthropic 的參數；Haiku 4.5 不支援 effort 與自適應思考 */}
          <Select id="effort" label={t("composer.effort")} title={t("composer.effortHint")} hidden={S.provider !== "anthropic" || isHaiku(currentModel())} value={S.effort}
            options={(["low", "medium", "high", "xhigh", "max"] as const).map((v) => ({ value: v, label: t(`effort.${v}`), hint: t(`effort.hint.${v}`) }))}
            onChange={(v) => {
              S.effort = v;
              emit();
              persist({ effort: S.effort });
            }} />
          <span className="spacer" />
          <span className="kbd-hint">{t("composer.enterHint")}</span>
          <button id="send" data-stop={stopMode ? "" : undefined} aria-label={stopMode ? t("composer.stop") : t("composer.send")}>
            <IconSend />
            <IconStop />
          </button>
        </div>
      </div>
    </form>
  );
}

function ChatView({ inert }: { inert: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const near = useRef(true); // 使用者往上捲在看舊內容時不要把他拉回底部
  useLayoutEffect(() => {
    const b = box.current!;
    if (S.stickForce || near.current) b.scrollTop = b.scrollHeight;
    S.stickForce = false;
  });
  return (
    <main id="chat" inert={inert}>
      <div id="scroll" ref={box} onScroll={() => {
        const b = box.current!;
        near.current = b.scrollHeight - b.scrollTop - b.clientHeight < 80;
      }}>
        <Empty />
        <div id="log"><LogList items={S.log} /></div>
      </div>
      <Composer />
    </main>
  );
}

function App() {
  useStore();
  // 整頁畫面的堆疊：[] 是對話；設定 → 子頁 → 技能編輯。返回時焦點回到當初點的那個按鈕
  const [stack, setStack] = useState<Route[]>([]);
  const openers = useRef<string[]>([]);
  const refocus = useRef<string | null>(null);
  useEffect(() => { showView(); }, []);
  useLayoutEffect(() => {
    document.body.dataset.view = S.view;
    if (S.busy) document.body.dataset.busy = "";
    else delete document.body.dataset.busy;
    document.documentElement.lang = currentLang();
    if (refocus.current) { document.getElementById(refocus.current)?.focus(); refocus.current = null; }
  });
  const nav: Nav = {
    push: (r) => { openers.current.push(document.activeElement?.id ?? ""); setStack((s) => [...s, r]); },
    pop: () => { refocus.current = openers.current.pop() ?? null; setStack((s) => s.slice(0, -1)); },
    closeAll: (focusId) => { refocus.current = focusId ?? openers.current[0] ?? null; openers.current = []; setStack([]); },
  };
  const top = S.view === "chat" ? stack.at(-1) : undefined;
  const page = !top ? null
    : top.name === "history" ? <HistoryPage nav={nav} />
    : top.name === "settings" ? <SettingsPage nav={nav} />
    : top.name === "provider" ? <ProviderPage nav={nav} />
    : top.name === "memory" ? <MemoryPage nav={nav} />
    : top.name === "skills" ? <SkillsPage nav={nav} />
    : <SkillEditorPage key={top.skill?.name ?? ""} skill={top.skill} nav={nav} />;
  return (
    <>
      <Header inert={!!page} onHistory={() => nav.push({ name: "history" })} onSettings={() => nav.push({ name: "settings" })} />
      <Consent />
      <Onboard />
      <ChatView inert={!!page} />
      {page}
      <Toast />
    </>
  );
}

await init();
createRoot(document.getElementById("root")!).render(<App />);
