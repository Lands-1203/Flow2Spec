#!/usr/bin/env node

const runInit = require("./lib/init");

const args = process.argv.slice(2);
const sub = args[0];

const help = `
Flow2Spec - 文档前置 + OpenSpec 变更工作流

用法:
  flow2spec init    在当前项目初始化：安装 OpenSpec（若未安装）、将模板写入 .cursor/

init 会:
  1. 若未检测到 OpenSpec，自动执行 npm install -g @fission-ai/openspec@latest
  2. 将 templates/ 下内容复制到项目 .cursor/（commands、rules、skills、docs）
  3. 之后可在 Cursor 中使用斜杠命令与 OpenSpec 工作流

更多说明见 README.md 或 docs/使用说明.md
`;

if (sub === "--help" || sub === "-h" || !sub) {
  console.log(help.trim());
  process.exit(0);
}

if (sub === "init") {
  runInit(process.cwd())
    .then(() => {
      console.log(`
✓ Flow2Spec init 完成
  - .cursor/commands/：文档与工作流命令（generateProjectContext、spec2context-md、pdf4code-md、opsx-* 等）
  - .cursor/rules/：实现技术方案规则（implement-tech-design.mdc，可按业务自行改造）
  - .cursor/skills/：OpenSpec 相关 Skills
  - .cursor/docs/：终稿模版
  - openspec/：OpenSpec 配置（如 config.yaml），供 openspec CLI 使用

在 Cursor 中输入 / 即可使用。建议阅读 README 或 docs/使用说明.md。
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
