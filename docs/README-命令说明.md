# 命令说明

本文档说明 **Flow2Spec** 提供的命令、入参、输出与典型流程（文档与上下文部分与 cursor-doc-gen 同源；Flow2Spec 在此基础上增加 OpenSpec 变更工作流及 global-sync 等）。

---

## 1. flow2spec init（CLI）

在项目根执行，安装 OpenSpec（若未安装）并将 Cursor 斜杠命令与 OpenSpec 模板写入项目。

| 项目 | 说明 |
|------|------|
| **用法** | `npx @lands/flow2spec init` 或 `flow2spec init`（全局安装后） |
| **创建/写入** | `.cursor/`、`.cursor/docs/`、`.cursor/rules/`、`.cursor/skills/`、`.cursor/commands/`；将 commands（含 generateProjectContext、deleteProjectContext、spec2context-md、pdf4code-md、genStructureDoc、opsx-*、global-sync 等）、rules、skills 从模板复制；**openspec/** 复制到项目根 |
| **结果** | 在 Cursor 聊天框输入 `/` 可看到对应斜杠命令；可配合 OpenSpec CLI 使用 openspec/changes 等 |

---

## 2. /generateProjectContext（Cursor 斜杠命令）

根据文档生成 Rules、Skills、文档索引（及按需更新 main.mdc）。

| 项目 | 说明 |
|------|------|
| **入参** | 一个：**URL**（如 `https://xxx.com/doc`）或 **本地路径**（如 `.cursor/docs/拼团技术方案设计.md`） |
| **文档位置** | 本地文档统一放在 **`.cursor/docs/`** |
| **行为** | 大模型拉取/读取文档 → 分析（概念、状态、流程、规则）→ 按「拆解与分工」生成/更新 main.mdc（若适用）、专题 Rules、专题 Skills、docs-index 一行 |
| **输出** | `.cursor/rules/main.mdc`（若为功能模块或公共模块）、`.cursor/rules/<主题>-context.mdc`、`.cursor/skills/<主题>/SKILL.md`、`.cursor/docs-index.md` 中该文档对应行；若入参为 URL 还会把原文保存到 `.cursor/docs/<主题>.md`。**入参通常为终稿文档**（如 `.cursor/docs/<方案名>_终稿.md`），但生成的 Rules、Skills **不带 `_终稿` 后缀**，见 [文档产物阶段](./README-目录与路径约定.md#3-文档产物阶段原稿--初稿--终稿)。 |

**注意**：同一文档多次执行会**更新**该文档对应的 Rules、Skills 及 docs-index 该行，不会重复追加行。内网 URL 可能无法访问，请先将内容保存到 `.cursor/docs/xxx.md` 再传路径。

---

## 3. /deleteProjectContext（Cursor 斜杠命令）

删除某份文档对应的 Rules、Skills、索引行及 main 中的相关描述。

| 项目 | 说明 |
|------|------|
| **入参** | 一个：**文档路径**（如 `.cursor/docs/拼团技术方案设计.md`）或 **可匹配的片段**（如 `拼团技术方案设计.md`） |
| **行为** | 在 docs-index 中匹配该文档行 → 删除该行中的 Rules、Skills 文件及 Skill 空目录 → 从 docs-index 删除该行 → 更新 main.mdc（删除模块一览对应行或公共能力入口节） |
| **结果** | 该文档不再拥有对应 Rule/Skill，索引与 main 中相关描述被移除；**.cursor/docs/ 下的源文档不删除** |

**注意**：若匹配到多行或删除范围不明确，大模型会向用户确认后再执行。

---

## 4. /spec2context-md（Cursor 斜杠命令）

将 PDF 或 Markdown 转为《终稿模版》规范格式的 MD。

| 项目 | 说明 |
|------|------|
| **入参** | 一个：**PDF 路径**或 **MD 路径**；可选第二个参数为输出路径 |
| **规范来源** | 优先读取项目内 **`.cursor/docs/终稿模版.md`**；若不存在则用命令内嵌结构 |
| **输出位置** | PDF 首次：**`.cursor/docs/<方案名>_初稿.md`**（初稿）；MD/初稿转为规范格式：**`.cursor/docs/<方案名>_终稿.md`**（终稿）。详见 [文档产物阶段](./README-目录与路径约定.md#3-文档产物阶段原稿--初稿--终稿)。 |

传入 Markdown 时：分析并重组为「核心概念、业务规则、关键流程」等模板结构，写入终稿。传入 PDF 时：首次执行输出初稿，用户确认后再执行一次（传入初稿路径）输出终稿。完成后提示可执行 `/generateProjectContext .cursor/docs/<方案名>_终稿.md`。

---

## 5. /genStructureDoc（Cursor 斜杠命令）

根据用户说明、已有文档或扫描代码，生成**项目架构说明初稿**（无固定格式，以描述清楚为准）。

| 项目 | 说明 |
|------|------|
| **入参** | 可选。**第一参数**：一段纯文字说明，或**文档路径**（如 `README.md`、`.cursor/docs/xxx.md`）；不传则进入「无输入」流程（扫描代码，需用户确认，不保证质量）。**第二参数**：输出路径（默认 `.cursor/docs/<项目名>架构说明_初稿.md`）。 |
| **行为** | 有输入时：读取说明或文档 → 结合项目目录与关键文件补充、归纳 → 生成架构说明初稿；若说明较宽泛则引导用户补充代码路径、模块划分、入口等。无输入时：先提示「是否确认不传递参数，仍使用 AI 扫描代码生成？（不保证质量）」，仅当用户明确确认后才执行扫描与生成。 |
| **输出** | 默认 `.cursor/docs/<项目名>架构说明_初稿.md`；可再通过 `/spec2context-md` 转为规范格式终稿，并配合 `/generateProjectContext` 生成 Rules、Skills。 |

---

## 6. /pdf4code-md（Cursor 斜杠命令）

将 PDF 技术方案文档转为 Markdown 并保存到项目，并可引导用户补全流程说明（流程图无法从 PDF 解析时）。

| 项目 | 说明 |
|------|------|
| **入参** | 一个：**PDF 技术方案文档的本地路径** |
| **行为** | 读取 PDF → 提取文字并转为 Markdown → 保存到项目（推荐 `docs/<方案名>.md` 或 `.cursor/docs/<方案名>.md`）；可选：引导用户以图片或文字提供流程图/流程说明，并追加到该 MD |
| **输出** | 保存后的 MD 路径；若用户补全流程说明则写入该 MD |
| **典型用法** | 在「提问与实现环节」之前，若技术方案仅为 PDF，可先执行本命令转成 MD，再执行 `/opsx-new` 等。 |

---

## 7. 推荐执行顺序（Flow2Spec）

### 上下文生成

| 顺序 | 命令 | 作用 |
|------|------|------|
| 1 | **/genStructureDoc** | 生成项目架构说明**初稿** |
| 2 | **/spec2context-md** | 将初稿转为《终稿模版》规范格式，得到**终稿** |
| 3 | **/generateProjectContext** | 根据终稿生成 **Rules、Skills、文档索引** |

