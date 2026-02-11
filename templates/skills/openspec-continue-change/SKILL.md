---
name: openspec-continue-change
description: 继续处理 OpenSpec 变更并创建下一个 artifact。当用户要推进变更、创建下一个产物或继续工作流时使用。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

继续某变更，创建下一个 artifact。

**输入**：可选的变更名称。若未提供或不清，必须让用户从可用变更中选择。

**步骤**

1. **若未提供变更名，让用户选择**

   执行 `openspec list --json`（按最近修改排序），用 **AskUserQuestion 工具**让用户选。展示最近修改的 3～4 个变更，含名称、Schema、状态（如 "0/5 tasks"）、最近修改时间，将最近一条标为「(Recommended)」。不要猜测或自动选择。

2. **查看当前状态**

   `openspec status --change "<name>" --json`，解析 `schemaName`、`artifacts`（"done"/"ready"/"blocked"）、`isComplete`。

3. **根据状态执行**

   - **若全部 artifact 已完成**：祝贺、展示最终状态、建议实现或归档，停止。
   - **若有 artifact 为 "ready"**：取第一个 ready，执行 `openspec instructions <artifact-id> --change "<name>" --json`，解析 `context`、`rules`、`template`、`instruction`、`outputPath`、`dependencies`；先读依赖 artifact，再按 template 创建该 artifact 文件（遵守 context/rules 但不抄入文件），写入 outputPath；展示创建内容与当前解锁项，**只创建一个**后停止。
   - **若没有 ready（全 blocked）**：展示状态并建议检查配置。

4. **创建 artifact 后展示进度**

   `openspec status --change "<name>"`。

**输出**：说明创建了哪个 artifact、当前 schema、进度（N/M）、已解锁的 artifact，并提示「要继续吗？让我继续或告诉我下一步」。

**spec-driven 常见 pattern**：proposal.md（Why/What Changes/Capabilities/Impact，Capabilities 决定每个 capability 一个 spec）→ specs/<capability>/spec.md → design.md → tasks.md。其他 schema 以 CLI 的 `instruction` 为准。

**书写语言**：artifact 正文语言须与项目一致。若技术方案、需求文档、依赖 artifact 或用户对话以**中文**为主，则 proposal、design、specs、tasks **全部用中文**书写（含 Requirement、Scenario、任务列表等）；若以英文为主则用英文。不要无理由在中文项目下写英文 artifact。

**约束**：每次只创建一个 artifact；先读依赖再创建；不跳过、不乱序；上下文不清先问用户；写入后确认文件存在；`context` 与 `rules` 是给你的约束，不要抄进 artifact。
