// 自訂下拉選單：取代原生 <select>（原生選單的外觀跟不上介面、也不能加說明文字與搜尋）。
// 觸發鈕＋浮出的 listbox（position: fixed，不會被捲動容器裁掉；下面放不下就往上開）。
// 鍵盤：觸發鈕上 ↑↓／Enter／空白鍵打開；選單裡 ↑↓／Home／End 移動、Enter（或不在搜尋框時的空白鍵）選取、
// Esc 關閉並把焦點還給觸發鈕、Tab 關閉；沒有搜尋框時打字跳到開頭相符的選項。點外面、捲動外面、視窗縮放都會關。
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { IconOk } from "./icons";
import { t } from "./i18n";

export type Opt = { value: string; label: string; hint?: string };

const SEARCH_MIN = 10; // 超過這麼多個選項才出現篩選框

export function Select({ id, value, options, onChange, label, variant = "bar", title, placeholder, allowCustom, onOpen, status, hidden }: {
  id: string; value: string; options: Opt[]; onChange: (v: string) => void;
  label: string; // aria-label（畫面上的 <label htmlFor={id}> 也點得開）
  variant?: "bar" | "field" | "compact"; // bar＝輸入框下方的小字；field＝整列輸入框；compact＝設定列右側
  title?: string; placeholder?: string;
  allowCustom?: boolean; // 動態模型清單：允許直接用輸入的名稱
  onOpen?: () => void; // 打開時（例如去抓模型清單）
  status?: ReactNode; // 清單上方的狀態列（載入中、載入失敗）
  hidden?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const btn = useRef<HTMLButtonElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const typed = useRef({ text: "", at: 0 });

  const searchable = !!allowCustom || options.length > SEARCH_MIN;
  const q = query.trim();
  const filtered = q ? options.filter((o) => `${o.label} ${o.value}`.toLowerCase().includes(q.toLowerCase())) : options;
  const items: (Opt & { custom?: boolean })[] = allowCustom && q && !options.some((o) => o.value === q)
    ? [...filtered, { value: q, label: t("model.useTyped", { name: q }), custom: true }]
    : filtered;
  const current = options.find((o) => o.value === value);
  const shown = current?.label ?? (value || placeholder || "");

  const close = (refocus: boolean) => { setOpen(false); if (refocus) btn.current?.focus(); };
  const openMenu = () => {
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
    onOpen?.();
  };
  const choose = (o: Opt) => { close(true); if (o.value !== value) onChange(o.value); };

  // 位置：寬度至少 220px、不超出畫面左右 8px；下方空間不夠且上方比較多就往上開
  useLayoutEffect(() => {
    if (!open) return;
    const r = btn.current!.getBoundingClientRect();
    const el = pop.current!;
    const w = Math.min(Math.max(r.width, 220), innerWidth - 16);
    const below = innerHeight - r.bottom - 12, above = r.top - 12;
    const up = below < Math.min(el.scrollHeight, 240) && above > below;
    Object.assign(el.style, {
      width: `${w}px`, left: `${Math.min(Math.max(r.left, 8), innerWidth - w - 8)}px`,
      top: up ? "auto" : `${r.bottom + 4}px`, bottom: up ? `${innerHeight - r.top + 4}px` : "auto",
      maxHeight: `${Math.min(360, up ? above : below)}px`,
    });
    if (up) el.dataset.up = "";
    else delete el.dataset.up;
  }, [open, items.length, !!status]); // 模型清單晚一點才載入：選項數變了重新量

  useLayoutEffect(() => { if (open) (searchable ? search.current : list.current)?.focus(); }, [open]);

  // 讓目前項目留在可見範圍（只捲清單自己；scrollIntoView 可能連外層一起捲，會觸發「捲動外面就關」）
  useEffect(() => {
    const box = list.current, el = box?.querySelector<HTMLElement>(`#${CSS.escape(`${id}-opt-${active}`)}`);
    if (!box || !el) return;
    if (el.offsetTop < box.scrollTop) box.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = el.offsetTop + el.offsetHeight - box.clientHeight;
  }, [open, active, query]);

  // 點外面、捲動外面、視窗縮放：關閉（焦點不搶回觸發鈕）
  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) => { const n = e.target as Node; if (!pop.current?.contains(n) && !btn.current?.contains(n)) close(false); };
    const resize = () => close(false);
    document.addEventListener("pointerdown", outside, true);
    document.addEventListener("scroll", outside, true);
    window.addEventListener("resize", resize);
    return () => { document.removeEventListener("pointerdown", outside, true); document.removeEventListener("scroll", outside, true); window.removeEventListener("resize", resize); };
  }, [open]);

  const onKey = (e: KeyboardEvent) => {
    if (e.nativeEvent.isComposing) return;
    const n = items.length;
    const inSearch = e.target === search.current;
    const move = (i: number) => { e.preventDefault(); if (n) setActive(Math.min(n - 1, Math.max(0, i))); };
    if (e.key === "ArrowDown") move(active + 1);
    else if (e.key === "ArrowUp") move(active - 1);
    else if (e.key === "Home" && (!inSearch || !query)) move(0);
    else if (e.key === "End" && (!inSearch || !query)) move(n - 1);
    else if (e.key === "Enter" || (e.key === " " && !inSearch)) { e.preventDefault(); if (items[active]) choose(items[active]); }
    else if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "Tab") close(false);
    else if (!inSearch && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // 打字跳到開頭相符的選項（連續打的字串起來）
      const now = Date.now();
      const tb = typed.current;
      tb.text = (now - tb.at > 700 ? "" : tb.text) + e.key.toLowerCase();
      tb.at = now;
      const i = items.findIndex((o) => o.label.toLowerCase().startsWith(tb.text));
      if (i !== -1) setActive(i);
      return;
    } else return;
    e.stopPropagation(); // 別讓外層（整頁的 Esc 返回、歷史清單的 ↑↓）也處理
  };

  const activeId = items[active] ? `${id}-opt-${active}` : undefined;
  return (
    <div className={`sel sel-${variant}`} hidden={hidden} data-open={open ? "" : undefined}>
      <button type="button" className="sel-btn" id={id} ref={btn} aria-label={label} title={title ?? shown} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-list`}
        data-empty={current || value ? undefined : ""}
        onClick={() => (open ? close(true) : openMenu())}
        onKeyDown={(e) => { if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openMenu(); } }}>
        <span className="sel-value">{shown}</span>
      </button>
      {open && (
        <div className="sel-pop" ref={pop} onKeyDown={onKey}>
          {searchable && (
            <input className="sel-search" ref={search} type="text" role="combobox" autoComplete="off" spellCheck={false}
              placeholder={t("select.filter")} aria-label={t("select.filter")} aria-expanded aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={activeId}
              value={query} onChange={(e) => { setQuery(e.target.value); setActive(0); }} />
          )}
          {status && <div className="sel-status" role="status">{status}</div>}
          <div className="sel-list" id={`${id}-list`} role="listbox" ref={list} tabIndex={-1} aria-label={label} aria-activedescendant={searchable ? undefined : activeId}>
            {items.map((o, i) => (
              <div key={`${o.custom ? "+" : ""}${o.value}`} id={`${id}-opt-${i}`} role="option" className="sel-opt" aria-selected={o.value === value && !o.custom}
                data-active={i === active ? "" : undefined} data-value={o.value} title={o.label}
                onMouseDown={(e) => e.preventDefault()} onMouseMove={() => i !== active && setActive(i)} onClick={() => choose(o)}>
                <span className="sel-text"><span className="sel-label">{o.label}</span>{o.hint && <small>{o.hint}</small>}</span>
                {o.value === value && !o.custom && <IconOk />}
              </div>
            ))}
            {!items.length && <div className="sel-empty">{t("select.noMatch")}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
