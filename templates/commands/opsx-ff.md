---
name: /快进变更
id: opsx-ff
category: 工作流
description: 一次性创建变更并生成实现所需全部产物
---

快进完成 artifact 创建，一次性生成开始实现所需的一切。

**输入**：`/opsx:ff` 后的参数为变更名称（kebab-case），或用户想要实现的需求描述。

**步骤**

1. **若未提供输入，先询问用户要做什么**

   使用 **AskUserQuestion 工具**（开放式，无预设选项）提问：
   > 你想做哪类变更？请描述你想实现或修复的内容。

   根据描述推导出 kebab-case 名称（如 "add user authentication" → `add-user-auth`）。

   **重要**：未弄清用户要做什么前，不要继续。

2. **创建变更目录**
   ```bash
   openspec new change "<name>"
   ```
   会在 `openspec/changes/<name>/` 下创建脚手架变更。

3. **获取 artifact 构建顺序**
   ```bash
   openspec status --change "<name>" --json
   ```
   解析 JSON 得到：
   - `applyRequires`：实现前需要的 artifact ID 列表（如 `["tasks"]`）
   - `artifacts`：所有 artifact 及其状态与依赖

4. **按顺序创建 artifact，直到达到可 apply 状态**

   使用 **TodoWrite 工具**跟踪 artifact 进度。

   按依赖顺序遍历（先处理无未满足依赖的 artifact）：

   a. **对每个状态为 `ready`（依赖已满足）的 artifact**：
      - 获取说明：
        ```bash
        openspec instructions <artifact-id> --change "<name>" --json
        ```
      - 说明 JSON 包含：
        - `context`：项目背景（对你的约束，不要写入产出文件）
        - `rules`：该 artifact 的规则（对你的约束，不要写入产出文件）
        - `template`：产出文件应使用的结构
        - `instruction`：该 artifact 类型的 schema 指引
        - `outputPath`：artifact 写入路径
        - `dependencies`：需先读取的已完成 artifact
      - 按需读取已完成的依赖文件作为上下文
      - 按 `template` 结构创建 artifact 文件
      - 遵守 `context` 与 `rules`，但不要把它们抄进文件
      - 简短提示进度：「✓ 已创建 <artifact-id>」

   b. **直到所有 `applyRequires` 中的 artifact 都完成**
      - 每创建一个 artifact 后重新执行 `openspec status --change "<name>" --json`
      - 检查 `applyRequires` 中每个 artifact ID 在 artifacts 数组里是否均为 `status: "done"`
      - 当全部完成时停止

   c. **若某 artifact 需要用户输入**（上下文不清）：
      - 用 **AskUserQuestion 工具**澄清
      - 再继续创建

5. **展示最终状态**
   ```bash
   openspec status --change "<name>"
   ```

**输出**

全部 artifact 完成后，总结：
- 变更名称与路径
- 已创建的 artifact 列表及简短说明
- 就绪情况：「所有 artifact 已创建，可以开始实现。」
- 提示：「执行 `/opsx:apply` 开始实现。」

**Artifact 创建指引**

- 按 `openspec instructions` 返回的 `instruction` 字段处理每种 artifact 类型
- schema 定义各 artifact 应包含内容，请遵循
- 创建新 artifact 前先读依赖 artifact 作为上下文
- 以 `template` 为起点，结合上下文填写

**书写语言（必守）**：artifact 正文使用的语言须与项目一致。
- 若**项目内文档**（如技术方案、需求说明）、**用户对话**或**依赖 artifact** 以**中文**为主，则 proposal、design、specs、tasks 等**全部用中文**书写（含 Requirement 描述、Scenario 的 WHEN/THEN、任务列表、决策与风险等）。
- 若项目与对话以**英文**为主，则用英文书写。
- 判断依据：优先看本变更依赖的文档语言、用户描述语言；不确定时默认与**用户输入或依赖文档**同语言。不要无理由使用英文书写中文项目的 artifact。

**约束**
- 创建 schema 的 `apply.requires` 所定义的全部实现所需 artifact
- 创建新 artifact 前务必先读依赖 artifact
- 若上下文严重不清可询问用户，但优先做合理假设以保持节奏
- 若该名称的变更已存在，询问用户是继续该变更还是新建一个
- 每写成一个 artifact 后确认文件存在，再继续下一个
