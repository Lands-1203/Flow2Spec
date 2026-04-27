---
description: flow2spec 项目总概述与索引，体系结构、模块一览、f2s-* 技能能力入口
sourceDoc: .claude/stock-docs/flow2spec架构说明_终稿.md
generatedAt: "2026-04-27T10:00:00+08:00"
---

# flow2spec 项目总概述

`@double-codeing/flow2spec` 是一个 CLI 工具兼模板分发系统（Node.js ≥ 16，纯 CommonJS，无额外依赖）。  
在目标业务仓库执行 `npx @double-codeing/flow2spec init [agent]`，将 `rules/`、`skills/`、`template/`、`stock-docs/`、`req-docs/` 写入所选 AI 工具配置根（`.cursor/`、`.claude/`、`.codex/`），形成「知识库 ↔ 实现 ↔ 知识库」的可持续闭环。

## 目录结构

```
flow2spec/
├── cli.js            # CLI 入口
├── lib/              # 核心逻辑（agents / init / claudeRulesAdapter）
├── templates/        # 分发到业务仓库的模板源（rules / skills / template）
├── docs/             # 工具自身说明（不写入业务仓库）
└── scripts/          # 暂空
```

## 模块一览

| 模块 | 说明 | 详细约定加载方式 |
|------|------|----------------|
| CLI 入口 | `cli.js`，解析 `init` / `--help` 命令，调用 `lib/init.js` | 打开 `cli.js` 或 `lib/` 时加载 `rules/flow2spec-ctx.md` |
| Agent 注册表 | `lib/agents.js`，定义 cursor/claude/codex 与配置根映射，含参数校验 | 同上 |
| 初始化流程 | `lib/init.js`，建五个子目录、复制模板、触发格式转换 | 同上 |
| 格式适配 | `lib/claudeRulesAdapter.js`，`.mdc → .md`，仅 `.claude` agentRoot 触发 | 同上 |
| 模板源 | `templates/`，rules（2）/ skills（13）/ template（2），init 时复制到业务仓库 | 查阅 `stock-docs/flow2spec架构说明_终稿.md` |

## 公共能力入口

- **格式转换**：`lib/claudeRulesAdapter.js` — `adaptRuleMdcToClaudeMd` / `shouldWriteClaudeStyleRules`
- **模板分发**：`lib/init.js` — `copyTemplatesToAgentRoot`
- **参数校验**：`lib/agents.js` — `normalizeAgentIds`
- **f2s-* 技能**：`.claude/skills/<标识>/SKILL.md`（13 个工作流技能，见 `docs-index.md`）

## 全文索引与渐进式读取

「文档路径 ↔ Rules / Skills」完整映射在 **`.claude/docs-index.md`**（非自动加载，须按需打开）。

**读取顺序**：定位某文档/需求/模块对应的规则或技能时，**先读 `docs-index.md`**，找到对应行，再按 Rules、Skills 列打开 `.md` / `SKILL.md`；需要长文细节时再打开 `stock-docs/` 源文档；仍不足再下钻业务源码。

**避免**：在未查 `docs-index.md`、未锁定 Rule/Skill 前，对工作区做无范围的大面积检索，或通读与当前问题无关的长文档。

**全文索引**：`.claude/docs-index.md`
