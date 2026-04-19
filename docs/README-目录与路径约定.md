# 目录与路径约定

本文档说明 **Flow2Spec** 在项目内使用的目录结构、文档路径与链接约定，以及版本管理字段。遵守这些约定可避免 AI 生成错误链接、便于索源与更新。

**命名一览（区分：业务项目「配置根」下的文档目录 vs Flow2Spec 包内的说明目录）**

| 目录 | 位置 | 用途 |
|------|------|------|
| **`stock-docs/`** | 如 `.cursor/stock-docs/` | **存量上下文源**：PDF/初稿/终稿/架构说明等，供 `/generateProjectContext` 生成 Rules、Skills、索引 |
| **`req-docs/`** | 如 `.cursor/req-docs/` | **需求与技术方案**：澄清需求、后端技术方案、PDF 转 MD（实现用）等，配合 `implement-tech-design` **按方案写代码** |


---

## 1. 目录结构（配置根与配置根父目录）

**「配置根」**：`flow2spec init [agent ...]` 写入的 AI 工具配置目录。默认 **Cursor** 为 **`.cursor/`**；可选 **`.claude/`**、**`.codex/`** 等（可多选，各自一套相同子结构）。下文表格以 **`.cursor/`** 为例；若你的配置根为 `.claude/`，将路径中的 `.cursor` 替换为 `.claude` 即可。

