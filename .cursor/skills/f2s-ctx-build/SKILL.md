---
name: f2s-ctx-build
description: 根据 stock-docs 文档生成 Rules、Skills 与文档索引；触发：生成项目上下文、f2s-ctx-build、终稿生成上下文
---
> **「配置根」**：当前 agent 对应的 AI 工具配置目录（`flow2spec init` 写入，常见 **`.cursor/`**、**`.claude/`**、**`.codex/`**）。下文 **`配置根/...`** 指该目录下的相对路径。

# 根据文档生成项目上下文（Rules、Skills、文档索引）

用户会在本技能后附带**一个参数**：要么是一个 **URL**（如 `https://xxx.com/doc`），要么是一个**本地路径**，且路径应指向 **配置根/stock-docs/** 下的 Markdown（PDF/初稿/终稿/架构说明等**存量上下文源**，用于生成 Rules、Skills）。**不要**把 **`配置根/req-docs/`**（按方案实现代码的技术方案目录）当作本技能入参；若用户只持有该目录下的方案，应提示先将符合《终稿模版》的文档复制或整理到 **`配置根/stock-docs/`** 再执行。请按以下步骤执行，用你的**大模型能力**分析文档并生成完整架构。

**文档产物阶段约定**：doc 中的产物一般分为 **原稿**、**初稿**、**终稿**；本技能生成的 **Rules、Skills 文件名与目录名不带 `_终稿` 等后缀**，与现有约定一致（如 `<主题>-context.mdc`、`<主题>-context/SKILL.md`）。

**生成原则：拆解与分工**  
本技能生成的所有产物须遵循以下两点，执行时即按此执行，而非事后补救：

1. **拆解**：根据文档篇幅与领域块数量，决定是「单 Rule + 单 Skill」还是「索引入口 + 多条专题 Rule/Skill」。篇幅长或含多块独立内容（如接口约定、消息队列、配置、公共工具等）时，应拆成索引入口 + 多条按场景/主题的 Rule 与 Skill，使单条更聚焦、按需加载。
2. **分工**：
   - **Rules**：承担**约束、约定、作用范围**；一条 alwaysApply 的索引入口 + 若干条用 globs 限定在相关路径的专题规则；正文写「必须/禁止/约定」类内容。
   - **Skills**：承担**领域知识、操作步骤、示例**；一个总览 skill + 若干专题 skill；description 写清触发词与使用场景，正文写概念、流程、方法表、示例。

---

## 步骤 1：获取文档内容

- 若用户给出的是 **HTTPS/HTTP URL**：使用你可用的网络请求能力（如 web fetch）拉取该 URL 的页面内容。若你所在环境无法访问该 URL（如内网），则回复用户说明「请将页面内容复制到项目内 `配置根/stock-docs/xxx.md`，再执行本技能并传入路径 `配置根/stock-docs/xxx.md`」。
- 若用户给出的是**本地路径**：从配置根的父目录读取该文件（须为 **`配置根/stock-docs/…`**，如 `配置根/stock-docs/功能描述.md`）。若路径落在 **`配置根/req-docs/`**（技术方案目录），应提醒用户：本技能入参须为 **stock-docs** 下的存量源文档；请先将符合《终稿模版》的内容整理到 **`stock-docs/`** 再执行。

得到的内容可能是 Markdown、HTML 或富文本，请先提取出**正文**（若是 HTML 可提取 body 内的文本或转成可读的 Markdown）。

---

## 文档路径与链接约定（必守，避免引用错误）

生成任何产物时，**必须**按下列规则写文档路径与链接。**路径写错会导致 Cursor 中链接失效、AI 无法正确打开源文档，务必严格按表执行。**

| 写入位置 | 文档所在目录（固定） | 引用该文档时的写法 |
|----------|----------------------|--------------------|
| **配置根/rules/*.mdc** | 文档在 `配置根/stock-docs/<文件名>.md` | 链接 **必须** 写为 `[文档标题](../stock-docs/<文件名>.md)`，即 href 为 **`../stock-docs/<文件名>.md`**（从 配置根/rules 到 配置根/stock-docs 的相对路径）。 |
| **配置根/skills/<主题>/SKILL.md** | 同上 | 链接 **必须** 写为 `[文档标题](../../stock-docs/<文件名>.md)`，即 href 为 **`../../stock-docs/<文件名>.md`**（从 配置根/skills/xxx 到 配置根/stock-docs 的相对路径）。 |
| **配置根/docs-index.md** | 同上 | 文档路径列：显示可写 `配置根/stock-docs/<文件名>.md`；链接 href **必须** 为 **`stock-docs/<文件名>.md`**（因 docs-index 位于配置根下，同级的 **stock-docs** 目录即 `stock-docs/<文件名>.md`）。示例：`[配置根/stock-docs/技术方案设计.md](stock-docs/技术方案设计.md)`。 |
| **frontmatter 的 sourceDoc** | 同上 | **必须** 写为 **`配置根/stock-docs/<文件名>.md`**（与用户传入的本地路径一致；若用户传的是相对路径如 `配置根/stock-docs/xxx.md`，即用该值）。 |

**正确示例（按位置抄写格式）：**
- Rule 内：`[技术方案设计](../stock-docs/技术方案设计.md)`
- Skill 内：`[技术方案设计](../../stock-docs/技术方案设计.md)`
- docs-index 表格单元格：`[配置根/stock-docs/技术方案设计.md](stock-docs/技术方案设计.md)`
- frontmatter：`sourceDoc: 配置根/stock-docs/技术方案设计.md`

**常见错误（禁止）：**
- **禁止** 在 Rule 内使用 `../../stock-docs/` 或 `req-docs/`（配置根下技术方案目录，非 stock-docs）—— 会 404。
- **禁止** 在 Skill 内使用 `../stock-docs/` 或 `req-docs/`（配置根下技术方案目录，非 stock-docs）—— 会 404。
- **禁止** 在 docs-index 内使用 `../stock-docs/` 或 `配置根/stock-docs/xxx.md` 作为链接 href —— 应仅为 `stock-docs/<文件名>.md`。
- **禁止** 在链接或 sourceDoc 中混用目录：生成上下文的链出与 **sourceDoc** 仅指向 **`stock-docs/`**；勿把 **`配置根/req-docs/`** 下的技术方案当作本技能产物的链出目标。
- **禁止** 在 sourceDoc 中写相对路径如 `../stock-docs/xxx.md` 或 **`配置根/req-docs/xxx.md`** —— 必须为 `配置根/stock-docs/<文件名>.md`。

**记忆要点**：默认文档目录为 **`配置根/stock-docs/`**（与项目约定一致）；Rule 内链出用 `../stock-docs/`，Skill 内链出用 `../../stock-docs/`，docs-index 内链出用 `stock-docs/`；sourceDoc 用 `配置根/stock-docs/<文件名>.md`。生成后自检所有链接与 sourceDoc，确保层级正确、与项目约定目录一致。

---

## 步骤 2：用大模型分析文档

请你**完整理解**该文档，并提炼出：

- **主题/标题**：文档的核心主题，用作生成产物的命名（如「订单功能」→ 文件名/目录名用英文或拼音如 `order`，或保留中文如 `订单功能描述`）。
- **核心概念**：术语表、名词解释、关键实体（如订单、创建、加入、完成、失败等）。
- **状态与流转**：若有状态机、流程，请整理出状态名与流转条件。
- **业务规则**：约束、限购、时效、支付与退款、库存等要点。
- **关键流程**：用户侧或系统侧的主要流程（创建、加入、完成、失败处理等）。

---

## 步骤 3：生成并写入以下产物

请**直接创建或覆盖**以下文件，保证格式正确、内容由你分析后生成（不要照抄原文，要提炼与结构化）。生成前先根据**拆解与分工**原则判断：本次是生成「单 rule + 单 skill」还是「索引入口 + 多条专题 rule/skill」。

**路径提醒**：写入 Rule/Skill/docs-index 时，文档链接 href 和 sourceDoc **必须**严格按「文档路径与链接约定」表执行——Rule 仅用 `../stock-docs/<文件名>.md`，Skill 仅用 `../../stock-docs/<文件名>.md`，docs-index 仅用 `stock-docs/<文件名>.md`，sourceDoc 仅用 `配置根/stock-docs/<文件名>.md`。勿凭印象写错层级。

**main.mdc 与 docs-index.md 的区别**  
- **main.mdc**（`配置根/rules/main.mdc`）：**项目的总概述和索引**，固定命名 **main**，**唯一** alwaysApply 的 rule。给 AI 看的「体系结构 + 模块一览 + 公共能力入口」，让 AI 大致知道项目结构，需要时再去读各模块的 rule/skill；并在正文中**强制约定**「先查 `docs-index.md` 再下钻」（见 3.0 正文第 4 点），以落实渐进式读取。  
- **docs-index.md**（`配置根/docs-index.md`）：**需求/文档索引**，按文档列出的表格（文档路径、Rules、Skills、简要说明），供人与 AI 查「某文档对应哪些产物」。不参与 alwaysApply，**须由 main 正文显式要求 Agent 在定位文档↔产物时优先读取**，否则不会自动进入上下文。

### 3.0 main.mdc（项目总概述与索引，唯一 alwaysApply）

- **路径**：`配置根/rules/main.mdc`（**固定命名**，不可改为其他文件名）
- **frontmatter**：`description: 项目总概述与索引，体系结构、模块一览、能力入口`，`alwaysApply: true`
- **正文结构**（简短；含下述第 4 点为优先，总行数可略超 50 行，**不得省略第 4 点**）：
  1. **项目结构**：按当前项目实际目录与约定，用通用表述写接口与模块的划分（如对客接口、公共/功能模块等），**不要写仅本项目特有的结构名**（如某团队、某产品线专属目录名），以便本技能复用于其他项目。
  2. **模块一览**（表格）：列「模块名」「说明」「详细约定加载方式」。每行对应一个功能模块：说明该模块用途；加载方式写「打开项目约定的该模块路径时自动加载对应 rule；或查阅 配置根/stock-docs/xxx、配置根/skills/xxx」。
  3. **公共能力入口**（若有）：接口与上下文、消息队列、配置、公共工具等入口的简短描述 + 指向对应 rule，并写实现位置（按项目约定，如 ctx 注入、MQ 辅助、配置辅助、模型、公共工具等）。
  4. **全文索引与渐进式读取（必填）**：须单独成段或小节，至少包含以下语义（可压缩措辞，不可删掉任一条）：
     - **映射表位置**：「文档路径 ↔ Rules / Skills」的完整表在 **`配置根/docs-index.md`**（`docs-index` 非 alwaysApply，不会自动进上下文，须按需打开）。
     - **读取顺序**：当要根据**某份 stock-docs 文档、某需求/模块名**定位应遵循的规则或应加载的技能时，**应先读取 `docs-index.md`**，在表中找到对应行，再按 **Rules**、**Skills** 列给出的路径打开 `.mdc` / `SKILL.md`；需要长文细节时再打开 **stock-docs** 链出的源文档；仍不足再下钻**业务源码**。
     - **避免**：在未查 `docs-index.md`、未锁定相关 Rule/Skill 前，对工作区做**无范围**的大面积检索，或通读与当前问题**无关**的长文档。
  5. 文末可再单列一行链接提示：**全文索引文件**：`配置根/docs-index.md`（与第 4 点呼应即可）。
- **main.mdc 的更新时机**：每次执行本技能时，**可能**会更新 main.mdc，**也可能**不更新。  
  - **会更新**：若本次文档属于「功能模块」或「公共模块说明」类，需在 main 的「模块一览」或「公共能力入口」中体现，则更新 main（若 main 不存在则先创建；若已存在则只更新与本次文档相关的部分，不删已有且无关的模块行）。  
  - **不更新**：若本次文档不涉及项目总概述与索引（如单次需求说明、不纳入体系结构的文档），则**不修改** main.mdc，仅生成/更新该文档对应的专题 Rules、Skills 及 docs-index 即可。

### 3.1 Rules（专题规则，一律非 alwaysApply）

- **路径**：`配置根/rules/<主题>-context.mdc`（或拆解后的多条，如 common-interface-ctx.mdc）
- **按配置根区分（必守）**：
  - **`.cursor/`（Cursor）**：规则文件扩展名 **`.mdc`**；路径范围用 **`globs:`**；专题规则 **`alwaysApply: false`**；总览 **`main.mdc`** 唯一 **`alwaysApply: true`**。
  - **`.claude/`（Claude Code）**：规则须为 **`.md`**（Claude Code 不加载 `.mdc`）；路径范围用 **`paths:`**，**不要**写 **`globs:`**；**不要**写 **`alwaysApply`**（无 `paths` 的规则与会话一并加载）。若项目同时存在 `.cursor/` 与 `.claude/`，生成或更新 **`.claude/rules/`** 时须按上表写 **`.md`** + **`paths:`**。`flow2spec init claude` 已对包内模板做自动转换，手工新增规则时请对齐官方文档。
- **格式**（以 **Cursor `.mdc`** 为默认表述；**Claude** 将 `globs`→`paths`、扩展名 `.md` 即可）：
  - frontmatter：`description: <一句话说明本规则>`，**禁止** `alwaysApply: true`（唯一 alwaysApply 为 main.mdc）
  - **globs（必填，仅 Cursor）**：按主题限定在相关路径，例如功能模块 → `globs: "**/functions/<模块名>/**"`；接口与 ctx → `globs: "**/functions/**/*.js"`；消息队列消费 → `globs: "**/qmq/**/*.js"` 或项目约定的 MQ 消费目录；公共工具 → `globs: "**/utils/common.js"` 或项目约定的工具路径。**Claude Code 下改为 `paths:`，键名同列表写法。**
  - `alwaysApply: false`（仅 Cursor；Claude 专题规则不写此项）
  - **版本管理（必填）**：`sourceDoc: <本次命令入参，即 配置根/stock-docs/xxx.md>`，`generatedAt: "<当前时间东八区北京时间，ISO 8601 如 2026-01-28T20:00:00+08:00>"`
  - 正文：提炼的**核心概念、关键流程、规则要点**（Markdown，简洁可读）+ **文档链接**（链接 href 必须为 `../stock-docs/<文件名>.md`，见「文档路径与链接约定」）
