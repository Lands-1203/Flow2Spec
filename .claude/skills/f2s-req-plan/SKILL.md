---
name: f2s-req-plan
description: 根据技术方案/需求描述/变更描述规划并实现任务；始终创建任务清单，支持子 agent 并行实现代码；触发：f2s-req-plan、创建任务、任务规划、我需要任务清单
---

# 需求任务规划与实现（f2s-req-plan）

从需求/技术方案出发，完整覆盖「规划 → 实现」链路。不依赖 `changeTracking` 配置，始终创建任务清单。知识库同步由用户后续按需调用 `f2s-kb-feat` / `f2s-kb-sync` 完成。

## 编排（主 / 子 agent）

- `subAgent` / `switchAgentVerification` 语义以统一入口为唯一事实源：**Cursor/Claude** 读 `rules/f2s-flow2spec-unified-entry.*`；**Codex** 读 `.codex/topics/f2s-flow2spec-unified-entry.md`。
- **步骤 1（解析）**：`subAgent=true` 时可拆子 agent 并行读多份文档/模块，仅只读，不落盘。
- **步骤 2（草稿确认）**：必须主 agent，确认权不可下放。
- **步骤 3（落盘任务清单）**：`task.md` / `context.md` / `user-todos.md` 可交子 agent 写初稿；**`user-todos.md` 中「执行中识别的用户代办」追加**优先主 agent 合并写盘，避免并发覆盖；`todo.json` 恒由主 agent 单点写入。
- **步骤 4（实现代码）**：`subAgent=true` 时可按任务清单拆子 agent 并行实现各模块；**合并子 agent 结果后**，主 agent 须按 **`f2s-flow2spec-unified-entry`**「Git worktree 与子任务工作目录卫生」清理仅为子任务创建的 worktree / 隔离目录，并 `git worktree list` 自检。
- **步骤 5（归档）**：主 agent 完成。
- **步骤 6（摘要）**：主 agent 完成。
- 落盘侧自验；`switchAgentVerification=true` 且技能正文明确标注时才启用交叉校验。

## 输入（任选其一）

- 技术方案文档路径（`.Knowledge/req-docs/*.md` 或 PDF）
- 需求描述 / 变更描述（自由文本）

## 步骤

### 步骤 1：解析输入

`subAgent=true` 时，可拆子 agent 并行执行（只读，不落盘）：

- 读取技术方案 / 需求文档全文，提取目标、范围、主要工作项、涉及文件路径
- 读取项目现有约定（`.Knowledge/stock-docs/`、架构说明）对齐实现上下文
- 若输入为 PDF，先执行 `f2s-doc-pdf` 转为 MD，再继续

子 agent 只输出「解析结果摘要」（目标、工作项列表、涉及文件）交主 agent 汇总；`subAgent=false` 时主 agent 直接完成。

### 步骤 2：输出草稿并确认（必须主 agent）

主 agent 基于步骤 1 汇总，输出规划草稿：

1. **任务名称建议**（snake_case，如 `alipay_refund_feat`）
2. **实现任务清单草稿**（每步独立可 checkbox）
3. **涉及文件列表**
4. **等待用户确认**

> 未确认前禁止创建任何文件或写任何代码。

### 步骤 3：落盘任务清单

确认后：

- **主 agent**：在 `todo.json` 新增条目（`linkedSkill: "f2s-req-plan"`）
- **主 agent（`subAgent=false`）/ 子 agent（`subAgent=true`）**：
  - 创建 `.task/active/<task-name>/task.md`
  - 创建 `.task/active/<task-name>/context.md`
  - 创建 `.task/active/<task-name>/user-todos.md`（见 `f2s-task`：固定文件名；尚无用户代办时写入简短占位说明即可）

### 步骤 4：实现代码

`subAgent=true` 时，按任务清单将各模块拆子 agent 并行实现：

- 子 agent 只写实现代码
- 子 agent 完成后向主 agent 汇报改动摘要（文件路径 + 改动说明）
- `subAgent=false` 时主 agent 按清单逐项实现

实现原则：

- 复用现有依赖与封装，不引入不必要抽象
- 与项目命名 / 目录 / 风格一致
- 未实现或部分实现的能力补齐，不重做

每完成清单中一步，立即用 `Edit` / `Write` 将 `task.md` 对应 checkbox 由 `[ ]` 改为 `[x]`，禁止批量勾选，禁止口头完成代替写盘（长记忆以磁盘 `task.md` 为准；见 `f2s-task`）。

凡产生**须用户执行**的项（改库、配环境、审批等），**同会话内**追加写入 `user-todos.md`（见 `f2s-task`「user-todos.md」）；子 agent 若回报此类项，由主 agent 合并追加，禁止仅写在对话中。

### 步骤 5：归档任务

**仅当** `task.md`「步骤」已全部 `[x]`（或备注已记录取消项）后：将 `.task/active/<task-name>/` 整体移至 `.task/completed/<YYYYMMDD>-<task-name>/`，从 `todo.json` 删除对应条目。若仍有 `[ ]`，禁止归档，应先补打钩或修订清单（与 `f2s-task` 归档门禁一致）。

### 步骤 6：输出摘要

```markdown
## f2s-req-plan 完成：<任务名>

### 实现
- <文件路径>：<改动说明>

### 待办（如需同步知识库）
- 可后续调用 f2s-kb-sync 补充知识库

### 用户代办（须用户在本机/平台完成）
- 详见 `.task/active/<task-name>/user-todos.md`（归档后在 `completed/.../` 同路径）
```

## 约束

- 不依赖 `changeTracking` 配置，始终创建任务清单
- 步骤 2（草稿确认）必须主 agent，未确认前禁止落盘
- `todo.json` 恒主 agent 单点写入
- 禁止批量勾选 checkbox，逐步执行
- 用户代办必须追加到 `user-todos.md`，禁止仅对话交付（见 `f2s-task`）

## 完成后自检

1. 任务清单步骤是否全部勾选（且已为磁盘上的 `[x]`，非仅对话宣称）。
2. 实现代码是否覆盖草稿确认的范围。
3. 满足归档门禁后：`.task/active/<task-name>/` 已移至 `completed/`（含 `user-todos.md`），`todo.json` 条目已删除。
4. 凡有用户代办意图的，磁盘上 `user-todos.md` 已创建且与会话结论一致（无代办则可为占位说明）。
5. 若曾拆子 agent / 并行实现且环境可能创建 **`git worktree`**：已按 **`f2s-flow2spec-unified-entry`** 清理或已交接删除命令；未使用 worktree 则标 N/A。
