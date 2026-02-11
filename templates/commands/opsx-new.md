---
name: /新建变更
id: opsx-new
category: 工作流
description: 使用实验性产物工作流（OPSX）新建一次变更
---

使用实验性的 artifact 驱动方式新建一次变更。

**输入**：`/opsx:new` 后的参数为变更名称（kebab-case），或用户想要实现的需求描述。

**步骤**

1. **若未提供输入，先询问用户要做什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）提问：
   > 你想做哪类变更？请描述你想实现或修复的内容。

   根据描述推导出 kebab-case 名称（如「添加用户认证」→ `add-user-auth`）。

   **重要**：未弄清用户要做什么前，不要继续。

2. **确定工作流 schema**

   除非用户明确要求其他工作流，否则使用默认 schema（不传 `--schema`）。

   **仅在以下情况使用其他 schema：**
   - 用户指定了 schema 名称 → 使用 `--schema <name>`
   - 用户说「展示工作流」或「有哪些工作流」→ 执行 `openspec schemas --json` 让用户选择

   **否则**：不传 `--schema`，使用默认。

3. **创建变更目录**
   ```bash
   openspec new change "<name>"
   ```
   仅当用户要求特定工作流时才加 `--schema <name>`。
   会在 `openspec/changes/<name>/` 下按所选 schema 创建脚手架变更。

4. **查看 artifact 状态**
   ```bash
   openspec status --change "<name>"
   ```
   用于查看哪些 artifact 待创建、哪些已就绪（依赖已满足）。

5. **获取第一个 artifact 的说明**
   第一个 artifact 由 schema 决定。根据 status 输出找到第一个状态为 "ready" 的 artifact。
   ```bash
   openspec instructions <first-artifact-id> --change "<name>"
   ```
   输出创建该 artifact 的模板与上下文。

6. **在此停止，等待用户指示**

**输出**

完成上述步骤后，总结：
- 变更名称与路径
- 当前使用的 schema/workflow 及其 artifact 顺序
- 当前进度（已完成 0/N 个 artifact）
- 第一个 artifact 的模板
- 提示：「准备好创建第一个 artifact 了吗？可执行 `/opsx:continue`，或直接描述这次变更要做什么，我会起草。」

**Artifact 书写语言（供后续 continue/ff 使用）**

当用户或后续命令创建 proposal、design、specs、tasks 时，artifact 正文语言须与项目一致：若技术方案/需求/用户对话以**中文**为主，则**全部用中文**书写；若以英文为主则用英文。不要无理由在中文项目下写出英文 artifact。

**约束**
- 暂不创建任何 artifact，仅展示说明
- 不要越过「展示第一个 artifact 模板」这一步
- 若名称不合法（非 kebab-case），请用户给出合法名称
- 若该名称的变更已存在，建议改用 `/opsx:continue`
- 使用非默认工作流时传入 --schema
