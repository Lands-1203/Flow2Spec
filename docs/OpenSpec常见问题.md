# OpenSpec 常见问题

本文档整理使用 OpenSpec 过程中的常见疑问与简要解答。

---

## 归档与路径

### 使用 `/归档`（opsx:archive）时，是怎么判断我是否需要「同步到主规范」的？

**判断依据只有一条**：该变更目录下**是否存在 delta spec**。

- **如何判断「有 delta spec」**：检查 `openspec/changes/<变更名>/specs/` 下是否存在至少一个能力子目录及其中的 `spec.md`，即是否存在形如 `openspec/changes/<变更名>/specs/<capability>/spec.md` 的文件。有则视为「需要同步到主规范」的候选；没有则视为「无 delta spec」。

**后续行为**：

- **若没有 delta spec**：不询问同步，直接执行归档（只做 `mv` 到 `openspec/changes/archive/YYYY-MM-DD-<name>/`）。主规范不会被改动。
- **若有 delta spec**：归档**之前**会先对比每个 delta 与主 spec（`openspec/specs/<capability>/spec.md`），给出会应用哪些变更（新增/修改/删除/重命名）的汇总，然后**由你选择**：
  - 「立即同步（推荐）」：先执行与 `/opsx:sync` 相同的逻辑，把 delta 合并进主规范，再执行归档。
  - 「不同步直接归档」：不改主规范，只把变更目录挪到 archive。
  - 若你之前已经同步过，还可能看到「立即归档」「仍要同步」「取消」等选项。

**总结**：是否同步到主规范**不是命令自动替你决定的**——命令只根据「有没有 delta spec」决定**要不要问你**；若问了，**选「立即同步」才会写主规范**，选「不同步直接归档」则只归档、不动 `openspec/specs`。

---

### 执行 `openspec archive "<name>"` 后，change 会到哪里？

会移动到 `**openspec/changes/archive/YYYY-MM-DD-<name>/**`，作为项目决策历史保留。  
该描述是正确的。  
此外，**CLI 默认会把变更中的 spec 同步到主规范**（更新 `openspec/specs`）。若只想归档、不更新主规范，可加参数：`openspec archive "<name>" --skip-specs`。

### 为什么我归档后，spec 在 `openspec/changes/archive/.../specs` 而不是 `openspec/specs`？

因为当前用的是**「整目录移动」的归档方式**（例如按 `/opsx:archive` 的步骤执行 `mv`），只把变更目录移到了 archive，**没有执行「同步到主 spec」这一步**。  
若使用 `**openspec archive "<name>"**` 命令归档，CLI 会默认把变更里的 spec 合并进 `**openspec/specs**`。  
若已用手动 mv 归档，仍希望主规范有内容，可以：先对变更执行 `/opsx:sync` 再归档，或手动把归档里的 spec 复制/合并到 `openspec/specs`。

### 什么情况下内容会进 `openspec/specs`？

- **用官方归档命令**：执行 `openspec archive "<change-name>"` 时，默认会同步更新 `openspec/specs`。
- **先同步再归档**：在归档前执行 `/opsx:sync`，把变更的 delta spec 同步到 `openspec/specs`，再用当前流程做「mv 归档」；此时主规范里已有内容。

---

## 概念：Specs 与主规范

### `openspec/specs` 是做什么的？

`**openspec/specs**` 是 **主规范目录**，用来存放**已采纳、已归档**的能力规范，是项目对能力的「权威」描述来源。

- 按**能力（capability）**分子目录，例如 `openspec/specs/ticket-stub-activity/spec.md`。
- 描述该能力的接口、行为、错误码等**约定**，供后续开发、评审、对接使用。
- 变更里的 spec 在**归档时**（或手动同步时）会合并到这里，形成主 spec。

### Specs 是什么意思？

**Spec** = Specification（规范 / 规格说明）。  
在 OpenSpec 里特指 **能力规范**：用文档把「某个能力要做什么」写清楚。

