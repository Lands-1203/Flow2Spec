---
name: /接入引导
id: opsx-onboard
category: 工作流
description: 引导完成一次完整的 OpenSpec 工作流（带步骤讲解）
---

引导用户完成第一次完整的 OpenSpec 工作流循环。这是一次教学式体验——会在真实代码库中做真实操作，同时讲解每一步。

---

## 前置检查

开始前确认 OpenSpec 是否已初始化：

```bash
openspec status --json 2>&1 || echo "NOT_INITIALIZED"
```

**若未初始化：**

> 当前项目尚未配置 OpenSpec。请先执行 `openspec init`，再回来使用 `/opsx:onboard`。

未初始化则在此停止。

---

## 阶段 1：欢迎

展示：

```
## 欢迎使用 OpenSpec！

我会用你代码库里的一个真实任务，带你走完一次完整的变更周期——从想法到实现。你会边做边熟悉这套工作流。

**我们将完成：**
1. 在代码库中选一个真实的小任务
2. 简短探索问题
3. 创建一个 change（承载本次工作的容器）
4. 按顺序构建 artifact：proposal → specs → design → tasks
5. 按 tasks 实现
6. 归档已完成的 change

**预计时间：** 约 15～20 分钟

先从「找一件事来做」开始。
```

---

## 阶段 2：选择任务

### 代码库分析

扫描代码库，找适合的小改进点。可关注：

1. **TODO/FIXME 注释**：在代码中搜索 `TODO`、`FIXME`、`HACK`、`XXX`
2. **缺失错误处理**：吞掉错误的 `catch`、无 try-catch 的风险操作
3. **无测试的函数**：对比 `src/` 与测试目录
4. **类型问题**：TypeScript 中的 `any`（`: any`、`as any`）
5. **调试残留**：非调试代码中的 `console.log`、`console.debug`、`debugger`
6. **缺失校验**：未做校验的用户输入处理

也可查看最近 git 记录：

```bash
git log --oneline -10 2>/dev/null || echo "No git history"
```

### 呈现建议

根据分析给出 3～4 个具体建议：

```
## 任务建议

根据对代码库的扫描，以下是一些适合入门的小任务：

**1. [最推荐的任务]**
   位置：`src/path/to/file.ts:42`
   范围：约 1～2 个文件，约 20～30 行
   推荐理由：[简短说明]

**2. [第二项]**
   位置：`src/another/file.ts`
   范围：约 1 个文件，约 15 行
   推荐理由：[简短说明]

**3. [第三项]**
   位置：[位置]
   范围：[估计]
   推荐理由：[简短说明]

**4. 其他？**
   告诉我你想做哪类事情。

你更想选哪一个？（可报序号或描述自己的任务）
```

**若未找到合适项**：改为询问用户想做什么：

> 在代码库中没发现明显的小改进点。有没有你一直想加或想修的小功能？

### 范围约束

若用户选的任务或描述的范围过大（大功能、多天工作量）：

```
这个任务很有价值，但对第一次走 OpenSpec 流程来说可能偏大。

学习工作流时，任务越小越好——这样能完整走完一轮而不卡在实现细节里。

**可选：**
1. **拆小一点**——[他们的任务] 里最小可交付的一块是什么？或许先做 [具体一块]？
2. **换一个**——从上面其他建议里选，或换一个更小的任务？
3. **坚持做这个**——若你确实想做这个，也可以，只是会花更长时间。

你更倾向哪种？
```

若用户坚持，可尊重选择；这是软性约束。

---

## 阶段 3：探索演示

选定任务后，简短演示探索模式：

```
在创建 change 之前，先快速展示一下**探索模式**——用来在定方向之前把问题想清楚。
```

花 1～2 分钟查看相关代码：

- 阅读涉及的文件
- 若有帮助可画简单 ASCII 图
- 记下注意事项

```
## 快速探索

[你的简短分析：发现了什么、有哪些注意点]

┌─────────────────────────────────────────┐
│   [可选：若有帮助可画 ASCII 图]           │
└─────────────────────────────────────────┘

探索模式（`/opsx:explore`）就是做这类思考——在实现前先调查。需要理清问题时可随时用。

接下来我们创建一个 change 来承载这次工作。
```

