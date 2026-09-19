// 技能＝SKILL.md：開頭 --- 包住的 name / description，後面是給模型的完整指示。
// 格式與 Claude Code 的 SKILL.md 相容，可以直接互相匯入匯出。選填的 model（例如 haiku）指定用 /名稱 叫出時用哪個模型。

export type Skill = { name: string; description: string; body: string; model?: string };

export const cleanName = (s: string) => s.trim().replace(/[\s/]+/g, "-");

export function parseSkill(md: string, fallbackName = ""): Skill {
  const text = md.replace(/^﻿/, "");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  const meta: Record<string, string> = {};
  if (m) {
    const lines = m[1].split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const kv = lines[i].match(/^([\w-]+):\s*(.*)$/);
      if (!kv) continue;
      let value = kv[2].trim();
      // YAML 多行字串（description: > 或 |）：收集後面縮排的行
      if (/^[>|][+-]?$/.test(value)) {
        const block: string[] = [];
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
    ...(meta.model ? { model: meta.model } : {}),
  };
}

export const serializeSkill = (s: Skill) =>
  `---\nname: ${s.name}\ndescription: ${s.description.replace(/\n/g, " ")}\n${s.model ? `model: ${s.model}\n` : ""}---\n\n${s.body}\n`;

// 技能的 model 欄位（Claude Code 寫法：haiku／sonnet／opus 或模型 id）→ 這裡支援的 Anthropic 模型 id；
// 其他值（inherit、舊模型、他家模型）回 null＝用目前選的
const MODEL_ALIASES: Record<string, string> = { haiku: "claude-haiku-4-5", sonnet: "claude-sonnet-5", opus: "claude-opus-5" };
export function skillModel(model: string | undefined): string | null {
  const m = (model ?? "").trim().toLowerCase();
  return MODEL_ALIASES[m] ?? (Object.values(MODEL_ALIASES).includes(m) ? m : null);
}

// 訊息開頭的 /名稱 對到哪個技能
export function slashSkill(text: string, skills: Skill[]) {
  const m = text.match(/^\/(\S+)/);
  return (m && skills.find((s) => s.name === m[1])) || null;
}

// 系統提示詞只放名稱與說明，完整指示等模型呼叫 use_skill 才載入
export function skillsPrompt(skills: Skill[]) {
  if (!skills.length) return "";
  return "\n\n## 可用技能\n需要時先呼叫 use_skill 載入完整指示再照做。使用者訊息開頭的「/名稱」代表指定用那個技能。\n"
    + skills.map((s) => `- ${s.name}：${s.description}`).join("\n");
}

// 使用者手動指定 /名稱：直接把技能內文併進這則訊息，省一次工具呼叫
export function expandSlash(text: string, skills: Skill[]) {
  const m = text.match(/^\/(\S+)\s*([\s\S]*)$/);
  const skill = m && skills.find((s) => s.name === m[1]);
  if (!skill) return text;
  return `使用技能「${skill.name}」，完整指示已附在下面（不用再呼叫 use_skill）：\n<skill name="${skill.name}">\n${skill.body}\n</skill>\n\n${m[2] || "（沒有補充說明，直接照技能指示做）"}`;
}
