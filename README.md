# Flow2Spec

**文档前置工作流**：在**配置根的父目录**（含 `.cursor/` 等 AI 配置目录的代码仓库根）执行 `flow2spec init`，将模板写入所选 **AI 配置根**（默认 Cursor 的 `.cursor/`，亦可 `.claude/`、`.codex/` 等）。先做文档与上下文，再按技术方案实现与全局工作流维护规则。

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

- 模板按所选 **agent** 写入对应**配置根**（如 **`.cursor/`**、**`.claude/`**、**`.codex/`**）下的 `rules/`、`skills/`、`template/` 与预建 **`stock-docs/`**（存量上下文源）、**`req-docs/`**（需求与技术方案，按代码实现）。目录分工见 [目录与路径约定](./docs/README-目录与路径约定.md)。
- 工作流说明在 **`skills/<标识>/SKILL.md`**；在 Cursor 中由 Agent 按场景加载对应 Skill。
- 可用 **`flow2spec --help`** 查看全部 agent 名称与示例。

**init 详解**：[Flow2Spec使用说明 - init 做了什么](./docs/Flow2Spec使用说明.md#一init-做了什么)。

---

## 能做什么

| 类型 | 说明 |
|------|------|
| **文档与上下文** | 技术方案/需求 → 规范格式 → Rules、Skills、索引（**gen-architecture-doc**、**spec2context-md**、**generate-project-context** 等技能） |
| **PDF 转 MD** | **pdf4code-md**：PDF 转 Markdown 并保存到 **配置根 `req-docs/`**，便于按方案实现代码 |
| **全局工作流** | **global-sync**：可写明 Agent 已实现能力或零输入；零输入时由 Agent 推断用户与项目关心的能力，**先大纲确认**再写入知识库以注入上下文；**global-fix** / **global-feat**：修正与新增能力时的文档与规则同步 |
| **按技术方案实现** | 对话中提供技术方案路径（如 **`.cursor/req-docs/xxx.md`**），AI 按 `implement-tech-design.mdc` 执行；[规则可自改](./docs/Flow2Spec使用说明.md#五implement-tech-designmdc-可自行改造) |

**推荐顺序**：上下文生成（gen-architecture-doc → spec2context-md → generate-project-context）→ 提问与实现（可选 pdf4code-md → 在对话中提供 **`req-docs/`** 技术方案路径并按 **implement-tech-design** 实现）→ 实现后（global-fix / global-feat / global-sync）。[按使用顺序查找](./docs/README-命令说明.md#按使用顺序查找)。

---

## 文档导航

| 文档 | 说明 |
|------|------|
| [**Flow2Spec使用说明**](./docs/Flow2Spec使用说明.md) | **使用手册**：init、目录约定、推荐顺序、典型流程、技能与工作流、常见问题 |
| [README-命令说明](./docs/README-命令说明.md) | 各命令入参/输出、**按使用顺序查找**、快速参考 |
| [README-目录与路径约定](./docs/README-目录与路径约定.md) | **配置根**下 `stock-docs/`、`req-docs/` 等结构、路径与链接约定、文档产物阶段 |
| [README-体系与原理](./docs/README-体系与原理.md) | 架构、设计原则、main 与 docs-index 区别 |

---

## CLI

| 命令 | 说明 |
|------|------|
| `flow2spec init [agent ...]` | 将模板写入所选配置根（默认 `cursor` → `.cursor/`）；详见 **`flow2spec --help`** |
| `flow2spec --help` | 查看用法、可选 agent（cursor / claude / codex）与示例 |

技能列表与速查见 [Flow2Spec使用说明](./docs/Flow2Spec使用说明.md)。
