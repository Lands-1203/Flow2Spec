---
name: openspec-sync-specs
description: 将变更中的 delta spec 同步到主 spec。当用户要在不归档变更的情况下用 delta spec 更新主规范时使用。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

将某变更中的 delta spec 同步到主 spec。

本操作为 **agent 驱动**：你读取 delta spec 并直接编辑主 spec 应用变更，支持智能合并（例如只加一个 scenario 而不整段复制 requirement）。

**输入**：可选的变更名称。若未提供或不清，必须让用户选择。

**步骤**

1. **若未提供变更名，让用户选择**

   执行 `openspec list --json`，用 **AskUserQuestion 工具**让用户选。展示含有 delta spec（存在 `specs/` 目录）的变更。不要猜测或自动选择。

2. **定位 delta spec**

   在 `openspec/changes/<name>/specs/*/spec.md` 查找。每个 delta spec 可含：`## ADDED Requirements`、`## MODIFIED Requirements`、`## REMOVED Requirements`、`## RENAMED Requirements`（FROM:/TO:）。若无则告知用户并停止。

3. **对每个 delta spec 将变更应用到主 spec**

   对每个在 `openspec/changes/<name>/specs/<capability>/spec.md` 有 delta 的 capability：读取 delta 与主 spec `openspec/specs/<capability>/spec.md`；按 ADDED（新增或更新）、MODIFIED（找 requirement 应用变更、保留未提及内容）、REMOVED（删除整块）、RENAMED（FROM→TO）智能应用；若 capability 尚无主 spec 则创建 `openspec/specs/<capability>/spec.md` 并写 Purpose、ADDED 的 requirement。

4. **展示摘要**

   说明更新了哪些 capability、做了哪些变更（requirement 新增/修改/删除/重命名）。

**Delta Spec 格式**：ADDED/MODIFIED/REMOVED/RENAMED 各节，Requirement 与 Scenario 的 WHEN/THEN/AND。原则为智能合并：可只做部分更新，delta 表达意图而非整份替换。

**成功时输出**：Specs Synced、Updated main specs、各 capability 的变更说明，并注明变更仍活跃、实现完成后再归档。

**约束**：修改前同时读 delta 与主 spec；保留 delta 未提及的已有内容；不清则澄清；操作应幂等。
