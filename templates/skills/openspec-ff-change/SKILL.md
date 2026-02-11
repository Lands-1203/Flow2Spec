---
name: openspec-ff-change
description: 快进完成 OpenSpec 的 artifact 创建。当用户想快速建好实现所需全部产物、不必逐个步骤执行时使用。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

快进完成 artifact 创建，一次性生成开始实现所需的一切。

**输入**：变更名称（kebab-case）或用户要做什么的描述。

**步骤**

1. **若无清晰输入，先问用户要做什么**

   用 **AskUserQuestion 工具**问要做什么，从描述推导 kebab-case 名称。未弄清前不要继续。

2. **创建变更目录**

   `openspec new change "<name>"`，在 `openspec/changes/<name>/` 下创建脚手架。

3. **获取 artifact 构建顺序**

   `openspec status --change "<name>" --json`，解析 `applyRequires`、`artifacts`。

4. **按顺序创建 artifact 直到达到可 apply 状态**

   用 **TodoWrite 工具**跟踪进度。按依赖顺序遍历，对每个 `ready` 的 artifact：获取 `openspec instructions <artifact-id> --change "<name>" --json`，按其中的 `context`、`rules`、`template`、`instruction`、`outputPath`、`dependencies` 创建文件（context/rules 不抄入文件）；直到 `applyRequires` 中全部为 "done"。若某 artifact 需要用户输入则用 AskUserQuestion 澄清后再继续。

5. **展示最终状态**

   `openspec status --change "<name>"`。

**输出**：总结变更名与路径、已创建 artifact 列表、「所有 artifact 已创建，可以开始实现」，并提示执行 `/opsx:apply` 或让 agent 开始实现。

**书写语言**：artifact 正文语言须与项目一致。若技术方案、需求文档或用户描述以**中文**为主，则 proposal、design、specs、tasks **全部用中文**书写；若以英文为主则用英文。不要无理由在中文项目下写英文 artifact。

**约束**：创建 schema 的 `apply.requires` 所定义的全部 artifact；先读依赖再创建；上下文严重不清可问用户但优先合理决策保持节奏；若该名称变更已存在则建议继续该变更；每写成一个确认文件存在再继续。**重要**：`context` 与 `rules` 是约束，不要抄进 artifact。
