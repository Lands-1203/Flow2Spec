# Flow2Spec 使用说明

本文档是 **Flow2Spec 的使用手册**：面向已安装或准备使用 Flow2Spec 的读者，说明 init 后日常如何使用、目录与产物约定、推荐顺序、典型流程、斜杠命令中英文及常见问题。  
**项目概览与快速开始** 见仓库根目录 [README.md](../README.md)。

---

## 文档结构一览

| 章节 | 内容 |
|------|------|
| [一、init 做了什么](#一init-做了什么) | 执行 init 后写入哪些目录与命令 |
| [二、文档目录约定](#二文档目录约定重要) | 配置根（如 `.cursor/`）下 **`stock-docs/`** 与 **`req-docs/`** 的分工；完整结构见 [目录与路径约定](./README-目录与路径约定.md) |
| [三、推荐执行顺序](#三推荐执行顺序) | 上下文生成 → 提问与实现 → 实现后；[按顺序查命令](./README-命令说明.md#按使用顺序查找) |
| [四、典型流程](#四典型流程) | 架构说明、文档→上下文、技术方案→代码、全局工作流 |
| [五、implement-tech-design 可改造](#五implement-tech-designmdc-可自行改造) | 如何按项目定制「按技术方案实现」规则 |
| [六、斜杠命令中英文](#六斜杠命令中英文) | 英文命令与中文 name 对应表 |
| [七、速查与相关文档](#七速查与相关文档) | 想做的事→命令 见 [命令说明 §7](./README-命令说明.md#7-快速参考按阶段)；常见问题与延伸阅读 |

---

## 一、init 做了什么

在**配置根父目录**执行 **`flow2spec init [agent ...]`**（未全局安装时可使用 `npx @ctrip/flow2spec init`）。**agent** 可省略，省略时默认为 **`cursor`**（写入 **`.cursor/`**）。可选 **`claude`**、**`codex`** 等，空格分隔多个时会**分别**写入多套目录（如 `.cursor/` 与 `.claude/` 各一份相同模板结构）。详见 **`flow2spec --help`**。

1. **模板写入「配置根」**（来自 Flow2Spec 的 `templates/`）：对每个所选 agent，在**配置根父目录**下创建对应目录（如 **`.cursor/`**、**`.claude/`**、**`.codex/`**），并写入下列子路径（结构相同）：

   | 子目录 | 内容 |
   |--------|------|
   | **commands/** | 斜杠命令定义（Markdown）：文档类（generateProjectContext、deleteProjectContext、spec2context-md、pdf4code-md、**genStructureDoc** 等）；**全局工作流**（**global-sync**、**global-fix**（/修正实现规则）、**global-feat**（/新增能力）、**global-merge-context**（/合并上下文冲突）） |
   | **rules/** | 如 **implement-tech-design.mdc**（按技术方案实现代码的通用规则） |
   | **skills/** | 与文档、上下文、工作流相关的 Skills |
   | **template/** | 终稿模版、后端技术模版等 |
   | **stock-docs/** | 预建空目录；你用来生成 Rules/Skills 的**存量源文档**（终稿、架构说明等）也放此处 |
   | **req-docs/** | 预建空目录；**需求澄清、技术方案、PDF 转实现用 MD** 等放在此处（如 `.cursor/req-docs/`） |

   **说明**：**斜杠命令**为 **Cursor** 的交互能力；写入 **`.claude/`**、**`.codex/`** 时主要为在统一目录结构下存放规则、技能与模版，供对应工具按各自方式加载。

**覆盖策略**：对已存在的模板文件为**覆盖写入**（刷新 `commands/`、`rules/`、`skills/`、`template/` 等）。请勿依赖「跳过已存在文件」来保留本地对模板的手工修改——如需定制，建议在业务仓库中改备份或使用自有分支管理。

---

## 二、文档目录约定（重要）

下文 **「配置根」** 表示 `flow2spec init` 所选工具对应目录（Cursor 默认 **`.cursor/`**，亦可 **`.claude/`**、**`.codex/`** 等）。**`stock-docs/`** 与 **`req-docs/`** 均在配置根下，是**两个并列子目录**，职责不同。

| 目录 | 用途 |
|------|------|
| **`stock-docs/`**（如 `.cursor/stock-docs/`） | 放**用于生成 Rules、Skills、索引**的**存量源文档**（终稿、架构说明、从 PDF 整理的领域说明等）。执行 `/generateProjectContext` 时传入 **`stock-docs/xxx.md`**（Cursor 下多为 `.cursor/stock-docs/xxx.md`）。 |
| **`req-docs/`**（如 `.cursor/req-docs/`） | 放**需要实现成代码的文档**（如技术方案、接口设计、表设计）。在对话中提供 **`.cursor/req-docs/xxx.md`**（或 **`req-docs/xxx.md`**，相对配置根）并说明「按该技术方案实现代码」时，AI 按 implement-tech-design 规则执行。 |

- 技术方案（含 PDF 转出的 MD）建议放在 **`req-docs/`**；仅用于给 AI 做上下文、不直接落代码的文档放在 **`stock-docs/`**（如 `.cursor/stock-docs/`）。
- 完整目录结构、文档路径与链接约定、**文档产物阶段**（原稿→初稿→终稿）见 [README-目录与路径约定](./README-目录与路径约定.md)。

---

## 三、推荐执行顺序

### 上下文生成

| 顺序 | 命令 | 作用 |
|------|------|------|
| 1 | **/genStructureDoc** | 生成项目架构说明**初稿** |
| 2 | **/spec2context-md** | 将初稿转为《终稿模版》规范格式，得到**终稿** |
| 3 | **/generateProjectContext** | 根据终稿生成 **Rules、Skills、文档索引**（项目上下文） |

### 提问与实现环节

若技术方案仅为 **PDF**，可先执行 **`/pdf4code-md <PDF路径>`** 转成 Markdown 并保存到 **`req-docs/`**（如 `.cursor/req-docs/`），再在对话中提供该 MD 路径并说明按技术方案实现代码。

| 顺序 | 步骤 / 命令 | 作用 |
|------|-------------|------|
| 1 | **按技术方案实现**（对话 + **implement-tech-design**） | 提供 **`req-docs/xxx.md`**（或 `.cursor/req-docs/...`）并说明按方案实现；AI 按 **`rules/implement-tech-design.mdc`** 读文档、列任务、提问缺项、实现代码 |
| 2 | **/global-fix**（/修正实现规则） | **实现后**用户指出规则错误时：修正代码并同步更新文档与全局 Rules/Skills |
| — | **/global-feat**（/新增能力） | **新增能力**时：补全实现与文档，或已实现则仅补文档与规则 |
| 3 | **/global-sync** | 技术方案 → 功能概述 → 提交到全局 Rules/Skills（可选） |
| — | **/global-merge-context**（/合并上下文冲突） | **merge/rebase 后**仍存在冲突标记时：上下文类（索引、规则、技能、说明文档）自动合并；实现与配置类仅列差异待确认 |

完成「上下文生成」1～3 后，再按「提问与实现环节」实现代码；**global-fix** 在实现后、用户指出某处违反规则时使用；**global-feat** 在新增能力时使用；**global-sync** 可按需执行。**global-merge-context** 在合并分支后出现 `<<<<<<<` 等冲突时使用，与上述无固定先后。更细的按使用顺序查找见 [README-命令说明](./README-命令说明.md#按使用顺序查找)。

---

## 四、典型流程

### 生成项目架构说明（初稿）

- 使用 **`/genStructureDoc`**（或 `/生成项目架构说明`）：根据**用户说明**（纯文字）、**已有文档路径**（如 README、设计 doc），或在不提供时**扫描代码**（不推荐），生成**项目架构说明初稿**。
- **入参**：可选。第一参数 = 一段说明文字 或 文档路径；第二参数 = 输出路径（默认 `stock-docs/<项目名>架构说明_初稿.md`，Cursor 下多为 `.cursor/stock-docs/...`）。
- **特点**：无固定格式，以描述清楚为准；用户说明较宽泛时会引导补充代码路径、模块划分、入口等；不推荐无输入直接扫描，若确需则先提醒再执行。
- 生成初稿后，可再执行 `/spec2context-md` 转为规范格式终稿，并配合 `/generateProjectContext` 生成 Rules、Skills。

### 文档 → 上下文（生成 Rules/Skills）

- 将需求/模块/领域说明放到 **`stock-docs/`**（Cursor 下即 `.cursor/stock-docs/`）。
- 使用 **`/spec2context-md`** 将 PDF 或杂乱 MD 转为《终稿模版》规范格式：PDF 先出**初稿**（`<方案名>_初稿.md`），再执行一次出**终稿**（`<方案名>_终稿.md`）；MD 直接出终稿。
- 使用 **`/generateProjectContext`** 并传入 `stock-docs/<方案名>_终稿.md`（如 `.cursor/stock-docs/...`）根据终稿生成 Rules、Skills、索引（Rules、Skills 命名不带 `_终稿`，见上文「文档产物阶段」）。
- 使用 **`/global-sync`**：**一条命令**完成「技术方案 → 功能概述 → **提交到全局 Rules/Skills**」。传入**技术方案路径**（如 **`.cursor/req-docs/xxx技术方案.md`**）即可。适用于**全局型/公共型**设计的沉淀到 Cursor 上下文。
- **merge / rebase 后**：若 **docs-index.md**、**main.mdc**、专题 **rules/skills** 或 **`stock-docs/`** 下说明出现 Git 冲突标记（Cursor 下路径多在 `.cursor/`），可用 **`/global-merge-context`**（或 **`/合并上下文冲突`**）按命令约定自动合并「上下文类」文件，实现与配置类冲突则只列差异待你确认。详见 [README-命令说明 §3.3](./README-命令说明.md#33-global-merge-context)。

### 技术方案 → 代码（实现用文档在配置根 req-docs/）

- 在对话中**提供技术方案文档路径**（通常为 **`.cursor/req-docs/xxx.md`** 或 **`req-docs/xxx.md`**（相对配置根），或 PDF 路径），并说明「按该技术方案实现代码」。
- AI 会按 **`rules/implement-tech-design.mdc`**（Cursor 下 `.cursor/rules/implement-tech-design.mdc`）执行：读文档、列任务、提问缺项、按顺序实现、输出待完成列表与平台配置提醒。
- **手头只有 PDF 时**：可先执行 **`/pdf4code-md <PDF路径>`** 将 PDF 转成 Markdown 并保存到 **`req-docs/<方案名>.md`**（可补全流程说明），再在对话中提供该 MD 路径；或直接提供 PDF 路径，规则会先按 pdf4code-md 转 MD 再继续。

### 全局工作流

| 命令 | 何时用 |
|------|--------|
| **/global-sync** | 技术方案→概述→提交到全局 Rules/Skills（可选） |
| **/global-fix**（/修正实现规则） | 实现后用户指出某处违反规则时，修正代码并同步更新相关文档与全局 Rules/Skills |
| **/global-feat**（/新增能力） | 新增能力时：补全实现与文档，或已实现则仅补文档与规则 |
| **/global-merge-context**（/合并上下文冲突） | merge/rebase 后：自动处理 **docs-index、rules、skills、说明类 MD** 等冲突；源码与对外配置等**不擅自合并**，只对比并等用户确认 |

详见 [README-命令说明](./README-命令说明.md)（含 [§3.3 global-merge-context](./README-命令说明.md#33-global-merge-context)）。

---

## 五、implement-tech-design.mdc 可自行改造

**`rules/implement-tech-design.mdc`**（Cursor 下路径为 `.cursor/rules/implement-tech-design.mdc`）是通用模板，约定的是「读文档 → 列任务 → 实现前提问 → 按顺序实现 → 待完成列表与提醒」的整体流程。

**你可以按自己项目的技术栈与业务对该文件做改造**，例如：

- **目录与约定**：把「项目约定的配置注册处」「接口/路由目录」「MQ 定义处」「错误码定义处」等改成你们项目真实路径与命名（如 `src/config/`、`src/api/`、`src/mq/` 等）。
- **步骤与检查项**：增加或删减步骤（如代码规范检查、内部 Code Review、发布流程提醒）。
- **术语与示例**：把示例中的表名、接口名、错误码换成你们业务相关示例，便于 AI 与成员理解。
- **触发条件**：调整 frontmatter 里的 `globs`，使规则在你们放「要实现成代码」的文档路径下自动加载（默认含 `**/req-docs/**/*.md`；技术方案应在 **`req-docs/`**，见 [二、文档目录约定](#二文档目录约定重要)）。

改造后文件保留在项目 **`rules/`** 下即可（Cursor 下多为 `.cursor/rules/`）。注意：当前 **`flow2spec init` 对模板为覆盖写入**，再次 init 会用包内模板刷新 `commands/`、`rules/`、`skills/`、`template/` 等；定制规则请在业务仓库用分支或备份管理，或避免对 init 下发的文件做长期手工修改。

---

## 六、斜杠命令中英文

斜杠命令**默认使用英文名**；你可以改为使用**对应的中文命令名**。

- **方式**：在 **`commands/`**（Cursor 下 `.cursor/commands/`）下找到对应 `.md` 文件，将 frontmatter 里的 `name` 改为中文，保存后 Cursor 中输入 `/` 即会显示该中文名，可直接用中文调用。
- **对应关系**（可按需自行修改）：

| 英文命令 / 标识 | 模板中的 name（中文命令名） |
|-----------------|----------------------------|
| `/pdf4code-md` | `/PDF转MD` |
| `/spec2context-md` | `/转成概述模板` |
| `/genStructureDoc` | `/生成项目架构说明` |
| `/global-sync` | `/全局同步`（方案→概述→全局 Rules/Skills） |
| `/generateProjectContext` | `/生成项目上下文` |
| `/deleteProjectContext` | `/删除项目上下文` |
| `/global-fix` | `/修正实现规则` |
| `/global-feat` | `/新增能力` |
| `/global-merge-context` | `/合并上下文冲突` |

---

## 七、速查与相关文档

**想做的事 → 用哪个命令**（按阶段速查）：见 [README-命令说明 - 快速参考](./README-命令说明.md#7-快速参考按阶段)。  
**按使用顺序查找命令**：见 [README-命令说明 - 按使用顺序查找](./README-命令说明.md#按使用顺序查找)。

---

### 常见问题

- **希望「实现技术方案」更贴合业务**：直接编辑 **`rules/implement-tech-design.mdc`**（Cursor 下 `.cursor/rules/...`），按 [五、implement-tech-design 可改造](#五implement-tech-designmdc-可自行改造) 改造即可。
- **斜杠命令找不到**：确认已在**配置根父目录**执行过 `flow2spec init`（且配置根为 `.cursor/`），且 Cursor 已识别到 **`.cursor/commands/`** 下的模板。
- **想按使用顺序查命令**：打开 [README-命令说明](./README-命令说明.md)，看开头的「按使用顺序查找」表。

**相关文档**

| 文档 | 说明 |
|------|------|
| [README-命令说明](./README-命令说明.md) | 各命令入参、输出、**按使用顺序查找** |
| [README-体系与原理](./README-体系与原理.md) | 文档与上下文的架构、main 与 docs-index 区别 |
| [README-目录与路径约定](./README-目录与路径约定.md) | **`stock-docs/`** / **`req-docs/`** 结构、文档产物阶段 |
