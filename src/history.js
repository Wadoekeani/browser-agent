// 對話歷史：存在 chrome.storage.local 的 chats，每筆是 { id, title, updated, messages }（messages 就是送給 API 的格式，還原後可以接著聊）
export const MAX_CHATS = 30; // ponytail: 超過就丟最舊的；一筆含讀頁結果可能上百 KB，storage.local 上限 10MB

// /技能 會被 expandSlash 展開成整段指示；顯示與標題要還原成使用者打的那一行
export function displayText(content) {
  if (typeof content !== "string") return null; // 陣列是 tool_result，不是使用者打的字
  const m = content.match(/^使用技能「(.+?)」，完整指示已附在下面[\s\S]*?<\/skill>\n\n([\s\S]*)$/);
  if (!m) return content;
  return `/${m[1]}${m[2].startsWith("（沒有補充說明") ? "" : ` ${m[2]}`}`;
}

export function chatTitle(messages) {
  const first = messages.map((m) => (m.role === "user" ? displayText(m.content) : null)).find(Boolean) ?? "新對話";
  const line = first.replace(/\s+/g, " ").trim();
  return line.length > 40 ? line.slice(0, 40) + "…" : line;
}

// 新的放最前面，同 id 取代舊的
export function upsertChat(chats, chat) {
  return [chat, ...chats.filter((c) => c.id !== chat.id)].slice(0, MAX_CHATS);
}

export function toMarkdown(chat) {
  const out = [`# ${chat.title}`, "", `_${new Date(chat.updated).toLocaleString("zh-TW")}_`];
  for (const m of chat.messages) {
    if (m.role === "user") {
      const text = displayText(m.content);
      if (text != null) out.push("", "## 你", "", text);
      continue;
    }
    const blocks = typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content;
    for (const b of blocks) {
      if (b.type === "text" && b.text.trim()) out.push("", "## Claude", "", b.text);
      else if (b.type === "tool_use") out.push("", `> 工具 \`${b.name}\` ${JSON.stringify(b.input)}`);
    }
  }
  return out.join("\n") + "\n";
}
