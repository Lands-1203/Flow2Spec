#!/usr/bin/env node

const runInit = require("./lib/init");
const { AGENTS } = require("./lib/agents");

const args = process.argv.slice(2);
const sub = args[0];

const agentList = Object.entries(AGENTS)
  .map(([id, { label }]) => `${id}（${label}）`)
  .join("，");

const help = `
Flow2Spec - 文档前置工作流（AI 配置模板）

用法:
  flow2spec init [agent ...]    在当前项目初始化：将模板写入所选 AI 工具配置目录
  flow2spec --help              显示本说明

agent（可多个，空格分隔；省略时默认为 cursor）：
  ${agentList}

示例:
  flow2spec init                  # 仅写入 .cursor/（Cursor）
  flow2spec init claude           # 仅写入 .claude/
  flow2spec init cursor claude    # 同时写入 .cursor/ 与 .claude/

init 会:
  1. 将 templates/ 下内容复制到各所选 agent 的配置根目录下的 rules、skills、template（及预建 stock-docs/、req-docs/）
  2. 工作流说明位于 skills 各子目录的 SKILL.md；写入 .claude/.codex 时主要为统一存放规则、技能与模版，供对应工具按各自方式加载

更多说明见 README.md 或 docs/Flow2Spec使用说明.md
`;

if (sub === "--help" || sub === "-h" || !sub) {
  console.log(help.trim());
  process.exit(0);
}

if (sub === "init") {
  const agentArgs = args.slice(1);
  runInit(process.cwd(), agentArgs)
    .then((ids) => {
      const lines = ids.map((id) => {
        const { root, label } = AGENTS[id];
        return `  - ${root}/：（${label}）rules、skills、template、stock-docs、req-docs（预建）`;
      });
      console.log(`
✓ Flow2Spec init 完成
${lines.join("\n")}

在 Cursor 中可通过 Agent Skills 加载 `skills/` 下工作流（配置根为 .cursor 时）。建议阅读 README 或 docs/Flow2Spec使用说明.md。
`);
    })
    .catch((e) => {
      console.error(e.message || e);
      process.exit(1);
    });
} else {
  console.log(help.trim());
  process.exit(1);
}
