// npm run check — SKILL.md 解析與記憶操作的自我檢查
import assert from "node:assert/strict";
import { parseSkill, serializeSkill, expandSlash, cleanName } from "../src/skills.js";
import { addMemory, forgetMemory, memoryPrompt, MAX_MEMORIES } from "../src/memory.js";

const a = parseSkill("---\nname: 會議紀錄\ndescription: 整理成固定格式\n---\n\n# 步驟\n1. 讀頁面\n");
assert.deepEqual(a, { name: "會議紀錄", description: "整理成固定格式", body: "# 步驟\n1. 讀頁面" });

// 往返不失真
assert.deepEqual(parseSkill(serializeSkill(a)), a);

// Claude Code 常見寫法：引號、多行 description、CRLF、BOM、多餘欄位
const b = parseSkill('﻿---\r\nname: "pdf-tools"\r\ndescription: >\r\n  Extract text\r\n  from PDFs\r\nallowed-tools: Read\r\n---\r\nBody here\r\n');
assert.equal(b.name, "pdf-tools");
assert.equal(b.description, "Extract text from PDFs");
assert.equal(b.body, "Body here");

// 沒有 frontmatter：整份當內文，名稱用檔名
const c = parseSkill("just instructions", "my skill");
assert.deepEqual(c, { name: "my-skill", description: "", body: "just instructions" });

assert.equal(cleanName(" a/b c "), "a-b-c");

const skills = [a];
assert.match(expandSlash("/會議紀錄 重點放前面", skills), /<skill name="會議紀錄">\n# 步驟\n1\. 讀頁面\n<\/skill>\n\n重點放前面$/);
assert.equal(expandSlash("/不存在 hi", skills), "/不存在 hi");
assert.equal(expandSlash("一般訊息", skills), "一般訊息");

console.log("skills: all checks passed");

// ---------- 記憶 ----------
let r = addMemory([], "  我叫  Eason ");
assert.deepEqual(r.list, ["我叫 Eason"]);
const one = r.list;
assert.equal(addMemory(one, "我叫 Eason").list, one); // 重複不加
assert.equal(addMemory(one, "").list, one);
assert.equal(addMemory(one, "字".repeat(201)).list, one);
assert.equal(addMemory(Array.from({ length: MAX_MEMORIES }, (_, i) => `m${i}`), "新的").list.length, MAX_MEMORIES);

const two = ["我叫 Eason", "比價一律換算成台幣", "偏好 Eason 風格"];
assert.deepEqual(forgetMemory(two, "比價一律換算成台幣").list, ["我叫 Eason", "偏好 Eason 風格"]); // 完全相同
assert.deepEqual(forgetMemory(two, "台幣").list, ["我叫 Eason", "偏好 Eason 風格"]); // 唯一部分符合
assert.equal(forgetMemory(two, "Eason").list, two); // 多條符合 → 不刪
assert.match(forgetMemory(two, "Eason").result, /有 2 條/);
assert.deepEqual(forgetMemory(["住台北", "住台北市信義區"], "住台北").list, ["住台北市信義區"]); // 完全相同優先於部分符合
assert.equal(forgetMemory(two, "不存在").list, two);

assert.match(memoryPrompt([]), /目前沒有記憶/);
assert.match(memoryPrompt(two), /- 比價一律換算成台幣/);
console.log("memory: all checks passed");

// ---------- 對話歷史 ----------
import { displayText, chatTitle, upsertChat, toMarkdown, MAX_CHATS } from "../src/history.js";
{
  const expanded = expandSlash("/會議紀錄 重點放前面", [a]);
  assert.equal(displayText(expanded), "/會議紀錄 重點放前面");
  assert.equal(displayText(expandSlash("/會議紀錄", [a])), "/會議紀錄");
  assert.equal(displayText([{ type: "tool_result" }]), null);
  const msgs = [
    { role: "user", content: expanded },
    { role: "assistant", content: [{ type: "thinking", thinking: "x" }, { type: "tool_use", id: "t", name: "click", input: { ref: 3 } }] },
    { role: "user", content: [{ type: "tool_result", tool_use_id: "t", content: "已點擊" }] },
    { role: "assistant", content: [{ type: "text", text: "好了" }] },
  ];
  assert.equal(chatTitle(msgs), "/會議紀錄 重點放前面");
  assert.equal(chatTitle([{ role: "user", content: "字".repeat(50) }]), "字".repeat(40) + "…");
  const md = toMarkdown({ title: "t", updated: 0, messages: msgs });
  assert.match(md, /## 你\n\n\/會議紀錄 重點放前面\n\n> 工具 `click` \{"ref":3\}\n\n## Claude\n\n好了\n$/);
  assert.ok(!md.includes("<skill"), "匯出不含展開的技能指示");
  let chats = [];
  for (let i = 0; i < MAX_CHATS + 5; i++) chats = upsertChat(chats, { id: String(i) });
  assert.equal(chats.length, MAX_CHATS);
  assert.equal(chats[0].id, String(MAX_CHATS + 4));
  chats = upsertChat(chats, { id: "10", title: "新" });
  assert.equal(chats[0].title, "新");
  assert.equal(chats.filter((c) => c.id === "10").length, 1);
}
console.log("history: all checks passed");
