---
name: f2s-kb-upgrade
description: 知识库模板升级技能（仅指本 SKILL）：**流程分流 V1** 须先 f2s-kb-migrate 再在流程内代跑 flow2spec init；**现行库（流程代号 V2+，含已用 .Knowledge 的 Flow2Spec npm v3.x 等项目）** 则代跑 init 以对齐 manifest-routing + matchers 分片（包内 `manifest-matchers.json` 仅作 init 合并种子，不落盘 .Knowledge）。触发：f2s-kb-upgrade、一键升级迁移、旧项目升级、知识库模板升级。注意：不要把单独的 flow2spec init 称作「升级命令」；**V1/V2+ 为技能内分流代号，不等于 npm 包主版本号**。
---

> 执行口径：本技能用于「代替用户跑 shell」完成 **按本 SKILL 定义的** Flow2Spec **模板与配置根对齐**；其中一步会代跑 **`flow2spec init`**，但 **`init` 不是「升级命令」**，**升级命令 / 知识库升级** 仅指 **`f2s-kb-upgrade` 本技能全流程**。

# f2s-kb-upgrade（知识库模板升级技能）

**术语（必须）**：**「升级」「升级命令」「知识库升级」** 仅指按本文件 **`f2s-kb-upgrade`** 执行的完整技能流程。**`flow2spec init`** 是 CLI **初始化/落盘**命令；本技能 **步骤 2** 会代跑它，**禁止**把用户单独执行的 `init` 或 CLI 帮助里的 `init` 表述为「升级命令」。

## 边界（避免误区）

- **`flow2spec init` 不写业务知识**：不替代 `f2s-kb-add`、`f2s-kb-fix`、`f2s-kb-feat`、`f2s-kb-sync`、`f2s-kb-build` 等对 `stock-docs` / `req-docs` / `topics` 正文与业务向路由词条的维护。
- 本技能跑通的是 **包版本下的目录、模板占位、路由结构对齐**；用户若说「把新能力写进知识库」，应引导 **`f2s-kb-sync` / `f2s-kb-add`** 等，而非仅 `f2s-kb-upgrade`。

## 编排（主 / 子 agent）

- 两字段（`subAgent` / `switchAgentVerification`）语义以统一入口为唯一事实源：**Cursor/Claude** 读配置根 `rules/f2s-flow2spec-unified-entry.*`；**Codex** 读 `.codex/topics/f2s-flow2spec-unified-entry.md`（与上同源，`flow2spec init` 镜像）。本节不复述。
- **子 agent 职责**（仅当 `subAgent=true`）：代跑 `flow2spec init` 等 shell 命令；仅承接命令执行，不承担知识库正文落盘。
- **主必控**（主 agent 不可下放）：
  1. **版本分流**：**V1** 先走 `f2s-kb-migrate` 再进入本技能；**现行库（V2+）** 直接进入 `init` 流程（含 Flow2Spec **npm v3.x** 等，只要已满足步骤 0 中「现行库」条件，均走此支，**勿**因主版本为 3 再单独设一套流程）。
  2. **`init` 后重读**：从磁盘重读 `f2s-kb-upgrade/SKILL.md`，对比标识是否变化。
  3. **整技能重跑**：SKILL 有变化时，按新版字面从头再跑一轮，直至连续两轮无变化。
  4. **步骤 3b 融合**：`.Knowledge/index.md` 的维护区保留 + 包版对齐融合由主 agent 执行。
  5. **校验摘要**：校验结论与输出摘要由主 agent 汇总。
- **写权硬约束**：`.Knowledge/index.md` **只由主 agent 落盘**，子 agent **不得触碰**；`manifest-routing.json` 同属主落盘。
- 本 SKILL 不绑定交叉校验；落盘侧自验。

## 与 `f2s-kb-migrate` 为何并存

| 技能 | 解决的问题 |
| --- | --- |
| **`f2s-kb-migrate`** | **结构搬家**：`docs-index.md` / `index-doc.md`、`rules/main.md(c)`、业务 `skills/`、散落 `stock-docs`/`req-docs` → **迁入 `.Knowledge`**，落盘 `migration-report.md`、删除清单需用户确认。不代跑 npm 包升级。 |
| **本技能 `f2s-kb-upgrade`** | **包与模板对齐**：代跑 **`flow2spec init`**，合并 **`manifest-routing.json`** 与 **`matchers/*.json`**（包内 `manifest-matchers.json` 仅作 init 合并种子，**不落盘**到 `.Knowledge`），刷新各 agent **`rules`/`skills`**（或 Codex **`AGENTS.md`**）；`init` 另将包内 **`index.md` → `.Knowledge/template/index.template.md`** 作对照快照，**`.Knowledge/index.md`** 由步骤 3b **diff 对齐**，init **不**自动改其正文。 |

