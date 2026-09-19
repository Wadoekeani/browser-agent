// 可互動元素清單：給每個元素一個編號（寫在 data-ba 屬性），模型用編號點擊／輸入，不用自己猜 CSS selector。
// 這個函式會被 chrome.scripting.executeScript 序列化後在頁面裡執行，所以必須自成一體：不能引用外部變數。
export function listElements(limit) {
  const SEL = [
    "a[href]", "button", "input:not([type=hidden])", "textarea", "select", "summary", "label[for]",
    "[role=button]", "[role=link]", "[role=checkbox]", "[role=radio]", "[role=tab]", "[role=menuitem]",
    "[role=option]", "[role=switch]", "[role=combobox]", "[role=textbox]", "[contenteditable=''], [contenteditable=true]",
  ].join(",");
  const clip = (s, n = 60) => {
    s = (s ?? "").replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n) + "…" : s;
  };
  // <label> 包住控制項時，innerText 會把下拉選項、輸入值一起算進去：複製一份拿掉控制項再取字
  const labelText = (el) => {
    const lab = el.labels?.[0];
    if (!lab) return "";
    const c = lab.cloneNode(true);
    c.querySelectorAll("select, input, textarea").forEach((n) => n.remove());
    return c.textContent;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.opacity === "0") return null;
    return r;
  };

  document.querySelectorAll("[data-ba]").forEach((e) => e.removeAttribute("data-ba"));
  const seen = new Set();
  const found = [];
  const add = (el) => {
    if (seen.has(el)) return;
    seen.add(el);
    const r = visible(el);
    if (r) found.push({ el, inView: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth });
  };
  document.querySelectorAll(SEL).forEach(add);
  // SPA 常把 onClick 掛在 div 上：cursor:pointer 且父層不是 pointer 的，當成可點（子層繼承的 pointer 不算）
  for (const el of document.body.querySelectorAll("div, span, li, img, svg")) {
    if (seen.has(el)) continue;
    if (getComputedStyle(el).cursor !== "pointer") continue;
    if (el.parentElement && getComputedStyle(el.parentElement).cursor === "pointer") continue;
    if (el.closest(SEL)) continue; // 已在某個可互動元素裡面，點外層就好
    add(el);
  }
  // 畫面內的排前面：模型通常要操作的是眼前這些
  found.sort((a, b) => b.inView - a.inView);

  const lines = [];
  let offscreenMarked = false;
  found.slice(0, limit).forEach(({ el, inView }, i) => {
    const ref = i + 1;
    el.setAttribute("data-ba", ref);
    if (!inView && !offscreenMarked) { lines.push("（以下在畫面外，點擊時會自動捲過去）"); offscreenMarked = true; }
    const tag = el.tagName.toLowerCase();
    const role = el.getAttribute("role");
    let kind = role || (tag === "a" ? "link" : tag);
    if (tag === "input") kind = `input[${el.type}]`;
    const name = clip(
      el.getAttribute("aria-label") || labelText(el) || (tag === "select" ? "" : el.innerText) ||
      el.getAttribute("placeholder") || el.getAttribute("title") || el.getAttribute("alt") ||
      el.querySelector("img[alt]")?.alt || el.getAttribute("name") || "",
    );
    let extra = "";
    if (tag === "select") {
      const opts = [...el.options].map((o) => clip(o.text, 30));
      extra = ` 目前="${clip(el.selectedOptions[0]?.text, 30)}" 選項: ${opts.slice(0, 12).join(" | ")}${opts.length > 12 ? ` …共 ${opts.length} 項` : ""}`;
    } else if (tag === "input" && (el.type === "checkbox" || el.type === "radio")) {
      extra = el.checked ? " 已勾選" : " 未勾選";
    } else if ((tag === "input" || tag === "textarea") && el.value) {
      extra = ` 值="${clip(el.value, 40)}"`;
    }
    if (el.disabled) extra += " 停用";
    lines.push(`[${ref}] ${kind}${name ? ` "${name}"` : ""}${extra}`);
  });
  if (found.length > limit) lines.push(`（還有 ${found.length - limit} 個元素沒列出；要找的不在清單裡就先 scroll 再重新讀）`);
  return lines.join("\n") || "（這個頁面沒有可互動的元素）";
}
