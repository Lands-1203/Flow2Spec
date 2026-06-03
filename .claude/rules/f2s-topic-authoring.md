---
description: Flow2Spec 主题创作准则：topic 命名 / 骨架 / topicDependencies 判定 / rule 是否需建对应 topic / 写盘权属指针
---

# Flow2Spec 主题创作准则（Topic Authoring）

本条为 **创作侧** 单一事实源；凡 `f2s-*` 技能在新增或修改 `.Knowledge/topics/<topic>.md`、调整 `manifest-routing.topicDependencies`、删除 / 迁移 topic 时，**必须先 Read 本条全文**，再按对应 SKILL 的步骤继续。与 `f2s-flow2spec-unified-entry`（消费侧）**并存**；硬冲突时以统一入口为准。

## 适用范围

满足下列任一即「触达本条」：

- 新增或重写 `.Knowledge/topics/<topic>.md`；
- 修改既有 topic 的标题 / 适用场景 / 关键流程边界；
- 在 `manifest-routing.topicDependencies` 中新增、删除或调整依赖边；
- 在 `taskToTopicRules[].topics` 中新增引用某个 topic id；
- 删除或迁移 topic（`f2s-ctx-rm` / `f2s-kb-migrate` / `f2s-kb-upgrade`）。

## 1. topic 命名

- **id**：`kebab-case`，与 `manifest-routing.topicPaths` 的 key 一致。
- **文件名**：`.Knowledge/topics/<topic-id>.md`；若该 topic 与同名 `f2s-*` 技能 / 规则强绑定（如 `f2s-task` / `f2s-req-plan`），文件名可加 `f2s-` 前缀以示同源。
- **不要**：版本后缀（`-v2` / `-new`）、个人花名、与 `index.md` 行级标题冲突的同义词。

## 2. topic 正文骨架

每个 topic 至少包含：

1. **标题与一句话意图**（一行写清"该 topic 解决什么"）；
2. **适用场景 / 触发词**（与对应 `matchers/<id>.json` `includeAny` 语义一致）；
3. **核心规则 / 流程**（可执行知识；步骤须可由 Agent 复现）；
4. **依赖声明**（若 `topicDependencies` 中存在依赖项，正文须显式写一句「执行前须先读依赖主题 `<dep>`」，参考 `topics/f2s-req-plan.md` 首段写法）；
5. **边界与禁止项**（避免膨胀到隔壁 topic）。

## 3. topicDependencies 判定准则

设当前主题为 A、候选依赖为 B。**四问命中任一即声明 `A → B`**：

1. **前置规则强引用**：A 的执行步骤**显式提到** B 的术语 / 产物 / 落盘约束（例：`f2s-req-plan` 要求「按 `f2s-task` 维护 `.task/`」）。
2. **缺 B 必出错**：仅读 A 不读 B 能否产出对的结果？答否——典型为 A 写"怎么做"、B 写"在哪做 / 用哪份输入"。
3. **共享落盘目标**：A、B 写同一组文件且 B 定义写盘格式（如 `.task/`、`.Knowledge/topics/`）。
4. **fallback 跳转 B**：A 自身覆盖不全，按现有约定回落 B 兜底。

**反向排除**（避免依赖膨胀）：

- 仅术语相邻（都谈"知识库"）→ 不写依赖，靠 `index.md` 语义边界即可。
- 跨主题信息互查（A 想"了解一下" B）→ 不写依赖，靠 `taskToTopicRules` 次高候选 + `expand` 补召回。
- **传递依赖不重复声明**：若 `A→B`、`B→C` 已成立，禁止再写 `A→C`（读 B 时会自然带上 C）。

**DAG 与最小化**：`topicDependencies` 必须是 DAG，禁止环；保持最小边集。

**判定时机**：终稿与新 / 改 topic 落盘后，扫正文中**反引号引用的其他 topic id 与规则文件名**，逐个套四问；命中即写入 `manifest-routing.topicDependencies`，**并在新 topic 正文显式写依赖声明**（见骨架第 4 条）。

## 4. rule 是否需新建对应 topic

判据：**该 rule 是否会作为用户任务路由命中**。

- **会**（用户问 / 输入会触发该规则的执行）→ 须在 `.Knowledge/topics/` 建对应路由摘要，并在 `taskToTopicRules` 配置入口。例：`f2s-task`（变更追踪用户场景命中）、`f2s-implement-tech-design`（"按方案实现"用户场景命中）。
- **不会**（仅被其他规则 / SKILL 内部引用，用户不会直接发起）→ **不建** topic。例：`f2s-knowledge-preflight`、`f2s-karpathy-guidelines`、`f2s-config-check`、本条 `f2s-topic-authoring`。

误区：「重要的规则就该有 topic」——重要不等于"用户路由命中"；让消费方 SKILL 在正文里直接 `Read rules/<id>.*` 全文即可，无需走 manifest 路由。

## 5. 写盘权属（指针）

`manifest-routing.json` / `.Knowledge/index.md` / `.Knowledge/topics/*.md` 的写权约束**以 `f2s-flow2spec-unified-entry` 与各 SKILL 内「写权硬约束」为准**，本条不复述；遇分歧以统一入口与对应 SKILL 为准。

## 禁止项

- 在未读本条的情况下新增 / 修改 topic 或 `topicDependencies`。
- 把"重要的规则"硬塞进 `taskToTopicRules`（参见第 4 条）。
- 用 `topicDependencies` 表达"信息相关"（应通过 `index.md` 语义边界 + matcher 关键词补召回，而非依赖边）。
- 在 `topicDependencies` 中写传递冗余边或形成环。
