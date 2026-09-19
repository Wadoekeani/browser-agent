// 可互動元素清單：給每個元素一個編號（寫在 data-ba 屬性），模型用編號點擊／輸入，不用自己猜 CSS selector。
// 這個函式會被 chrome.scripting.executeScript 序列化後在頁面裡執行，所以必須自成一體：不能引用外部變數。
export function listElements(limit: number) {
  const SEL = [
    "a[href]", "button", "input:not([type=hidden])", "textarea", "select", "summary", "label[for]",
    "[role=button]", "[role=link]", "[role=checkbox]", "[role=radio]", "[role=tab]", "[role=menuitem]",
    "[role=option]", "[role=switch]", "[role=combobox]", "[role=textbox]", "[contenteditable=''], [contenteditable=true]",
  ].join(",");
  const clip = (s: string | null | undefined, n = 60) => {
    s = (s ?? "").replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n) + "…" : s;
  };
  // <label> 包住控制項時，innerText 會把下拉選項、輸入值一起算進去：複製一份拿掉控制項再取字
  const labelText = (el: any): string => {
    const lab = el.labels?.[0];
    if (!lab) return "";
    const c = lab.cloneNode(true);
    c.querySelectorAll("select, input, textarea").forEach((n: Element) => n.remove());
    return c.textContent ?? "";
  };
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return null;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.opacity === "0") return null;
    return r;
  };

  document.querySelectorAll("[data-ba]").forEach((e) => e.removeAttribute("data-ba"));
  const seen = new Set<Element>();
  const found: { el: any; inView: boolean }[] = [];
  const add = (el: Element) => {
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
  found.sort((a, b) => Number(b.inView) - Number(a.inView));

  const lines: string[] = [];
  let offscreenMarked = false;
  found.slice(0, limit).forEach(({ el, inView }, i) => {
    const ref = i + 1;
    el.setAttribute("data-ba", String(ref));
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
      const opts = [...el.options].map((o: HTMLOptionElement) => clip(o.text, 30));
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

// 點擊／送出前的風險判斷，同樣在頁面裡執行、必須自成一體。
// 不可逆動作要使用者點頭，不能只靠系統提示詞：網頁裡的提示詞注入可以說服模型跳過確認。
// 回傳 label＝畫面上看得到的字、aria＝無障礙名稱（模型在元素清單看到的是它）；兩者對不上 mismatch＝true
export function inspectTarget(sel: string, submitting: boolean) {
  const el = document.querySelector(sel) as any;
  if (!el) return null;
  // 中日韓泰沒有空格分詞：子字串比對。拉丁／西里爾等用字首邊界＋整字，避免 "Orders"、"Postal"、"Shared" 這類導覽字誤判
  const CJK = [
    "付款|支付|購買|結帳|下單|訂購|刪除|轉帳|匯款|送出|提交|發布|發佈|傳送|確認|確定|同意|授權|允許|核准|儲存|存檔|更新|回覆|分享|邀請|安裝|移除|取消訂閱|連結帳號|簽署", // 繁中
    "购买|结账|结算|订购|删除|转账|汇款|发布|发送|确认|确定|授权|允许|批准|保存|储存|回复|邀请|安装|取消订阅|签署", // 簡中
    "支払|購入|注文|決済|削除|送信|振込|送金|投稿|公開|確認|確定|承認|許可|同意|保存|更新|返信|共有|招待|インストール|解除|購読をやめる|署名|連携", // ja
    "결제|구매|주문|삭제|제출|전송|송금|이체|게시|보내기|확인|승인|허용|동의|저장|업데이트|답장|답글|공유|초대|설치|제거|구독 취소|서명|연결", // ko
    "ชำระ|จ่าย|ซื้อ|ลบ|ส่ง|โอน|เผยแพร่|โพสต์|ยืนยัน|อนุญาต|ยอมรับ|บันทึก|อัปเดต|ตอบกลับ|แชร์|เชิญ|ติดตั้ง|ถอนการติดตั้ง|ยกเลิกการสมัคร|เชื่อมต่อ|ลงนาม", // th
  ].join("|");
  const WORDS = [
    "pay|buy|purchase|checkout|order|delete|submit|publish|send|transfer|authori[sz]e|allow|accept|approve|grant|confirm|save|update|post|reply|share|invite|install|uninstall|remove|unsubscribe|connect|sign(?! ?(?:in|up|out)\\b)|payment|place order", // en
    "pagar|pago|comprar|compra|pedido|eliminar|borrar|enviar|transferir|publicar|autorizar|permitir|aceptar|aprobar|conceder|confirmar|guardar|actualizar|responder|compartir|invitar|instalar|quitar|desuscribir(?:se)?|cancelar suscripción|conectar|firmar", // es
    "payer|paiement|acheter|achat|commander|supprimer|envoyer|soumettre|virement|transférer|publier|autoriser|permettre|accepter|approuver|accorder|confirmer|enregistrer|sauvegarder|mettre à jour|répondre|partager|inviter|installer|retirer|se désabonner|désabonner|connecter|signer", // fr
    "bezahlen|zahlung|kaufen|bestellen|kasse|löschen|absenden|senden|überweis\\p{L}*|veröffentlichen|autorisieren|zulassen|erlauben|akzeptieren|annehmen|genehmigen|gewähren|bestätigen|speichern|aktualisieren|posten|antworten|teilen|einladen|installieren|entfernen|abbestellen|verbinden|unterschreiben|signieren", // de
    "excluir|apagar|deletar|finalizar|autorizar|permitir|aceitar|aprovar|conceder|confirmar|salvar|atualizar|responder|compartilhar|convidar|instalar|remover|cancelar inscrição|desinscrever|conectar|assinar", // pt
    "pagare|paga|acquista|ordina|cassa|elimina|cancella|invia|bonifico|trasferisci|pubblica|autorizza|consenti|accetta|approva|concedi|conferma|salva|aggiorna|rispondi|condividi|invita|installa|rimuovi|annulla iscrizione|disiscriviti|collega|connetti|firma", // it
    "оплат\\p{L}*|купить|покупк\\p{L}*|заказ\\p{L}*|оформить|удалить|отправить|перевести|перевод|опубликовать|авторизовать|разрешить|принять|одобрить|предоставить|подтвердить|сохранить|обновить|ответить|поделиться|пригласить|установить|отписаться|подключить|подписать", // ru
    "thanh toán|mua|đặt hàng|xóa|xoá|gửi|chuyển khoản|chuyển tiền|đăng bài|xuất bản|ủy quyền|cho phép|chấp nhận|phê duyệt|cấp quyền|xác nhận|lưu|cập nhật|trả lời|chia sẻ|mời|cài đặt|gỡ|hủy đăng ký|kết nối|ký tên", // vi
    "bayar|beli|pesan|hapus|kirim|terbitkan|otorisasi|izinkan|terima|setujui|berikan|konfirmasi|simpan|perbarui|posting|balas|bagikan|undang|pasang|instal|copot|berhenti berlangganan|sambungkan|hubungkan|tandatangani", // id
    "ödeme|öde|satın al|sipariş|sil|gönder|yayınla|yayımla|yetkilendir|izin ver|kabul et|onayla|kaydet|güncelle|yanıtla|cevapla|paylaş|davet et|yükle|kaldır|abonelikten çık|bağlan|imzala", // tr
  ].join("|");
  const RISKY = new RegExp(`${CJK}|(?<!\\p{L})(?:${WORDS})(?!\\p{L})`, "iu");
  const norm = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  // 畫面上看得到的字、無障礙名稱、title、value 分開取，全部都比對：只看其中一個，網頁可以把真正的意思藏在另一個
  const texts = (e: any) => {
    const visible = norm(e?.innerText || (/^(submit|button|image|reset)$/.test(e?.type) && e.tagName === "INPUT" ? e.value || e.alt : ""));
    return { visible, aria: norm(e?.getAttribute?.("aria-label")), title: norm(e?.getAttribute?.("title")), value: norm(e?.matches?.("button, input[type=submit], input[type=button], input[type=image], input[type=reset]") ? e.value : "") };
  };
  const anyRisky = (x: ReturnType<typeof texts>) => [x.visible, x.aria, x.title, x.value].some((s) => s && RISKY.test(s));
  const low = (s: string) => s.toLowerCase();
  const mismatchOf = (x: ReturnType<typeof texts>) => !!x.visible && !!x.aria && !low(x.visible).includes(low(x.aria)) && !low(x.aria).includes(low(x.visible));
  const form = el.form ?? el.closest("form");
  // 搜尋框：送出不用問，問太多使用者會養成直接按允許
  const searchy = !!form && (form.matches("[role=search]") || !!form.querySelector("input[type=search], input[name=q], input[name=query], input[name=search], textarea[name=q]"));
  const fields = form?.querySelectorAll("input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=image]), textarea, select").length ?? 0;
  const hasPassword = !!document.querySelector("input[type=password]");
  // 多個欄位、有密碼欄、或有多行輸入（留言、訊息）的表單
  const seriousForm = !!form && (fields > 1 || !!form.querySelector("input[type=password]") || (!searchy && !!form.querySelector("textarea, [contenteditable=''], [contenteditable=true]")));
  const buttonLike = (e: any) => !!e?.matches?.("button, input[type=submit], input[type=button], input[type=image], [role=button]");
  // 純圖示按鈕（沒有任何字）：看不出它做什麼；在表單裡（搜尋框除外）或頁面上有密碼欄時當成不可逆
  const iconRisk = (e: any, x: ReturnType<typeof texts>) => buttonLike(e) && !x.visible && !x.aria && !x.title && !x.value && ((!!form && !searchy) || hasPassword);
  if (submitting) {
    // 不在表單裡的輸入框按 Enter：聊天室、留言框就是這樣送出的，一律問
    if (!form) return { risky: true, label: norm(el.getAttribute("aria-label") || el.getAttribute("placeholder")), aria: "", mismatch: false };
    const btn = form.querySelector("[type=submit], button:not([type])");
    const x = texts(btn);
    return { risky: seriousForm || anyRisky(x) || (!!btn && iconRisk(btn, x)), label: x.visible || x.value || x.aria || x.title, aria: x.aria, mismatch: mismatchOf(x) }; // 空字串由呼叫端補「表單」（介面語言）
  }
  const x = texts(el);
  // 勾選框、單選、分頁標籤、展開這類可以再按一次復原的，不看字（「同意條款」勾選框不用問）
  const toggle = el.matches("input[type=checkbox], input[type=radio], select, option, summary, label, [role=checkbox], [role=radio], [role=switch], [role=tab], [role=option], [role=combobox]");
  const isSubmit = !!form && el.matches("button[type=submit], button:not([type]), input[type=submit], input[type=image]");
  const label = x.visible || x.value || x.aria || x.title;
  // 連結的目的地：點下去等於 navigate，交給呼叫端做跨網站檢查
  const href = (el.closest("a[href]") as HTMLAnchorElement | null)?.href ?? "";
  return { risky: !toggle && (anyRisky(x) || iconRisk(el, x)) || (isSubmit && seriousForm), label, aria: x.aria, mismatch: mismatchOf(x), href };
}
