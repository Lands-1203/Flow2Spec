---
name: f2s-doc-milestone
description: 据 req-docs、git log、.task 与知识库主题语义生成里程碑（《项目里程碑模版》）；触发：f2s-doc-milestone、生成项目里程碑、里程碑。命令后可附语义化范围。本技能固定子 agent 生成、主 agent 验证，不受 flow2spec.config 编排开关影响
---

> 执行口径：读 `.Knowledge/template/项目里程碑模版.md`；落盘 **仅** `.Knowledge/stock-docs/<范围名>里程碑.md`（无第二路径参数）。

## 编排（固定，不受项目配置影响）

**本技能不受** `flow2spec.config.json` 中 **`subAgent`**、**`switchAgentVerification`**（及旧键 `subAgentVerification`）**影响**：无论其为 `true` 或 `false`，**一律**按下述分工执行，**禁止**因配置改为「全主会话」或「子 agent 自验即结束」。

| 角色 | 步骤 | 职责 |
| --- | --- | --- |
| **主 agent** | 0、3、4 | 读模版与知识库主题索引、解析范围、派子、**验证**、必要时修订、回复用户 |
| **子 agent** | 1、2 | 采集四源、套模版、**Write 初稿** |

1. **主 agent**：步骤 0 → 下发「采集契约」→ 子 agent 步骤 1–2 落盘初稿。
2. **主 agent**：步骤 3 对照四源与「重要节点清单」验证（不全文重写；补缺、纠偏、「待确认」）→ 步骤 4 回复。
3. 子 agent **禁止**宣称「里程碑已验收完成」；终稿以主 agent 验证后为准。

> 步骤 0 仍 **`Read("flow2spec.config.json")`**（满足 `f2s-config-check` 前置），但**不得**用其中的 `subAgent` / `switchAgentVerification` 改变本技能编排。

**子 agent 采集契约（主 agent 派子前写入 prompt）**

| 字段 | 内容 |
| --- | --- |
| `scope` | 用户语义范围一句 |
| `outputPath` | `stock-docs/<范围名>里程碑.md` |
| `sources` | 见下文「四源」；**须含知识库主题语义** |
| `template` | `.Knowledge/template/项目里程碑模版.md`（不写模版顶部说明 blockquote） |
| `delivery` | 完整 Markdown，可直接 `Write` 至 `outputPath` |

## 四源（采集与验证均须覆盖）

| 源 | 读什么 | 里程碑里怎么用 |
| --- | --- | --- |
| **req-docs** | 范围内 `.Knowledge/req-docs/*.md` | 需求/方案节点、交付摘要 |
| **git** | `git log --no-merges`、`git tag -l`、`package.json` 版本 | 时间线、大版本/tag、提交锚点 |
| **`.task`** | `todo.json`、`active/`、`completed/` 下 `task.md` 等 | 任务闭环、已交付步骤 |
| **知识库主题（语义）** | 见下「主题索源」 | 与 index/manifest 已登记能力对齐，避免漏写「库里已有语义」的阶段 |

### 主题索源（知识库语义，主 agent 步骤 0 须读；子 agent 步骤 1 须读）

1. **`Read(".Knowledge/manifest-routing.json")`**：提取 `topicPaths`、`taskToTopicRules`（及与范围相关的 `topicDependencies`）。
2. **`Read(".Knowledge/index.md")`**：至少「**主题一览**」表（主题 id、适用场景、关联文档摘要）。
3. **按需 `Read` `.Knowledge/topics/<topic>.md`**：与范围或 manifest 命中相关的摘要（**禁止**为枚举遍历整个 `topics/`；仅读 manifest/index 已点名的主题，通常 ≤ 全表行数）。
4. 将主题语义归纳为「能力/场景节点」列表，供子 agent 写入契约；里程碑阶段须能覆盖或于「待确认」说明与某主题相关的缺口。

文首 **「索源」** 一行须写明：本轮读了哪些 topic（id 或 `topics/*.md` 路径），或「无 `.Knowledge` 路由」。

## 入参（仅一个，可选）

命令名之后可跟**一段语义化范围**（自然语言）：

| 用户意图 | 示例 | 落盘文件名 |
| --- | --- | --- |
| 整个项目（默认） | 不传 / `整个项目` / `全项目` | `项目里程碑.md` |
| 某一需求或能力 | `支付回调改造` / `登录模块` | `<简述>里程碑.md` |

**文件名规则**：后缀 `里程碑.md`；整个项目 → 前缀 `项目`；单一需求 → 语义或 req 标题简述（≤ 20 字）。

