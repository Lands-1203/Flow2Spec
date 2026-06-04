# config-precheck（路由摘要）

## 本主题作用

- 供 `manifest-routing.topicPaths` 锚定主题 id **`config-precheck`**。
- 与执行任意 **`f2s-*` 技能**前读取项目根 **`flow2spec.config.json`**（`subAgent`、`switchAgentVerification`、`changeTracking`、`updateCheck`）相关；语义与 **`AGENTS.md`** 顶部、「统一入口」一致。
- 同时记录 Claude / Cursor / Codex 三端对“配置读取提醒”和“自动更新检测”的分工，避免把 hooks 注入误认为替代显式 Read。

## 完整条令（按需，勿在 `.Knowledge` 再维护第二份正文）

| 侧 | 路径 |
| --- | --- |
| Codex（init 镜像，与模板同源） | [f2s-config-check.md](../../.codex/topics/f2s-config-check.md) |
| Cursor | 仓库根 `.cursor/rules/f2s-config-check.mdc`（`flow2spec init cursor`） |
| Claude | `.claude/rules/f2s-config-check.md`；PreToolUse：`templates/hooks/f2s-config-inject.js`；SessionStart：`templates/hooks/f2s-config-session.js` |
| 包模板 | `templates/rules/f2s-config-check.mdc` |

## 必备步骤

1. 用 **Read** 打开项目根 **`flow2spec.config.json`**（须在 `f2s-*` 技能正文任何步骤之前）。
2. **`AGENTS.md`** / `.codex/topics/f2s-config-check.md` 中的配置表为 **init 时刻快照**；与磁盘不一致时以 **Read** 结果为准。
3. Claude 的 `SessionStart` 配置摘要与 `PreToolUse Skill` 提醒只做注入 / 提醒；不得替代第 1 步的显式读取。

## 三端分工

| 侧 | 配置读取约束 | 自动更新检测 |
| --- | --- | --- |
| Claude | `SessionStart` 输出配置摘要；`PreToolUse Skill` 提醒技能前先 Read `flow2spec.config.json` | `SessionStart` 执行 `.claude/hooks/f2s-update-check.js` |
| Cursor | 通过 `.cursor/rules/f2s-config-check.mdc` 文本约束技能前先读配置 | `sessionStart` 执行 `.cursor/hooks/f2s-update-check.js`，通过 `additional_context` 注入提示 |
| Codex | 通过根 `AGENTS.md` 与 `.codex/topics/f2s-config-check.md` 文本约束技能前先读配置 | `SessionStart`（`startup|resume`）执行 `.codex/hooks/f2s-update-check.js`，通过 `hookSpecificOutput.additionalContext` 注入提示 |

## 禁止项

- 禁止在未读 **`flow2spec.config.json`** 的情况下进入 **`f2s-*`** 技能正文步骤（与 `AGENTS`、`.codex/topics/f2s-config-check.md` 一致）。
- 禁止因为 hooks 已输出配置摘要，就跳过技能开始时的 `flow2spec.config.json` 显式读取。