- **与 main.mdc 的联动**：仅当本次**会更新** main.mdc 时（见 3.0「main.mdc 的更新时机」）：若本次是功能模块，生成/更新该 rule 后**必须**在 main 的「模块一览」中增加或更新该模块行；若本次是公共模块说明，在 main 的「公共能力入口」中体现即可。若本次**不更新** main，则不改 main.mdc。

### 3.2 Skills

- **路径**：`配置根/skills/<主题>/SKILL.md`（主题建议用英文或拼音，如 `order-context`，避免仅中文目录名）
- **格式**：
  - frontmatter：`name: <主题>-context`，`description: <何时使用本技能，写清触发场景>`
  - **版本管理（必填）**：`sourceDoc: <本次命令入参，即 配置根/stock-docs/xxx.md>`，`generatedAt: "<当前时间东八区北京时间，ISO 8601 +08:00>"`
  - 正文：何时使用、核心概念（表或列表）、关键流程、业务规则要点、**详细文档链接**（链接 href 必须为 `../../stock-docs/<文件名>.md`，见「文档路径与链接约定」）。

### 3.3 docs-index.md（需求/文档索引）

- **路径**：`配置根/docs-index.md`
- **操作**：若文件不存在，先创建表头：

  ```markdown
  # 需求/文档索引

  | 需求/模块 | 文档路径 | Rules | Skills | 简要说明 |
  | --------- | -------- | ----- | ------ | -------- |
  ```

  然后**追加一行**，且**必须填写 Rules、Skills 列**：
  - **Rules**：本次生成的 Rule 路径，多个用顿号或空格分隔，如 `配置根/rules/<主题>-context.mdc` 或 `配置根/rules/common-interface-ctx.mdc`。注意：main.mdc 不在此列逐文档列出（main 为总索引，与单文档非一对一）。
  - **Skills**：本次生成的 Skill 路径，多个用顿号或空格分隔，如 `配置根/skills/<主题>-context/SKILL.md` 或 `配置根/skills/common-modules-context/SKILL.md`、`配置根/skills/common-modules-mq-usage/SKILL.md`。
  - **文档路径与链接（必守）**：文档路径列显示 `配置根/stock-docs/<文件名>.md`；链接 **必须** 为 `[配置根/stock-docs/<文件名>.md](stock-docs/<文件名>.md)`，即 href 只能是 **`stock-docs/<文件名>.md`**（见上文「文档路径与链接约定」）。勿写成 `../stock-docs/` 或误指 **`req-docs/`**。