- 一个 spec 对应一个**能力（capability）**。
- 内容可包括：目的与范围、接口/行为约定（请求、响应、错误码）、可测试的 Requirements 与 Scenarios（如 WHEN/THEN）。
- **主 spec** 在 `openspec/specs/<capability>/spec.md`；**变更里的 spec** 在 `openspec/changes/<name>/specs/`，可能是新建能力或对已有能力的 delta（ADDED/MODIFIED/REMOVED）。

### 「delta spec」是什么意思？

**Delta spec** = **增量规范**，指「**相对主规范的改动**」，而不是一整份完整规范。

- **主规范（main spec）**：在 `openspec/specs/<capability>/spec.md`，表示该能力**当前生效**的完整约定。
- **Delta spec**：在 `openspec/changes/<变更名>/specs/<capability>/spec.md`，只写**本变更**要对主规范做的**增减**，例如：
  - **ADDED Requirements**：新增的条款
  - **MODIFIED Requirements**：对已有条款的修改（需写出完整修改后内容）
  - **REMOVED Requirements**：要删掉的条款（需注明原因与迁移说明）
  - **RENAMED Requirements**：重命名（FROM:/TO:）

这样做的目的：多个变更可以**分次、增量**地更新主规范，由 **opsx-sync** 或归档时选「立即同步」把 delta **合并**进主 spec，而不是整份覆盖。所以「delta」= 差异/增量。

### 什么情况下不会存在增量规范？

**不会存在 delta spec** = 变更目录下没有 `openspec/changes/<变更名>/specs/`，或该目录下没有任何 `spec.md` 文件。常见情况包括：

1. **本次变更不涉及「能力约定」的增减**：例如修 bug（行为不变、只修实现）、重构、依赖升级、配置项调整等。Proposal 里 **New Capabilities** 与 **Modified Capabilities** 都为空，因此不会去写 specs，也就没有 delta spec。
2. **团队选择不写 spec**：即使用 spec-driven schema，若认为本次改动不需要落成「对外的能力规范」（例如纯内部逻辑、一次性活动），可以只写 proposal、design、tasks，不创建 `specs/<capability>/spec.md`。
3. **使用的 schema 没有 specs 环节**：若工作流本身不包含「specs」这类 artifact，变更里就不会有 specs 目录。
4. **变更刚开始、还没写到 specs**：按顺序创建 artifact 时，若只完成了 proposal（和 design），尚未创建 specs，则 `specs/` 可能不存在或为空。

**总结**：只要本次变更**既没有新增能力、也没有修改已有能力的规范**，或**选择不写 spec**，就不会产生增量规范；归档时也就不会出现「是否同步到主规范」的询问，只会做目录移动归档。

### OpenSpec 什么时候会去读取主规范（`openspec/specs`）？

- **写 Proposal 时**：填「Modified Capabilities」时需要先看 `openspec/specs/` 里已有的 capability 名称，以便正确引用并生成 delta spec。
- **执行 Sync 时**：把变更的 delta spec 合并进主 spec 时，会读取 `openspec/specs/<capability>/spec.md` 的当前内容再做合并。
- **用 CLI 归档时**：执行 `openspec archive` 且未加 `--skip-specs` 时，CLI 会读（并写）主规范以更新主 spec。

**一般不会读主规范的时候**：Apply（实现）和 Verify（校验）时，读的是**当前变更**下的 proposal、specs、design、tasks，不要求读 `openspec/specs`。

---

## 工作流：Proposal

### openspec 的 proposal 是做什么的？

在 **spec-driven** 下，**proposal** 是变更里的**第一个 artifact**，对应 `openspec/changes/<name>/proposal.md`。

作用：说清楚**为什么要做这次变更**（Why），而不是「怎么做」（How）。

常见章节：

