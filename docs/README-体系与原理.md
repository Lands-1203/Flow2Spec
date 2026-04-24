# 体系与原理

Flow2Spec 如何把**长文档**变成 **main + 专题 Rules + 专题 Skills + docs-index**，让 AI **按需加载**、控制上下文体积。**配置根**同前（默认 `.cursor/`）。

**一句话**：**stock-docs** 里文档经 **f2s-ctx-build** 落成 **main（总览）**、**globs 规则**、**description 技能** 与 **docs-index（文档↔产物表）**；实现代码用 **req-docs** + **implement-tech-design**。

**文档**：[Flow2Spec使用说明](./Flow2Spec使用说明.md) · [README-命令说明](./README-命令说明.md) · [README-目录与路径约定](./README-目录与路径约定.md) · [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md)

---

## 1. 目标与价值

- **目标**：按路径 / 按问题加载片段，避免整篇长文塞进一轮对话。  
- **手段**：Rule 写约束（+ globs）；Skill 写知识与步骤（+ description）；**main** 总览；**docs-index** 查某文档对应哪些产物。

---

## 2. 整体架构

在**配置根**里，和 Flow2Spec 日常闭环相关的主要是**三条线**（先建立整体印象，再下看表格）：

| 线 | 目录 / 产物 | 在闭环里的角色 |
|----|----------------|----------------|
| **A. 文档源** | **`stock-docs/`** | 放终稿、初稿、架构长文等；是 **f2s-ctx-build** 的输入源 |
| **B. 可加载知识库** | **`main.mdc`**、**`rules/`**、**`skills/`**、**`docs-index.md`** | Agent **按需**读：总览 → 索引 → 专题规则/技能 → 必要时回 **`stock-docs/`** 长文 |
| **C. 按方案写代码** | **`req-docs/`** + **`implement-tech-design`** | 技术方案 MD 驱动改业务代码；**不**替代 A→B 那条「把长文拆进规则与技能」的链 |

**阶段二：用终稿跑一次 f2s-ctx-build**——入参通常是 **`stock-docs/…_终稿.md`**（或 URL 等，见 [命令说明 §2.3](./README-命令说明.md#23-f2s-ctx-build)）。**同一次执行会一并写出 / 更新下面几类文件**；它们是**并列产物**，不是「先跑完 main 再跑 rules」的串行流水线。

| 产物 | 作用 |
|------|------|
| **main.mdc** | 唯一 **alwaysApply**；总地图、模块一览、公共入口（正文应约定先读 **docs-index** 再下钻） |
| **专题 Rules**（`rules/*-context.mdc`） | 必须/禁止/约定；按 **globs** 命中文件时加载 |
| **专题 Skills**（`skills/` 下各主题的 **SKILL.md**） | 概念、流程、示例；按 **description** 匹配问题 |
| **docs-index.md** | 表格式：文档路径、Rules、Skills、摘要（**非** alwaysApply，须按需读） |

---

## 3. 设计原则：拆解与分工

- **拆解**：长文档或多块独立内容 → 多条 Rule、多个 Skill，单条更短、更聚焦。  
- **分工**：Rule = 约束与范围；Skill = 知识与操作；main = 索引不写细节；docs-index = 文档级映射。

---

## 4. main.mdc 与 docs-index.md

| | **main.mdc** | **docs-index.md** |
|---|--------------|-------------------|
| 路径 | `rules/main.mdc` | 配置根下与 stock-docs 同级 |
| 角色 | 项目总览、模块与公共能力入口 | 按文档列 Rules / Skills |
| 加载 | **唯一 alwaysApply** | 不自动进上下文；由 **main** 约定阅读顺序 |

**查模块/入口** → main；**查某文档生成了哪些 Rule/Skill** → docs-index。

---

## 5. 版本管理与索源

字段格式见 [README-目录与路径约定 §4](./README-目录与路径约定.md#4-版本管理sourcedoc-与-generatedat)。

- **sourceDoc**：产物 → 源文档。  
- **docs-index 行**：文档 → 产物列表。  
- **更新**：改 **stock-docs** 源文后，对同路径再执行 **f2s-ctx-build**。

---

## 6. 推荐顺序（概要）

上下文链 → **req-docs** 实现 → **f2s-kb-*** 维护；冲突 **f2s-kb-merge**。详表：[README-命令说明](./README-命令说明.md#按使用顺序查找)。

---

## 7. 延伸阅读

- **路径与链接**：[README-目录与路径约定](./README-目录与路径约定.md)  
- **命令与速查**：[README-命令说明](./README-命令说明.md)  
- **操作手册**：[Flow2Spec使用说明](./Flow2Spec使用说明.md)  
- **使用案例（对话版式）**：[Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md)