- 行示例：`| <文档标题> | [配置根/stock-docs/<文件名>.md](stock-docs/<文件名>.md) | <Rules 路径> | <Skills 路径> | <一两句摘要> |`
- 若文件已存在且表头无 Rules、Skills 列，则先补全表头再追加；追加时仍须填写 Rules、Skills 列。
- **同一文档只占一行**：若该文档路径（或文档标题）在表中已有行，则**更新该行**（覆盖 Rules、Skills、简要说明），不要追加新行，便于日后「修改文档后重新生成」时索引保持一对一。

### 3.4 更新与索源（版本管理）

版本管理服务于**更新 docs 时方便更新与索源**：

- **索源**  
  - **从产物找文档**：Rule/Skill 的 frontmatter 中 `sourceDoc` 即源文档路径，`generatedAt` 即本次生成时间。  
  - **从文档找产物**：查 `配置根/docs-index.md` 中该文档所在行的 **Rules**、**Skills** 列，即由该文档生成的全部 Rule/Skill 路径。
- **更新流程**  
  - 修改某份文档后，对该文档**再次执行本技能**并传入同一路径（如 `配置根/stock-docs/技术方案设计.md`），即可覆盖并更新该文档对应的全部 Rules、Skills；文档索引中该文档所在行的 Rules、Skills、简要说明会一并更新。  
  - 无需手动查找要改哪些 Rule/Skill：一次按 doc 执行即可。