### 提问与实现环节

若技术方案仅为 **PDF**，可先执行 **`/pdf4code-md <PDF路径>`** 转成 MD，再进入下列步骤。

| 顺序 | 命令 | 作用 |
|------|------|------|
| 1 | **/opsx-new** | **提问**并新建变更，按 artifact 填写 proposal 等 |
| 2 | **/opsx-continue** | **继续**根据提案生成剩余产物（specs、design、tasks） |
| 3 | **/opsx-apply** | **根据规划**（tasks）生成代码 |
| 4 | **/global-fix** | **实现后**用户指出规则错误时：修正代码并同步更新文档与全局 Rules/Skills |
| 5 | **/global-sync** | 生成全局 Skills、Rules 并**归档**（可选） |

完成「上下文生成」1～3 后，再按「提问与实现环节」1～5 进行变更留档与代码实现；**global-fix** 在实现后、用户指出某处违反规则时使用；**global-sync** 可按需执行。

---

## 8. OpenSpec 与其它命令（概要）

- **/opsx-new**、**/opsx-continue**、**/opsx-apply**、**/opsx-archive**、**/opsx-ff**、**/opsx-explore**、**/opsx-onboard**、**/opsx-sync**、**/opsx-verify**、**/opsx-bulk-archive**：OpenSpec 变更工作流，详见 [OpenSpec-介绍](./OpenSpec-介绍.md) 与 [Flow2Spec使用说明](./Flow2Spec使用说明.md)。
- **/global-sync**：一条命令完成「技术方案 → 功能概述 → 提交到全局 Rules/Skills → 同步规范到 openspec/specs」；可传技术方案路径或变更名。
- **/global-fix**（**/修正实现规则**）：实现后用户指出某处违反项目规则或约定时使用（不归纳到 OpenSpec）。根据用户描述修正相关代码，并同步更新与该约定相关的文档（如 `.cursor/docs/*.md`）、全局规则（`.cursor/rules/*.mdc`）与 Skill（`.cursor/skills/*/SKILL.md`），必要时更新变更产物（如 `openspec/changes/<name>/design.md`）。使约定被明确记录，后续实现与 AI 可遵循。详见 `.cursor/commands/global-fix.md`。
- **根据技术方案实现代码**：Rule `implement-tech-design.mdc`；在对话中提供技术方案路径（通常为 `docs/xxx.md`），AI 按规则执行读文档、列任务、提问、实现、待完成列表与平台配置提醒。

