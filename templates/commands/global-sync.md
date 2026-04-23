---
name: /global-sync
id: global-sync
category: 工作流
description: 技术方案转功能概述 → 提交到全局 Rules/Skills 与文档索引
---
> **「配置根」**：当前 agent 对应的 AI 工具配置目录（`flow2spec init` 写入，常见 **`.cursor/`**、**`.claude/`**、**`.codex/`**）。下文 **`配置根/...`** 指该目录下的相对路径。

# global-sync（方案→概述→全局 Rules/Skills）

将**技术方案**转为《终稿模版》规范格式，并**提交到全局 Rules、Skills 与文档索引**（`/generateProjectContext`）。适用于开发过程中产生的**全局型或公共型**设计，沉淀到 Cursor 上下文（Rules/Skills）。

**输入**：**一个参数**——**技术方案文档路径**（如 **`.cursor/req-docs/xxx技术方案.md`**、`配置根/stock-docs/xxx.md`）。路径相对于**配置根的父目录**，或与用户当前工作区一致。

**若未提供任何参数**：请向用户说明本命令需传入**技术方案路径**，作用为**将方案转概述、再提交到全局 Rules/Skills 与索引**。

---

## 执行步骤（按顺序）

### 步骤 1：确定「技术方案」输入路径

- 输入路径 = 用户传入的路径（相对于配置根的父目录或工作区根）。

### 步骤 2：用 /spec2context-md 转为《终稿模版》

- 读取并执行 `配置根/commands/spec2context-md.md` 中的逻辑（或项目内等价命令说明）。
- **输入**：步骤 1 确定的**技术方案路径**（多为 **`配置根/req-docs/xxx.md`**）。
- **输出**：得到符合《终稿模版》的文档，默认写入 **`配置根/stock-docs/<方案名>.md`**（方案名由一级标题或文件名推断，做合法文件名处理）。
- 若输入为 PDF，按 spec2context-md 的「流程二」处理：先产出初稿并提示用户确认后再转模板格式；本命令可在用户确认后再次执行并传入初稿路径，或在本轮仅完成「PDF → 初稿」并说明下一步。

### 步骤 3：用 /generateProjectContext 提交到全局 Rules、Skills、索引

- 读取并执行 `配置根/commands/generateProjectContext.md` 中的逻辑。
- **输入**：步骤 2 产出的 **`配置根/stock-docs/<方案名>.md`**。
- **输出**：更新/生成 `配置根/rules/`、`配置根/skills/`、`配置根/docs-index.md` 及 main 等。

---

## 回复与总结

- 每步完成后可简要说明该步结果（如：已生成 `配置根/stock-docs/<方案名>.md`；**已提交到全局 Rules、Skills、索引**）。

---

## 约束与注意

- 路径均相对于**配置根的父目录**（或与工作区约定一致）；顺序为：转功能概述 → **提交到全局 Rules/Skills**，不可颠倒。
- 本命令融合「方案转概述 + generateProjectContext」，将全局型/公共型设计一次性落到 Cursor 上下文。
