---
description: flow2spec 架构约定：CLI 命令、模块职责、init 流程、格式转换规则、templates/ 清单
paths:
  - "cli.js"
  - "lib/**/*.js"
  - "templates/**"
sourceDoc: .claude/stock-docs/flow2spec架构说明_终稿.md
generatedAt: "2026-04-27T10:00:00+08:00"
---

# flow2spec 架构约定

详细架构说明见 [flow2spec架构说明_终稿](../stock-docs/flow2spec架构说明_终稿.md)。

## 核心概念

| 概念 | 说明 |
|------|------|
| 配置根 | AI 工具配置目录（`.cursor/` / `.claude/` / `.codex/`），init 的写入目标 |
| agent | CLI 参数标识（cursor / claude / codex），默认 cursor，可多选去重 |
| templates/ | 包内模板源，init 以 `__dirname` 为基准读取，覆盖写入业务仓库 |
| stock-docs/ | 配置根下存量上下文源目录（初稿/终稿/架构说明）|
| req-docs/ | 配置根下需求与技术方案目录，`implement-tech-design` 规则覆盖范围 |
| claudeRulesAdapter | `.mdc → .md` 格式适配，仅 `.claude` agentRoot 触发 |
| f2s-* 技能 | 13 个工作流技能，覆盖文档生成→上下文管理→需求→知识库维护全链路 |

## init 规则

- 默认 agent 为 `cursor`；传多个 agent 空格分隔，去重后逐一写入
- 未知 agent ID 抛出错误，中断 init
- 写入策略为覆盖（`copyRecursive`），可重复执行升级模板版本
- `stock-docs/` 与 `req-docs/` 为预建空目录，init **不删除**已有内容

## 格式转换规则（claudeRulesAdapter）

- 仅 `agentRoot === ".claude"` 时触发
- `globs:` → `paths:`；移除 `alwaysApply` 行；正文内 `.mdc` 引用改为 `.md`
- 转换前删除 `rules/` 下已存在的 `.mdc` 文件
- 基于正则，幂等，对已转换文件重复执行无副作用

## init 关键路径

```
cli.js → lib/init.js
  ensureDirs(cwd, agentRoot)           // 建 rules/ skills/ template/ stock-docs/ req-docs/
  copyRulesTemplates(...)              // 含格式转换
  copyRecursive(skillsSrc, skillsDest) // 逐目录覆盖
  copyRecursive(templateSrc, ...)      // 文档模版
```

所有源路径以 `path.join(__dirname, '..', 'templates')` 为基准；目标路径以 `process.cwd()` 为基准。

## templates/ 内容清单（主要条目）

| 路径 | 说明 |
|------|------|
| `rules/implement-tech-design.mdc` | 引导 AI 按 req-docs 方案写代码 |
| `rules/stock-docs-vs-req-docs.mdc` | stock-docs 与 req-docs 职责划分 |
| `skills/f2s-doc-arch/SKILL.md` | 生成架构说明初稿 |
| `skills/f2s-doc-final/SKILL.md` | 初稿 → 终稿规范格式 |
| `skills/f2s-ctx-build/SKILL.md` | 终稿 → Rules/Skills/docs-index |
| `skills/f2s-doc-add/SKILL.md` | 已落地能力多文件解析进知识库 |
| `skills/f2s-kb-sync/SKILL.md` | 会话/现状沉淀进知识库 |
| `template/终稿模版.md` | f2s-doc-final 的结构参考 |
| `template/后端技术模版.md` | f2s-req-backend 的章节结构参考 |

## 新增 agent 接入步骤

1. `lib/agents.js` → `AGENTS` 对象新增 `{ id: { root: '.<name>', label: '...' } }`
2. 若有特殊规则格式，在 `claudeRulesAdapter.js` 增加适配分支，在 `init.js` 的 `shouldWriteClaudeStyleRules` 启用
3. `flow2spec init <id>` 即可写入

## 新增/更新技能或规则

- 编辑 `templates/skills/<标识>/SKILL.md` 或 `templates/rules/<名>.mdc`
- `npm publish` 后，业务仓库重新执行 `flow2spec init` 即覆盖更新
