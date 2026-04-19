# Flow2Spec

**文档前置 + OpenSpec 变更工作流**：在**配置根的父目录**（含 `.cursor/` 与 `openspec/` 的代码仓库根）执行 `flow2spec init`，将模板写入所选 **AI 配置根**（默认 Cursor 的 `.cursor/`，亦可 `.claude/`、`.codex/` 等），并复制 **openspec/**；先做文档与上下文，再做结构化变更与归档。

---

## 快速开始

```bash
# 在目标代码仓库（配置根的父目录）执行（默认仅写入 .cursor/）
npx @lands/flow2spec init
# 指定 AI 工具配置目录（可多选）
npx @lands/flow2spec init claude
npx @lands/flow2spec init cursor claude codex
# 或全局安装后
npm install -g @lands/flow2spec
flow2spec init
```

- 未检测到 OpenSpec 时会自动安装；模板按所选 **agent** 写入对应**配置根**（如 **`.cursor/`**、**`.claude/`**、**`.codex/`**）下的 `commands/`、`rules/`、`skills/`、`template/` 与预建 **`stock-docs/`**（存量上下文源）、**`req-docs/`**（需求与技术方案，按代码实现）；**openspec/** 始终复制到**配置根的父目录**（一份）。目录分工见 [目录与路径约定](./docs/README-目录与路径约定.md)。
- **斜杠命令**为 Cursor 能力；配置根为 `.cursor` 时，在 Cursor 中输入 `/` 即可使用。
- 可用 **`flow2spec --help`** 查看全部 agent 名称与示例。

**init 详解**：[Flow2Spec使用说明 - init 做了什么](./docs/Flow2Spec使用说明.md#一init-做了什么)。

---

## 能做什么

| 类型 | 说明 |
|------|------|
| **文档与上下文** | 技术方案/需求 → 规范格式 → Rules、Skills、索引（`/genStructureDoc`、`/spec2context-md`、`/generateProjectContext`） |
| **PDF 转 MD** | `/pdf4code-md`：PDF 转 Markdown 并保存到 **配置根 `req-docs/`**，便于按方案实现代码 |
| **OpenSpec 变更** | 新建变更、快进 artifact、按任务实现、归档（`/opsx-new`、`/opsx-ff`、`/opsx-apply`、`/opsx-archive` 等） |
| **全局工作流** | `/global-sync`：方案→全局 Rules/Skills→同步规范；`/global-fix`：修正规则错误并同步文档；`/global-feat`：新增能力时补全实现与文档 |
| **按技术方案实现** | 对话中提供技术方案路径（如 **`.cursor/req-docs/xxx.md`**），AI 按 `implement-tech-design.mdc` 执行；[规则可自改](./docs/Flow2Spec使用说明.md#五implement-tech-designmdc-可自行改造) |

**推荐顺序**：上下文生成（genStructureDoc → spec2context-md → generateProjectContext）→ 提问与实现（可选 pdf4code-md → opsx-new → opsx-continue → opsx-apply）→ 实现后（global-fix / global-feat / global-sync）。[按使用顺序查命令](./docs/README-命令说明.md#按使用顺序查找)。

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [**Flow2Spec使用说明**](./docs/Flow2Spec使用说明.md) | **使用手册**：init、目录约定、推荐顺序、典型流程、斜杠命令中英文、常见问题 |
| [README-命令说明](./docs/README-命令说明.md) | 各命令入参/输出、**按使用顺序查找**、快速参考 |
| [README-目录与路径约定](./docs/README-目录与路径约定.md) | **配置根** `stock-docs/`、`req-docs/` 与**配置根的父目录**下 `openspec/` 结构、路径与链接约定、文档产物阶段 |
| [README-体系与原理](./docs/README-体系与原理.md) | 架构、设计原则、main 与 docs-index 区别 |
| [OpenSpec-介绍](./docs/OpenSpec-介绍.md) | OpenSpec 概念、变更与 artifact、工作流 |
| [OpenSpec常见问题](./docs/OpenSpec常见问题.md) | OpenSpec 常见问题 |

---

## CLI

| 命令 | 说明 |
|------|------|
| `flow2spec init [agent ...]` | 安装 OpenSpec（若未安装）；将模板写入所选配置根（默认 `cursor` → `.cursor/`）；`openspec/` 复制到**配置根的父目录** |
| `flow2spec --help` | 查看用法、可选 agent（cursor / claude / codex）与示例 |

斜杠命令列表、中英文对应、速查见 [Flow2Spec使用说明](./docs/Flow2Spec使用说明.md)。
