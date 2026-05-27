---
description: Flow2Spec 统一知识库入口，按 .Knowledge 渐进式读取
---

# Flow2Spec 统一入口规则

本项目知识库已统一到 `.Knowledge/`，请按以下顺序读取，避免无范围检索。

## 项目根 CLI 开关（必须按需读取）

业务仓库**项目根** `flow2spec.config.json`（`flow2spec init` 在文件缺失时从包模板补齐）含布尔字段 **`subAgent`**、**`switchAgentVerification`**（**切换 agent 校验**），默认 `false`。执行任意 **`f2s-*` 技能**或与 Flow2Spec 初始化相关的说明前，须读取该文件；技能或规则中凡写「仅当 `subAgent` / `switchAgentVerification` 为 true」的步骤，**必须按文件实际值决定是否执行**；缺失字段或文件不存在时均视为 `false`。

> **`init` 与择路**：包模板 **`templates/rules/f2s-flow2spec-unified-entry.md`** 经 **`flow2spec init`** 写入业务仓库配置根 **`rules/f2s-flow2spec-unified-entry.*`**，并（去 frontmatter）镜像 **`.codex/topics/f2s-flow2spec-unified-entry.md`**；两处正文同源，按需读一处即可。技能引「统一入口」时，在 **Codex** 以 **`.codex/topics/f2s-flow2spec-unified-entry.md`** 为准。

### 两字段语义（模板约定）

- **`subAgent`**：`f2s-*` 技能若规定某步骤「用子 agent 执行」，则 **`true`** 时按技能使用子 agent，**`false`** 时在主 agent 内完成。用户可在对话中要求「**仅当**本项为 **`true`** 时，由主 agent **动态判断**哪些子任务适合交给子 agent」——**仅当配置为 `true` 时该要求有效**；配置为 `false` 时凡依赖拆子 agent 的该段说明**不生效**，全部在主 agent 完成。**各 `f2s-*` 在工作哪一阶段必须或建议使用子 agent** 由包内技能正文逐步约定，**当前尚未在模板层给出统一阶段表**；以技能为准并受本项约束。
- **`switchAgentVerification`（切换 agent 校验）**：落盘或变更后的**验证/复核**（对照清单、diff、自检）**不是**「一律在主 agent」；默认以**落盘侧所在 agent 为「当前 agent」**，在该会话内完成校验（**子 agent 落盘的就在子 agent 内验，主 agent 落盘的就在主 agent 内验**）。**仅当**① 配置 **`switchAgentVerification` 为 `true`**，**且** ② **当前 `f2s-*` 技能正文**对该步骤**明确写出**「当 **`switchAgentVerification`** 为 **`true`**」时，才启用**交叉校验**：**子 agent 落盘的 → 由主 agent 校验**；**主 agent 落盘的 → 由子 agent 校验**（**须**已存在子 agent 会话，即 **`subAgent` 为 `true`** 且实际拆出子任务；若 **`subAgent` 为 `false`**，无子侧可承接，**「主落盘→子验」不发生**，校验**全部在主 agent 内**完成）。配置为 `false`、或技能未写依赖本项、或用户仅泛泛要求「给对方验」的：**不**启用交叉，仍在**落盘侧 agent**内完成验证。

### Git worktree 与子任务工作目录卫生（`subAgent: true` 或并行子任务时必读）

部分环境会为子 agent / 并行尝试创建 **独立 `git worktree`** 或等价隔离目录。规则如下：

1. **谁创建谁收尾**：子侧创建则子侧在返回前尽量清理；若子会话已结束无法清理，**主 agent 合并结果后**必须执行清理，**禁止**依赖「稍后自动回收」。
2. **收尾动作（必须）**：对**仅为本次子任务**添加的 worktree，在合并或丢弃该子任务结果后执行 `git worktree remove <path>`（工作区干净仍失败时再用 `git worktree remove --force <path>`，**须确认**该路径无他人未提交修改）；随后 `git worktree list` 自检，**禁止**留下已知孤儿路径。
3. **中断 / 用户换题前**：若本会话曾添加 worktree，在结束前**必须**完成上述移除或在 `task.md`「## 备注」写明残留路径与删除命令，并视情况写入 **`user-todos.md`** 请用户本地执行（见 `f2s-task`）。
4. **禁止**：子任务已结束、主分支已继续开发，仍长期保留仅用于尝试的 worktree 目录（易造成混淆提交、磁盘堆积）。