---

## 9. 命令关系简图

```
flow2spec init
  └── 创建 .cursor/*、openspec/ 并注册斜杠命令

推荐顺序（上下文）：genStructureDoc → spec2context-md → generateProjectContext
推荐顺序（提问与实现）：（可选 pdf4code-md）→ opsx-new → opsx-continue → opsx-apply → global-sync（可选）

genStructureDoc  └── 说明/文档（或扫描）→ .cursor/docs/<项目名>架构说明_初稿.md
spec2context-md     └── PDF/MD → 初稿/终稿 → .cursor/docs/
generateProjectContext └── .cursor/docs/xxx.md（或 URL）→ main + Rules + Skills + docs-index
deleteProjectContext  └── 文档路径/片段 → 删该文档对应的 Rules、Skills、索引行、main 相关描述
pdf4code-md         └── PDF 路径 → 转 Markdown 并保存（如 docs/<方案名>.md），可补流程说明

opsx-new / opsx-continue / opsx-apply / opsx-archive 等 └── OpenSpec 变更留档与实现
global-fix          └── 用户指出规则错误 → 修正代码 + 更新文档与 Rules/Skills（全局工作流，不归纳到 opsx）
global-sync         └── 方案→概述→全局 Rules/Skills→同步规范（可选）
```

---

## 10. 快速参考

| 想做的事 | 用哪个命令 |
|----------|------------|
| 项目首次使用 | `npx @lands/flow2spec init` 或 `flow2spec init` |
| 生成项目架构说明初稿 | `/genStructureDoc`：可传说明文字或文档路径；输出默认 `.cursor/docs/<项目名>架构说明_初稿.md` |
| 把需求/方案文档变成 AI 可用的 Rules、Skills | `/generateProjectContext .cursor/docs/xxx.md`（通常传入终稿路径 `_终稿.md`） |
| 把 PDF 或杂乱 MD 变成规范技术方案（终稿） | `/spec2context-md .cursor/docs/xxx.pdf` 或 `xxx.md`；PDF 先出初稿，再执行一次出终稿 |
| 手头只有 PDF、要进入提问与实现环节 | 先 `/pdf4code-md <PDF路径>` 转成 MD，再 `/opsx-new` 等 |
| 提问并新建变更 | `/opsx-new <变更名>` |
| 继续根据提案生成剩余产物 | `/opsx-continue` |
| 根据规划（tasks）生成代码 | `/opsx-apply` |
| 实现后用户指出规则错误：改代码并同步文档与规则 | `/global-fix`（或 `/修正实现规则`） |
| 生成全局 Skills、Rules 并归档 | `/global-sync`（可选） |
| 不再需要某文档的上下文 | `/deleteProjectContext .cursor/docs/xxx.md` 或 `xxx` |
| 更新某文档的 Rules、Skills | 改文档后再次 `/generateProjectContext .cursor/docs/xxx.md` |
