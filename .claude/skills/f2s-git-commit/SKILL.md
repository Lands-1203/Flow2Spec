---
name: f2s-git-commit
description: 代码写完后提交 Git：自动检查变更文件、比对知识库覆盖情况，未入库则提示用户，确认提交信息后执行 commit。触发：f2s-git-commit、提交代码、git commit、帮我提交
---

> 执行口径：本技能代用户执行 git 操作；不使用 `git add -A` / `git add .`，不跳过 hooks（`--no-verify`），不自动 push。

## 编排（主 / 子 agent）

- `subAgent` / `switchAgentVerification` 语义以统一入口为唯一事实源：**Cursor/Claude** 读配置根 `rules/f2s-flow2spec-unified-entry.*`；**Codex** 读 `.codex/topics/f2s-flow2spec-unified-entry.md`。
- 本技能全程在主 agent 完成（交互确认不可下放）。

# f2s-git-commit（提交代码）

## 强制流程

### 步骤 1：读取变更（只读）

```bash
git status --short
git diff HEAD
```

- 从 `git status --short` 区分三类文件：
  - **Staged**：已 `git add`，前缀为 `M `、`A `、`D `（首列非空）
  - **Unstaged**：已追踪但未 add，前缀为 ` M`、` D`（次列非空）
  - **Untracked**：`??` 前缀，新文件尚未追踪
- 若三类均为空（nothing to commit），直接告知用户并结束。

**冲突检查（必须，先于一切）**：

扫描所有变更文件内容，若任意文件包含 `<<<<<<<`、`=======`、`>>>>>>>` 冲突标记，立即终止并提示：

```
❌ 检测到未解决的 merge conflict：
  - <文件路径>

请先解决冲突后再提交。
```

### 步骤 2：知识库覆盖检查（必须）

**先判断 `.Knowledge/` 是否存在：**

- 若 `.Knowledge/manifest-routing.json` 不存在：跳过本步骤，在步骤 5 收尾提示「项目尚未初始化 Flow2Spec 知识库，建议运行 flow2spec init」，继续步骤 3。

**存在时执行覆盖检查：**

1. 从 `git diff HEAD` 及 untracked 文件路径推断本次变更涉及的**功能模块**（如：支付、订单、用户认证等）。
2. 读取 `.Knowledge/topics/` 目录列表与 `.Knowledge/stock-docs/` 目录列表。
3. 对比步骤 1 推断出的功能模块，判断对应文档是否已在知识库中登记。
4. 得出结论：**已覆盖 / 部分覆盖 / 未覆盖**。

> 判断粗粒度即可：有对应 topic 或 stock-docs 文档即视为已覆盖；若知识库为空或找不到相关文档则视为未覆盖。

**未覆盖或部分覆盖时（必须提示）：**

```
⚠️  本次变更涉及以下能力尚未入知识库：
  - <能力描述>

建议在提交前同步知识库，可选：
  A) 现在运行 f2s-kb-sync 补录，完成后自动继续提交流程
  B) 先提交，稍后手动补录（输入 B 确认）
  C) 取消本次提交（输入 C）
```

- 选 **A**：提示用户运行 `f2s-kb-sync` 或 `f2s-kb-feat` 补录，补录完成后询问「是否继续提交？」，用户确认后从步骤 3 继续。
- 选 **B**：记录未覆盖能力描述，在步骤 5 收尾提示中输出。
- 选 **C**：终止本技能。

### 步骤 3：生成提交信息草稿（必须）

读取 `git diff HEAD`（内容过长时取前 300 行），基于实际变更内容生成提交信息：

```
<类型>: <简洁描述>（不超过 72 个字符）

[可选正文：若变更较复杂，列 1-3 条要点]
```

类型参考：`feat` / `fix` / `refactor` / `docs` / `chore` / `test` / `perf` / `revert`

**输出草稿并等待用户确认或修改，未确认前不执行任何 git 写操作。**

### 步骤 4：执行提交（用户确认后）

根据步骤 1 的三类文件分别处理：

```bash
# 1. Unstaged 文件：需先 add
git add <unstaged 文件列表>

# 2. Untracked 文件：需先 add
git add <untracked 文件列表>

# 3. Staged 文件：已 add，无需重复操作

# 执行提交
git commit -m "<确认后的提交信息>"
```

- 禁止使用 `git add -A` / `git add .`，仅 add 步骤 1 中明确列出的文件。
- 若 pre-commit hook 失败：输出完整错误信息，提示用户修复后重新触发本技能，**不**使用 `--no-verify` 绕过。
- 若 commit 成功：读取 commit hash（`git rev-parse --short HEAD`）并进入步骤 5。

### 步骤 5：收尾提示

```
✅ commit <hash> 完成
   <提交信息首行>

[若步骤 2 选了 B]
📌 提醒：以下能力仍未入知识库，建议在合并前补录：
  - <能力描述>
  可运行：f2s-kb-sync 或 f2s-kb-feat

[若跳过了步骤 2（.Knowledge 不存在）]
💡 项目尚未初始化 Flow2Spec 知识库，如需接入可运行：flow2spec init
```

## 约束

- 禁止使用 `git add -A` / `git add .`，只 add 已确认的变更文件。
- 禁止 `--no-verify`，hook 失败须修复后重试。
- 禁止 `--amend` 已推送的 commit，除非用户明确要求。
- 禁止自动 push，commit 完成后停止。
- 知识库未覆盖时必须提示，但最终是否补录由用户决定（选 B 不阻塞）。
- 提交信息必须经用户确认，不可静默提交。
- 存在 merge conflict 标记时必须终止，不得继续。

## 完成后自检

1. 步骤 1 是否检查了 merge conflict（必须为是）。
2. 是否区分了 staged / unstaged / untracked 三类文件（必须为是）。
3. 是否用了 `git add -A` / `git add .`（必须为否）。
4. 知识库检查是否执行或有明确跳过理由（必须为是）。
5. 步骤 3 是否基于 `git diff` 实际内容生成提交信息（必须为是，而非仅 `--stat`）。
6. 提交信息是否经用户确认（必须为是）。
7. 若 pre-commit 失败，是否跳过了 hook（必须为否）。
8. 若步骤 2 选 B，收尾提示是否包含未补录提醒。
9. 若步骤 2 选 A，是否在用户补录后询问确认再继续（必须为是）。
