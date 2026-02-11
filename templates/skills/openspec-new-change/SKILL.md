---
name: openspec-new-change
description: 使用实验性 artifact 工作流新建一次 OpenSpec 变更。当用户想用结构化、分步方式创建新功能、修复或改动时使用。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

使用实验性的 artifact 驱动方式新建一次变更。

**输入**：用户请求应包含变更名称（kebab-case）或要做什么的描述。

**步骤**

1. **若没有清晰输入，先问用户要做什么**

   用 **AskUserQuestion 工具**（开放式）问：「你想做哪类变更？请描述你想实现或修复的内容。」根据描述推导 kebab-case 名称（如 "add user authentication" → `add-user-auth`）。未弄清前不要继续。

2. **确定工作流 schema**

   除非用户明确要求，否则使用默认 schema（不传 `--schema`）。仅当用户提到具体 schema 名或「展示工作流」时，才用 `--schema <name>` 或执行 `openspec schemas --json` 让用户选。

3. **创建变更目录**

   `openspec new change "<name>"`，必要时加 `--schema <name>`。会在 `openspec/changes/<name>/` 下按所选 schema 创建脚手架。

4. **展示 artifact 状态**

   `openspec status --change "<name>"`，显示哪些 artifact 待创建、哪些已就绪。

5. **获取第一个 artifact 的说明**

   第一个 artifact 由 schema 决定（如 spec-driven 下为 `proposal`）。从 status 中找到第一个 "ready" 的 artifact，执行 `openspec instructions <first-artifact-id> --change "<name>"`，得到模板与上下文。

6. **在此停止，等待用户指示**

**输出**：总结变更名与路径、schema/workflow 及 artifact 顺序、当前进度（0/N）、第一个 artifact 的模板，并提示：「准备好创建第一个 artifact 了吗？直接描述这次变更要做什么我会起草，或让我继续。」

**书写语言（供后续 continue/ff 创建 artifact 时遵守）**：若技术方案/需求/用户对话以中文为主，则后续创建的 proposal、design、specs、tasks 应**全部用中文**书写；英文项目则用英文。

**约束**：暂不创建任何 artifact，仅展示说明；不越过「展示第一个 artifact 模板」；名称非法（非 kebab-case）则要求合法名；若该名称变更已存在则建议继续该变更；非默认工作流时传 --schema。
