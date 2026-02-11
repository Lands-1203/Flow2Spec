---
name: /校验变更
id: opsx-verify
category: 工作流
description: 在归档前校验实现是否与变更产物一致
---

校验当前实现是否与变更的 artifact（specs、tasks、design）一致。

**输入**：可在 `/opsx:verify` 后指定变更名称（如 `/opsx:verify add-auth`）。若未提供，尝试从对话推断；若模糊或歧义，必须让用户从可用变更中选择。

**步骤**

1. **若未提供变更名称，让用户选择**

   执行 `openspec list --json` 获取变更列表，用 **AskUserQuestion 工具**让用户选择。

   展示有实现任务（存在 tasks artifact）的变更。
   若有 schema 信息一并展示。
   对任务未全部完成的变更标为「（进行中）」。

   **重要**：不要猜测或自动选择，始终由用户选择。

2. **查看状态以确认 schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析 JSON 得到：
   - `schemaName`：使用的工作流（如 "spec-driven"）
   - 该变更存在哪些 artifact

3. **获取变更目录并加载 artifact**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   返回变更目录与上下文文件。从 `contextFiles` 读取所有可用 artifact。

4. **初始化校验报告结构**

   按三个维度建报告：
   - **Completeness（完整性）**：任务与 spec 覆盖
   - **Correctness（正确性）**：requirement 实现与 scenario 覆盖
   - **Coherence（一致性）**：与 design 的符合度与模式一致

   每个维度可包含 CRITICAL、WARNING 或 SUGGESTION 级别的问题。

5. **校验 Completeness**

   **任务完成度**：
   - 若 contextFiles 中有 tasks.md，读取并解析勾选：`- [ ]`（未完成）与 `- [x]`（已完成）
   - 统计已完成/总任务数
   - 若有未完成任务：为每项记 CRITICAL，建议：「完成任务：<描述>」或「若已实现请标为完成」

   **Spec 覆盖**：
   - 若 `openspec/changes/<name>/specs/` 存在 delta spec：提取所有 requirement（"### Requirement:"）
   - 对每个 requirement：在代码库中搜索相关关键词，判断是否已有实现
   - 若某 requirement 似未实现：记 CRITICAL「Requirement not found: <requirement name>」，建议：「实现 requirement X：<描述>」

6. **校验 Correctness**

   **Requirement 实现映射**：
   - 对 delta spec 中每个 requirement：在代码库中搜索实现证据
   - 若找到，记录文件路径与行号
   - 判断实现是否与 requirement 意图一致；若明显偏离：记 WARNING「Implementation may diverge from spec: <详情>」，建议：「对照 requirement X 检查 <file>:<lines>」

   **Scenario 覆盖**：
   - 对 delta spec 中每个 scenario（"#### Scenario:"）：检查代码是否处理了条件、是否有测试覆盖
   - 若某 scenario 似未覆盖：记 WARNING「Scenario not covered: <scenario name>」，建议：「为 scenario 补充测试或实现：<描述>」

7. **校验 Coherence**

   **与 design 一致**：
   - 若 contextFiles 中有 design.md：提取关键决策（如 "Decision:"、"Approach:"、"Architecture:"）
   - 检查实现是否遵循这些决策；若发现矛盾：记 WARNING「Design decision not followed: <decision>」，建议：「调整实现或修订 design.md 以符合现状」
   - 若无 design.md：跳过此项，注明「无 design.md 可供校验」

   **代码模式一致**：
   - 检查新增代码与项目既有模式是否一致（命名、目录、风格）
   - 若发现明显偏离：记 SUGGESTION「Code pattern deviation: <详情>」，建议：「考虑遵循项目模式：<示例>」

8. **生成校验报告**

   **摘要评分卡**：
   ```
   ## 校验报告：<change-name>

   ### 摘要
   | 维度       | 状态           |
   |------------|----------------|
   | Completeness | X/Y 任务，N 个 req |
   | Correctness  | M/N 个 req 已覆盖 |
   | Coherence    | 已遵循/存在问题   |
   ```

   **按优先级列问题**：

   1. **CRITICAL**（归档前必须修复）：未完成任务、缺失的 requirement 实现等，每项附可执行建议
   2. **WARNING**（建议修复）：与 spec/design 的偏差、缺失的 scenario 覆盖等，每项附建议
   3. **SUGGESTION**（可选）：模式不一致、小改进等，每项附建议

   **最终结论**：
   - 若有 CRITICAL：「发现 X 个 critical 问题，修复后再归档。」
   - 若仅有 WARNING：「无 critical 问题，有 Y 个 warning 可考虑。可归档（并后续改进）。」
   - 若全部通过：「校验通过，可以归档。」

**校验启发**

- **Completeness**：关注客观清单（勾选、requirement 列表）
- **Correctness**：结合关键词搜索、路径分析与合理推断，不要求绝对确定
- **Coherence**：关注明显不一致，不纠结风格细节
- **误报**：不确定时优先标 SUGGESTION 而非 WARNING，WARNING 而非 CRITICAL
- **可执行性**：每个问题都应有具体建议，尽量带文件/行引用

**降级策略**

- 仅有 tasks.md：只校验任务完成度，跳过 spec/design
- 有 tasks + specs：校验完整性与正确性，跳过 design
- 有完整 artifact：三个维度都校验
- 始终说明跳过了哪些检查及原因

**输出格式**

使用清晰 Markdown：摘要用表格，问题按 CRITICAL/WARNING/SUGGESTION 分组，引用格式 `file.ts:123`，建议具体可执行，避免「建议再检查」等空泛表述。
