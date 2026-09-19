// 設定、歷史對話、技能編輯：佔滿側邊欄的整頁畫面（左上返回），由 App 用一個堆疊管理（設定 → 子頁 → 技能編輯）
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ChangeEvent, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { S, emit, setMemories, showToast } from "./store";
import { persist, send, showView, openChat, deleteChat, resetChat, scheduleSuggestions, COMMANDS } from "./agent";
import { addMemory, MAX_MEMORY_CHARS, MAX_MEMORIES } from "./memory";
import { parseSkill, serializeSkill, cleanName, type Skill } from "./skills";
import { toMarkdown, groupChats, MAX_CHATS, type Chat } from "./history";
import { t, LANGS, langPref, setLangPref, currentLang, type Key } from "./i18n";
import { IconBack, IconChevron, IconErr, IconMore, IconSearch } from "./icons";
import { Select, type Opt } from "./select";
import { ANTHROPIC_MODELS, PROVIDERS, PROVIDER_IDS, providerName, cleanBaseURL, baseURL, conf, currentModel, listModels, ready, type ProviderId } from "./providers";

export type Route =
  | { name: "history" }
  | { name: "settings" }
  | { name: "provider" }
  | { name: "memory" }
  | { name: "skills" }
  | { name: "skill"; skill: Skill | null }; // skill 為 null＝新增

export type Nav = { push: (r: Route) => void; pop: () => void; closeAll: (focusId?: string) => void };

// 把 t() 字串裡的 {name} 換成 React 元素（例如 <code>/</code>）
export function rich(s: string, parts: Record<string, ReactNode>) {
  return s.split(/(\{\w+\})/).map((seg, i) => {
    const m = seg.match(/^\{(\w+)\}$/);
    return m && m[1] in parts ? <Fragment key={i}>{parts[m[1]]}</Fragment> : seg;
  });
}

function download(filename: string, text: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function SkillItem({ cls, skill, ...rest }: { cls: string; skill: { name: string; description: string } } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cls} {...rest}>
      <strong>/{skill.name}</strong>
      <small>{skill.description || t("slash.noDescription")}</small>
    </button>
  );
}

// 整頁外殼：固定的頂列（返回＋標題）＋可捲動的內容。Esc＝返回（選單等子元件處理過 Esc 會 preventDefault）
function Page({ id, title, onBack, children }: { id: string; title: string; onBack: () => void; children: ReactNode }) {
  const back = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => { back.current?.focus(); }, [id]);
  return (
    <section className="page" id={id} aria-labelledby={`${id}-title`} onKeyDown={(e) => {
      if (e.key !== "Escape" || e.defaultPrevented || e.nativeEvent.isComposing) return;
      e.preventDefault();
      onBack();
    }}>
      <div className="page-head">
        <button className="icon-btn" type="button" id="page-back" ref={back} aria-label={t("common.back")} title={t("common.back")} onClick={onBack}><IconBack /></button>
        <h1 id={`${id}-title`}>{title}</h1>
      </div>
      <div className="page-body">{children}</div>
    </section>
  );
}

// 底部「已刪除 · 復原」：5 秒後消失，換頁也留著
export function Toast() {
  const toast = S.toast;
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => { if (S.toast === toast) { S.toast = null; emit(); } }, 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {toast && (
        <div className="toast" key={toast.id}>
          <span>{toast.text}</span>
          <button type="button" className="toast-undo" id="toast-undo" onClick={() => { S.toast = null; emit(); toast.undo(); }}>{t("common.undo")}</button>
        </div>
      )}
    </div>
  );
}