### 3.5 按需拆解与加详（执行要点）

当文档**篇幅较长**或**领域清晰**（如同时包含「接口约定、消息队列、配置、公共工具」等多块独立内容）时，**必须**按前述拆解与分工做**拆分 + 适度加详**，使 Rules、Skills 按场景加载、单条更聚焦。

**Rules 拆分建议：**

- **唯一 alwaysApply** 为 **main.mdc**（见 3.0）；不再为单文档单独建 alwaysApply 的「索引入口」rule。各文档对应的索引入口统一合并到 main.mdc 的「模块一览」或「公共能力入口」中。
- 按**主题**拆成的多条 rule 一律 **alwaysApply: false**，每条用 **globs** 限定在相关路径，例如：
  - 功能模块 → `globs: "**/functions/<模块名>/**"`
  - 接口与 ctx 约定 → `globs: "**/functions/**/*.js"`
  - 消息队列约定 → `globs: "**/qmq/**/*.js"` 或项目约定的 MQ 消费目录
  - 公共工具约定 → `globs: "**/utils/common.js"` 或项目约定路径
- 每条 rule 的 frontmatter 中 **且必须含** `sourceDoc`、`generatedAt`（同上），正文写该主题的**核心概念、关键流程、规则要点**，可带简短示例；单条建议 &lt;50 行。生成功能模块 rule 后必须在 main.mdc 的「模块一览」中追加/更新对应行。