- **旧项目一键闭环**：**先 `f2s-kb-migrate`** → **再本技能**（`init`）。禁止仅用 `init` 代替完整迁移。
- **已是新版 `.Knowledge` 的项目**：**只跑本技能**，勿重复 migrate。

**为何 Cursor / Claude / Codex 下各有一份同名 `SKILL.md`？**  
各工具只加载**本配置根**下的 `skills/`（例如 Codex 仅 `.codex/skills/`）。内容应以 **`templates/skills/`**（或包发布物）为源保持一致；`flow2spec init` 会向所选 agent 目录**同步落盘**。

## 目标

当用户说「帮我升级知识库模板 / 跑 f2s-kb-upgrade / 同步最新 Flow2Spec」时，Agent **按本技能 `f2s-kb-upgrade` 全文流程执行**（含代跑 `flow2spec init`、清理、校验、摘要）；**勿**把仅执行 `init` 等同于完成本技能。

## 默认行为

1. 本技能步骤 2 代跑 **`flow2spec init`** 时，默认 **增量落盘**（不带 `--reset-knowledge`）。
2. 仅当用户明确要求「覆盖重置」时，才在 `init` 末尾追加 `--reset-knowledge`。
3. 优先写入用户指定的 agent；未指定时默认 `cursor claude codex`。

## init 与技能自更新（必须）

本技能在 **步骤 2** 会执行 **`flow2spec init`**；`init` 会把包内 **`templates/skills/`** 等同步到各 agent **配置根**，因此 **`init` 成功结束后**，本仓库里的 **`skills/f2s-kb-upgrade/SKILL.md`** **可能被新版本覆盖**，与当前对话里已缓存的旧说明不一致。

**闭环（防旧条令）**：

1. **`init` 前**（推荐）：记下当前配置根内 **`skills/f2s-kb-upgrade/SKILL.md`** 的标识（如 `mtime`、文件大小或正文 hash）。  
2. **`init` 成功结束后**：**重新读取磁盘上** 该 **`SKILL.md` 全文**（Cursor：`.cursor/skills/f2s-kb-upgrade/SKILL.md`；Claude：`.claude/skills/...`；Codex：`.codex/skills/...`，与本次 `init` 写入的 agent 一致）。  
3. **若相对步骤 1 有变化**（或刚升级 Flow2Spec 包、无法确认是否无变）：**必须以最新 SKILL 为准**，**从下文「步骤 0」起完整再执行一遍**本技能（含版本分流、是否再次 `init`、校验与摘要——一律按新版字面）；可循环直至**连续两轮**读到的 SKILL **无变化**，或用户明确要求停止。  
4. **若无变化**：继续执行步骤 3 及以后。

> 口径：**本技能步骤 2 执行 `init` 后** → 再读最新 `f2s-kb-upgrade/SKILL.md` → 有变则 **整技能重跑**；不要仅凭会话记忆执行 **本技能**。

## 强制流程

### 步骤 0：版本判定与分流（必须，先于 init）

> **命名说明**：下文 **「V1」「现行库（V2+）」** 为本技能**流程分流代号**。**npm 包为 v3.x、v4.x…** 且仓库**已**是 `.Knowledge` + `manifest-routing` 形态时，仍走 **「现行库（V2+）」** 支（仅 `init` 对齐），**不要**把 npm 主版本数字当成这里的「V2」字面限制。

**V1 — 旧版知识组织（须先迁移再 init）**  
命中**任一**强信号则按 V1：

- 配置根仍有 **`docs-index.md` 或 `index-doc.md`**，且主要仍经 **`rules/main.md` / `rules/main.mdc`** 收口；或  
- 业务 **`stock-docs` / `req-docs` 与规则、业务 skills** 仍以配置根旧树为主，**未**稳定落在 `.Knowledge`。

**动作**：先按 **`f2s-kb-migrate`** 全流程执行（含 `migration-report`、删除清单确认），**再**进入步骤 1–5 执行 `flow2spec init`。

**现行库（V2+）— 已上 `.Knowledge` + 新版路由（仅包级 / 形态对齐）**  
同时满足：

- 存在 **`.Knowledge/manifest-routing.json`**，且 **`topicPaths` / `taskToTopicRules`** 可用；  
- 业务文档已以 **`.Knowledge/stock-docs`、`req-docs`、`topics`** 为主（可与 V1 刚结束状态衔接）。

**历史口径**：若仓库里仍有遗留 **单文件 `manifest.json`**，**不得**再当作机读事实源；机读以 **`manifest-routing.json` + `matcherPath` 指向的 `matchers/*.json`** 为准，`init` 负责与模板**合并 / 回填分片**。

**动作**：直接进入步骤 1–5；**无需** migrate，除非用户明确要求重做迁移。