**范围收窄**：在四源上按关键词、路径、日期过滤；未传范围则四源全量可追溯（主题索源读 index 全表 + manifest，topics 按需展开）。

## 步骤 0：前置（主 agent）

1. **`Read("flow2spec.config.json")`**（不采纳其 `subAgent` / `switchAgentVerification` 编排本技能）
2. **`Read(".Knowledge/template/项目里程碑模版.md")`**
3. **主题索源**（见上：manifest → index 主题一览 → 按需 topics 摘要）
4. 解析范围 → 确定默认路径 **`stock-docs/<范围名>里程碑.md`**。
5. **相似文件检查（落盘前必做）**：列出 `.Knowledge/stock-docs/` 下已有 `*里程碑*.md`（含 `*里程碑.md`）。若存在与本次**目标路径相同**或**语义相近**的文件（例如同为「整个项目」的 `项目里程碑.md` 与 `Flow2Spec里程碑.md`，或前缀/范围关键词高度重叠），**须先询问用户**，**禁止**静默覆盖或擅自另存：
   - **覆盖**：沿用原路径，子 agent 写入时覆盖该文件（验证后仍以该路径为终稿）。
   - **另生成一份**：改用新路径（建议：范围简述 + `_YYYYMMDD` + `里程碑.md`，或用户指定的 `<简述>里程碑.md`），并在契约中更新 `outputPath`。
   - 无相似文件，或仅有一个且与目标路径完全一致且用户本轮已明确要「重新生成/覆盖」→ 可不再追问，按默认路径继续。
6. 向用户复述：范围、**最终** `outputPath`、已读主题数量；若做了相似文件询问，待用户选择后再继续。
7. 组装「采集契约」（含最终 `outputPath`、主题节点列表）并 **派子 agent** 执行步骤 1–2

## 步骤 1：采集索源（子 agent）

- 按契约完成 **四源** 采集；git **须** 对照 tag 与主版本跃迁（如 `v3.0.0` 架构 tag）。
- 主题语义：核对 manifest/index 中能力与 git/req/task 是否同窗出现；暂无法对齐的记入内部备注供「待确认」。

索源为空：仍生成文档，「待确认」说明缺口；**禁止**训练数据填交付。

## 步骤 2：套模版并落盘（子 agent）

1. `# （范围名）里程碑`；文首范围、时间、**索源（含本轮 topics）**。
2. 时间升序 **M1、M2…**；总览表与各 `## Mx ·` 一一对应；可与知识库主题名呼应（非必须一一对应 topic id）。
3. 不写模版顶部说明 blockquote。
4. **`Write`** 至 `outputPath`。

## 步骤 3：验证（主 agent，须执行）

子 agent 落盘后 **必须**验证：**重要节点**是否错误、遗漏或合并过度。

1. **重读四源要点**：git tag/commit、req/task、**index 主题一览 + 已读 topics** 与文稿对照。
2. **对照「重要节点清单」**：

| 类别 | 检查什么 |
| --- | --- |
| 大版本 / tag | 1.0 首发、2.0 重组、**3.0.0 架构/知识库**（tag）、3.0.x 系列 |
| 路线切换 | OpenSpec 退场 → `f2s-*` / `.Knowledge` 机读路由 |
| 核心能力 | git/req/task 出现的技能与能力 |
| **知识库主题** | index/manifest 中与范围相关的主题是否在里程碑中有对应阶段或「待确认」 |
| 任务闭环 | 已归档 `.task` 是否体现 |
| 依据可追溯 | 每 Mx 交付能否在四源中找到 |
| 时间线 | 先后合理；同周多版本是否需拆分（如 3.0.0 vs 3.0.1/beta） |

3. 遗漏 → 补 Mx；错误 → 按四源修正；无法确认 → 「待确认」。
4. 验证或修订完成后方可步骤 4。

## 步骤 4：回复（主 agent）

落盘路径、阶段数、验证结论（一句）、「待确认」摘要。

## 禁止项

- 禁止用 `subAgent` / `switchAgentVerification` 跳过子生成或跳过主验证。
- 禁止在 `stock-docs/` 已存在**相似里程碑**且用户未选择「覆盖 / 另生成一份」前派子 agent 或 `Write`。
- 禁止第二参数改输出路径（路径由范围 + 相似文件询问结果确定）；禁止写入 `req-docs`。
- 禁止未读四源写交付；禁止子 agent 未经验证即宣称完成。
- 禁止遍历整个 `matchers/` 或全仓 topics 代替「manifest + index + 按需 topics」。
- 禁止与 Flow2Spec 产品线 M0–M8 双仓细表混淆（读 `Flow2Spec-项目里程碑.md`，不用本技能代答）。