**Skills 拆分建议：**

- 保留 1 个**总览** skill：路径如 `配置根/skills/<主题>-context/SKILL.md`，内容为项目/文档总览、各能力入口、关键流程摘要，并在正文中说明「具体某类问题见 xxx-usage 技能」。
- 按**高频场景**再拆 1 ～ 2 个专题 skill，例如：
  - 消息队列发送与消费 → 路径如 `配置根/skills/<主题>-mq-usage/SKILL.md`，description 写清触发词（如「消息队列、发送、topic/subject、消费、MQ 辅助」），正文写定义、发送、消费步骤与示例。
  - 公共工具方法 → 路径如 `配置根/skills/<主题>-utils-usage/SKILL.md`，description 写清触发词（如「公共工具、加密、日志、外部服务、风控、用户、支付、工具方法」），正文写完整方法表、分类、示例。
- 各 skill 的 **description** 必须写清「何时使用、触发词」，便于 Cursor 按问题匹配到对应技能；每条 skill 的 frontmatter **必须含** `sourceDoc`、`generatedAt`（同上）。

**加详要点：**

- 在**专题** rule/skill 中写「必要细节」：示例代码、完整方法表、步骤与注意点；总览/索引入口保持简短，指向详细文档或专题 rule/skill。
- 若文档本身较短、主题单一，则按 3.1、3.2 生成单 rule、单 skill 即可；此时仍须遵守**分工**：Rule 写约束与约定，Skill 写知识与步骤。