## 读取顺序（必须）

1. 先读 `.Knowledge/manifest-routing.json`，优先按 `taskToTopicRules` 路由；按需根据 `matcherPath` 读取 matcher 分片获取 `includeAny` 关键词；无法命中时进入补召回阶段。
   - 若命中主题在 `topicDependencies` 中存在依赖，先读依赖主题，再读主主题。
   - 路由清单仅通过 `f2s-*` 技能流程维护，不依赖额外 CLI 子命令。
2. `.Knowledge/index.md` 按需读取，仅用于确认主题语义与边界。
3. 再读 `.Knowledge/topics/<topic>.md`（**路由摘要**：主题 id、路径约定、下一步指针）；若主题为 **`implement-tech-design`** 或 **`stock-docs-vs-req-docs`**，**必须继续读取**配置根 **`rules/f2s-implement-tech-design.*` / `rules/f2s-stock-docs-vs-req-docs.*` 全文**作为执行依据（`.Knowledge/topics` 内同名文件不重复长文）。
4. 若需要背景，再读 `.Knowledge/stock-docs/<doc>.md`。
5. 仅在前四步不足时下钻业务源码。
6. 命中后必须执行 `match -> expand -> verify -> act`：
   - `match`：先取主候选；
   - `expand`：展开 `topicDependencies`，并保留次高候选做补充校验；
   - `verify`：执行前做缺口检查（关键主题/边界/上下文是否缺失）；
   - `act`：仅在置信度足够时执行；低置信度必须先澄清。
7. 仅在以下条件之一成立时，允许执行跨 matcher 全量补检索（top-k）：
   - `taskToTopicRules` 无命中；
   - 主候选与次候选分差过小（低置信度）；
   - 缺口检查失败（关键主题/依赖/上下文缺失）；
   - 用户明确要求“全量检查/不要遗漏”。

## 任务分流

- 技术方案实现：先读 `.Knowledge/topics/f2s-implement-tech-design.md`（摘要），再读 **`rules/f2s-implement-tech-design.*` 全文**；需求文档默认位于 `.Knowledge/req-docs/`。
- 目录边界判断：先读 `.Knowledge/topics/f2s-stock-docs-vs-req-docs.md`（摘要），再读 **`rules/f2s-stock-docs-vs-req-docs.*` 全文**。

## 机读事实源口径（规则层）

- `taskToTopicRules`：任务路由第一优先级。
- `taskToTopicRules[].matcherPath`：匹配词分片直链路径，按需读取单个 matcher 文件。
- `taskToTopicRules[].matcherId`：matcher 的稳定标识，需与 matcher 分片内 `id` 一致。
- `topicDependencies`：主主题命中后先加载依赖主题。
- `matcherPath(includeAny)`：任务关键词匹配词表。
- `fallbackTopic`：任务与关键词都未命中时必须读取，但仅作低置信度兜底，不是最终执行依据。
- `.Knowledge/manifest-routing.json + matcherPath 分片文件` 是机读事实源（关键词仅在 `matchers/*.json`）。
- `.Knowledge/index.md` 不是机读事实源，仅作人读导航与语义边界校验。
- 进入 `fallbackTopic` 后，必须先补召回或澄清，再决定是否执行改动。

## 知识缺口与对策（分场景）