### 步骤 1：确认本技能内 `init` 模式（必须）

- 若用户未明确「覆盖重置」，本技能步骤 2 默认 **增量 `init`**。
- 若用户提到「全部按模板覆盖/重置」，二次确认后再使用 `--reset-knowledge`。

### 步骤 2：执行命令（代用户跑 shell）

在目标项目根目录执行以下其一：

1. 优先（推荐升级到最新包）：
   - `npx @double-codeing/flow2spec@latest init <agents...>`
2. 若项目已固定使用本地安装：
   - `npx flow2spec init <agents...>`
3. 覆盖重置时：
   - 在上述命令末尾追加 `--reset-knowledge`

> `<agents...>` 示例：`cursor claude codex`。

**步骤 2 完成后**：立刻执行上文 **「init 与技能自更新」**：重读 **`skills/f2s-kb-upgrade/SKILL.md`**；若有更新则 **从步骤 0 整技能重跑**，再回到步骤 3（避免用旧版 SKILL 做后续校验）。

### 步骤 3：旧主题模板清理与引用修复（若存在则必须执行）

**本技能步骤 2** `flow2spec init` 成功后，先执行「旧文件清理 + 引用修复」：

> **skill 目录自动对齐**：`flow2spec init` 现已自动删除配置根 `skills/` 中不再存在于 `templates/skills/` 的旧目录（重命名/删除的 skill 如 `f2s-ctx-build`、`f2s-doc-add`、`f2s-rule-capture`、`stock-docs-vs-req-docs` 等），**无需 Agent 手动清理**。

1. 清理旧命名主题文件（仅在文件存在时删除，均为无 `f2s-` 前缀的旧版遗留）：
   - `.Knowledge/topics/flow2spec-architecture.md`
   - `.Knowledge/topics/implement-tech-design.md`
   - `templates/knowledge/topics/implement-tech-design.md`
2. 修复引用（仅在文件存在时更新；**`.Knowledge/index.md` 正文不由 init 改写**，见步骤 3b）：
   - `templates/knowledge/index.md`
   - `templates/knowledge/manifest-routing.json`
   - `.Knowledge/index.md`（按需人工或技能侧改路径/段落）
   - `.Knowledge/manifest-routing.json`
3. 引用更新目标（确认使用新名）：
   - `.Knowledge/topics/f2s-flow2spec-architecture.md`
   - `.Knowledge/topics/f2s-implement-tech-design.md`
   - `.Knowledge/topics/f2s-stock-docs-vs-req-docs.md`

> 口径：只清理”旧命名主题文件”，不删除带 `f2s-` 前缀的现行主题文件。

### 步骤 3b：`index.md` 融合与 `template/index.template.md`（必须执行）

> **范围**：本条「融合」**仅在本技能内由 Agent 落盘 `.Knowledge/index.md`**；**不要求、也不假设**修改 Flow2Spec 包内 **`cli.js` / `lib/init.js`** 等 JS。`init` 行为仍以仓库现行为准（仅复制快照等）。

**`flow2spec init` 在本流程中的角色**：把包内 **`templates/knowledge/index.md` 原样复制**到 **`.Knowledge/template/index.template.md`**，作为**包版外壳对照**；**不**替代本步骤对 **`index.md`** 的融合书写。

#### 融合规则（必须遵守）

0. **写权归属**：本步骤的 `.Knowledge/index.md` 融合恒由主 agent 执行并落盘；子 agent 不得直接写入（写权硬约束）。
1. **对照源**  
   - **包版全文**：**`.Knowledge/template/index.template.md`**（与当前包 `templates/knowledge/index.md` 一致）。  
   - **项目现状**：**`.Knowledge/index.md`**。

2. **项目自身维护区（锚点：包模板 `index.md` 约第 18–19 行）**  
   - 以包模板行号为参照：**从二级标题 `## 主题一览` 起**（对应模板中紧接上一段 `---` 之后的 **`## 主题一览`** 与节首空行，即常见 **第 18–19 行**），**直至本节结束**：即到 **紧挨在 `## 命中与执行`（含括号说明）之前的那个 `---` 之前**的整块内容（含「主题一览」下的表格、节内说明段落等）。  
   - 该整块 **必须保留来自当前项目 `.Knowledge/index.md` 的正文**（由业务与 **f2s-*** 维护）；**禁止**用包模板同一段落**整体替换**覆盖（避免丢失业务主题行与摘要列）。  
   - **允许**在该块内做**最小必要修补**：例如为包新增的 `topicPaths` 主题**补行**、按 **`manifest-routing.json` 的 `topicPaths`** 改正「路径」列、与快照对比后补上包模板里**新增**的表格列说明——仍以保留项目已有行为主。

