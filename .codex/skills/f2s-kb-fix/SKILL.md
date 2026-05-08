---
name: f2s-kb-fix
description: 根据用户指出的实现或规则错误修正代码，并默认同步知识库；触发：f2s-kb-fix、修正实现规则
---

> 执行口径：`f2s-kb-fix` 默认"修代码 + 同步 `.Knowledge`"，无需用户额外要求"请同步知识库"。

## 编排（主 / 子 agent）

- 两字段（`subAgent` / `switchAgentVerification`）语义以统一入口为唯一事实源：**Cursor/Claude** 读配置根 `rules/f2s-flow2spec-unified-entry.*`；**Codex** 读 `.codex/topics/f2s-flow2spec-unified-entry.md`（与上同源，`flow2spec init` 镜像）。本处不复述。
- 代码子包（bug 修复类实现代码）：`subAgent=true` 时可外包给子 agent 执行。
- 文档子包（rules / skills / topics / stock-docs 等文风类改动）：默认不拆，由主 agent 直接编写，以保证「现行真值覆盖 / 篇幅上限 / 禁历史否定堆砌」等文风合规。
- 若确需外包文档改动：子侧**只输出「原位替换 diff」**（before / after 小段），**不得整文件重写**；由主 agent 合并落盘。
- 写权硬约束：`manifest-routing.json` / `.Knowledge/index.md` 恒由主 agent 落盘，子 agent 不得触碰。
- 落盘侧自验。

# /修正能力（f2s-kb-fix）

## 输入

- 用户描述违规点、正确写法、可选范围。

## 步骤

**步骤 0：变更追踪（仅当 `changeTracking.fix: true`）**

执行前读取 `flow2spec.config.json`，若 `changeTracking.fix: true`：

- 检查 `.task/todo.json` 是否存在活跃任务，将用户描述与 `keywords` 匹配。
- 命中 → 加载对应 `task.md`，展示剩余清单，在已有任务中继续。
- 无命中 → 创建新任务（见 `f2s-task` 规则），将步骤 1–4 写入 `task.md` 作为任务 checklist。

1. 明确违规点与影响范围（不清先追问）。
2. 修复代码实现。
3. 同步知识库（默认执行）：
   - `.Knowledge/stock-docs/`：修订约定说明
   - `.Knowledge/topics/`：修订对应主题规则/流程
   - `.Knowledge/index.md`：更新主题索引
   - 路由清单：若路由受影响则最小更新
4. 输出摘要（代码改动 + 知识库改动）。

## 输出摘要格式（建议）

```markdown
## 修正结果：<约定简述>

### 代码
- <文件路径>：<改动说明>

### 知识库
- .Knowledge/stock-docs/<文件>.md：<新增/修订说明>
- .Knowledge/topics/<topic>.md：<新增/修订说明>
- .Knowledge/index.md：<更新说明>
- .Knowledge/manifest-routing.json：<是否更新与原因>
- .Knowledge/matchers/<id>.json：<是否更新与原因>
```

## 复杂场景示例

用户指出"订单回调幂等实现错误"，但未给明确文件范围。

- 先按最小可行范围修复已定位的回调处理链路，并在摘要中说明"可继续扩展全仓同类修复"。
- 同步更新 `topics` 中幂等规则段落，避免后续再次生成错误实现。
- 若该修复影响任务路由（例如新增"幂等修复"主题），再最小更新 `manifest`。

## 约束

- 与旧约定冲突时：**改写到当前真值**，不要叠写「（不再与某 X 有关）」等对照旧版的赘句。
- 同主题优先原位更新。
- 范围不明时按最小可行范围修复并说明。
- 不改配置根 `rules/skills`。
- 文档子包默认不拆；必要外包子侧仅出 before/after diff 片段，主合并落盘；`manifest-routing.json` / `.Knowledge/index.md` 恒主落盘（写权硬约束）。

## 知识库落盘文风（必须，防赘述）

写 `stock-docs` / `topics` / `index` 时遵守：

1. **增量最小**：只改与**本次修复**直接相关的段落或列表项；禁止借机重述整份方案、整段历史背景或与修复无关的说明。
2. **现行真值覆盖（禁止历史否定堆砌）**：修复后约定从「与 A 有关」变为「与 B 有关」等时，应**删除或原位改写**仍写着旧约定的句子，正文只保留**当前成立**的表述。**禁止**叠写「（不再与 A 有关）」「原错误地与 A 绑定」等对照旧版的括号或脚注；除非用户明确要求「迁移说明」，否则不写旧→新对照长文。
3. **不重复叙事**：`stock-docs` 与 `topics` 不就同一修复各写长篇；一处写清「错因 / 正确约定 / 注意点」，另一处简短引用或链到该段。
4. **条文化优先**：以「错误表现 → 根因 → 正确行为 / 边界」为序的短列表为主，避免散文式展开。
5. **篇幅上限（软约束）**：单次同步中，对**同一文件**的新增或替换正文合计不宜超过约 **60 行**（不含代码块行）；超出则只保留与修复相关的最小说明，其余用「见提交/见某路径」代替。
6. **`index.md`**：仅更新受影响的索引行或摘要列，禁止无关整表重写。
7. **禁止**：重复粘贴用户报错全文（可摘一行标识 + 链接）、重复解释 Flow2Spec 用法。

## 完成后自检

1. 代码修复是否覆盖用户点名范围。
2. 主题文档是否与修复后的实现一致。
3. `index` 是否指向正确主题。
4. 若更新了 `manifest`，路由字段是否仍可解析。
5. 知识库变更是否可再压缩：删套话后约定是否仍清晰。
6. 是否仍存在「否定旧版 / 不再与某物有关」类赘句：现行规则已写清则应删。
7. 子 agent 未整文件重写文档；manifest / index 由主 agent 单点落盘。
8. 若 `changeTracking.fix: true`：`.task/active/<task-name>/` 已归档至 `completed/`，`todo.json` 已删除对应条目。