**暂停**：等待用户确认后再继续。

---

## 阶段 4：创建 Change

**说明：**

```
## 创建 Change

在 OpenSpec 里，「change」是一块工作相关的所有思考和计划的容器。它位于 `openspec/changes/<name>/`，里面放的是你的 artifact：proposal、specs、design、tasks。

我为这次任务创建一个。
```

**执行**：用推导出的 kebab-case 名称创建 change：

```bash
openspec new change "<derived-name>"
```

**展示：**

```
已创建：`openspec/changes/<name>/`

目录结构：
openspec/changes/<name>/
├── proposal.md    ← 为什么要做（空，待填写）
├── design.md      ← 怎么实现（空）
├── specs/         ← 详细 requirement（空）
└── tasks.md       ← 实现清单（空）

接下来填第一个 artifact：proposal。
```

---

## 阶段 5：Proposal

**说明：**

```
## Proposal

Proposal 记录我们**为什么**做这次变更、**大致要改什么**。是这块工作的「elevator pitch」。

我根据任务起草一份。
```

**执行**：起草 proposal 内容（先不保存）：

```
这是 proposal 草稿：

---

## Why（为什么）

[1～2 句说明问题/机会]

## What Changes（改什么）

[要点列出会有哪些变化]

## Capabilities

### New Capabilities
- `<capability-name>`：[简短描述]

### Modified Capabilities
<!-- 若涉及修改已有行为 -->

## Impact（影响）

- `src/path/to/file.ts`：[会怎么改]
- [其他涉及文件]

---

这样是否表达清楚意图？确认或修改后我们再保存。
```

**暂停**：等待用户确认或反馈。

确认后保存 proposal：

```bash
openspec instructions proposal --change "<name>" --json
```

然后将内容写入 `openspec/changes/<name>/proposal.md`。

```
Proposal 已保存。这是你的「为什么」文档，理解深化后随时可以回来改。

下一步：specs。
```

---

## 阶段 6：Specs

**说明：**

```
## Specs

Spec 用可测试的、精确的语言定义我们**要做什么**。采用 requirement/scenario 格式，让预期行为一目了然。

对这种小任务，可能只需要一个 spec 文件。
```

**执行**：创建 spec 文件：

```bash
mkdir -p openspec/changes/<name>/specs/<capability-name>
```

起草 spec 内容：

```
这是 spec：

---

## ADDED Requirements

### Requirement: <名称>

<系统应做什么的描述>

#### Scenario: <场景名>

- **WHEN** <触发条件>
- **THEN** <预期结果>
- **AND** <若有额外结果>

---

这种 WHEN/THEN/AND 格式让 requirement 可被直接当测试用例读。
```

保存到 `openspec/changes/<name>/specs/<capability>/spec.md`。

---

## 阶段 7：Design

**说明：**

```
## Design

Design 记录**怎么实现**——技术决策、取舍、思路。

小变更可以写得很短，没问题；不是每个变更都需要长篇设计。
```

**执行**：起草 design.md：

```
这是 design：

---

## Context（背景）

[当前状态简要说明]

## Goals / Non-Goals

**Goals：**
- [我们要达成的目标]

**Non-Goals：**
- [明确不在范围内的]

## Decisions（决策）

### Decision 1：[关键决策]

[做法与理由]

---

对小任务来说，这样就能抓住关键决策，又不过度设计。
```

保存到 `openspec/changes/<name>/design.md`。

---

## 阶段 8：Tasks

**说明：**

```
## Tasks

最后把工作拆成实现任务——带勾选的清单，驱动 apply 阶段。

任务应小、清晰、顺序合理。
```

**执行**：根据 specs 和 design 生成 tasks：

```
这是实现任务：

---

## 1. [类别或文件]

- [ ] 1.1 [具体任务]
- [ ] 1.2 [具体任务]

## 2. 验证

- [ ] 2.1 [验证步骤]

---

每个勾选在 apply 阶段就是一块工作。准备好实现了吗？
```

**暂停**：等待用户确认可以开始实现。

保存到 `openspec/changes/<name>/tasks.md`。

---

## 阶段 9：Apply（实现）

**说明：**