---

## 步骤 4：若输入是 URL，保存原文到项目

若用户提供的是 **URL**，请将你拉取到的**原始正文**保存到项目内 **`配置根/stock-docs/<主题>.md`**（或项目约定的文档目录），以便后续引用。主题名可从文档标题或 URL 路径推断，并做合法文件名处理。

---

## 约束与注意

- 所有路径均相对于**配置根的父目录**。
- **文档路径与链接（必守）**：一律按上文「文档路径与链接约定」执行。Rule 内链到文档 **仅允许** `../stock-docs/<文件名>.md`；Skill 内链到文档 **仅允许** `../../stock-docs/<文件名>.md`；docs-index 内链到文档 **仅允许** `stock-docs/<文件名>.md`。sourceDoc 仅允许 `配置根/stock-docs/<文件名>.md`。勿将 **`配置根/req-docs/`** 下的技术方案当作本技能产物的链出目标（链出**仅**指向 **stock-docs**）。
- **版本管理**：每条 Rule 与每条 Skill 的 frontmatter 必须含 `sourceDoc`（`配置根/stock-docs/xxx.md`）、`generatedAt`（东八区北京时间 ISO 8601 +08:00），便于更新时索源与重新生成。
- 生成前可先确认 `配置根/rules`、`配置根/skills`、`配置根/stock-docs` 目录存在，不存在则创建。
- **完成后自检（路径必查）**：
  1. 每个 `.mdc` 中指向源文档的链接 href 是否为 **`../stock-docs/<文件名>.md`**（不是 `../../stock-docs/` 或误链到 `req-docs/`）。
  2. 每个 `配置根/skills/**/SKILL.md` 中指向源文档的链接 href 是否为 **`../../stock-docs/<文件名>.md`**（不是 `../stock-docs/` 或误链到 `req-docs/`）。
  3. `docs-index.md` 中该文档行的链接 href 是否为 **`stock-docs/<文件名>.md`**（不是 `../stock-docs/` 或裸路径）。
  4. 所有 Rule/Skill 的 frontmatter 中 `sourceDoc` 是否为 **`配置根/stock-docs/<文件名>.md`**。
  5. 链接目标与项目约定的文档目录一致（若约定为 `配置根/stock-docs/`，则勿用 **`配置根/req-docs/`** 作为链接目标）。
  完成后用一句话总结：已生成 Rules、Skills、文档索引及（若适用）配置根/stock-docs 下的原文备份；并确认「文档路径与链接约定」已遵守。
