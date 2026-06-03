# Flow2Spec Knowledge Index

> **读前区分（本仓库）**：本文件与同级目录 **`.Knowledge/`** 属于 **Flow2Spec 产品开发 Git 仓库**自用：用于**追踪与记录 Flow2Spec 作为产品**的能力说明、路由样例、`stock-docs` 终稿等（人读 + 本仓 `manifest-routing`）。**随包发布、并由 `flow2spec init` 写入各业务仓的默认索引与规则骨架**来自仓库 **`templates/`** 与 **`lib/`**（源代码与模板），二者是 **交付物**，不是本 `.Knowledge/` 的另一套「正文副本」；在业务仓内工作时，以该仓根目录 `.Knowledge/` 与 `init` 落盘为准。  
> **Agent 修包边界（本仓专用）**：在本**产品开发仓**内让 Agent 改 f2s 能力 / 规则 / CLI 时，**只改** `templates/`、`lib/` 等交付物，**禁止改** `.cursor/`、`.claude/`、`.codex/`（init 落盘副本，避免 diff 看不清真值变更）。细则见 [产品仓 Agent 修包边界](stock-docs/Flow2Spec-产品仓-Agent修包边界.md)。**不**写入包内 `templates/skills`。

本文件是 **人读导航**：主题说明、关联文档摘要、语义边界。  
**机读事实源** 以 `.Knowledge/manifest-routing.json` + `taskToTopicRules[].matcherPath` 指向的 `.Knowledge/matchers/*.json` 分片为准（不再使用 `.Knowledge/manifest-matchers.json`）。

---

## 推荐阅读顺序

1. `.Knowledge/manifest-routing.json`（任务路由、`topicPaths`、`topicDependencies`、`fallbackTopic`）
2. 按需：由 `matcherPath` 读取 `.Knowledge/matchers/<id>.json`（`includeAny` 关键词）
3. 按需：本 `index.md`（主题语义与边界）
4. `.Knowledge/topics/<topic>.md`（执行约束与流程）
5. 按需：`.Knowledge/stock-docs/`、`.Knowledge/req-docs/`
6. 仍不足再下钻业务代码

---

## 主题一览

| 主题 | 路径 | 适用场景 | 关联文档（摘要） |
| --- | --- | --- | --- |
| implement-tech-design | `.Knowledge/topics/f2s-implement-tech-design.md` | 按技术方案实现代码 | req：[技术方案](.Knowledge/req-docs/<技术方案>.md)（必填） |
| stock-docs-vs-req-docs | `.Knowledge/topics/f2s-stock-docs-vs-req-docs.md` | stock-docs / req-docs 目录分工 | stock：[目录边界说明](.Knowledge/stock-docs/<目录边界说明>.md)（可选） |
| fallback-triage | `.Knowledge/topics/f2s-fallback-triage.md` | 未命中或低置信度：分诊与澄清 | stock：[路由分诊说明](.Knowledge/stock-docs/<分诊说明>.md)（可选） |
| config-precheck | `.Knowledge/topics/f2s-config-precheck.md` | 执行 `f2s-*` 前读 `flow2spec.config.json` / 编排开关 | Codex 长文：仓库根 `.codex/topics/f2s-config-check.md`；[路由摘要](topics/f2s-config-precheck.md) |
| f2s-task | `.Knowledge/topics/f2s-task.md` | 变更追踪、`.task/` 任务清单与跨会话续作 | stock：[任务清单与变更追踪](stock-docs/Flow2Spec-任务清单与变更追踪.md)；长文：`rules/f2s-task.*` |
| f2s-req-plan | `.Knowledge/topics/f2s-req-plan.md` | 需求/方案规划与实现；始终维护 `.task/` | 技能：`skills/f2s-req-plan/SKILL.md`；依赖 `f2s-task` |
| flow2spec-presentations | `.Knowledge/topics/f2s-flow2spec-presentations.md` | 本仓对外介绍 HTML 演示稿路径与维护约定 | stock：[对外介绍演示](stock-docs/Flow2Spec-对外介绍演示.md) |
| flow2spec-milestones | `.Knowledge/topics/f2s-flow2spec-milestones.md` | 版本演进；含内部仓 vs 开源仓、双语 PPT、Cursor 插件 | stock：[项目里程碑](stock-docs/Flow2Spec-项目里程碑.md) |
| skill-authoring | `.Knowledge/topics/skill-authoring.md` | 新增 / 重构 `f2s-*` SKILL 时的骨架与命名约定（仅本仓，不下发） | 参考实现：`templates/skills/f2s-rule-capture/SKILL.md` |

每主题保留 **1–3 条** 可点击摘要链接；全量路径对照写入 `.Knowledge/migration-report.md`（迁移场景）。  
其中 **`implement-tech-design`**、**`stock-docs-vs-req-docs`**、**`config-precheck`**、**`f2s-task`** 在 `topics/` 内为**路由摘要**；执行长文见配置根 **`rules/f2s-*.md(c)`**；使用 Codex 时见 **`.codex/AGENTS.md`**、**`.codex/topics/f2s-*.md`**（`f2s-config-check` 与 `AGENTS` 前置同源，按需打开）。

---

## 命中与执行（与统一入口一致）

- **路由**：`taskToTopicRules` 给出任务 → 主题集合；**关键词**在 matcher 分片的 `includeAny`。
- **依赖**：命中主主题前，按 `topicDependencies` 先读依赖主题。
- **兜底**：`fallbackTopic` 指向分诊主题（如 `fallback-triage`），仅低置信度上下文，**不得**当作最终命中直接改代码。
- **执行链**：`match → expand → verify → act`；`expand` 须含依赖展开，并保留次高候选做校验。
- **全量补检索**：仅当无命中、候选分差过小、缺口检查失败，或用户明确要求「全量检查」时允许跨 matcher 补检索。

---

## 目录职责

| 目录 | 职责 |
| --- | --- |
| `topics/` | 专题规则与执行流程 |
| `matchers/` | matcher 分片（`matcherPath` 指向） |
| `stock-docs/` | 存量沉淀（架构、终稿等） |
| `req-docs/` | 需求与技术方案（驱动实现） |
| `template/` | 终稿与方案模版 |

路由清单由 `f2s-*` 技能链路维护，不依赖额外 CLI 子命令。

---

## 常见缺口怎么处理（与统一入口一致）

| 情况 | 你怎么做 |
| --- | --- |
| 有文档但没配到（1a） | 维护侧：`f2s-ctx-build` / `f2s-kb-sync` / `f2s-doc-add` 补路由与 `includeAny`。执行侧：分诊主题澄清任务类型，**不**用全仓扫替代 manifest。 |
| 配到了但不够（1b） | 走依赖与次高候选 → `verify` 点名缺哪篇文档；仍缺则向用户要路径或补 `req-docs`。 |
| 库里没有（2） | 承认缺口 → 代码下钻或请用户补需求/方案文档。 |
| 反复读 manifest 费 token（2a） | 同一任务线内 routing 只当快照；只读命中项的单个 matcher；不遍历整个 `matchers/` 目录枚举；`index.md` 勿与 routing 循环互刷。 |

**说明**：「路由/知识已更新」指 `f2s-*`（如 `f2s-ctx-build`、`f2s-kb-sync`、`f2s-doc-add`、`f2s-kb-fix` 等）产出或手改 `manifest-routing` / `matchers` 分片；**`flow2spec init` 不撰写业务文档**，以模板补齐与配置根落盘为主，勿与知识库内容更新混为一谈。
