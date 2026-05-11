# config-precheck（路由摘要）

## 本主题作用

- 供 `manifest-routing.topicPaths` 锚定主题 id **`config-precheck`**。
- 与执行任意 **`f2s-*` 技能**前读取项目根 **`flow2spec.config.json`**（`subAgent`、`switchAgentVerification`、`changeTracking`）相关；语义与 **`.codex/AGENTS.md`** 顶部、「统一入口」一致。

## 完整条令（按需，勿在 `.Knowledge` 再维护第二份正文）

| 侧 | 路径 |
| --- | --- |
| Codex（init 镜像，与模板同源） | [f2s-config-check.md](../../.codex/topics/f2s-config-check.md) |
| Cursor | 仓库根 `.cursor/rules/f2s-config-check.mdc`（`flow2spec init cursor`） |
| Claude | `.claude/rules/f2s-config-check.md`；PreToolUse：`templates/hooks/f2s-config-inject.js` |
| 包模板 | `templates/rules/f2s-config-check.mdc` |

## 必备步骤

1. 用 **Read** 打开项目根 **`flow2spec.config.json`**（须在 `f2s-*` 技能正文任何步骤之前）。
2. **`.codex/AGENTS.md`** 中 `{{FLOW2SPEC_PROJECT_CONFIG}}` 表为 **init 时刻快照**；与磁盘不一致时以 **Read** 结果为准。

## 禁止项

- 禁止在未读 **`flow2spec.config.json`** 的情况下进入 **`f2s-*`** 技能正文步骤（与 `AGENTS`、`.codex/topics/f2s-config-check.md` 一致）。