```
## 实现

现在按任务逐项实现，完成一项勾一项。我会说明正在做哪一项，并偶尔提到 spec/design 如何影响做法。
```

**执行**：对每个任务：

1. 说明：「正在做任务 N：[描述]」
2. 在代码库中完成对应修改
3. 自然引用 spec/design：「spec 里要求 X，所以我在做 Y」
4. 在 tasks.md 中勾选：`- [ ]` → `- [x]`
5. 简短状态：「✓ 任务 N 完成」

讲解保持轻量，不必逐行解释代码。

全部任务完成后：

```
## 实现完成

所有任务已完成：
- [x] 任务 1
- [x] 任务 2
- [x] ...

变更已实现！还剩一步：归档。
```

---

## 阶段 10：归档

**说明：**

```
## 归档

当 change 完成后，我们把它归档。这会把它从 `openspec/changes/` 移到 `openspec/changes/archive/YYYY-MM-DD-<name>/`。归档时，变更中的 spec 会同步到 **openspec/specs**，该目录即项目**官方能力规范**的存放位置。

归档后的 change 成为项目的决策历史，之后随时可以翻出来理解「当时为什么这样设计」。
```

**执行：**

```bash
openspec archive "<name>"
```

**展示：**

```
已归档至：`openspec/changes/archive/YYYY-MM-DD-<name>/`

该 change 已成为项目历史的一部分：代码在代码库中，决策记录被保留。
```

---

## 阶段 11：回顾与下一步

```
## 恭喜！

你刚完成了一轮完整的 OpenSpec 流程：

1. **Explore** - 把问题想清楚
2. **New** - 创建 change 容器
3. **Proposal** - 记录 WHY
4. **Specs** - 详细定义 WHAT
5. **Design** - 决定 HOW
6. **Tasks** - 拆成步骤
7. **Apply** - 实现
8. **Archive** - 保留记录

同样的节奏适用于任何规模的变更——小修复或大功能都可以。

---

## 命令速查

| 命令 | 作用 |
|------|------|
| `/opsx:explore` | 在工作前/工作中理清问题 |
| `/opsx:new` | 新建 change，按步骤建 artifact |
| `/opsx:ff` | 快进：一次性建好所有 artifact |
| `/opsx:continue` | 继续处理已有 change |
| `/opsx:apply` | 按 change 的任务实现 |
| `/opsx:verify` | 校验实现与 artifact 是否一致 |
| `/opsx:archive` | 归档已完成的 change |

---

## 接下来？

用 `/opsx:new` 或 `/opsx:ff` 做一个你真正想做的需求吧，节奏你已经熟悉了！
```

---

## 中途退出

### 用户想中途停止

若用户表示要停、要暂停或显得不想继续：

```
没问题！你的 change 已保存在 `openspec/changes/<name>/`。

之后接着做可以：
- `/opsx:continue <name>` - 继续创建 artifact
- `/opsx:apply <name>` - 直接实现（若已有 tasks）

进度不会丢，随时可以回来。
```

从容结束，不施压。

### 用户只想要命令速查

若用户说只想看命令或跳过教程：

```
## OpenSpec 速查

| 命令 | 作用 |
|------|------|
| `/opsx:explore` | 理清问题（不改代码） |
| `/opsx:new <name>` | 新建 change，一步步来 |
| `/opsx:ff <name>` | 快进：一次性建好所有 artifact |
| `/opsx:continue <name>` | 继续已有 change |
| `/opsx:apply <name>` | 实现任务 |
| `/opsx:verify <name>` | 校验实现 |
| `/opsx:archive <name>` | 完成后归档 |

试试 `/opsx:new` 开第一个 change，或 `/opsx:ff` 快速推进。
```

从容结束。

---

## 约束

- 在关键节点（探索后、proposal 草稿后、tasks 后、归档后）遵循 **说明 → 执行 → 展示 → 暂停** 的模式
- 实现阶段讲解保持轻量，教但不啰嗦
- 即使变更很小也**不跳过阶段**，目标是教会工作流
- 在标出的节点暂停等待确认，但不要过度暂停
- **优雅处理退出**，不施压用户继续
- **用真实代码库任务**，不模拟、不用假例子
- **温和引导范围**，倾向小任务但尊重用户选择

