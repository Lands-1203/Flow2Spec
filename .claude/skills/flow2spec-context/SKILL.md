---
name: flow2spec-context
description: 了解 flow2spec 架构、init 流程、模块职责、f2s-* 技能体系时使用；触发词：flow2spec、init、配置根、agent、templates、claudeRulesAdapter、f2s-* 技能、知识库闭环
sourceDoc: .claude/stock-docs/flow2spec架构说明_终稿.md
generatedAt: "2026-04-27T10:00:00+08:00"
---

# flow2spec 架构上下文

详细架构说明：[flow2spec架构说明_终稿](../../stock-docs/flow2spec架构说明_终稿.md)

## 项目定位

`@double-codeing/flow2spec`（v2.2.0）是 CLI 工具兼模板分发系统。在业务仓库执行 `npx @double-codeing/flow2spec init [agent]`，将 AI 工作流配置（rules / skills / template / stock-docs / req-docs）写入目标配置根，形成「知识库 ↔ 实现 ↔ 知识库」的可持续闭环。

## 核心概念

| 概念 | 说明 |
|------|------|
| 配置根 | `.cursor/` / `.claude/` / `.codex/`，init 的写入目标根 |
| agent | 工具标识（cursor / claude / codex），默认 cursor，可多选 |
| templates/ | 包内模板源，位于 `__dirname/../templates/`，不随配置根分发 |
| stock-docs/ | 存量上下文源：初稿、终稿、架构说明，供 f2s-* 技能读写 |
| req-docs/ | 需求与技术方案，`implement-tech-design` 规则的覆盖范围 |
| claudeRulesAdapter | `.mdc → .md` 格式适配，仅 `.claude` 触发 |
| docs-index.md | 文档路径 ↔ Rules/Skills 的完整映射表，由 f2s-ctx-build 生成 |
| 闭环 | 知识库 → 对话实现 → 写回知识库 |

## 关键文件

| 文件 | 职责 |
|------|------|
| `cli.js` | 解析命令，调用 `lib/init.js` |
| `lib/agents.js` | Agent 注册表与 `normalizeAgentIds` 参数校验 |
| `lib/init.js` | `ensureDirs` / `copyRulesTemplates` / `copyTemplatesToAgentRoot` |
| `lib/claudeRulesAdapter.js` | `adaptRuleMdcToClaudeMd` / `shouldWriteClaudeStyleRules` |

## 关键流程

1. **初始化**：`flow2spec init [agent]` → 校验 ID → 建五个子目录 → 复制 rules（含格式转换）/ skills / template → 配置根可用
2. **架构沉淀**：f2s-doc-arch → `stock-docs/*_初稿.md` → f2s-doc-final → `*_终稿.md` → f2s-ctx-build → rules + skills + docs-index
3. **需求驱动实现**：f2s-req-clarify → f2s-req-backend → `req-docs/` 技术方案 → `implement-tech-design` 规则驱动实现
4. **知识库维护**：f2s-kb-feat / f2s-kb-fix / f2s-kb-sync / f2s-kb-merge，任意时机触发，确认大纲后写库
5. **已落地能力补录**：f2s-doc-add，传入多个相关文件路径，一次完成初稿 → 终稿 → Rules/Skills/索引

## 格式转换要点（claudeRulesAdapter）

- 仅 `agentRoot === ".claude"` 触发
- `globs:` → `paths:`；移除 `alwaysApply` 行；`.mdc` 引用改 `.md`
- 幂等，可重复执行；转换前删除 `rules/` 下旧 `.mdc`

## f2s-* 技能分组（13 个）

| 分组 | 技能 |
|------|------|
| 文档生成链 | f2s-doc-arch / f2s-doc-final / f2s-doc-pdf / f2s-doc-add |
| 上下文管理 | f2s-ctx-build / f2s-ctx-rm |
| 需求侧 | f2s-req-clarify / f2s-req-backend |
| 知识库维护 | f2s-kb-feat / f2s-kb-fix / f2s-kb-sync / f2s-kb-merge |
| 参考说明 | stock-docs-vs-req-docs |

## 新增 agent / 更新技能

- **新增 agent**：`lib/agents.js` AGENTS 对象 → 按需加适配分支 → `flow2spec init <id>`
- **更新技能/规则**：编辑 `templates/skills/<标识>/SKILL.md` 或 `templates/rules/<名>.mdc` → `npm publish` → 业务仓库 `flow2spec init` 覆盖更新
