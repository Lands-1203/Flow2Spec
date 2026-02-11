---
name: openspec-bulk-archive-change
description: 一次性归档多个已完成的变更。当用户要归档多个并行变更时使用。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

一次性归档多个已完成的变更。

通过检查代码库中实际实现情况智能处理 spec 冲突，再批量归档。

**输入**：无必填（会提示选择要归档的变更）。

**步骤**

1. **获取活跃变更**：`openspec list --json`。若无活跃变更则告知并停止。

2. **让用户多选要归档的变更**：用 **AskUserQuestion 工具**，展示每个变更及 schema，提供「全部」选项，允许选 1 个或多个。不要自动选择。

3. **批量校验**：对每个选中变更收集 artifact 状态（`openspec status --change "<name>" --json`）、任务完成度（读 `openspec/changes/<name>/tasks.md`）、delta spec（`openspec/changes/<name>/specs/`）。

4. **检测 spec 冲突**：构建 capability → [涉及该 capability 的变更] 映射；当 2+ 个选中变更对同一 capability 有 delta spec 时为冲突。

5. **由 agent 解决冲突**：对每个冲突读各变更的 delta spec、在代码库搜索实现证据；若仅一个被实现则只同步该变更的 spec，若两个都被实现则按时间顺序应用，若都未实现则跳过同步并警告；记录解决方式。

6. **展示汇总状态表**：变更名、Artifacts、Tasks、Specs、Conflicts、Status；对冲突展示解决方式，对未完成展示警告。

7. **确认批量操作**：用 **AskUserQuestion** 一次确认（如「归档这 N 个变更？」），选项可含「全部归档」「仅归档就绪的」「取消」。若有未完成变更需说明将带警告归档。

8. **对每个确认的变更执行**：若有 delta spec 则按 openspec-sync-specs 方式同步（冲突按解决顺序）；再 `mkdir -p openspec/changes/archive` 与 `mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>`；记录成功/失败/跳过。

9. **展示最终摘要**：已归档列表、跳过列表、失败列表、Spec 同步摘要（含冲突解决说明）。

**冲突解决示例**：仅一个实现→只同步该变更；两个都实现→按时间顺序应用 spec。见命令文档示例。

**约束**：始终让用户选择；尽早检测冲突并通过查代码库解决；两个都实现时按时间顺序应用 spec；仅当实现缺失时跳过同步并警告；整批一次确认；保留 .openspec.yaml；归档目标为 YYYY-MM-DD-<name>；若目标已存在则该变更失败但继续其余。
