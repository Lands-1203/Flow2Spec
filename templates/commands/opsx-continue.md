---
name: /继续变更
id: opsx-continue
category: 工作流
description: 继续当前变更并创建下一个产物（实验性）
---

继续处理某变更，创建下一个 artifact。

**输入**：可在 `/opsx:continue` 后指定变更名称（如 `/opsx:continue add-auth`）。若未提供，尝试从对话推断；若模糊或歧义，必须让用户从可用变更中选择。

**步骤**

1. **若未提供变更名称，让用户选择**

   执行 `openspec list --json` 获取变更列表（按最近修改排序），用 **AskUserQuestion 工具**让用户选择要继续的变更。

   展示最近修改的 3～4 个变更作为选项，并显示：
   - 变更名称
   - Schema（有 `schema` 字段则用，否则为 "spec-driven"）
   - 状态（如 "0/5 tasks"、"complete"、"no tasks"）
   - 最近修改时间（来自 `lastModified`）

   将最近修改的变更标为「（推荐）」。

   **重要**：不要猜测或自动选择，始终由用户选择。

2. **查看当前状态**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析 JSON 得到当前状态，包括：
   - `schemaName`：使用的工作流 schema（如 "spec-driven"）
   - `artifacts`：各 artifact 及状态（"done"、"ready"、"blocked"）
   - `isComplete`：是否所有 artifact 均已完成

3. **根据状态执行**：

   ---

   **若所有 artifact 已完成（`isComplete: true`）**：
   - 祝贺用户
   - 展示最终状态（含使用的 schema）
   - 建议：「所有 artifact 已就绪！可使用 `/opsx:apply` 实现此变更，或使用 `/opsx:archive` 归档。」
   - 停止

   ---

   **若有 artifact 处于可创建状态**（status 中存在 `status: "ready"` 的 artifact）：
   - 从 status 输出中取**第一个** `status: "ready"` 的 artifact
   - 获取其说明：
     ```bash
     openspec instructions <artifact-id> --change "<name>" --json
     ```
   - 解析 JSON，关键字段：
     - `context`：项目背景（对你的约束，不要写入产出）
     - `rules`：该 artifact 的规则（对你的约束，不要写入产出）
     - `template`：产出文件应使用的结构
     - `instruction`：schema 对该类 artifact 的指引
     - `outputPath`：artifact 写入路径
     - `dependencies`：需先读取的已完成 artifact
   - **创建该 artifact 文件**：
     - 按需读取已完成的依赖文件作为上下文
     - 按 `template` 结构填写各节
     - 写作时遵守 `context` 与 `rules`，但不要把它们抄进文件
     - 写入说明中给出的 output path
   - 说明创建了什么、当前解锁了哪些
   - 创建**一个** artifact 后停止

   ---

   **若没有 artifact 处于 ready（均为 blocked）**：
   - 在合法 schema 下通常不应出现
   - 展示状态并建议检查配置或依赖

4. **创建 artifact 后展示进度**
   ```bash
   openspec status --change "<name>"
   ```

**输出**

每次调用后展示：
- 创建了哪个 artifact
- 当前使用的 schema workflow
- 当前进度（N/M 已完成）
- 当前哪些 artifact 已解锁
- 提示：「执行 `/opsx:continue` 可创建下一个 artifact」

**Artifact 创建指引**

artifact 类型与用途由 schema 决定，以说明中的 `instruction` 为准。

**书写语言（必守）**：artifact 正文使用的语言须与项目一致。
- 若**项目内文档**（如技术方案、需求说明、已有 proposal/design）、**用户对话**或**依赖 artifact** 以**中文**为主，则 proposal、design、specs、tasks 等**全部用中文**书写（含 Requirement 描述、Scenario 的 WHEN/THEN、任务列表、决策与风险等）。
- 若项目与对话以**英文**为主，则用英文书写。
- 判断依据：优先看本变更依赖的技术方案/文档语言、已有 artifact 语言、用户当前对话语言；不确定时默认与**依赖文档或用户最近一条消息**同语言。不要无理由使用英文书写中文项目的 artifact。

常见 pattern（**spec-driven schema**：proposal → specs → design → tasks）：
- **proposal.md**：若上下文不清可先问用户。填写 Why、What Changes、Capabilities、Impact。Capabilities 一节很重要，其中每项都会对应一个 spec 文件。
- **specs/<capability>/spec.md**：为 proposal 的 Capabilities 中每项各建一个 spec（用 capability 名，不是变更名）。
- **design.md**：记录技术决策、架构与实现思路。
- **tasks.md**：将实现拆成带勾选的任务。

其他 schema 以 CLI 返回的 `instruction` 为准。

**约束**
- 每次调用只创建一个 artifact
- 创建新 artifact 前先读依赖 artifact
- 不跳过、不乱序创建 artifact
- 上下文不清时先问用户再创建
- 写入后确认 artifact 文件存在再更新进度
- 按 schema 的 artifact 顺序执行，不假设具体 artifact 名称
- **重要**：`context` 与 `rules` 是给你的约束，不是要写入文件的内容；不要将 `<context>`、`<rules>`、`<project_context>` 等块抄进 artifact；这些仅用于指导写作，不应出现在产出中
