// node scripts/check-skills.mjs — SKILL.md 解析的自我檢查
import assert from "node:assert/strict";
import { parseSkill, serializeSkill, expandSlash, cleanName } from "../src/skills.js";

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