3. **必须与包模板一致的部分**  
   - **上述维护区之外**的所有内容（含 **`## 主题一览` 之前**从文件开头到该节前、以及 **`## 命中与执行` 及之后**直到文件结尾）：须与 **`.Knowledge/template/index.template.md`** 中对应段落 **一致**（以包版为准；diff 后以模板覆盖项目侧旧文）。

4. **产出**  
   - 将融合后的完整 **`index.md`** 写回 **`.Knowledge/index.md`**。  
   - **diff** 结论与是否改动写入步骤 5 摘要。

5. **与 `--reset-knowledge` 的关系**  
   - 若用户已 `reset`，`.Knowledge/index.md` 可能被模板整文件覆盖，仍须按本条 **2** 从备份或版本控制恢复「主题一览」块后再与包外壳做 **3** 的合并（若仓库无备份，则按 `topicPaths` + 快照**重建**主题表并让用户确认）。

### 步骤 4：校验本技能执行结果（必须）

至少校验：

1. 步骤 2 的 `flow2spec init` 是否成功退出（exit code = 0）。
2. init 输出是否包含 **路由清单与 `.Knowledge` 的结论**（已对齐/已最新/reset 覆盖等），以及 **`index.template.md` 已复制** 一行（若包内缺 `index.md` 则无此行）。
3. `manifest-routing` 与各 `matcherPath` 分片是否可解析，且 `topicPaths` / `matcherId` 引用均有效。
4. 存在 **`.Knowledge/template/index.template.md`**；已按步骤 **3b** 完成 **`index.md` 融合**（维护区保留 + 其余与包版一致）或写明待用户处理原因。
5. 配置根产物是否存在：
   - Cursor/Claude：`rules/`、`skills/`
   - Codex：`.codex/AGENTS.md`、`skills/`

### 步骤 5：输出结果摘要（必须）

输出以下信息：

- 执行命令（含 agent 与是否 reset）
- 是否成功
- 旧主题模板清理结论（删了哪些 / 哪些本就不存在）
- `index/manifest` 引用修复结论
- **index**：`index.template.md` 是否已生成；**`index.md` 融合**是否完成（锚点 **18–19「主题一览」节**保留、其余与包版一致）及 `topicPaths` / diff 结论（步骤 3b）
- **SKILL 自更新**：`init` 后是否重读 `f2s-kb-upgrade/SKILL.md`；是否因文件变化 **整技能重跑**及轮次（见「init 与技能自更新」）
- manifest / matchers 对齐结论（随 init 输出）
- 关键文件校验结论
- 如失败，给出下一步可执行修复建议

## 输出摘要模板（建议）

```markdown
## f2s-kb-upgrade 执行结果

- 本技能内代跑命令：`<实际执行的 flow2spec init ...>`
- init 模式：`增量` / `覆盖重置（--reset-knowledge）`
- 执行结果：`成功` / `失败`

### 核心校验
- 旧主题文件：`已清理` / `无需清理`
- 引用修复：`已更新` / `已一致`
- **index（快照 + 融合）**：`快照已复制` / `index.md 已融合` / `待处理（见备注）`
- **f2s-kb-upgrade SKILL**：`init 后无变化` / `已按新版重跑 N 轮` / `待确认`
- manifest-routing / matchers 分片：`已与模板对齐` / `已是最新` / `reset 覆盖`
- topics.path：`全部存在` / `存在缺失（见下）`
- agent 产物：`通过` / `异常（见下）`

### 备注
- <失败原因或后续建议>
```

## 约束

- 不把“请用户自行运行命令”作为默认方案；优先由 Agent 直接执行。
- 未经明确同意，不执行 `--reset-knowledge`。
- 不修改业务代码；仅按 **本技能 `f2s-kb-upgrade`** 流程与结果做校验。
- 步骤 3b `.Knowledge/index.md` 融合与 `manifest-routing.json` 均恒由主 agent 落盘（写权硬约束）；子 agent 仅可代跑 shell 命令。

## 完成后自检

1. 是否已做 **步骤 0**：V1 未跳过 migrate、**现行库（V2+）** 未误跑 migrate。
2. 是否在 **步骤 2 的 `init` 之后**重读过 **`f2s-kb-upgrade/SKILL.md`**，并在有变化时 **整技能重跑**（见「init 与技能自更新」）。
3. 是否已实际执行 shell 命令（而非只给建议）。
4. 是否明确标注增量 or reset 模式。
5. 是否已处理旧主题文件清理与 `index/manifest` 引用修复。
6. 是否已执行 **步骤 3b**：**融合** `index.md`（**主题一览**节起至命中与执行前为项目维护区，其余同包版），并核对 `topicPaths`。
7. 是否输出了 manifest 与关键路径校验结果。
8. 若失败，是否给出下一步具体命令建议。
9. 步骤 3b 的 `index.md` 融合由主 agent 完成并落盘，无子 agent 越权写入。
