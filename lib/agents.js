/**
 * flow2spec init 支持的 AI 工具配置目录。
 * 模板以相同子目录结构写入各配置根：commands/、rules/、skills/、stock-docs/、req-docs/、template/
 */
const AGENTS = {
  cursor: { root: ".cursor", label: "Cursor" },
  claude: { root: ".claude", label: "Claude" },
  codex: { root: ".codex", label: "Codex" },
};

const SUBDIRS = ["stock-docs", "req-docs", "template", "rules", "skills", "commands"];

/**
 * @param {string[]} argv  init 后的参数，如 []、['cursor']、['cursor','claude']
 * @returns {string[]}  去重后的 agent id 列表
 */
function normalizeAgentIds(argv) {
  const list = argv.length ? argv : ["cursor"];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const id = String(raw).toLowerCase().replace(/^--/, "");
    if (!AGENTS[id]) {
      const keys = Object.keys(AGENTS).join(", ");
      throw new Error(`未知 agent：${raw}。可选：${keys}`);
    }
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

module.exports = { AGENTS, SUBDIRS, normalizeAgentIds };
