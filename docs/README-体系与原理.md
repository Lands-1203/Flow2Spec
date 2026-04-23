# 体系与原理

本文档面向团队讲解 **Flow2Spec** 中「文档与上下文」的整体架构、设计原则，以及 Rules、Skills、文档索引之间的关系。适合想理解「为什么这样设计」「main 和 docs-index 有什么区别」的读者。

**配置根**：`flow2spec init [agent ...]` 写入的 AI 工具目录（默认 **`.cursor/`**，亦可是 **`.claude/`**、**`.codex/`** 等）。下文图示与表格以 **`.cursor/`** 为例；若你的配置根不同，将路径中的 `.cursor` 替换为实际目录名即可。

**一句话**：文档通过命令生成 **main（总地图）+ 专题 Rules（按路径加载）+ 专题 Skills（按触发词匹配）+ docs-index（文档↔产物索引）**，使 AI 能按需加载上下文，避免长文档一次性塞入。

---

## 文档结构一览

| 章节 | 内容 |
|------|------|
| [1. 目标与价值](#1-目标与价值) | 为什么做「按需加载」、带来什么价值 |
| [2. 整体架构](#2-整体架构) | 文档 → 命令 → main / Rules / Skills / docs-index 的流向 |
| [3. 设计原则：拆解与分工](#3-设计原则拆解与分工) | 为何拆成多条 Rule、多个 Skill；Rule 与 Skill 的职责划分 |
| [4. main.mdc 与 docs-index 的区别](#4-mainmdc-与-docs-index-的区别) | 何时看 main、何时看 docs-index |
| [5. 版本管理与索源](#5-版本管理与索源) | sourceDoc、generatedAt；从产物找文档、从文档找产物 |
| [6. 推荐执行顺序（概要）](#6-flow2spec-推荐执行顺序概要) | 上下文生成 → 提问与实现 → 实现后；延伸链接 |
| [7. 小结与延伸阅读](#7-小结与延伸阅读) | 记住这几点 + 相关文档链接 |

---

## 1. 目标与价值

- **目标**：让 Cursor 里的 AI **按需**加载项目上下文，而不是一次性塞入整份长文档。
- **价值**：
  - 文档 → 结构化 **Rules**（约束、约定）+ **Skills**（领域知识、步骤、示例）+ **文档索引**
  - AI 打开某目录/某文件时，通过 **globs** 自动加载对应 Rule；通过 **description** 匹配到对应 Skill
  - 索引入口（**main.mdc**、**docs-index**）方便人与 AI 查「某文档对应哪些产物」「项目有哪些模块」

---

## 2. 整体架构

```
文档（`stock-docs/*.md`；Cursor 下即 `.cursor/stock-docs/*.md`）
        │
        ├── /genStructureDoc ──► 架构说明初稿（推荐顺序第 1 步）
        ├── /spec2context-md ──► 规范格式 MD（初稿/终稿）
        │
        └── /generateProjectContext
                    │
                    ├── main.mdc（唯一 alwaysApply：项目总概述 + 模块一览 + 公共能力入口）
                    ├── 专题 Rules（`rules/*-context.mdc`，globs 限定路径）
                    ├── 专题 Skills（`skills/<主题>/SKILL.md`，description 触发）
                    └── docs-index.md（文档 ↔ Rules、Skills 索引表）
```

| 产物 | 说明 |
|------|------|
| **文档** | 生成 Rules/Skills 的源真相在 **`stock-docs/`**（如 `.cursor/stock-docs/`）；需实现成代码的技术方案在 **`req-docs/`**（如 `.cursor/req-docs/`）。 |
| **main.mdc** | 给 AI 的「总地图」，**唯一**始终加载的 Rule；列出项目结构、模块一览、公共能力入口。 |
| **专题 Rules** | 按主题/路径（**globs**）加载，写「必须/禁止/约定」；与 main 同在 **`rules/`**。 |
| **专题 Skills** | 按问题/触发词（**description**）匹配，写概念、流程、方法表、示例。 |
| **docs-index** | 表格：一行对应一份文档，列出处（文档路径、Rules、Skills、简要说明）；文件位于配置根下，与 `stock-docs/` 同级。 |

---

## 3. 设计原则：拆解与分工

### 3.1 拆解

- 长文档或多块独立内容（如接口约定、QMQ、配置、公共工具）应**拆成多条 Rule、多个 Skill**。
- 单条更聚焦、**按需加载**，避免单文件过长、alwaysApply 过多导致上下文膨胀。

### 3.2 分工

| 产物 | 职责 | 加载方式 |
|------|------|----------|
| **Rules** | 约束、约定、作用范围；「必须/禁止/约定」 | main 唯一 alwaysApply；专题 Rule 用 **globs** 限定在相关路径 |
| **Skills** | 领域知识、操作步骤、示例、方法表 | **description** 写清触发词与场景，Cursor 按问题匹配 |

- **main.mdc**：不写细节，只写「有什么模块、入口在哪、详见哪条 rule/skill」。
- **专题 Rule**：写该主题下的规则要点，正文可带简短示例。
- **专题 Skill**：写何时用、概念、流程、完整方法表或示例，便于 AI 回答「怎么用 QMQ」「工具方法有哪些」。

---

## 4. main.mdc 与 docs-index 的区别

| 项目 | main.mdc | docs-index.md |
|------|----------|---------------|
| **路径** | `rules/main.mdc`（Cursor：`.cursor/rules/main.mdc`） | `docs-index.md`（Cursor：`.cursor/docs-index.md`） |
| **用途** | 项目总概述与索引，给 AI 的「总地图」 | 需求/文档索引，**按文档**列产物 |
| **加载** | **唯一** alwaysApply 的 Rule | 不参与 alwaysApply，仅供查阅 |
| **内容** | 项目结构、模块一览、公共能力入口 | 表格：需求/模块、文档路径、Rules、Skills、简要说明 |
| **更新** | 仅当文档属于「功能模块」或「公共模块说明」时更新对应部分 | 每份文档占一行，生成/更新时更新该行 |

**何时看哪个**：查「项目有哪些模块、公共能力在哪」→ **main.mdc**；查「某份文档生成了哪些 Rules、Skills」→ **docs-index**。

---

## 5. 版本管理与索源

路径与字段格式（sourceDoc、generatedAt）约定见 [README-目录与路径约定 §4](./README-目录与路径约定.md#4-版本管理sourcedoc-与-generatedat)。此处侧重用法：

- **sourceDoc**：每条 Rule/Skill 的 frontmatter 中写 `sourceDoc: <配置根>/stock-docs/xxx.md`（如 `.cursor/stock-docs/xxx.md`），表示「由哪份文档生成」。
- **generatedAt**：同一 frontmatter 中写 `generatedAt: 2026-01-28T20:00:00+08:00`（东八区 ISO 8601）。

| 典型问题 | 做法 |
|----------|------|
| 从产物找文档 | 看 Rule/Skill 的 **sourceDoc** |
| 从文档找产物 | 看 **docs-index** 中该文档行的 Rules、Skills 列 |
| 更新某文档的产物 | 改文档后，对同一路径再执行 `/generateProjectContext` + `stock-docs/xxx.md`，会覆盖该文档对应的全部 Rules、Skills，并更新 docs-index 该行与 main 的相关部分 |

---

## 6. Flow2Spec 推荐执行顺序（概要）

**上下文生成** → **提问与实现** → **实现后**（global-fix / global-feat / global-sync）；**合并分支后**若**配置根**下索引、规则、技能等出现冲突标记（Cursor 下多在 `.cursor/`），可用 **global-merge-context** 与实现侧冲突分流处理（见 [命令说明 §3.3](./README-命令说明.md#33-global-merge-context)）。日常在 Cursor 中时 AI 自动加载 main，按路径加载 Rule、按提问匹配 Skill。  
按使用顺序查命令与各命令入参输出见 [README-命令说明](./README-命令说明.md)；init 与典型流程见 [Flow2Spec使用说明](./Flow2Spec使用说明.md)。

---

## 7. 小结与延伸阅读

**记住这几点**

- 文档在 **`stock-docs/`**（生成上下文用；如 `.cursor/stock-docs/`），技术方案需实现成代码的在 **`req-docs/`**（如 `.cursor/req-docs/`）；产物在 **`rules/`**、**`skills/`**，索引在 **`docs-index.md`**，总入口在 **main.mdc**。
- **拆解**：长文档拆成多条 Rule、多个 Skill，按需加载。
- **分工**：Rule 管约束与约定，Skill 管知识与步骤；main 管总览，docs-index 管文档与产物对应关系。
- **路径与链接**：统一按 [README-目录与路径约定](./README-目录与路径约定.md) 执行，避免引用错误。

**相关文档**

| 文档 | 说明 |
|------|------|
| [README-命令说明](./README-命令说明.md) | 各命令入参、输出、按使用顺序查找 |
| [README-目录与路径约定](./README-目录与路径约定.md) | **`stock-docs/`** / **`req-docs/`** 结构、文档产物阶段 |
| [Flow2Spec使用说明](./Flow2Spec使用说明.md) | init 详解、推荐顺序、斜杠命令中英文、常见问题 |
