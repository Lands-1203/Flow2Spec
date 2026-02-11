# 目录与路径约定

本文档说明 **Flow2Spec** 在项目内使用的目录结构、文档路径与链接约定，以及版本管理字段。遵守这些约定可避免 AI 生成错误链接、便于索源与更新。（与 cursor-doc-gen 约定同源；Flow2Spec 额外包含 **openspec/** 与 **docs/** 的用途区分。）

---

## 1. 目录结构（.cursor 与项目根）

**`.cursor/`** 下为文档与上下文相关产物；**`openspec/`** 与 **`docs/`** 在项目根下。

| 路径                      | 说明                                                                         |
| ----------------------- | -------------------------------------------------------------------------- |
| `.cursor/docs/`         | 源文档目录；终稿模版、需求/方案 MD、PDF 转出的初稿等，用于**生成 Rules、Skills、索引** |
| `.cursor/rules/`        | Rules：**main.mdc**（总概述，唯一 alwaysApply）与各**专题 Rule**（*-context.mdc）均存放在此目录下 |
| `.cursor/skills/`       | Skills：按主题分子目录，每目录下 SKILL.md                                               |
| `.cursor/commands/`     | Cursor 斜杠命令模板（由 flow2spec init 写入）                                           |
| `.cursor/docs-index.md` | 需求/文档索引表（单文件，在 .cursor 下）                                                  |
| **`docs/`**（项目根）   | **需要实现成代码的文档**（如技术方案、接口设计）；对话中提供 `docs/xxx.md` 时，AI 按 implement-tech-design 规则执行 |
| **`openspec/`**（项目根）| OpenSpec 配置与变更目录（changes、config.yaml 等），由 flow2spec init 复制到项目根            |

**flow2spec init 会创建**：`.cursor`、`.cursor/docs`、`.cursor/rules`、`.cursor/skills`、`.cursor/commands`，并将 **openspec/** 复制到项目根。项目根下的 **docs/** 需自行创建，用于存放「要按方案实现代码」的技术方案文档。

---

## 2. 文档路径与链接约定（必守）

生成 Rule、Skill、docs-index 时，引用 **`.cursor/docs/`** 下文档的写法必须按下列规则，否则 Cursor 中链接会失效。

| 写入位置                             | 引用该文档时的写法                                                               |
| -------------------------------- | ----------------------------------------------------------------------- |
| **.cursor/rules/*.mdc**          | 链接 href 为 `**../docs/<文件名>.md**`（从 rules 到 docs 的相对路径）                  |
| **.cursor/skills/<主题>/SKILL.md** | 链接 href 为 `**../../docs/<文件名>.md**`（从 skills/xxx 到 docs 的相对路径）          |
| **.cursor/docs-index.md**        | 链接 href 为 `**docs/<文件名>.md**`（docs-index 在 .cursor 下，同级 docs 即 `docs/`） |
| **frontmatter 的 sourceDoc**      | `**.cursor/docs/<文件名>.md**`（统一用该形式，与用户传入路径一致）                           |

**正确示例：**

- Rule 内：`[拼团技术方案设计](../docs/拼团技术方案设计.md)`
- Skill 内：`[拼团技术方案设计](../../docs/拼团技术方案设计.md)`
- docs-index 单元格：`[.cursor/docs/拼团技术方案设计.md](docs/拼团技术方案设计.md)`
- frontmatter：`sourceDoc: .cursor/docs/拼团技术方案设计.md`

**禁止：**

- 在 Rule 内使用 `../../docs/` 或项目根下的 `docs/`（会 404）
- 在 Skill 内使用 `../docs/` 或项目根下的 `docs/`
- 在 docs-index 的链接 href 中使用 `../docs/` 或裸路径 `.cursor/docs/xxx.md`（应仅为 `docs/<文件名>.md`）
- 在 sourceDoc 中写 `../docs/xxx.md` 或 `docs/xxx.md`（必须为 `.cursor/docs/<文件名>.md`）

**记忆要点**：文档目录唯一为 **`.cursor/docs/`**；Rule 内用 `../docs/`，Skill 内用 `../../docs/`，docs-index 内用 `docs/`；sourceDoc 用 `.cursor/docs/<文件名>.md`。

---

## 3. 文档产物阶段（原稿 / 初稿 / 终稿）

文档在流程中的阶段与命名约定如下，便于区分「未加工 → 待确认 → 可生成上下文」的形态。

| 阶段 | 含义 | 典型文件名 / 来源 |
|------|------|-------------------|
| **原稿** | 原始材料（如 PDF、未结构化的 MD），未放入本体系时的形态。 | 任意 PDF、`.cursor/docs/xxx.md`（未规范前） |
| **初稿** | `/spec2context-md` 从 **PDF 首次**转出、或 `/genStructureDoc` 生成的架构说明，供人工检查与修改。 | `.cursor/docs/<方案名>_初稿.md`、`<项目名>架构说明_初稿.md` |
| **终稿** | 初稿或任意 MD 经 `/spec2context-md` 转为《终稿模版》规范格式后的**最终产物**，用于生成 Rules、Skills。 | `.cursor/docs/<方案名>_终稿.md` |

**与命令的对应关系：**

- **spec2context-md**：传入 PDF → 输出初稿（`_初稿.md`）；传入初稿或 MD → 输出**终稿**（`_终稿.md`）。
- **generateProjectContext**：入参为**终稿文档路径**（如 `.cursor/docs/<方案名>_终稿.md`），根据该文档生成 Rules、Skills、索引。生成的 **Rules、Skills 文件名与目录名不带 `_终稿` 后缀**，保持现有约定（如 `.cursor/rules/<主题>-context.mdc`、`.cursor/skills/<主题>-context/SKILL.md`）。

小结：**文档**可有 原稿 → 初稿（`_初稿`）→ 终稿（`_终稿`）；**Rules、Skills** 由终稿生成，命名不加 `_终稿`。

---

## 4. 版本管理（sourceDoc 与 generatedAt）

每条 Rule、每条 Skill 的 frontmatter 中**必须**包含：

- **sourceDoc**：源文档路径，格式 `**.cursor/docs/<文件名>.md**`
- **generatedAt**：本次生成时间，东八区北京时间，ISO 8601，如 `2026-01-28T20:00:00+08:00`

用途：

- **从产物找文档**：看 Rule/Skill 的 `sourceDoc`
- **从文档找产物**：查 `.cursor/docs-index.md` 中该文档行的 Rules、Skills 列
- **更新**：修改文档后对同一路径再执行 `/generateProjectContext`，会覆盖该文档对应的全部 Rules、Skills，并更新 docs-index 与 main 的相关部分

---

## 5. 终稿模版的位置

- **init 注入**：flow2spec init 时，若项目内尚无 **`.cursor/docs/终稿模版.md**`，会从包内复制一份到该路径（具体以当前 init 实现为准）。
- **spec2context-md**：转换时优先读取 **`.cursor/docs/终稿模版.md**** 作为格式规范；若不存在则使用命令内嵌的模板结构。
- 团队可自行修改 `.cursor/docs/终稿模版.md`，init 不会覆盖已存在的该文件。

---

## 6. 小结

- **`.cursor/`** 下：`.cursor/docs/`、`.cursor/rules/`、`.cursor/skills/`、`.cursor/commands/`，索引文件 `.cursor/docs-index.md`。**项目根**：`docs/`（技术方案等需实现成代码的文档）、`openspec/`（OpenSpec 变更与配置）。
- **文档产物阶段**：原稿 → 初稿（`_初稿.md`）→ 终稿（`_终稿.md`）；spec2context-md 的最终输出为终稿；generateProjectContext 用终稿生成 Rules、Skills，但 Rules、Skills 命名不带 `_终稿`。
- 文档链接按**写入位置**使用不同相对路径：Rule 用 `../docs/`，Skill 用 `../../docs/`，docs-index 用 `docs/`；sourceDoc 统一为 `.cursor/docs/<文件名>.md`。
- 版本管理用 **sourceDoc** + **generatedAt**，便于索源与按文档更新产物。