**配置根**下为 **stock-docs/**、**req-docs/**、**rules/**、**skills/**、**commands/**、**template/** 及 **docs-index.md**；**仅** **`openspec/`** 位于**配置根父目录**（与 `.cursor/`、`.claude/` 等并列）。下表**左列**为逻辑位置，**中列**为 Cursor（配置根 `.cursor/`）时的完整路径示例；使用 **`.claude/`** 等时把中列的 `.cursor` 换成对应目录名即可。

| 逻辑位置（相对配置根或配置根父目录） | Cursor 下路径示例 | 说明 |
| ------------------------ | ----------------- | ---- |
| `stock-docs/` | `.cursor/stock-docs/` | **存量源文档**；终稿、架构初稿、从 PDF 整理的 MD 等，用于**生成 Rules、Skills、索引** |
| `rules/` | `.cursor/rules/` | **main.mdc**（总概述，唯一 alwaysApply）与各**专题 Rule**（*-context.mdc） |
| `skills/` | `.cursor/skills/` | Skills：按主题分子目录，每目录下 SKILL.md |
| `commands/` | `.cursor/commands/` | Cursor 斜杠命令定义（init 写入） |
| `template/` | `.cursor/template/` | 《终稿模版》《后端技术模版》等 |
| **docs-index.md**（与 `stock-docs/` 同级） | `.cursor/docs-index.md` | 需求/文档索引表 |
| `req-docs/` | `.cursor/req-docs/` | **需要实现成代码的文档**（技术方案等）；对话中 **`.cursor/req-docs/xxx.md`** + implement-tech-design |
| `openspec/`（配置根父目录） | `openspec/` | OpenSpec 配置与变更（**仅一份**，与各配置根并列） |

**flow2spec init 会创建**：对每个所选 agent，创建 **配置根** 及 **`stock-docs/`**、**`req-docs/`**、**`template/`**、**`rules/`**、**`skills/`**、**`commands/`** 子目录，并写入模板；同时将 **openspec/** 复制到**配置根父目录**。

**从旧版升级**：若仍使用旧名 **`docs/`**（配置根下），可改名为 **`stock-docs/`**。若曾把 **`req-docs/` 误放在配置根父目录**（与 `.cursor` 同级而非其下），请**整体迁入**当前所用配置根下（如 `.cursor/req-docs/`），再执行 `flow2spec init` 可确保目录存在（已存在则保留其中文件）。

---

## 2. 文档路径与链接约定（必守）

生成 Rule、Skill、docs-index 时，引用 **`stock-docs/`**（配置根下）内文档的链接写法必须按下列规则，否则在编辑器里打开产物时链接会失效。

**与配置根的关系**：下表以 **Cursor**（配置根为 **`.cursor/`**）为例书写路径。若你通过 `flow2spec init claude` 等使用 **`.claude/`**、**`.codex/`** 等作为配置根，则：

- **显示路径、sourceDoc、docs-index 文档列**中的 **`.cursor`** 一律改为你的配置根目录名（例如 `sourceDoc: .claude/stock-docs/<文件名>.md`，docs-index 显示列写 `.claude/stock-docs/...`）。
- **相对链接**规则不变：Rule 内仍用 `../stock-docs/<文件名>.md`，Skill 内仍用 `../../stock-docs/<文件名>.md`，docs-index 的链接 href 仍仅为 `stock-docs/<文件名>.md`（均相对于**该配置根**内部的 `rules/`、`skills/`、`docs-index.md` 位置，与 **`req-docs/`** 无关）。

| 写入位置（以 `.cursor/` 为例）        | 引用该文档时的写法                                                               |
| -------------------------------- | ----------------------------------------------------------------------- |
| **`rules/*.mdc`**          | 链接 href 为 `**../stock-docs/<文件名>.md**`（从 rules 到同配置根下 stock-docs 的相对路径）                  |
| **`skills/<主题>/SKILL.md`** | 链接 href 为 `**../../stock-docs/<文件名>.md**`（从 skills/xxx 到 stock-docs 的相对路径）          |
| **`docs-index.md`**        | 链接 href 为 `**stock-docs/<文件名>.md**`（docs-index 与 `stock-docs/` 同级，故 href 不含 `../`） |
| **frontmatter 的 sourceDoc**      | **`<配置根>/stock-docs/<文件名>.md`**（与 `/generateProjectContext` 入参一致，如 `.cursor/stock-docs/...` 或 `.claude/stock-docs/...`）                           |

**正确示例（配置根为 `.cursor/` 时）：**

- Rule 内：`[拼团技术方案设计](../stock-docs/拼团技术方案设计.md)`
- Skill 内：`[拼团技术方案设计](../../stock-docs/拼团技术方案设计.md)`
- docs-index 单元格：`[.cursor/stock-docs/拼团技术方案设计.md](stock-docs/拼团技术方案设计.md)`
- frontmatter：`sourceDoc: .cursor/stock-docs/拼团技术方案设计.md`

**若配置根为 `.claude/`**：docs-index 显示列与 sourceDoc 改为 `.claude/stock-docs/<文件名>.md`；链接 href 仍同上三行相对规则。

**禁止：**

- 在 Rule 内使用 `../../stock-docs/` 或把 **`req-docs/`** 下的技术方案误当作 **stock-docs** 链出目标（会 404 或链错）
- 在 Skill 内使用 `../stock-docs/` 或上述误链
- 在 docs-index 的链接 href 中使用 `../stock-docs/` 或裸路径 `.cursor/stock-docs/xxx.md`（应仅为 `stock-docs/<文件名>.md`）
- 在 sourceDoc 中写 `../stock-docs/xxx.md` 或 **`req-docs/xxx.md`**（生成上下文的 sourceDoc 必须为 **`<配置根>/stock-docs/<文件名>.md`**）

**记忆要点**：生成 Rules/Skills 的**源文档**只在 **`stock-docs/`** 下（勿把 **`req-docs/`** 当链出目标）；Rule 内 `../stock-docs/`，Skill 内 `../../stock-docs/`，docs-index 内 `stock-docs/`；sourceDoc 用 **实际配置根** + `/stock-docs/<文件名>.md`。

---

## 3. 文档产物阶段（原稿 / 初稿 / 终稿）

文档在流程中的阶段与命名约定如下，便于区分「未加工 → 待确认 → 可生成上下文」的形态。以下路径均在 **`stock-docs/`** 下（Cursor 下即 `.cursor/stock-docs/`，其他 agent 将 `.cursor` 换为对应目录名）。

| 阶段 | 含义 | 典型文件名 / 来源 |
|------|------|-------------------|
| **原稿** | 原始材料（如 PDF、未结构化的 MD），未放入本体系时的形态。 | 任意 PDF、`stock-docs/xxx.md`（未规范前） |
| **初稿** | `/spec2context-md` 从 **PDF 首次**转出、或 `/genStructureDoc` 生成的架构说明，供人工检查与修改。 | `stock-docs/<方案名>_初稿.md`、`<项目名>架构说明_初稿.md` |
| **终稿** | 初稿或任意 MD 经 `/spec2context-md` 转为《终稿模版》规范格式后的**最终产物**，用于生成 Rules、Skills。 | `stock-docs/<方案名>_终稿.md` |

**与命令的对应关系：**

- **spec2context-md**：传入 PDF → 输出初稿（`_初稿.md`）；传入初稿或 MD → 输出**终稿**（`_终稿.md`）。
- **generateProjectContext**：入参为**终稿或等价存量文档路径**（如 `stock-docs/<方案名>_终稿.md`，即 `.cursor/stock-docs/...` 或 `.claude/stock-docs/...` 等），根据该文档生成 Rules、Skills、索引。生成的 **Rules、Skills 文件名与目录名不带 `_终稿` 后缀**，保持现有约定（如 `rules/<主题>-context.mdc`、`skills/<主题>-context/SKILL.md`）。

小结：**文档**可有 原稿 → 初稿（`_初稿`）→ 终稿（`_终稿`）；**Rules、Skills** 由终稿生成，命名不加 `_终稿`。

---

## 4. 版本管理（sourceDoc 与 generatedAt）

每条 Rule、每条 Skill 的 frontmatter 中**必须**包含：

- **sourceDoc**：源文档路径，格式 **`<配置根>/stock-docs/<文件名>.md`**（与 `/generateProjectContext` 入参一致，如 `.cursor/stock-docs/xxx.md`、`.claude/stock-docs/xxx.md`）
- **generatedAt**：本次生成时间，东八区北京时间，ISO 8601，如 `2026-01-28T20:00:00+08:00`

用途：**从产物找文档**（看 Rule/Skill 的 `sourceDoc`）、**从文档找产物**（查该配置根下的 docs-index）、**更新**（改文档后对同一路径再执行 `/generateProjectContext`）。索源与典型用法见 [README-体系与原理 - 版本管理与索源](./README-体系与原理.md#5-版本管理与索源)。

---

## 5. 模版目录（`template/`）

- **包内路径**：Flow2Spec 包内模版目录 **templates/template/**（与 templates/commands 等同级），包含 `终稿模版.md`、`后端技术模版.md` 等。
- **init 注入**：`flow2spec init` 将包内 **templates/template/** 整目录复制到**每个所选配置根**下的 **`template/`**（Cursor 下即 **`.cursor/template/`**，Claude 下即 **`.claude/template/`** 等），例如 `终稿模版.md`、`后端技术模版.md` 位于 **`template/`** 内。
- **spec2context-md**：转换时优先读取 **`template/终稿模版.md`** 作为格式规范；若不存在则使用命令内嵌的模板结构。
- **生成后端技术文档**：结构范本为 **`template/后端技术模版.md`**；产出技术方案默认写入 **`req-docs/`**。
- 团队可自行修改**当前所用配置根**下 `template/` 内文件；再次 init 会**覆盖**该目录（与 commands/rules/skills 行为一致）。

---

## 6. 小结

- **配置根**下：`stock-docs/`、**`req-docs/`**、`rules/`、`skills/`、`commands/`、`template/`，索引文件 **docs-index.md**（如 `.cursor/docs-index.md`）。**配置根父目录**：**仅** `openspec/`（OpenSpec 变更与配置，仅一份）。
- **文档产物阶段**：原稿 → 初稿（`_初稿.md`）→ 终稿（`_终稿.md`）；spec2context-md 的最终输出为终稿；generateProjectContext 用终稿生成 Rules、Skills，但 Rules、Skills 命名不带 `_终稿`。
- 文档链接按**写入位置**使用不同相对路径：Rule 用 `../stock-docs/`，Skill 用 `../../stock-docs/`，docs-index 用 `stock-docs/`；**sourceDoc** 与显示路径用 **实际配置根** + `/stock-docs/<文件名>.md`（见 §2）。
- 版本管理用 **sourceDoc** + **generatedAt**，便于索源与按文档更新产物。

**相关文档**：[Flow2Spec使用说明](./Flow2Spec使用说明.md)（init、目录约定引用、典型流程） | [README-命令说明](./README-命令说明.md)（各命令入参输出、按使用顺序查找） | [README-体系与原理](./README-体系与原理.md)（main 与 docs-index、设计原则）
