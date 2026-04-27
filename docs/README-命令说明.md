# 工作流与技能说明

各 Skill（`skills/<标识>/SKILL.md`）的**入参、输出、行为**与**推荐使用顺序**。**「配置根」**：`flow2spec init` 写入的目录（默认 **`.cursor/`**，亦可 **`.claude/`**、**`.codex/`**）。

- 目录结构：[README-目录与路径约定](./README-目录与路径约定.md)
- init 概要：[Flow2Spec使用说明 · 一](./Flow2Spec使用说明.md#一init-做了什么)
- 架构：[README-体系与原理](./README-体系与原理.md)
- 使用案例：[Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md)

---

## 按使用顺序查找

| 阶段         | 步骤 | 技能 / 命令                                              | 一句话                                                                               | 详见                                             |
| ------------ | ---- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------ |
| 首次         | —    | `flow2spec init [agent ...]`                             | 写入配置根模板                                                                       | [§1](#1-flow2spec-initcli)                       |
| 需求与方案   | 1    | **f2s-req-clarify**                                      | PRD/需求反问至清楚                                                                   | [§2.0.1](#201-f2s-req-clarify)                   |
| 需求与方案   | 2    | **f2s-req-backend**                                      | 澄清后出后端技术文档                                                                 | [§2.0.2](#202-f2s-req-backend)                   |
| 上下文生成   | 1～3 | **f2s-doc-arch** → **f2s-doc-final** → **f2s-ctx-build** | 初稿→终稿→Rules/Skills/索引                                                          | [§2.1～2.3](#21-f2s-doc-arch-技能)               |
| 上下文生成   | 可选 | **f2s-doc-add**                                          | **工作中**：**已做好的能力** + 多个相关文件路径→解析进上下文（`stock-docs` 初稿→终稿→同 **f2s-ctx-build** 产物） | [§2.1.1](#211-f2s-doc-add-技能)                  |
| 上下文生成   | 配合 | **f2s-ctx-rm**                                           | 按文档删产物                                                                         | [§2.4](#24-f2s-ctx-rm-技能)                      |
| 上下文生成   | 可选 | **f2s-doc-pdf**                                          | PDF→MD（req-docs）                                                                   | [§2.5](#25-f2s-doc-pdf-技能)                     |
| 提问与实现   | —    | **按技术方案实现**                                       | 提供 **`req-docs/`** 下方案 MD 路径，并说明「按方案实现」                            | [§3.1](#31-按技术方案实现)                       |
| 任意时机     | 按需 | **f2s-kb-fix** / **f2s-kb-feat**                         | 纠错 / 新能力（不限于实现后）                                                        | [§3.2](#32-f2s-kb-fix--f2s-kb-feat--f2s-kb-sync) |
| 实现后       | 按需 | **f2s-kb-sync**                                          | 会话或现状沉淀写库（典型在实现后）                                                   | [§3.2](#32-f2s-kb-fix--f2s-kb-feat--f2s-kb-sync) |
| merge/rebase | —    | **f2s-kb-merge**                                         | 上下文类冲突合并                                                                     | [§3.3](#33-f2s-kb-merge)                         |

**汇总**：init →（可选需求链）→ arch → final → ctx-build →（可选 pdf）→ req-docs + implement-tech-design →（随时 **fix** / **feat**；实现后或收尾 **sync**）；冲突用 **f2s-kb-merge**。更细速查见 [§6](#6-快速参考按阶段)。

---

## 1. flow2spec init（CLI）

| 项   | 说明                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 用法 | `npx @double-codeing/flow2spec init` 或全局安装后 `flow2spec init [cursor \| claude \| codex ...]`；默认 **cursor**                                |
| 写入 | 各配置根下 `stock-docs/`、`req-docs/`、`template/`、`rules/`、`skills/`（见 [Flow2Spec使用说明](./Flow2Spec使用说明.md#一init-做了什么)）。**`.claude/`** 下 **`rules/*.md`**（`globs`→`paths`）；**`.cursor/`** 下 **`rules/*.mdc`** |
| 结果 | Agent 按场景加载 `skills/*/SKILL.md`                                                                                                      |

---

## 2. 需求与方案、上下文生成

### 2.0 需求与方案（可选）

**f2s-req-clarify**：入参可选（PRD/描述/路径）；反问至清晰；本阶段不输出技术方案。结束可接 **f2s-req-backend**。

**f2s-req-backend**：入参必填（澄清后需求或文档路径）；参考 `template/后端技术模版.md`；默认输出 **`req-docs/<方案名>_技术方案.md`**（供实现，**不**走 f2s-ctx-build）。

### 2.1 f2s-doc-arch

**定位**：**仅**「项目/模块**架构说明初稿**」；**不是** f2s-doc-add。入参可选（说明文字或文档路径；无参=扫描代码须先确认）。输出默认 **`stock-docs/<项目名>架构说明_初稿.md`**。可接 **f2s-doc-final** → **f2s-ctx-build**。

### 2.1.1 f2s-doc-add

**定位**：**工作中**要把**已经做好的某条能力**（实现与说明分散在多文件）**解析进 AI 上下文**时用本技能；**多文件路径**聚合→初稿→终稿→上下文产物。**独立技能**，与 **f2s-doc-arch** 分工见 **`skills/f2s-doc-add/SKILL.md`**（含「使用时机」）。入参：**多个**本地文件路径（必填，空格/换行/`@`）；可选方案名、初稿/终稿输出路径。行为：**适度深度**读源 → **`stock-docs/<方案名>_初稿.md`** → 按 **`template/终稿模版.md`** 与 **f2s-doc-final** 思路出 **`_终稿.md`** → 按 **f2s-ctx-build** 生成/更新 **Rules、Skills、`docs-index.md`**（及按需 **`main.mdc`**）。详见 **`skills/f2s-doc-add/SKILL.md`**（在对话中加载该技能后执行）。

### 2.2 f2s-doc-final

入参：PDF 或 MD 路径；可选第二参数为输出路径。规范来源：`template/终稿模版.md`。PDF：先初稿 `_初稿.md`，确认后再跑初稿路径出 `_终稿.md`；MD：可直达终稿。完成后接 **f2s-ctx-build** + `stock-docs/<方案名>_终稿.md`。

### 2.3 f2s-ctx-build

入参：URL 或 **`stock-docs/`** 下本地路径（终稿常见）。产出：**main.mdc**（按需）、专题 **rules/\*.mdc**、**skills/**、**docs-index** 一行；URL 时另存 `stock-docs/`。同文档重复执行=**更新**同套产物。内网 URL 建议先落盘再传路径。

### 2.4 f2s-ctx-rm

入参：`stock-docs/` 文档路径或文件名片段。删对应 Rules、Skills、docs-index 行及 main 相关描述；**不删** stock-docs 源文件。

### 2.5 f2s-doc-pdf

入参：PDF 路径。转 MD，推荐 **`req-docs/<方案名>.md`**，可补流程说明。再在同对话提供该 MD 路径按方案实现。

---

## 3. 提问与实现、实现后

### 3.1 按技术方案实现

对话中提供 **`配置根/req-docs/xxx.md`** 并说明按方案实现；AI 执行 **`rules/implement-tech-design.mdc`**。仅 PDF 时先 **f2s-doc-pdf** 再提供生成的 MD。典型流程见 [Flow2Spec使用说明 · 四](./Flow2Spec使用说明.md#四典型流程)。

### 3.2 f2s-kb-fix / f2s-kb-feat / f2s-kb-sync

| 技能            | 何时                                                  | 要点                                           |
| --------------- | ----------------------------------------------------- | ---------------------------------------------- |
| **f2s-kb-fix**  | **任意**；发现违反约定或不一致即可                    | 改代码 + 同步文档与 rules/skills               |
| **f2s-kb-feat** | **任意**；新增或扩展能力时                            | 未实现则补实现；已实现则对齐文档与规则         |
| **f2s-kb-sync** | **典型在实现后**或阶段收尾；需沉淀会话/现状到知识库时 | 可先列能力或零输入推断 → **大纲须确认** 再写库 |

细则见各 `skills/f2s-kb-*/SKILL.md`。

### 3.3 f2s-kb-merge

merge/rebase 后仍有 **`<<<<<<<` 等**时使用。与 **f2s-kb-fix**（单点纠错）不同：处理**批量合并冲突**。**可自动合并**：docs-index、main、rules、skills、说明类 MD 等，须去净冲突标记。**禁止自动合并**：业务源码、对外行为配置、依赖锁文件等，只出差异待你确认。详见 **`skills/f2s-kb-merge/SKILL.md`**。

---

## 4. 推荐执行顺序（简）

与「按使用顺序查找」表及 [§6](#6-快速参考按阶段) 一致。

---

## 5. 技能关系简图

```
init → 配置根（rules / skills / template / stock-docs / req-docs）

需求：f2s-req-clarify → f2s-req-backend → req-docs/*_技术方案.md
上下文（架构）：f2s-doc-arch → f2s-doc-final → f2s-ctx-build → main + Rules + Skills + docs-index
上下文（已落地能力→知识库）：f2s-doc-add →（工作中多文件解析进上下文；内含终稿与 f2s-ctx-build 等价步骤，与 f2s-doc-arch 分工不同）
实现：（f2s-doc-pdf）→ req-docs/*.md + implement-tech-design → 代码
随时：f2s-kb-fix | f2s-kb-feat；实现后/收尾：f2s-kb-sync；冲突 → f2s-kb-merge
```

---

## 6. 快速参考（按阶段）

| 阶段       | 想做的事                 | 技能 / 步骤 |
| ---------- | ------------------------ | ----------- |
| 首次       | 初始化                   | `flow2spec init` … |
| 上下文生成 | 架构：初稿→终稿→索引 | **f2s-doc-arch** → **f2s-doc-final** → **f2s-ctx-build** |
|            | 已落地能力→进上下文 | **f2s-doc-add**（`skills/f2s-doc-add/SKILL.md`：**工作中**多路径聚合，**非** f2s-doc-arch） |
|            | 删某文档上下文           | **f2s-ctx-rm** |
|            | 更新某文档产物           | 改文档后再 **f2s-ctx-build** 同路径 |
| 需求与方案 | 澄清 / 后端方案          | **f2s-req-clarify** / **f2s-req-backend** |
| 提问与实现 | PDF→MD                   | **f2s-doc-pdf** → **req-docs/xx技术方案.md** |
|            | 写代码                   | 提供 **req-docs/\*.md** + 按方案实现 |
| 任意时机   | 纠错 / 新能力            | **f2s-kb-fix** / **f2s-kb-feat** |
| 实现后     | 会话或现状写库           | **f2s-kb-sync** |
| 合并冲突   | 索引与规则等             | **f2s-kb-merge** |

**相关文档**：[Flow2Spec使用说明](./Flow2Spec使用说明.md) | [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md) | [README-目录与路径约定](./README-目录与路径约定.md) | [README-体系与原理](./README-体系与原理.md)