// 「⋯」選單：Enter／空白鍵打開後焦點在第一項，↑↓ 移動、Esc 關閉並回到按鈕、焦點離開就關
function RowMenu({ label, items }: { label: string; items: { label: string; danger?: boolean; run: () => void }[] }) {
  const [open, setOpen] = useState(false);
  const [up, setUp] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const m = menu.current!;
    setUp(btn.current!.getBoundingClientRect().bottom + m.offsetHeight + 8 > window.innerHeight); // 下面放不下就往上開
    (m.firstElementChild as HTMLElement | null)?.focus();
  }, [open]);
  const close = (refocus: boolean) => { setOpen(false); if (refocus) btn.current?.focus(); };
  const onKey = (e: KeyboardEvent) => {
    const list = [...menu.current!.querySelectorAll<HTMLElement>("[role=menuitem]")];
    const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (j: number) => { e.preventDefault(); list[(j + list.length) % list.length]?.focus(); };
    if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(-1);
    else if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "Tab") close(false);
    e.stopPropagation(); // 別讓歷史清單的 ↑↓ 也處理
  };
  return (
    <div className="menu-wrap" ref={wrap} data-open={open ? "" : undefined} onBlur={(e) => { if (open && !wrap.current!.contains(e.relatedTarget as Node)) setOpen(false); }}>
      <button type="button" className="icon-btn more-btn" ref={btn} aria-label={label} title={label} aria-haspopup="menu" aria-expanded={open}
        onClick={() => setOpen(!open)}><IconMore /></button>
      {open && (
        <div className={up ? "menu up" : "menu"} role="menu" ref={menu} onKeyDown={onKey}>
          {items.map((it) => (
            <button key={it.label} type="button" role="menuitem" tabIndex={-1} className={it.danger ? "danger" : undefined}
              onClick={() => { close(false); it.run(); }}>{it.label}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- 歷史對話 ----------

const SEARCH_MIN = 8; // 超過這麼多段才出現搜尋框

function chatTime(chat: Chat, group: string) {
  const d = new Date(chat.updated);
  return group === "today" || group === "yesterday"
    ? d.toLocaleTimeString(currentLang(), { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString(currentLang(), { month: "numeric", day: "numeric" });
}

async function removeChat(chat: Chat) {
  const index = S.chats.indexOf(chat);
  const wasCurrent = chat.id === S.chatId;
  await deleteChat(chat);
  showToast(t("history.deleted"), async () => {
    if (S.chats.some((c) => c.id === chat.id)) return;
    const list = [...S.chats];
    list.splice(Math.min(index, list.length), 0, chat);
    S.chats = list.slice(0, MAX_CHATS);
    if (wasCurrent && S.chatId === null) S.chatId = chat.id; // 畫面上的還是那段對話：接著聊要更新同一筆
    emit();
    await persist({ chats: S.chats });
  });
}

export function HistoryPage({ nav }: { nav: Nav }) {
  const [q, setQ] = useState("");
  const query = S.chats.length > SEARCH_MIN ? q.trim().toLocaleLowerCase() : "";
  const shown = query ? S.chats.filter((c) => c.title.toLocaleLowerCase().includes(query)) : S.chats;
  // ↑↓ 在各段對話之間移動（選單打開時由選單自己處理）
  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const rows = [...e.currentTarget.querySelectorAll<HTMLElement>(".chat-open")];
    const i = rows.findIndex((r) => r.parentElement!.contains(document.activeElement));
    const next = rows[i === -1 ? 0 : Math.min(rows.length - 1, Math.max(0, i + (e.key === "ArrowDown" ? 1 : -1)))];
    if (next) { e.preventDefault(); next.focus(); }
  };
  return (
    <Page id="history" title={t("history.title")} onBack={nav.pop}>
      {S.busy && <div className="notice" id="history-busy">{t("history.busy")}</div>}
      {S.chats.length > SEARCH_MIN && (
        <label className="search">
          <IconSearch />
          <input type="search" id="history-search" placeholder={t("history.search")} aria-label={t("history.search")} value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      )}
      {!S.chats.length ? (
        <div className="empty-state">
          <strong>{t("history.empty")}</strong>
          <span>{t("history.emptyHint")}</span>
          <button className="btn btn-ghost" type="button" onClick={() => { resetChat(); nav.closeAll("input"); }}>{t("history.startNew")}</button>
        </div>
      ) : !shown.length ? (
        <div className="empty-state"><span>{t("history.noMatch")}</span></div>
      ) : (
        <div id="history-list" onKeyDown={onListKey}>
          {groupChats(shown).map(({ group, chats }) => (
            <section className="chat-group" key={group} aria-labelledby={`group-${group}`}>
              <h2 className="group-title" id={`group-${group}`}>{t(`history.${group}` as Key)}</h2>
              <ul role="list">
                {chats.map((chat) => {
                  const current = chat.id === S.chatId;
                  return (
                    <li className="chat-row" key={chat.id} aria-current={current ? "true" : undefined}>
                      <button type="button" className="chat-open" title={current ? t("history.current") : undefined} onClick={() => { openChat(chat); nav.closeAll("input"); }}>
                        <span className="chat-title">{chat.title}</span>
                        <time dateTime={new Date(chat.updated).toISOString()}>{chatTime(chat, group)}</time>
                      </button>
                      <RowMenu label={t("common.more")} items={[
                        { label: t("history.export"), run: () => download(`${chat.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 40)}.md`, toMarkdown(chat)) },
                        { label: t("common.delete"), danger: true, run: () => removeChat(chat) },
                      ]} />
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
      <div className="hint page-note">{t("history.hint", { n: MAX_CHATS })}</div>
    </Page>
  );
}

// ---------- 設定首頁 ----------

const PAGE_CHARS: [number, Key?][] = [[3000, "settings.pageCharsMin"], [5000], [8000, "settings.pageCharsDefault"], [15000], [30000, "settings.pageCharsMax"]];

function NavRow({ id, title, value, onClick }: { id: string; title: string; value: string; onClick: () => void }) {
  return (
    <button type="button" className="list-row nav-row" id={id} onClick={onClick}>
      <span className="row-text">{title}<small>{value}</small></span>
      <IconChevron />
    </button>
  );
}

export function SettingsPage({ nav }: { nav: Nav }) {
  const model = currentModel();
  const account = providerName(S.provider) + (model ? ` · ${ANTHROPIC_MODELS.find((m) => m.value === model)?.label ?? model}` : "");
  return (
    <Page id="settings" title={t("settings.title")} onBack={nav.pop}>
      <div className="list-group">
        <NavRow id="settings-provider" title={t("settings.provider")} value={account} onClick={() => nav.push({ name: "provider" })} />
        <NavRow id="settings-memory" title={t("memory.title")} value={t(S.memoryOn ? "settings.memorySummaryOn" : "settings.memorySummaryOff", { n: S.memories.length })} onClick={() => nav.push({ name: "memory" })} />
        <NavRow id="settings-skills" title={t("skills.title")} value={t("settings.skillsSummary", { n: S.skills.length })} onClick={() => nav.push({ name: "skills" })} />
      </div>
      <div className="list-group">
        <div className="list-row">
          <label className="row-text" htmlFor="lang">{t("settings.language")}</label>
          <Select id="lang" variant="compact" label={t("settings.language")} value={langPref()}
            options={[{ value: "auto", label: t("settings.languageAuto") }, ...Object.entries(LANGS).map(([code, [name, en]]) => ({ value: code, label: name, hint: en }))]}
            onChange={(v) => {
              setLangPref(v);
              if (v === "auto") chrome.storage.local.remove("lang");
              else persist({ lang: v });
              emit();
              scheduleSuggestions();
            }} />
        </div>
        <div className="list-row">
          <label className="row-text" htmlFor="page-chars">{t("settings.pageChars")}<small>{t("settings.pageCharsHint")}</small></label>
          <Select id="page-chars" variant="compact" label={t("settings.pageChars")} value={String(S.pageChars)}
            options={PAGE_CHARS.map(([n, k]) => {
              const num = n.toLocaleString(currentLang());
              return { value: String(n), label: k ? t(k, { n: num }) : num };
            })}
            onChange={(v) => {
              S.pageChars = Number(v);
              emit();
              persist({ pageChars: S.pageChars });
            }} />
        </div>
        <label className="list-row">
          <span className="row-text">{t("settings.suggest")}<small>{S.provider === "anthropic" ? t("settings.suggestHint") : t("settings.suggestAnthropicOnly")}</small></span>
          <input type="checkbox" className="switch" id="suggest-on" checked={S.suggestOn} onChange={(e) => {
            S.suggestOn = e.target.checked;
            emit();
            persist({ suggestOn: S.suggestOn });
            scheduleSuggestions();
          }} />
        </label>
      </div>
    </Page>
  );
}

// ---------- 模型供應商 ----------

export const persistProviders = () => persist({ provider: S.provider, providers: S.providers });

// OpenAI 相容供應商的模型清單：打開選單時才去抓 GET {base}/models；同一組（供應商＋位址＋金鑰）只抓一次，失敗下次打開再試
type ModelList = { list?: string[]; error?: string; loading?: boolean };
const modelLists = new Map<string, ModelList>();
const listKey = (p: ProviderId) => `${p} ${baseURL(p)} ${conf(p).key ?? ""}`;
function loadModels(p: ProviderId) {
  const k = listKey(p);
  const cur = modelLists.get(k);
  if (cur?.list || cur?.loading) return;
  modelLists.set(k, { loading: true });
  emit();
  listModels(p).then(
    (list) => { modelLists.set(k, { list }); emit(); },
    (e) => { modelLists.set(k, { error: e?.message ?? String(e) }); emit(); },
  );
}

// 目前供應商的模型選單：Anthropic 固定三個；其他動態列出，也能直接輸入模型名稱
export function ModelSelect({ id, variant }: { id: string; variant: "bar" | "field" }) {
  const p = S.provider;
  const value = currentModel();
  const set = (v: string) => { conf(p).model = v; emit(); persistProviders(); };
  if (p === "anthropic") {
    return <Select id={id} variant={variant} label={t("composer.model")} value={value} onChange={set}
      options={ANTHROPIC_MODELS.map((m) => ({ value: m.value, label: m.label, hint: t(m.hint) }))} />;
  }
  const state = modelLists.get(listKey(p)) ?? {};
  const options: Opt[] = (state.list ?? []).map((m) => ({ value: m, label: m }));
  if (value && !options.some((o) => o.value === value)) options.unshift({ value, label: value });
  return <Select id={id} variant={variant} label={t("composer.model")} value={value} onChange={set} options={options} allowCustom
    placeholder={t("model.choose")} onOpen={() => loadModels(p)}
    status={state.loading ? t("model.loading") : state.error ? t("model.loadFailed", { error: state.error }) : null} />;
}

// 一個供應商的欄位；換供應商時整個重建（key={p}），輸入框不會殘留上一家的金鑰
function ProviderFields({ p, nav }: { p: ProviderId; nav: Nav }) {
  const c = conf(p);
  const custom = p === "custom";
  const [key, setKey] = useState(c.key ?? "");
  const [base, setBase] = useState(c.baseURL ?? "");
  const [showKey, setShowKey] = useState(false);
  const [err, setErr] = useState("");
  const latest = useRef({ key, base });
  latest.current = { key, base };
  const commit = () => {
    const k = latest.current.key.trim() || undefined;
    const b = latest.current.base.trim();
    const url = custom ? cleanBaseURL(b) : undefined;
    if (custom && b && !url) setErr(t("error.badBaseURL"));
    else setErr("");
    const next = { ...c, key: k, ...(custom && url ? { baseURL: url } : {}) };
    if (next.key === c.key && next.baseURL === c.baseURL) return;
    S.providers[p] = next;
    emit();
    persistProviders();
  };
  useEffect(() => commit, []); // 按 Esc／返回離開時輸入框不一定會先失焦
  const info = PROVIDERS[p];
  return (
    <>
      {custom && (
        <div className="row">
          <label className="field-label" htmlFor="base-url">{t("settings.baseURL")}</label>
          <input className="input" id="base-url" type="url" placeholder="http://localhost:11434/v1" autoComplete="off" spellCheck={false}
            value={base} onChange={(e) => setBase(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); }} />
          <div className="form-error" id="base-url-error">{err}</div>
        </div>
      )}
      <div className="row">
        <label className="field-label" htmlFor="key">{custom ? t("settings.keyOptional") : t("settings.key")}</label>
        <div className="key-row">
          <input className="input" id="key" type={showKey ? "text" : "password"} autoComplete="off" spellCheck={false} placeholder={info.keyPlaceholder ?? ""}
            value={key} onChange={(e) => setKey(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); }} />
          <button className="btn btn-ghost" type="button" id="toggle-key" onClick={() => setShowKey(!showKey)}>
            {showKey ? t("settings.hide") : t("settings.show")}
          </button>
        </div>
        {info.keyURL && !c.key && <a className="text-link" href={info.keyURL} target="_blank" rel="noopener">{t("onboard.getKeyFrom", { name: info.name })}</a>}
      </div>
      <div className="row">
        <label className="field-label" htmlFor="settings-model">{t("settings.model")}</label>
        <ModelSelect id="settings-model" variant="field" />
      </div>
      <div className="hint" id="provider">
        {custom ? <>{t("settings.providerCustom")} {t("settings.localHint")}</> : t("settings.providerDirect", { name: info.name })}
        {p === "anthropic" && <>{" "}<a className="text-link" href="https://console.anthropic.com/usage" target="_blank" rel="noopener">{t("settings.usageLink")}</a></>}
      </div>
      {(c.key || c.baseURL) && (
        <div className="page-foot">
          <button className="btn btn-ghost danger wide" type="button" id="logout" onClick={async () => {
            if (!confirm(t("settings.logoutConfirm"))) return;
            if (S.busy) send(""); // 執行中的任務沒有金鑰也跑不完：停掉，但畫面上的對話留著
            S.providers[p] = { model: c.model };
            latest.current = { key: "", base: "" };
            await persistProviders();
            if (p === "anthropic") await chrome.storage.local.remove("key"); // 舊版欄位，不移掉下次會被當成金鑰讀回來
            if (!ready()) { nav.closeAll(); showView(); }
            else { setKey(""); setBase(""); }
          }}>{t("settings.logout")}</button>
        </div>
      )}
    </>
  );
}

export function ProviderPage({ nav }: { nav: Nav }) {
  return (
    <Page id="provider-page" title={t("settings.provider")} onBack={nav.pop}>
      <div className="row">
        <label className="field-label" htmlFor="provider-select">{t("onboard.provider")}</label>
        <Select id="provider-select" variant="field" label={t("onboard.provider")} value={S.provider}
          options={PROVIDER_IDS.map((id) => ({ value: id, label: providerName(id) }))}
          onChange={(v) => { S.provider = v as ProviderId; emit(); persistProviders(); scheduleSuggestions(); }} />
      </div>
      <ProviderFields key={S.provider} p={S.provider} nav={nav} />
    </Page>
  );
}

// ---------- 記憶 ----------

function memoryError(r: ReturnType<typeof addMemory>) {
  if (r.code === "tooLong") return t("memory.errTooLong", { n: r.length!, max: MAX_MEMORY_CHARS });
  if (r.code === "duplicate") return t("memory.errDuplicate");
  if (r.code === "full") return t("memory.errFull", { max: MAX_MEMORIES });
  return t("memory.errEmpty");
}

export function MemoryPage({ nav }: { nav: Nav }) {
  const [mem, setMem] = useState("");
  const [memErr, setMemErr] = useState<ReturnType<typeof addMemory> | null>(null); // 存結果不存字串：換語言時跟著換
  const add = async (e: FormEvent) => {
    e.preventDefault();
    const r = addMemory(S.memories, mem);
    if (r.list === S.memories) { setMemErr(r); return; }
    setMemErr(null);
    await setMemories(r.list);
    setMem("");
  };
  const remove = async (m: string) => {
    const index = S.memories.indexOf(m);
    await setMemories(S.memories.filter((x) => x !== m));
    showToast(t("memory.deleted"), () => {
      if (S.memories.includes(m)) return;
      const list = [...S.memories];
      list.splice(Math.min(index, list.length), 0, m);
      setMemories(list.slice(0, MAX_MEMORIES));
    });
  };
  return (
    <Page id="memory" title={t("memory.title")} onBack={nav.pop}>
      <div className="list-group">
        <label className="list-row">
          <span className="row-text">{t("memory.enable")}</span>
          <input type="checkbox" className="switch" id="memory-on" checked={S.memoryOn} onChange={(e) => {
            S.memoryOn = e.target.checked;
            emit();
            persist({ memoryOn: S.memoryOn });
          }} />
        </label>
      </div>
      <div className="hint">{t("memory.hint")}</div>
      <div className="row">
        <form className="key-row" id="memory-add" onSubmit={add}>
          <input className="input" id="memory-input" placeholder={t("memory.placeholder")} aria-label={t("memory.placeholder")} autoComplete="off" maxLength={MAX_MEMORY_CHARS} value={mem} onChange={(e) => setMem(e.target.value)} />
          <button className="btn btn-ghost" type="submit">{t("memory.add")}</button>
        </form>
        <div className="form-error" id="memory-error">{memErr && memoryError(memErr)}</div>
      </div>
      {!S.memories.length ? <div className="skill-empty">{t("memory.empty")}</div> : (
        <ul className="item-list" id="memory-list" role="list">
          {S.memories.map((m) => (
            <li className="memory-row" key={m}>
              <span>{m}</span>
              <button type="button" className="icon-btn" title={t("common.delete")} aria-label={`${t("common.delete")}: ${m}`} onClick={() => remove(m)}><IconErr /></button>
            </li>
          ))}
        </ul>
      )}
      {!!S.memories.length && (
        <div className="page-foot">
          <button className="btn btn-ghost danger wide" type="button" id="memory-clear" onClick={async () => {
            if (confirm(t("memory.clearConfirm", { n: S.memories.length }))) await setMemories([]);
          }}>{t("memory.clear")}</button>
        </div>
      )}
    </Page>
  );
}

// ---------- 技能 ----------

async function saveSkills(list: Skill[]) {
  S.skills = list;
  emit();
  await persist({ skills: list });
}

export function SkillsPage({ nav }: { nav: Nav }) {
  const importSkills = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = [...(input.files ?? [])];
    const skipped: string[] = [];
    let list = [...S.skills];
    for (const file of files) {
      // Claude Code 的技能檔名一律是 SKILL.md，那種就只能靠 frontmatter 裡的 name
      const skill = parseSkill(await file.text(), file.name.replace(/\.md$/i, "").replace(/^SKILL$/i, ""));
      if (!skill.name || !skill.body) { skipped.push(file.name); continue; }
      const i = list.findIndex((s) => s.name === skill.name);
      if (i === -1) list.push(skill);
      else if (confirm(t("skills.importOverwrite", { name: skill.name }))) list = list.map((s, j) => (j === i ? skill : s));
    }
    input.value = "";
    await saveSkills(list);
    if (skipped.length) alert(t("skills.importSkipped", { files: skipped.join(t("common.listSep")) }));
  };
  return (
    <Page id="skills" title={t("skills.title")} onBack={nav.pop}>
      <div className="actions">
        <button className="btn btn-ghost" type="button" id="skill-new" onClick={() => nav.push({ name: "skill", skill: null })}>{t("skills.new")}</button>
        {/* label 包 input：點得到、鍵盤 focus 在 label 上按 Enter 由瀏覽器開檔案選擇 */}
        <label className="btn btn-ghost" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.currentTarget.querySelector("input")!.click(); } }}>
          {t("skills.import")}<input type="file" id="skill-import" accept=".md,text/markdown" multiple hidden onChange={importSkills} />
        </label>
      </div>
      {!S.skills.length ? <div className="skill-empty">{t("skills.empty")}</div> : (
        <div className="list-group" id="skill-list">
          {S.skills.map((skill, i) => (
            <button key={i} type="button" className="list-row nav-row skill-row" id={`skill-${i}`} onClick={() => nav.push({ name: "skill", skill })}>
              <span className="row-text"><strong>/{skill.name}</strong><small>{skill.description || t("slash.noDescription")}</small></span>
              <IconChevron />
            </button>
          ))}
        </div>
      )}
      <div className="hint">{rich(t("skills.hint"), { slash: <code>/</code> })}</div>
    </Page>
  );
}

export function SkillEditorPage({ skill: editing, nav }: { skill: Skill | null; nav: Nav }) {
  const [name, setName] = useState(editing?.name ?? "");
  const [desc, setDesc] = useState(editing?.description ?? "");
  const [body, setBody] = useState(editing?.body ?? "");
  const [err, setErr] = useState("");
  const dirty = name !== (editing?.name ?? "") || desc !== (editing?.description ?? "") || body !== (editing?.body ?? "");
  const back = () => { if (!dirty || confirm(t("skillEditor.discardConfirm"))) nav.pop(); };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    // model 欄位編輯器沒有顯示，但要保留（匯入的 SKILL.md、預設技能的 model: haiku）
    const skill: Skill = { name: cleanName(name), description: desc.trim(), body: body.trim(), ...(editing?.model ? { model: editing.model } : {}) };
    if (!skill.name || !skill.body) return setErr(t("skillEditor.errRequired"));
    if (COMMANDS.some((c) => c.name === skill.name)) return setErr(t("skillEditor.errReserved", { name: skill.name }));
    if (S.skills.some((s) => s.name === skill.name && s !== editing)) return setErr(t("skillEditor.errDuplicate", { name: skill.name }));
    await saveSkills(editing ? S.skills.map((s) => (s === editing ? skill : s)) : [...S.skills, skill]);
    nav.pop();
  };

  return (
    <Page id="skill-editor" title={editing ? t("skillEditor.edit") : t("skillEditor.new")} onBack={back}>
      <form id="skill-form" onSubmit={save}>
        <div className="row">
          <label className="field-label" htmlFor="skill-name">{t("skillEditor.name")}</label>
          <input className="input" id="skill-name" required placeholder={t("skillEditor.namePlaceholder")} autoComplete="off" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="row">
          <label className="field-label" htmlFor="skill-desc">{t("skillEditor.desc")}</label>
          <textarea className="input skill-desc" id="skill-desc" rows={2} placeholder={t("skillEditor.descPlaceholder")} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="row">
          <label className="field-label" htmlFor="skill-body">{t("skillEditor.body")}</label>
          <textarea className="input skill-body" id="skill-body" required placeholder={t("skillEditor.bodyPlaceholder")} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div className="form-error" id="skill-error">{err}</div>
        <div className="actions">
          <button className="btn btn-primary" type="submit">{t("skillEditor.save")}</button>
          {editing && <button className="btn btn-ghost" type="button" id="skill-export" onClick={() => download(`${editing.name}.md`, serializeSkill(editing))}>{t("skillEditor.export")}</button>}
        </div>
      </form>
      {editing && (
        <div className="page-foot">
          <button className="btn btn-ghost danger wide" type="button" id="skill-delete" onClick={async () => {
            if (!confirm(t("skillEditor.deleteConfirm", { name: editing.name }))) return;
            await saveSkills(S.skills.filter((s) => s !== editing));
            nav.pop();
          }}>{t("common.delete")}</button>
        </div>
      )}
    </Page>
  );
}
