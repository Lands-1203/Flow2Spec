# 体系与原理

本文档面向团队讲解 **Flow2Spec** 中「文档与上下文」部分的整体架构、设计原则，以及 Rules、Skills、文档索引之间的关系（与 cursor-doc-gen 同源；Flow2Spec 在此基础上增加 OpenSpec 变更工作流）。

---

## 1. 目标与价值

- **目标**：让 Cursor 里的 AI 能**按需**加载项目上下文，而不是一次性塞入整份长文档。
- **价值**：
  - 文档 → 结构化 Rules（约束、约定）+ Skills（领域知识、步骤、示例）+ 文档索引
  - AI 打开某目录/某文件时，通过 **globs** 自动加载对应 Rule；通过 **description** 匹配到对应 Skill
  - 索引入口（main.mdc、docs-index）方便人与 AI 查「某文档对应哪些产物」「项目有哪些模块」

---

## 2. 整体架构

```
文档（.cursor/docs/*.md）
        │
        ├── /genStructureDoc ──► 架构说明初稿（可选，推荐执行顺序第 1 步）
        ├── /spec2context-md ──► 规范格式 MD（初稿/终稿）
        │
        └── /generateProjectContext
                    │
                    ├── main.mdc（唯一 alwaysApply：项目总概述 + 模块一览 + 公共能力入口）
                    ├── 专题 Rules（.cursor/rules/*-context.mdc，globs 限定路径）
                    ├── 专题 Skills（.cursor/skills/<主题>/SKILL.md，description 触发）
                    └── docs-index.md（需求/文档索引表：文档 ↔ Rules、Skills）
```

- **文档**：源真相，放在 `.cursor/docs/`；需实现成代码的技术方案可放在项目根下 **`docs/`**。
- **main.mdc**：给 AI 的「总地图」，唯一始终加载的 Rule；列出项目结构、模块一览、公共能力入口。与专题 Rules 同处 **`.cursor/rules/`** 下。
- **专题 Rules**：按主题/路径（globs）加载，写「必须/禁止/约定」；与 main.mdc 同目录（`.cursor/rules/`）。
- **专题 Skills**：按问题/触发词（description）匹配，写概念、流程、方法表、示例。
- **docs-index**：表格，一行对应一份文档，列出处：文档路径、Rules、Skills、简要说明。

---

## 3. 设计原则：拆解与分工

### 3.1 拆解

- 长文档或多块独立内容（如接口约定、QMQ、配置、公共工具）应**拆成多条 Rule、多个 Skill**。
- 单条更聚焦、按需加载，避免单文件过长、alwaysApply 过多导致上下文膨胀。

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
|------|----------|----------------|
| **路径** | `.cursor/rules/main.mdc` | `.cursor/docs-index.md` |
| **用途** | 项目总概述与索引，给 AI 的「总地图」 | 需求/文档索引，按文档列产物 |
| **加载** | **唯一** alwaysApply 的 Rule | 不参与 alwaysApply，仅供查阅 |
| **内容** | 项目结构、模块一览、公共能力入口 | 表格：需求/模块、文档路径、Rules、Skills、简要说明 |
| **更新** | 仅当文档属于「功能模块」或「公共模块说明」时更新对应部分 | 每份文档占一行，生成/更新时更新该行 |

- 查「项目有哪些模块、公共能力在哪」→ 看 **main.mdc**。
- 查「某份文档生成了哪些 Rules、Skills」→ 看 **docs-index**。

---

## 5. 版本管理与索源

- **sourceDoc**：每条 Rule/Skill 的 frontmatter 中写 `sourceDoc: .cursor/docs/xxx.md`，表示「由哪份文档生成」。
- **generatedAt**：同一 frontmatter 中写 `generatedAt: 2026-01-28T20:00:00+08:00`（东八区 ISO 8601）。
- **从产物找文档**：看 Rule/Skill 的 `sourceDoc`。
- **从文档找产物**：看 docs-index 中该文档行的 Rules、Skills 列。
- **更新**：改文档后，对同一路径再执行 `/generateProjectContext .cursor/docs/xxx.md`，会覆盖该文档对应的全部 Rules、Skills，并更新 docs-index 该行与 main 的相关部分。

---

## 6. Flow2Spec 推荐执行顺序（概要）

1. **上下文生成**：`/genStructureDoc` → `/spec2context-md` → `/generateProjectContext`（详见 [README-命令说明](./README-命令说明.md) 与 [Flow2Spec使用说明](./Flow2Spec使用说明.md)）。
2. **提问与实现环节**：若技术方案仅为 PDF 可先执行 `/pdf4code-md`；然后 `/opsx-new` 提问 → `/opsx-continue` 生成剩余产物 → `/opsx-apply` 根据规划生成代码 → `/global-sync`（可选）生成全局 Skills、Rules 并归档。
3. **日常使用**：在 Cursor 中编码时，AI 自动加载 main；打开某路径时加载对应 globs 的 Rule；提问时匹配到对应 Skill。

---

## 7. 小结

- 文档在 **`.cursor/docs/`**（生成上下文用），技术方案可实现代码的可在 **`docs/`**；产物在 **`.cursor/rules/`**、**`.cursor/skills/`**，索引在 **`.cursor/docs-index.md`**，总入口在 **main.mdc**。
- **拆解**：长文档拆成多条 Rule、多个 Skill，按需加载。
- **分工**：Rule 管约束与约定，Skill 管知识与步骤；main 管总览，docs-index 管文档与产物对应关系。
- **路径与链接**：统一按 [README-目录与路径约定](./README-目录与路径约定.md) 执行，避免引用错误。
