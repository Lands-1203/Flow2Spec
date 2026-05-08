# Flow2Spec Codex 入口

你正在一个使用 Flow2Spec 的项目中工作。项目知识库已统一到 `.Knowledge/`，请按渐进式读取，避免一次性加载大量无关文档。

## Flow2Spec 项目开关（项目根 `flow2spec.config.json`；缺失时由 `flow2spec init` 从包模板补齐）

**`flow2spec init` 的定位**：把 Flow2Spec **包内模板**落到当前仓库——包括 **`.Knowledge/`**（含路由结构、快照等）与本目录 **`.codex/`**（`AGENTS.md`、`skills/`、经 `init` 写入的 `topics/*.md`），**不负责**撰写业务 `stock-docs` / `topics` 正文或替代 **`f2s-*` 技能**；即 **模板与目录落盘 / 形态对齐**，不是「知识库升级命令」（升级见 **`f2s-kb-upgrade`** 技能）。

执行任意 **`f2s-*` 技能**前，应读取 `flow2spec.config.json` 中的布尔字段（缺省或文件不存在均视为 `false`）。下表由 **最近一次 `flow2spec init`** 根据当时配置写入，**以磁盘上的文件为准**。

{{FLOW2SPEC_PROJECT_CONFIG}}

### `subAgent` 与 `switchAgentVerification`（语义与上表一致；以磁盘配置为准）

- **`subAgent`**：`f2s-*` 技能若写明某步「用子 agent 执行」，**`true`** 时按技能使用子 agent，**`false`** 时在主会话内完成。用户可说明「**仅当** `subAgent` 为 **`true`** 时，由主 agent **动态判断**哪些子任务适合交给子 agent」——**仅当配置为 `true` 时该说明有效**；为 **`false`** 时该段要求**自动失效**，不得拆子 agent。**各技能在何阶段用子 agent** 由技能正文约定，包模板**尚未**给出统一阶段清单。
- **`switchAgentVerification`（切换 agent 校验）**：**不是**「校验一律在主会话」；**`false` 或未启用交叉规则时**：谁在会话里**落盘**，验证与复核（对照清单、diff、自检）**就在该 agent 会话内**完成（子写子验、主写主验）。**`true` 且** 当前 **`f2s-*` 技能正文**写明依赖本项时，启用**交叉校验**：**子 agent 落盘的 → 主 agent 验**；**主 agent 落盘的 → 子 agent 验**（无子 agent 时，如 **`subAgent` 为 `false`**，则「主落盘→子验」不发生，**全在主会话**验）。

## 全局约束

1. **必须先读机器索引**：优先读取 `.Knowledge/manifest-routing.json` 做主题路由；按需依据 `taskToTopicRules[].matcherPath` 读取对应 matcher 分片（单文件）取匹配词；无法命中时进入补召回阶段。
   - 若存在 `taskToTopicRules`，优先按任务规则路由主题。
   - 若命中主题含 `topicDependencies`，先读依赖主题再读主主题。
   - `manifest` 仅通过 `f2s-*` 技能流程维护，不假设存在额外 CLI 命令。
2. **人工索引按需读取**：仅在需要校验主题语义与边界时读取 `.Knowledge/index.md`。
   - `index.md` 不是机读事实源，仅承担人读导航与语义边界说明。
3. **专题优先**：根据任务从 `.Knowledge/topics/*.md` 读取**路由摘要**（主题 id、路径、下一步指针）。Flow2Spec **包级执行条令**由 **`flow2spec init`** 写入 **`.codex/topics/f2s-*.md`**（见下文 **「专题长文」**）；需要完整条令时**按需**打开对应文件。
4. **长文按需**：仅在需要背景时再读 `.Knowledge/stock-docs/*.md`。
5. **需求文档路径**：默认使用 `.Knowledge/req-docs/*.md`。
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
   - 禁止跳过 `manifest-routing`、按需 `matcherPath` 分片与 `topics/` 直接全仓检索或直接编码；`index.md` 按需读取，不可替代上述机读链。
   - 同一任务线内避免重复全文读取 `manifest-routing.json`（除非用户说明已通过 `f2s-ctx-build` / `f2s-kb-sync` / `f2s-doc-add` 等更新路由或知识、或手动改了 manifest；**勿将**仅执行 `flow2spec init` 当作业务知识库已更新）；禁止为枚举而遍历整个 `matchers/`；禁止 `index.md` 与 routing 交替「刷清单」。
   - 禁止把 `stock-docs` 作为“按方案实现代码”的直接输入文档。
   - Flow2Spec 执行条令仅以本 `AGENTS.md`、**`.codex/topics/f2s-*.md`** 与 **`skills/`** 为准；勿从仓库内其它路径下的 `rules/` 补读同名约定，以免口径分叉。
   - 禁止把 `fallbackTopic` 当作最终命中直接实施改动；`fallbackTopic` 仅作安全兜底与澄清前置上下文。
   - 禁止在不满足触发门槛时做跨 matcher 全量补检索。

## 渐进式读取顺序

1. `.Knowledge/manifest-routing.json`
2. `.Knowledge/matchers/<matcher>.json`（按需：通过 `matcherPath` 定位）
3. `.Knowledge/index.md`（按需，用于语义校验）
4. `.Knowledge/topics/<topic>.md`（摘要；涉及统一入口、路由细则、`implement-tech-design` / `stock-docs-vs-req-docs` 等时，按需续读下文 **「专题长文」** 所列 `.codex/topics/f2s-*.md`）
5. `.Knowledge/stock-docs/<doc>.md`（按需）
6. 业务代码（按需）

## 机读事实源口径（必须遵循）

- 机读路由主事实以 `.Knowledge/manifest-routing.json` 为准；匹配词以 `taskToTopicRules[].matcherPath` 指向的 matcher 分片为准。
- `.Knowledge/index.md` 仅作人读导航与语义边界校验，不承担机读字段定义。
- `fallbackTopic` 仅用于低置信度兜底，不作为最终执行依据；进入 fallback 后必须先补召回或澄清。

## 可用主题

- 不在此处维护静态主题列表，避免与知识库演进漂移。
- 每次任务均以 `.Knowledge/manifest-routing.json` 的 `topicPaths`、`taskToTopicRules`、`fallbackTopic` 为唯一路由事实，并按每条规则的 `matcherPath` 读取 matcher 分片。
- 若路由清单与 `.Knowledge/index.md` 语义不一致，以路由清单为准并提示用户同步修正。

## 专题长文（`.codex/topics`）

由 **`flow2spec init`** 将包内 `templates/rules/*.mdc` 去 frontmatter 后写入 **`.codex/topics/*.md`**，与本入口、`skills/` 一起构成 Flow2Spec 的可执行依据。**当前包模板**对应文件：

- **统一入口**：`.codex/topics/f2s-flow2spec-unified-entry.md`
- **implement-tech-design**：`.codex/topics/f2s-implement-tech-design.md`
- **stock-docs-vs-req-docs**：`.codex/topics/f2s-stock-docs-vs-req-docs.md`

执行 Flow2Spec 相关任务时，先读本 `AGENTS.md` 与 `.Knowledge/manifest-routing.json`，再按需打开上列文件。

## 可用 Flow2Spec 技能（自动生成）

{{FLOW2SPEC_CODEX_SKILLS_SUMMARY}}