| 情况 | 对策 |
| --- | --- |
| **1a 库里有文档但未配路由** | 用 `f2s-ctx-build` / `f2s-kb-sync` / `f2s-doc-add` 补 `taskToTopicRules`、`matcherPath` 分片、`topicPaths`；扩充 `includeAny` 覆盖用户常用说法。Agent 侧：走 `fallbackTopic` 分诊并提示「需补路由」，**不**靠全仓扫文件代替配置。 |
| **1b 命中了但上下文不够** | 先 `expand`（`topicDependencies` + 次高候选），再 `verify` 点名缺哪份 `stock-docs`/`req-docs` 或哪段 topic；仍不足则 **向用户要文档或路径**，不要无门槛跨 matcher 全量补检索。**Agent 若需下钻源码**：须先对用户做**可见的缺口说明**（已读 KB、缺什么、拟读哪 1～2 个文件），见 **`f2s-knowledge-preflight`**「缺口闸门」；**禁止**无说明地连续 `Grep`/乱序探源。 |
| **2 库里没有对应文档** | 一次读完 routing + 已命中 matcher + 相关 topic 后，在回复中 **明确承认知识库无覆盖**，再选：下钻业务代码 / 请用户补充 `req-docs` 或 PRD。**禁止**用反复读清单假装「再找一遍就会有」。**下钻源码前**同样须满足 **`f2s-knowledge-preflight`**「缺口闸门」的可见说明。 |
| **2a 反复读清单耗 token** | **同一任务线内** `manifest-routing.json` 视为稳定快照：再次全文读取须说明理由（例如用户声明已通过 `f2s-ctx-build` / `f2s-kb-sync` / `f2s-doc-add` 等更新路由或知识、或**手动编辑**了 manifest/matcher）。**勿将**仅执行 **`flow2spec init`** 等同于「业务知识库已更新」：`init` 以模板补齐、配置根落盘与包级路由结构对齐为主；**stock-docs / req-docs、topics 路由摘要、matchers 词条**由 **`f2s-*` 技能流程**维护；**包模板 `templates/rules/*.md`** 为 Flow2Spec 规则事实源，`init` 同步到配置根 **`rules/*.md`**（或等价扩展名）并镜像 **`.codex/topics/*.md`**（条数与包模板一致，含统一入口与专题长文）。只读 **当前规则对应的单个** `matcherPath`；不要为枚举而遍历整个 `matchers/` 目录。`index.md` 仅在需核对主题语义时打开，禁止与 manifest 交替「刷清单」。 |

### 知识缺口的执行层要点（避免「表里有写、行为没做」）

- **「向用户说明」「明确承认无覆盖」必须是用户可见的自然语言**，不得仅在内部分析或工具链中隐含带过；细则与停步条件见 **`f2s-knowledge-preflight`**（缺口闸门、探索次数上限）。
- **禁止**在命中 **1b / 2** 后，未做上述可见说明便进入「多文件 + 依赖目录」的链式探源；每出现一个新的「入口符号」就再 `Grep` 一轮，属于典型反模式。
- **HTTP 状态、错误正文、重定向与否**等事实，**不得以训练数据或他库经验代答**；须以当前仓库内**本次已读到的实现**为准。

## 禁止项

- **`templates/` 可下发约束**（经 `init` 会克隆到任意业务仓）：技能/规则/知识模板正文中的示例须**中性**——勿写特定业务域名称、单一组织 npm 包名、仅 Flow2Spec 产品仓存在的 `docs/` 路径；用 `<能力>`、`src/<模块>/` 等占位。
- 使用 `git worktree` 或隔离目录跑子任务后，**禁止**在未 `git worktree remove` / 未交接删除命令的情况下结束会话（见上文「Git worktree 与子任务工作目录卫生」）。
- 未查看 `.Knowledge/manifest-routing.json` 前，禁止进行全仓无范围扫描；`.Knowledge/index.md` 在需确认主题语义时再读，禁止与 manifest 交替重复读取以代替决策。
- 禁止把 `stock-docs` 作为直接编码输入文档；按方案实现应使用 `req-docs`。
- 禁止把 `fallbackTopic` 当作最终命中直接实施改动。
- 禁止在不满足触发门槛时执行跨 matcher 全量补检索。
