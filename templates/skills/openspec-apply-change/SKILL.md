---
name: openspec-apply-change
description: 按 OpenSpec 变更实现任务。当用户要开始实现、继续实现或按任务清单推进时使用。
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: "1.0"
  generatedBy: "1.1.1"
---

按 OpenSpec 变更中的任务进行实现。

**输入**：可选的变更名称。若未提供，尝试从对话推断；若模糊或歧义，必须让用户从可用变更中选择。

**步骤**

1. **选定变更**

   若提供了名称则使用。否则：
   - 若用户提到过某变更，从对话推断
   - 若仅有一个活跃变更，可自动选中
   - 若有歧义，执行 `openspec list --json` 获取列表，用 **AskUserQuestion 工具**让用户选择

   始终说明：「当前变更：<name>」及如何覆盖（如 `/opsx:apply <其他>`）。

2. **查看状态以确认 schema**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析 JSON 得到：`schemaName`（如 "spec-driven"）、哪个 artifact 包含任务（spec-driven 下多为 "tasks"）。

3. **获取 apply 说明**

   ```bash
   openspec instructions apply --change "<name>" --json
   ```

   返回：context 文件路径（因 schema 而异）、进度、任务列表、动态说明。

   **状态处理**：若 `state: "blocked"` 提示并建议用 openspec-continue-change；若 `state: "all_done"` 祝贺并建议归档；否则继续实现。

4. **读取 context 文件**

   按 apply 说明中的 `contextFiles` 读取。spec-driven 下多为 proposal、specs、design、tasks。

5. **展示当前进度**

   显示 schema、进度「N/M 任务已完成」、剩余任务、CLI 动态说明。

6. **按任务实现（循环直到完成或阻塞）**

   对每个待办：标明当前任务、做代码修改、保持最小改动、在 tasks 文件中勾选完成、继续下一项。若任务不清、实现暴露设计问题、遇错误或用户打断则暂停。

7. **完成或暂停时展示状态**

   显示本轮完成的任务、总进度；全部完成则建议归档，暂停则说明原因并等待指示。

**实现中/完成/暂停时的输出格式**：见命令文档，保持「Implementing / Implementation Complete / Implementation Paused」等标题与进度信息。

**约束**：按任务推进直到完成或阻塞；开始前必读 context 文件；任务不清先问再实现；实现暴露问题则建议更新 artifact；每项完成后立即更新勾选；遇错误或需求不清时暂停不猜测；以 CLI 的 contextFiles 为准。

**与工作流的衔接**：可随时调用（artifact 未全完成但已有 tasks 时也可）；允许在实现过程中建议更新 artifact，不锁阶段。
