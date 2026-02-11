---
name: openspec-verify-change
description: 校验实现是否与变更的 artifact 一致。当用户在归档前要验证实现是否完整、正确且与设计一致时使用。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

校验实现是否与变更的 artifact（specs、tasks、design）一致。

**输入**：可选的变更名称。若未提供或不清，必须让用户选择。

**步骤**

1. **若未提供变更名，让用户选择**

   执行 `openspec list --json`，用 **AskUserQuestion 工具**让用户选。展示有 tasks artifact 的变更，若有 schema 一并展示，任务未完成的可标「(In Progress)」。不要猜测或自动选择。

2. **查看 schema**

   `openspec status --change "<name>" --json`，解析 `schemaName`、存在哪些 artifact。

3. **加载 artifact**

   `openspec instructions apply --change "<name>" --json`，从返回的 `contextFiles` 读取所有可用 artifact。

4. **初始化校验报告**

   按三个维度：**Completeness**（任务与 spec 覆盖）、**Correctness**（requirement 实现与 scenario 覆盖）、**Coherence**（与 design 一致性与代码模式）。每维度可有 CRITICAL、WARNING、SUGGESTION 级别问题。

5. **校验 Completeness**：读 tasks.md 统计 `- [ ]`/`- [x]`，未完成任务记 CRITICAL；若有 delta spec 则提取 requirement 并在代码库搜索实现证据，似未实现记 CRITICAL。

6. **校验 Correctness**：对每个 requirement 查实现证据与意图是否一致，偏离记 WARNING；对每个 scenario 查代码与测试覆盖，未覆盖记 WARNING。

7. **校验 Coherence**：若有 design.md 提取决策并核对实现是否遵循，矛盾记 WARNING；检查新代码与项目模式一致性，明显偏离记 SUGGESTION。

8. **生成报告**：摘要表（Completeness / Correctness / Coherence）、按 CRITICAL/WARNING/SUGGESTION 分组的问题与建议、最终结论（有 CRITICAL 需先修复再归档 / 仅 WARNING 可归档 / 全部通过可归档）。

**启发**：Completeness 看客观清单；Correctness 用关键词与路径分析，不要求绝对确定；Coherence 看明显不一致；不确定时优先标 SUGGESTION/WARNING；每个问题都应有可执行建议与文件/行引用。

**降级**：仅有 tasks 时只校验任务；有 tasks+specs 时校验完整性与正确性；有完整 artifact 时三个维度都校验；并说明跳过了哪些检查及原因。

**输出格式**：清晰 Markdown、摘要表、分组问题列表、`file.ts:123` 形式引用、具体建议。
