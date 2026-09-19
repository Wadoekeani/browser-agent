// 技能＝SKILL.md：開頭 --- 包住的 name / description，後面是給模型的完整指示。
// 格式與 Claude Code 的 SKILL.md 相容，可以直接互相匯入匯出。

export const cleanName = (s) => s.trim().replace(/[\s/]+/g, "-");

export function parseSkill(md, fallbackName = "") {
  const text = md.replace(/^﻿/, "");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  const meta = {};
  if (m) {
    const lines = m[1].split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const kv = lines[i].match(/^([\w-]+):\s*(.*)$/);
      if (!kv) continue;
      let value = kv[2].trim();
      // YAML 多行字串（description: > 或 |）：收集後面縮排的行
      if (/^[>|][+-]?$/.test(value)) {
        const block = [];
        while (i + 1 < lines.length && (/^\s+\S/.test(lines[i + 1]) || lines[i + 1].trim() === "")) block.push(lines[++i].trim());
        value = block.join(value.startsWith(">") ? " " : "\n").trim();
      }
      meta[kv[1]] = value.replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  return {
    name: cleanName(meta.name || fallbackName),
    description: meta.description || "",
    body: (m ? m[2] : text).trim(),
  };
}

export const serializeSkill = (s) => `---\nname: ${s.name}\ndescription: ${s.description.replace(/\n/g, " ")}\n---\n\n${s.body}\n`;

// 系統提示詞只放名稱與說明，完整指示等模型呼叫 use_skill 才載入
export function skillsPrompt(skills) {
  if (!skills.length) return "";
  return "\n\n## 可用技能\n需要時先呼叫 use_skill 載入完整指示再照做。使用者訊息開頭的「/名稱」代表指定用那個技能。\n"
    + skills.map((s) => `- ${s.name}：${s.description}`).join("\n");
}

// 使用者手動指定 /名稱：直接把技能內文併進這則訊息，省一次工具呼叫
export function expandSlash(text, skills) {
  const m = text.match(/^\/(\S+)\s*([\s\S]*)$/);
  const skill = m && skills.find((s) => s.name === m[1]);
  if (!skill) return text;
  return `使用技能「${skill.name}」，完整指示已附在下面（不用再呼叫 use_skill）：\n<skill name="${skill.name}">\n${skill.body}\n</skill>\n\n${m[2] || "（沒有補充說明，直接照技能指示做）"}`;
}
