const fs = require("fs");
const path = require("path");

function readSkillSummary(skillsDir) {
  if (!fs.existsSync(skillsDir)) return [];
  const out = [];
  for (const name of fs.readdirSync(skillsDir)) {
    const skillFile = path.join(skillsDir, name, "SKILL.md");
    if (!fs.existsSync(skillFile)) continue;
    const raw = fs.readFileSync(skillFile, "utf8");
    const frontmatter = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const body = frontmatter ? frontmatter[1] : "";
    const skillName = (body.match(/^\s*name:\s*(.+)\s*$/m) || [])[1] || name;
    const desc = (body.match(/^\s*description:\s*(.+)\s*$/m) || [])[1] || "暂无描述";
    out.push(`- \`${skillName.trim()}\`：${desc.trim()}`);
  }
  return out.sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

function renderProjectConfigBlock(projectConfig) {
  const c = projectConfig || {};
  const subAgent = Boolean(c.subAgent);
  const switchAgentVerification = Boolean(c.switchAgentVerification);
  return [
    "| 配置项 | 当前值 | 说明 |",
    "| --- | --- | --- |",
    "| `subAgent` | " +
      String(subAgent) +
      " | 技能规定用子 agent 的步骤：`true` 执行，`false` 全在主会话。用户「动态判断谁用子 agent」**仅当本项为 true** 时有效，否则该说明失效。各 f2s 阶段细则见技能正文（模板未统一写死）。 |",
    "| `switchAgentVerification` | " +
      String(switchAgentVerification) +
      " | **切换 agent 校验**：`false` 时落盘侧同会话内验（子写子验、主写主验）。`true` 且技能写明依赖本项时交叉验：子落盘→主验，主落盘→子验；无子 agent（如 `subAgent` false）则主落盘→子验不发生、全主验。旧键 `subAgentVerification` 仍可被解析。 |",
  ].join("\n");
}

function renderCodexAgents(templateBody, skillsSummaryLines, projectConfig) {
  const summary =
    skillsSummaryLines.length > 0
      ? skillsSummaryLines.join("\n")
      : "- 当前未发现可用技能。";
  let body = templateBody.replace("{{FLOW2SPEC_CODEX_SKILLS_SUMMARY}}", summary);
  body = body.replace(
    "{{FLOW2SPEC_PROJECT_CONFIG}}",
    renderProjectConfigBlock(projectConfig),
  );
  return body;
}

function buildCodexAgentsMd(templatesDir, projectConfig) {
  const templatePath = path.join(templatesDir, "AGENTS.md");
  const skillsDir = path.join(templatesDir, "skills");
  const templateBody = fs.readFileSync(templatePath, "utf8");
  const skillLines = readSkillSummary(skillsDir);
  return renderCodexAgents(templateBody, skillLines, projectConfig);
}

module.exports = { buildCodexAgentsMd, renderProjectConfigBlock };
