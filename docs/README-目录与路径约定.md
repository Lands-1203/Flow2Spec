# 目录与路径约定

## 核心边界

- `.Knowledge/`：只放业务知识文档与索引
- `配置根`（`.cursor/.claude/.codex`）：放规则与技能入口

---

## 目录职责

| 路径 | 职责 |
| --- | --- |
| `.Knowledge/stock-docs/` | 架构、终稿、沉淀文档 |
| `.Knowledge/req-docs/` | 需求澄清、技术方案 |
| `.Knowledge/topics/` | 主题路由文档（用于规则与流程执行） |
| `.Knowledge/template/` | 终稿/技术方案模板 |
| `.Knowledge/index.md` | 人类可读索引 |
| `.Knowledge/manifest-routing.json` | 机器可读路由骨架（task/topic/dependencies） |
| `.Knowledge/matchers/*.json` | 关键词分片（`id/includeAny`），由 `manifest-routing.taskToTopicRules[].matcherPath` 直链指向 |
| `.Knowledge/migration-report.md` | `f2s-kb-migrate` 落盘的迁移对照表与拟删除路径列表 |
| `.task/` | 变更追踪任务清单目录（`active/` 进行中，`completed/` 已归档，`todo.json` 活跃任务索引）；仅当 `changeTracking.*` 为 `true` 或显式调用 `f2s-req-plan` 时创建 |
| `配置根/rules/` | 规则文件（Cursor `.mdc`，Claude `.md`） |
| `配置根/skills/` | 技能定义（`SKILL.md`） |
| `配置根/template/` | （废弃）不再写入；历史目录可清理 |
| `.codex/AGENTS.md` | Codex 统一入口与加载说明 |
| `flow2spec.config.json` | 项目根配置，控制 `subAgent`、`switchAgentVerification`、`changeTracking`（嵌套对象，含 `feat` / `fix` / `implement` 三个子项） |

---

## 路径约束

1. `.Knowledge/topics` 是知识路由主题层，允许并鼓励通过 `f2s-*` 技能维护。
2. `f2s-ctx-build` 从 `.Knowledge/stock-docs` 读，更新 `.Knowledge/topics`、`.Knowledge/index.md`、`.Knowledge/manifest-routing.json`、`.Knowledge/matchers/*.json`。
3. 实现类任务统一读取 `.Knowledge/req-docs/*.md`。
4. `manifest-routing.json` 与 `matchers/*.json` 由 `f2s-*` 技能流程维护；不再使用 `.Knowledge/manifest-matchers.json`（`flow2spec init` 会删除遗留文件）。

---

## 相关文档

- [Flow2Spec使用说明](./Flow2Spec使用说明.md)
- [README-命令说明](./README-命令说明.md)
- [README-体系与原理](./README-体系与原理.md)
- [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md)