- **Why**：一两句话说明要解决什么问题、为什么是现在做。
- **What Changes**：要点列表，会新增/修改/删除什么；若有破坏性变更标 BREAKING。
- **Capabilities**：**New** 列出新增能力（每个会对应一个 spec）；**Modified** 列出要改的已有能力（需要 delta spec）。这一块会驱动后续的 spec 与设计。
- **Impact**：影响的代码、API、依赖或系统。

填好 proposal 后才会解锁 design 和 specs；获取写作说明可用：`openspec instructions proposal --change "<name>"`。

### 我只要调用了 opsx-new，不就一定会创建增量规范吗？

**不一定。** 调用 **opsx-new** 只会创建变更目录并展示第一个 artifact（通常是 proposal），**不会自动生成 delta spec**。

是否会有增量规范，取决于两件事：

1. **Proposal 里是否写了能力**
  在 spec-driven 下，只有 proposal 的 **Capabilities** 里填了 **New Capabilities** 或 **Modified Capabilities** 时，后续才会为每个 capability 创建 `specs/<capability>/spec.md`（即 delta spec）。若这两项都为空（例如本次只是修 bug、重构、改配置，不新增也不修改对外能力），就不会有 specs 可写，也就**不会产生增量规范**。
2. **你是否按流程创建了 specs 这个 artifact**
  即使 proposal 里列了能力，也要在 **opsx-continue** 或 **opsx-ff** 时**实际创建 specs** 并写入 `specs/<capability>/spec.md`，变更里才会有 delta spec。若你只写了 proposal 和 design 就停手，或跳过了 specs 步骤，变更目录下仍然不会有增量规范。

**总结**：opsx-new 只是「开了一个变更」；有没有增量规范，要看 proposal 是否包含能力、以及你是否创建并写入了 specs artifact。

---

## 主规范 vs 全局 Rules/Skills

### 主规范（openspec/specs）是否能完全替代全局 skill 和 rules？他们能力是否重复？

**不能完全替代，且职责不同，不重复。**


| 维度          | 主规范（openspec/specs）                                      | 全局 Rules / Skills（`rules/`、`skills/`；Cursor 下即 `.cursor/rules`、`.cursor/skills`）       |
| ----------- | -------------------------------------------------------- | ----------------------------------------------------- |
| **定位**      | 项目**能力契约**：约定「系统应如何表现」（Requirement + Scenario，可当测试/验收依据） | Cursor **按需上下文**：约定「实现时怎么用、项目约定是什么、示例在哪」              |
| **内容形态**    | 每条 capability 一份 spec，写 SHALL/MUST、WHEN/THEN             | Rules 按**路径（globs）加载约束；Skills 按问题/触发词**加载知识、步骤、方法表、示例 |
| **主要用途**    | 归档留档、同步变更、实现与验收时对照「做什么」                                  | 编码时 AI 打开某目录或某问题时，自动注入对应约束与知识                         |
| **谁在什么时候用** | 人/实现/测试对照「规范」；OpenSpec sync/archive 读写                   | Cursor 在对话中按路径或问题**自动加载**，不主动读 openspec/specs         |


**结论**：

- **主规范** = 规范层：写清「能力做什么、在什么情况下得到什么结果」，偏契约与可测试性，**不负责**「在 Cursor 里何时加载、按什么触发」。
- **Rules/Skills** = 上下文层：拆成多条 Rule、多个 Skill，用 globs 和 description 控制**何时**被 Cursor 加载，并补充项目约定、目录、示例等，**不负责** delta/sync/archive 的规范工作流。

二者可以**互补**：例如主规范写「票根活动 SHALL(应) 在团满时允许领取优惠券」；Skill 写「实现票根活动时见 `openspec/specs/ticket-stub-activity/spec.md`，接口放 `src/functions/20260202-ticket-stub/`，错误码见 xxx」。所以**不是重复**，而是**不同层次**——主规范管「约定是什么」，Rules/Skills 管「在 Cursor 里怎么用、按什么加载」。

---

