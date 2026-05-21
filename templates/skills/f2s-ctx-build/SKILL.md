---
name: f2s-ctx-build
description: 根据 .Knowledge/stock-docs 文档生成知识路由主题与索引；触发：生成项目上下文、f2s-ctx-build、终稿生成上下文
---

> 执行口径：本技能只维护 `.Knowledge`（`topics/index/manifest-routing/matchers` 分片），不改配置根 `rules/skills`。不再维护 `.Knowledge/manifest-matchers.json`（已废弃聚合文件；`flow2spec init` 会删除遗留副本）。

# 根据文档生成项目上下文（topics/index/路由清单）

## 编排（主 / 子 agent）

- 两字段（`subAgent` / `switchAgentVerification`）语义以统一入口为唯一事实源：**Cursor/Claude** 读配置根 `rules/f2s-flow2spec-unified-entry.*`；**Codex** 读 `.codex/topics/f2s-flow2spec-unified-entry.md`（与上同源，`flow2spec init` 镜像）。本 SKILL 不复述。
- **首选分支（小变更 → 主全流程）**：当本次改动 **≤ 2 个新 / 改主题**，**且 ≤ 1 个新 matcher**，**且无跨主题批量引用调整** 时，全流程在主 agent 完成，不拆子。
- **中大变更分支**（`subAgent=true` 且超出上述阈值）：
  - 主 agent 在主会话中列出**文件级契约**：子 A 只写 `.Knowledge/topics/<foo>.md`，子 B 只写 `.Knowledge/matchers/<m-foo>.json`，路径互不重叠；
  - 子 agent 仅落盘契约内文件，不跨边界；
  - **主 agent 单点**编辑 `.Knowledge/manifest-routing.json` / `.Knowledge/index.md`（补 `taskToTopicRules`、`topicPaths`、`matcherPath`、`topicDependencies`）；
  - 主 agent 做整体验收。
- **不推荐**：单个子 agent 同时改 manifest / index / 多份 topics / matchers；以及「子 A 写、子 B 验」。
- **「一子写、主验」**：仅在交付边界极窄（例如只产出 1 个新 matcher 分片草稿，manifest 引用仍由主写）时可接受。
- **写权硬约束**：`.Knowledge/manifest-routing.json` / `.Knowledge/index.md` **恒由主 agent 落盘**，子 agent 不得触碰。
- 默认落盘侧 agent 自验；本 SKILL 不绑定交叉校验。

## 输入

- 接收一个参数：URL 或本地路径。
- 本地路径必须位于 `.Knowledge/stock-docs/`。
- 若传入 `.Knowledge/req-docs/`，提示用户先整理为 `stock-docs` 终稿后再执行。

## 生成原则

1. **拆解**：文档较长或包含多块独立能力时，拆分为多个 topic；避免把无关能力塞到同一主题。
2. **分工**：
  - `topics/`：规则与流程正文（可执行知识）
  - `index.md`：主题索引与语义说明（人读入口）
  - `manifest-routing.json` + `taskToTopicRules[].matcherPath` 指向的 `matchers/*.json`：任务路由与关键词词表（机读入口）

## 步骤 1：获取文档内容

- URL：抓取正文；无法访问时提示用户先落地到 `.Knowledge/stock-docs/*.md`。
- 本地路径：读取 Markdown 文档，提炼主题与能力边界。

## 步骤 2：语义分析（必须）

从文档中提炼：

- 主题名与主题意图（可形成 topic id）
- 核心概念与关键流程
- 业务规则与边界条件
- 任务触发词（写入对应 `matchers/<matcherId>.json` 的 `includeAny`）
- 与现有主题的依赖关系（用于 `topicDependencies`）

## 步骤 3：写入 topics

- 目标路径：`.Knowledge/topics/<topic>.md`
- 若已存在同主题：优先增量更新，避免重复主题。
- 若为新主题：新增文件并补充清晰标题、适用场景、规则与流程。

## 步骤 4：更新 index

- 更新 `.Knowledge/index.md` 的主题路由表。
- 保证“同主题单行”。
- 主题路由表需维护“关联文档（摘要）”列：每个主题补充 1-3 条关键文档**可点击 Markdown 链接**（格式：`[标题](相对路径)`，优先 `stock-docs/req-docs`）。
- 若某主题暂无可公开文档，写“无”或“待补充”，禁止留空导致歧义。
- 若新增/删除主题，索引同步调整，避免孤儿路径。

## 步骤 5：更新路由清单（按需）

- 本步骤由主 agent 落盘（写权硬约束），子 agent 不得执行。
- 更新 `manifest-routing.topicPaths`（topicId -> topic 文件路径）
- 更新 `manifest-routing.taskToTopicRules[]`（任务到主题集合 + matcherId）
- 更新 `manifest-routing.topicDependencies`（先读依赖后读主主题）
- 更新 `matchers/<matcherId>.json` 的 `includeAny`（关键词词表；路径须与 `taskToTopicRules[].matcherPath` 一致）
- 校验 `fallbackTopic`、`topicPaths`、`matcherId` 引用有效
- 仅做最小改动，不重写无关字段

## 路径与引用约束

- `sourceDoc` 或文档引用统一指向 `.Knowledge/stock-docs/<文件名>.md`
- 禁止把 `.Knowledge/req-docs/` 作为 topic 的 `sourceDoc`
- 禁止改写配置根 `rules/skills`

## 输出摘要（必须）

- 新增/更新的 topic 文件
- `index` 更新项
- 路由清单更新项（如有）
- 失败或跳过项及原因

## 复杂场景示例

用户输入：`f2s-ctx-build .Knowledge/stock-docs/回调改造_终稿.md`，且现有 `topics/callback.md` 已存在。

- 若新文档与现有 `callback` 主题高度重合：原位更新 `topics/callback.md`，不要新建 `callback-v2.md`。
- 若新文档新增「重试补偿」子能力：可新增 `topics/callback-retry.md`，并在 `manifest-routing.topicDependencies` 中声明 `callback-retry -> callback`。
- 更新后同步 `index` 与路由清单，确保 `topicPaths`、`fallbackTopic`、`matcherId` 仍有效。

## 完成后自检

1. `.Knowledge/topics/*.md` 与 `manifest-routing.topicPaths` 一一对应。
2. `index.md` 主题表与 topics 文件集合一致，且每个主题都包含“关联文档（摘要）”。
3. 每个 `taskToTopicRules[].matcherPath` 文件存在且其中 `id` 与 `matcherId` 一致。
4. 未触碰配置根 `rules/skills`。
5. 中大变更时是否按文件级契约拆子（子 A / 子 B 路径互不重叠）。
6. `manifest-routing.json` / `.Knowledge/index.md` 由主 agent 单点落盘，无子 agent 越权写入。

