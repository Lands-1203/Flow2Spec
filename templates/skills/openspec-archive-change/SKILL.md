---
name: openspec-archive-change
description: 在实验性工作流中归档已完成的变更。当用户在实现完成后要收尾并归档时使用。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

在实验性工作流中归档一个已完成的 change。

**输入**：可选的变更名称。若未提供或不清，必须让用户从可用变更中选择。

**步骤**

1. **若未提供变更名，让用户选择**

   执行 `openspec list --json`，用 **AskUserQuestion 工具**让用户选。仅展示活跃变更（未归档），若有 schema 一并展示。不要猜测或自动选择。

2. **检查 artifact 完成状态**

   执行 `openspec status --change "<name>" --json`。解析 `schemaName`、`artifacts`（状态是否为 `done`）。若有未完成 artifact，显示警告并用 **AskUserQuestion** 确认是否继续。

3. **检查任务完成状态**

   读取 tasks 文件（通常 `tasks.md`），统计 `- [ ]` 与 `- [x]`。若有未完成任务，显示警告并确认。无 tasks 文件则跳过任务相关警告。

4. **评估 delta spec 同步状态**

   检查 `openspec/changes/<name>/specs/` 是否有 delta spec。若有，与主 spec `openspec/specs/<capability>/spec.md` 对比，展示将应用的变更摘要，再提供选项：「立即同步（推荐）」/「不同步直接归档」等。若用户选同步，执行 openspec-sync-specs 的逻辑。

5. **执行归档**

   `mkdir -p openspec/changes/archive`，目标名 `YYYY-MM-DD-<change-name>`。若目标已存在则报错并建议重命名或换日期；否则 `mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>`。

6. **展示摘要**

   包含变更名、schema、归档路径、spec 是否已同步、若有未完成 artifact/tasks 的警告说明。

**成功时输出**：Archive Complete、Archived to 路径、Specs 状态（已同步/无 delta spec/已跳过同步）。

**约束**：未提供变更时始终让用户选择；用 openspec status --json 做完成度检查；有警告时不阻止归档，仅提示并确认；移动时保留 .openspec.yaml；若存在 delta spec 先做同步评估并展示摘要再询问。
