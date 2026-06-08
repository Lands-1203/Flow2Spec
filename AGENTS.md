# Flow2Spec 项目入口

本文件由 `flow2spec init` 写入仓库根 **`./AGENTS.md`**（完整条令，供 [Codex 自动发现](https://developers.openai.com/codex/guides/agents-md)）。**`./.codex/AGENTS.md`** 仅为指向本文件的短说明，不含完整规则。你正在使用 Flow2Spec 的项目中工作；知识库在 **`./.Knowledge/`**，请渐进式读取，避免一次性加载大量无关文档。

## ⚠️ f2s-* 技能前置强制步骤

**执行任何 `f2s-*` 技能的第一个动作，必须先用 Read 工具读取仓库根目录文件 `./flow2spec.config.json`**，获取 `subAgent` 与 `switchAgentVerification` 的实际值，再决定后续编排方式。

```
必须执行：Read("flow2spec.config.json")  ← 相对仓库根；技能正文任何步骤之前
```

**禁止在未读该文件的情况下进入技能正文的任何执行步骤。**

## Flow2Spec 项目开关（`./flow2spec.config.json`；缺失时由 `flow2spec init` 补齐）

**`flow2spec init` 的定位**：把 Flow2Spec 运行结构写入当前仓库——包括 **`./.Knowledge/`**（含路由结构、快照等）、仓库根 **`./AGENTS.md`**（完整）、**`.codex/AGENTS.md`**（指针）及 **`./.codex/`**（**`./.codex/skills/`**、**`./.codex/topics/*.md`** 等），**不负责**撰写业务 **`./.Knowledge/stock-docs/`**、**`./.Knowledge/topics/`** 正文或替代 **`f2s-*` 技能**；即 **目录落盘 / 形态对齐**，不是「知识库升级命令」（升级见 **`f2s-kb-upgrade`** 技能）。

执行任意 **`f2s-*` 技能**前，必须读取 `./flow2spec.config.json` 中的布尔字段（缺省或文件不存在均视为 `false`）。下表由 **最近一次 `flow2spec init`** 根据当时配置写入，**以磁盘上的文件为准**。

| 配置项 | 当前值 | 说明 |
| --- | --- | --- |
| `subAgent` | true | 技能规定用子 agent 的步骤：`true` 执行，`false` 全在主会话。用户「动态判断谁用子 agent」**仅当本项为 true** 时有效，否则该说明失效。各 f2s 阶段细则见技能正文（模板未统一写死）。 |
| `switchAgentVerification` | true | **切换 agent 校验**：`false` 时落盘侧同会话内验（子写子验、主写主验）。`true` 且技能写明依赖本项时交叉验：子落盘→主验，主落盘→子验；无子 agent（如 `subAgent` false）则主落盘→子验不发生、全主验。旧键 `subAgentVerification` 仍可被解析。 |
| `intentRecognition` | false | `true` → 高置信操作意图按 `f2s-intent-routing` 自动进入对应 `f2s-*` 技能；`false` → 不做自动分流，按普通对话与显式命令处理。讨论/评估/低置信输入不自动调用技能。 |
| `changeTracking.feat` | true | `true` → `f2s-kb-feat` **步骤 0** 必须创建/续作 `.task/active/` 变更追踪任务；`false` → 跳过，不创建 `.task/` 目录。 |
| `changeTracking.fix` | false | `true` → `f2s-kb-fix` **步骤 0** 必须创建/续作 `.task/active/` 变更追踪任务；`false` → 跳过。 |
| `changeTracking.implement` | true | `true` → `f2s-implement-tech-design` **步骤 2.5** 写入任务清单、**步骤 5** 归档完成；`false` → 跳过。 |

### `subAgent` 与 `switchAgentVerification`（语义与上表一致；以磁盘配置为准）

- **`subAgent`**：`f2s-*` 技能若写明某步「用子 agent 执行」，**`true`** 时按技能使用子 agent，**`false`** 时在主会话内完成。用户可说明「**仅当** `subAgent` 为 **`true`** 时，由主 agent **动态判断**哪些子任务适合交给子 agent」——**仅当配置为 `true` 时该说明有效**；为 **`false`** 时该段要求**自动失效**，不得拆子 agent。**各技能在何阶段用子 agent** 由技能正文约定；若技能未写明，则不默认拆子。
- **`switchAgentVerification`（切换 agent 校验）**：**不是**「校验一律在主会话」；**`false` 或未启用交叉规则时**：谁在会话里**落盘**，验证与复核（对照清单、diff、自检）**就在该 agent 会话内**完成（子写子验、主写主验）。**`true` 且** 当前 **`f2s-*` 技能正文**写明依赖本项时，启用**交叉校验**：**子 agent 落盘的 → 主 agent 验**；**主 agent 落盘的 → 子 agent 验**（无子 agent 时，如 **`subAgent` 为 `false`**，则「主落盘→子验」不发生，**全在主会话**验）。

### `intentRecognition`（意图识别自动分流）

- **`intentRecognition: false` 或字段不存在**：不启用自动分流；仅用户显式 `$f2s-*` / 明确要求执行某技能时进入对应技能。
- **`intentRecognition: true`**：按 **`./.codex/topics/f2s-intent-routing.md`** 判断高置信操作意图；询问、讨论、评估、低置信、多意图冲突、当前流程未结束等场景不得自动切换技能，必须先回答或澄清。

## 全局约束

1. **必须先读机器索引**：优先读取 **`./.Knowledge/manifest-routing.json`** 做主题路由；按需依据 `taskToTopicRules[].matcherPath` 读取对应 matcher 分片（单文件，路径形如 **`./.Knowledge/matchers/<id>.json`**）取匹配词；无法命中时进入补召回阶段。
   - 若存在 `taskToTopicRules`，优先按任务规则路由主题。
   - 若命中主题含 `topicDependencies`，先读依赖主题再读主主题。
   - 若存在 `topicMetadata`，仅将其中 `primary` / `tags` 作为阅读预期：`config` 关注配置项 / 开关 / 默认值；`policy` 关注正文中的必须 / 禁止 / 门禁 / 流程约束；`feature` 作为已落地能力背景；`module` 作为目录 / 包 / 模块边界背景。`topicMetadata` 不参与 matcher 命中，不决定是否读取 topic，不改变执行强制性；无明确分类证据时不写 metadata，并在摘要列为待确认。
   - `manifest` 仅通过 `f2s-*` 技能流程维护，不假设存在额外 CLI 命令。
2. **人工索引按需读取**：仅在需要校验主题语义与边界时读取 **`./.Knowledge/index.md`**。
   - `index.md` 不是机读事实源，仅承担人读导航与语义边界说明。
3. **专题优先**：根据任务从 **`./.Knowledge/topics/*.md`** 读取**路由摘要**（主题 id、路径、下一步指针）。Flow2Spec **包级执行条令**由 **`flow2spec init`** 写入 **`./.codex/topics/f2s-*.md`**（见下文 **「专题长文」**）；需要完整条令时**按需**打开对应文件。
4. **长文按需**：仅在需要背景时再读 **`./.Knowledge/stock-docs/*.md`**。
5. **需求文档路径**：默认使用 **`./.Knowledge/req-docs/*.md`**。
6. 下钻代码前先对齐知识库：若索引已覆盖，优先遵循知识库约定。
7. **命中后补全（必须）**：执行 `match -> expand -> verify -> act`。
   - `match`：先基于 routing + matcherPath 得到主候选。
   - `expand`：展开 `topicDependencies`，并保留次高候选（建议 top-2/top-3）做补充校验。
   - `verify`：执行前做缺口检查（是否缺关键主题、边界条件、上下文文档）。
   - `act`：仅在置信度足够时执行；低置信度必须先澄清再执行。
8. **全量补检索触发门槛（必须）**：仅在以下条件之一成立时允许做跨 matcher 全量补检索（top-k）：
   - `taskToTopicRules` 无命中；
   - 主候选与次候选分差过小（低置信度）；
   - 缺口检查失败（关键主题/依赖/上下文缺失）；
   - 用户明确要求“全量检查/不要遗漏”。
9. **禁止项**：
   - 禁止跳过 **`./.Knowledge/manifest-routing.json`**、按需 `matcherPath` 分片与 **`./.Knowledge/topics/`** 直接全仓检索或直接编码；**`./.Knowledge/index.md`** 按需读取，不可替代上述机读链。
   - 同一任务线内避免重复全文读取 **`./.Knowledge/manifest-routing.json`**（除非用户说明已通过 `f2s-kb-build` / `f2s-kb-sync` / `f2s-kb-add` 等更新路由或知识、或手动改了 manifest；**勿将**仅执行 `flow2spec init` 当作业务知识库已更新）；禁止为枚举而遍历整个 **`./.Knowledge/matchers/`**；禁止 **`./.Knowledge/index.md`** 与 routing 交替「刷清单」。
   - 禁止把 **`./.Knowledge/stock-docs/`** 作为“按方案实现代码”的直接输入文档。
   - Flow2Spec 执行条令以 **`./AGENTS.md`**（完整）、**`./.codex/topics/f2s-*.md`** 与 **`./.codex/skills/`** 为准；**`.codex/AGENTS.md`** 仅为目录指针，不可替代根 `AGENTS.md`；勿使用仓库内 **非上述路径** 的同名条令文件作为执行依据，以免口径分叉。
   - 禁止把 `fallbackTopic` 当作最终命中直接实施改动；`fallbackTopic` 仅作安全兜底与澄清前置上下文。
   - 禁止在不满足触发门槛时做跨 matcher 全量补检索。
10. **检索与作答节奏**：在 KB 已形成可答结论时，控制 `grep`/读盘范围与轮次；优先按 topic 给出的目录做单点 `Read`。用户未要求「全仓 / 通读依赖」时，允许**先短答再按需下钻**。细则见 **`./.codex/topics/f2s-knowledge-preflight.md`** 中 **「检索体积与作答节奏」**。
11. **普通问答源码补答收口**：普通问答下钻源码并据此补答时，先按 **`./.codex/topics/f2s-knowledge-preflight.md`** 完成首读与缺口闸门，再按 **`./.codex/topics/f2s-kb-feedback-closing.md`** 完成最终知识库补充建议收口；只提示，不自动执行 `f2s-kb-add` / `f2s-kb-sync`。

## 渐进式读取顺序

1. `./.Knowledge/manifest-routing.json`
2. `./.Knowledge/matchers/<matcher>.json`（按需：通过 `taskToTopicRules[].matcherPath` 定位具体文件）
3. `./.Knowledge/index.md`（按需，用于语义校验）
4. `./.Knowledge/topics/<topic>.md`（摘要；涉及统一入口、路由细则、`implement-tech-design` / `f2s-doc-routing` 等时，按需续读下文 **「专题长文」** 所列 `./.codex/topics/f2s-*.md`）
5. `./.Knowledge/stock-docs/<doc>.md`（按需）
6. 业务代码（按需；路径以仓库内实际目录为准）

## 机读事实源口径（必须遵循）

- 机读路由主事实以 **`./.Knowledge/manifest-routing.json`** 为准；匹配词以 `taskToTopicRules[].matcherPath` 指向的 matcher 分片文件为准。
- **`./.Knowledge/index.md`** 仅作人读导航与语义边界校验，不承担机读字段定义。
- `fallbackTopic` 仅用于低置信度兜底，不作为最终执行依据；进入 fallback 后必须先补召回或澄清。

## 可用主题

- 不在此处维护静态主题列表，避免与知识库演进漂移。
- 每次任务均以 **`./.Knowledge/manifest-routing.json`** 的 `topicPaths`、`taskToTopicRules`、`fallbackTopic` 为唯一路由事实，并按每条规则的 `matcherPath` 读取 matcher 分片；`topicMetadata` 只作治理与阅读预期，不是路由事实源。
- 若路由清单与 **`./.Knowledge/index.md`** 语义不一致，以路由清单为准并提示用户同步修正。

## 专题长文（`./.codex/topics/`）

由 **`flow2spec init`** 写入当前仓库，与本文件、**`./.codex/skills/`** 一起构成 Flow2Spec 的可执行依据。当前运行时路径均在仓库根下 **`.codex/topics/`**：

- **统一入口**：`./.codex/topics/f2s-flow2spec-unified-entry.md`
- **implement-tech-design**：`./.codex/topics/f2s-implement-tech-design.md`
- **f2s-doc-routing**：`./.codex/topics/f2s-stock-docs-vs-req-docs.md`

同目录下另有：

- **`./.codex/topics/f2s-knowledge-preflight.md`**：**普通提问**也须先 `Read` **`./.Knowledge/manifest-routing.json`** 再下钻代码；与统一入口并行时以本条「首工具调用」为准。
- **`./.codex/topics/f2s-kb-feedback-closing.md`**：普通问答读取业务源码后的知识库补充建议收口；需要补充时只输出一条 `f2s-kb-add` / `f2s-kb-sync` 命令，不需要时静默。
- **`./.codex/topics/f2s-intent-routing.md`**：仅当 `flow2spec.config.json.intentRecognition=true` 时启用；高置信操作意图可自动进入对应 `f2s-*` 技能，讨论 / 评估 / 低置信输入不自动调用。
- **`./.codex/topics/f2s-config-check.md`**：内容与上文「先 Read **`./flow2spec.config.json`**」一致并含 **changeTracking** 细表；**仅**在需核对细表时按需打开，不必与上列三条并列必读。

执行 Flow2Spec 相关任务时，先读本文件（**`./AGENTS.md`**）与 **`./.Knowledge/manifest-routing.json`**，再按需打开上列 **`./.codex/topics/*.md`** 文件。

## 知识库版本自检（SessionStart 自动触发；每日首次，仅 updateCheck.enabled=true 时）

Codex 由 `flow2spec init codex` 写入 **`.codex/hooks.json`**，在 `SessionStart` 的 `startup|resume` 事件自动执行 `node .codex/hooks/f2s-update-check.js`；首次生成或 hook 内容变化后，Codex 可能要求通过 `/hooks` 审核并信任该项目 hook。

**规则层双保险**（若 hook 未运行，则按本节补检；与脚本缓存互为备份）：

1. 读 `flow2spec.config.json` → 若 `updateCheck.enabled` 不为 `true`，跳过，不做任何提示。
2. 读 `.Knowledge/update-check.json` → 若文件存在且 `checkedAt` 与今日为同一自然日（`new Date(checkedAt).toDateString() === new Date().toDateString()`），不重复查 npm；但若 `needsUpgrade=true` 或 `latestNpm > manifestVersion`，本会话首次回复用户时仍须提醒执行 `f2s-kb-upgrade`；若当前 `.Knowledge/manifest-routing.json.version` 已不低于 `latestNpm`，删除该缓存并不再提示。
3. 上述两步均未跳过时：执行 `node .codex/hooks/f2s-update-check.js`，解析标准输出的 JSON：
   - 若含 `hookSpecificOutput.additionalContext`：**告知用户**该内容（建议执行 `/f2s-kb-upgrade`）。
   - 无输出或解析失败：静默，不提示。
4. 以上步骤出现任何错误，静默跳过，不影响正常对话。

## 可用 Flow2Spec 技能（自动生成）

- `f2s-doc-arch`：根据用户说明或文档（或扫描代码）生成项目架构说明初稿，无固定格式，描述清楚即可；触发：项目架构说明、f2s-doc-arch、架构初稿
- `f2s-doc-final`：将 PDF 或 MD 转为《终稿模版》规范格式，便于后续用 f2s-kb-build 同步 topics/index/manifest；触发：f2s-doc-final、转成概述模板、终稿模版
- `f2s-doc-milestone`：据 req-docs、git log、.task 与知识库主题语义生成里程碑（《项目里程碑模版》）；触发：f2s-doc-milestone、生成项目里程碑、里程碑。命令后可附语义化范围。本技能固定子 agent 生成、主 agent 验证，不受 flow2spec.config 编排开关影响
- `f2s-doc-pdf`：将 PDF 技术方案转为 Markdown 并保存到 req-docs，可补全流程说明；触发：PDF转MD、按方案实现前的 PDF
- `f2s-git-commit`：代码写完后提交 Git：默认检查变更与知识库覆盖；用户明确要求“快捷提交”时跳过知识库覆盖检查；生成带 emoji 首行的提交说明后**可直接 commit**（须在当条回复展示首行，不要求用户单独确认 commit）；**git pull 类拉取须用户先确认**。触发：f2s-git-commit、提交代码、快捷提交、git commit、帮我提交
- `f2s-kb-add`：工作中把已落地能力解析进知识库（多文件聚合）：初稿→终稿→topics/index/manifest；触发：f2s-kb-add、已有能力进知识库、多文件生成上下文
- `f2s-kb-addRules`：把用户口述的规则沉淀进知识库，自动判定「新建主题 / 并入存量主题」并同步路由；不写代码、不创建 .task/；触发：f2s-kb-addRules、新增规则、口述规则、把这条记到知识库
- `f2s-kb-build`：根据 .Knowledge/stock-docs 文档生成知识路由主题与索引；触发：生成项目上下文、f2s-kb-build、终稿生成上下文
- `f2s-kb-feat`：新增能力时补全实现与知识库；已实现则仅同步知识库；触发：f2s-kb-feat、新增能力
- `f2s-kb-fix`：根据用户指出的实现或规则错误修正代码，并默认同步知识库；触发：f2s-kb-fix、修正实现规则
- `f2s-kb-merge`：解决 Git 合并后编辑器上下文冲突；可选传入冲突文件；实现侧冲突仅罗列待用户确认；触发：合并上下文冲突、f2s-kb-merge
- `f2s-kb-migrate`：旧版知识库一次性迁到 `.Knowledge`：以配置根 `docs-index.md` + 规则统一入口（旧版 `rules/main.md(c)` 或新版包 `rules/f2s-flow2spec-unified-entry.md(c)`）为主索引线索，全量处理业务 `rules/` 与业务 `skills/`（排除 `f2s-*` 包技能），并全量迁移 `stock-docs`/`req-docs`；**迁移验收后必选**落盘 `.Knowledge/migration-report.md`（迁移对照表 + 拟删除路径列表）；**收尾必选**删除已迁旧的 `rules/`、已迁业务 `skills/`、旧版 `docs-index.md`/`index-doc.md`；用户只**核对/修订删除清单（排除项）**；触发：f2s-kb-migrate、知识库迁移、旧版迁移
- `f2s-kb-rm`：删除某 stock-docs 文档对应的知识主题与索引映射；触发：删除项目上下文、f2s-kb-rm
- `f2s-kb-sync`：可显式给出能力或零输入推断；先输出知识库更新大纲，确认后写入 topics/index/manifest；触发：f2s-kb-sync、全局同步、知识库同步、已实现能力
- `f2s-kb-upgrade`：知识库模板升级技能（仅指本 SKILL）：**流程分流 V1** 须先 f2s-kb-migrate 再在流程内代跑 flow2spec init；**现行库（流程代号 V2+，含已用 .Knowledge 的 Flow2Spec npm v3.x 等项目）** 则代跑 init 以对齐 manifest-routing + matchers 分片（包内 `manifest-matchers.json` 仅作 init 合并种子，不落盘 .Knowledge）。触发：f2s-kb-upgrade、一键升级迁移、旧项目升级、知识库模板升级。注意：不要把单独的 flow2spec init 称作「升级命令」；**V1/V2+ 为技能内分流代号，不等于 npm 包主版本号**。
- `f2s-req-clarify`：针对 PRD/需求反问直到清楚，再可用 f2s-req-tech 出技术方案；触发：需求澄清、PRD 澄清
- `f2s-req-plan`：根据技术方案/需求描述/变更描述规划并实现任务；始终按 f2s-task 维护 .task/；支持子 agent 并行实现；触发：f2s-req-plan、创建任务、任务规划、我需要任务清单
- `f2s-req-tech`：根据澄清后的需求基于项目知识库/Skills/Rules 生成技术方案文档；触发：生成技术方案、技术方案、f2s-req-tech
