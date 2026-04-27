# Flow2Spec 使用说明

使用手册：**init → 目录约定 → 推荐顺序 → 典型流程 → 技能标识 → 常见问题**。概览与快速开始见仓库 [README.md](../README.md)。

**文档**：[README-命令说明](./README-命令说明.md) · [README-目录与路径约定](./README-目录与路径约定.md) · [README-体系与原理](./README-体系与原理.md) · [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md)

| 章节                                                                     | 内容                                                                                  |
| ---------- | ----------------------- |
| [一、init](#一init-做了什么)                                             | 写入目录与模板                                                                        |
| [二、目录约定](#二文档目录约定)                                          | `stock-docs/` vs `req-docs/`；完整结构见 [目录与路径约定](./README-目录与路径约定.md) |
| [三、推荐顺序](#三推荐执行顺序)                                          | 链到 [命令说明 · 按使用顺序查找](./README-命令说明.md#按使用顺序查找)                 |
| [四、典型流程](#四典型流程)                                              | 架构 / 上下文 / 按方案实现 / 全局技能                                                 |
| [五、改造 implement-tech-design](#五implement-tech-designmdc-可自行改造) | 按项目改「按方案实现」规则                                                            |
| [六、技能标识](#六技能与工作流标识)                                      | `skills/<name>/SKILL.md` 速览                                                         |
| [七、延伸](#七速查与相关文档)                                            | 速查与 FAQ                                                                            |
| [使用案例（另文）](./Flow2Spec-使用案例-模拟对话.md)                     | 真实输入、命令解释、场景与速查                                                        |

---

## 一、init 做了什么

在**配置根父目录**执行 **`flow2spec init [agent ...]`**（未全局安装可用 **`npx @double-codeing/flow2spec init`**）。`agent` 省略时默认 **`cursor`** → **`.cursor/`**；可多个：`cursor claude codex`，各写一套相同结构。详见 **`flow2spec --help`**。

对每个所选配置根：**覆盖写入** `templates/` 中的 `rules/`、`skills/`、`template/`，并预建 **`stock-docs/`**、**`req-docs/`**。Cursor 下 Agent 按场景加载 **`skills/<标识>/SKILL.md`**。

**规则文件与工具差异**：**Cursor** 的 `rules/` 使用 **`.mdc`**，frontmatter 用 **`globs:`**、**`alwaysApply:`**。**Claude Code** 仅加载 **`.claude/rules/`** 下 **`.md`**（官方文档「Organize rules with .claude/rules」）；`flow2spec init claude` 会把模板 **`.mdc`** 转为 **`.md`**，并将 **`globs:`** 改为 **`paths:`**、去掉 **`alwaysApply`**（无 `paths` 的规则与会话一并加载，等价于总览类 always 规则）。

| 子目录          | 用途                                       |
| --------------- | ------------------------------------------ |
| **skills/**     | f2s-\* 工作流 + **stock-docs-vs-req-docs** |
| **rules/**      | Cursor：**\*.mdc**（如 **implement-tech-design.mdc**）；Claude Code：**\*.md**（如 **implement-tech-design.md**） |
| **template/**   | 终稿模版、后端技术模版                     |
| **stock-docs/** | 生成 Rules/Skills 的**存量源文档**         |
| **req-docs/**   | 需求澄清、技术方案、**按方案实现**用 MD    |

**注意**：再次 init 会覆盖模板；本地对模板的长期修改请用分支或备份。

---

## 二、文档目录约定

**配置根**：如 `.cursor/`、`.claude/`。

| 目录            | 用途                                                         |
| --------------- | ------------------------------------------------------------ |
| **stock-docs/** | 终稿、架构说明等 → **f2s-ctx-build** 入参                    |
| **req-docs/**   | 技术方案等 → 对话提供路径 + **implement-tech-design** 写代码 |

细则、链接写法、原稿/初稿/终稿：[README-目录与路径约定](./README-目录与路径约定.md)。

---

## 三、推荐执行顺序

**需求（可选）**：f2s-req-clarify → f2s-req-backend

**上下文（架构说明）**：**f2s-doc-arch** → **f2s-doc-final** → **f2s-ctx-build**  
**上下文（已落地能力→知识库）**：**f2s-doc-add**——**工作中**要把**已经做好的能力**从多份源码/说明里**解析进上下文**时用；独立技能，**不要**与「仅要架构初稿」的 f2s-doc-arch 混用（见 `skills/f2s-doc-add/SKILL.md`「使用时机」与分工表）

**实现**：可选 f2s-doc-pdf → **req-docs/** 下 MD + 说明「按方案实现」→ **implement-tech-design**

**知识库维护**：任意时机 **f2s-kb-fix** / **f2s-kb-feat**；**实现后**（或收尾）沉淀写库 → **f2s-kb-sync**；合并冲突 → **f2s-kb-merge**

完整表与入参/输出：[README-命令说明 · 按使用顺序查找](./README-命令说明.md#按使用顺序查找)。

---

## 四、典型流程

**架构初稿**：**f2s-doc-arch**（说明或文档路径；无参扫描需用户确认）→ 可选 **f2s-doc-final** → **f2s-ctx-build**。

**已落地能力 → 上下文**：在日常开发中，某能力**已实现**且材料分散在多文件时，加载 **f2s-doc-add**，给出**多个相关路径**：适度深度解析 → **`stock-docs/<方案名>_初稿.md`** → 终稿 → **f2s-ctx-build** 等价产物。

**文档 → 上下文**：材料放 **stock-docs/**；PDF/杂乱 MD 用 **f2s-doc-final**（PDF 常先初稿再终稿）；终稿路径交给 **f2s-ctx-build**。会话沉淀、大纲确认写库：**f2s-kb-sync**。冲突标记：**f2s-kb-merge**（见 [命令说明 §3.3](./README-命令说明.md#33-f2s-kb-merge)）。

**技术方案 → 代码**：提供 **req-docs/xxx.md**（或 PDF，规则会先走 **f2s-doc-pdf**），说明按方案实现；行为见 **rules/implement-tech-design.mdc**。

**全局**：**f2s-kb-feat** / **f2s-kb-fix**（任意时机）；**f2s-kb-sync**（典型在实现后，大纲确认后写库）。

---

## 五、implement-tech-design.mdc 可自行改造

路径：**`rules/implement-tech-design.mdc`**。可按项目改目录约定、步骤、**globs**（默认含 `**/req-docs/**/*.md`）。再次 **init** 会覆盖 `rules/` 等模板，定制请用分支或备份。

---

## 六、技能与工作流标识

工作流在 **`skills/<标识>/SKILL.md`**；Agent 依 **frontmatter** 的 `name`、`description` 匹配。

| name                                                  | 用途                                                 |
| ----------------------------------------------------- | ---------------------------------------------------- |
| f2s-doc-arch                                          | **仅**架构说明类初稿（文字/单文档/扫描）；**不**内含终稿与 ctx-build |
| f2s-doc-add                                           | **工作中**：**已做好的能力** + 多文件路径→解析进上下文（初稿→终稿→Rules/Skills/索引）；勿与 f2s-doc-arch 混用 |
| f2s-doc-final                                         | PDF/MD → 终稿模版                                    |
| f2s-ctx-build                                         | 终稿 → Rules / Skills / docs-index                   |
| f2s-ctx-rm                                            | 按文档删上下文                                       |
| f2s-doc-pdf                                           | PDF → req-docs MD                                    |
| f2s-req-clarify / f2s-req-backend                     | 需求澄清 / 后端技术方案                              |
| f2s-kb-fix / f2s-kb-feat / f2s-kb-sync / f2s-kb-merge | 任意：纠错、新能力；典型实现后：写库；冲突：合并     |
| stock-docs-vs-req-docs                                | 两目录分工说明                                       |

入参与输出细节仍以各 **SKILL.md** 与 [README-命令说明](./README-命令说明.md) 为准。

---

## 七、速查与相关文档

**按阶段速查**：[README-命令说明 §6](./README-命令说明.md#6-快速参考按阶段)。

**常见问题**

- **按方案实现要改行为**：改 **implement-tech-design.mdc**（见上文第五节）。
- **技能不触发**：确认已 init；对话里点名技能名或 `description` 里的词。
- **顺序搞不清**：看 [README-命令说明](./README-命令说明.md) 开头总表。

| 文档                                                            | 说明                                         |
| - | -------------------------------------------- |
| [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md) | 真实输入 + 命令解释 + Agent 示意，全文同版式 |
| [README-命令说明](./README-命令说明.md)                         | 入参、输出、顺序、§6 速查                    |
| [README-目录与路径约定](./README-目录与路径约定.md)             | 路径、链接、产物阶段                         |
| [README-体系与原理](./README-体系与原理.md)                     | main、docs-index、拆解原则                   |
