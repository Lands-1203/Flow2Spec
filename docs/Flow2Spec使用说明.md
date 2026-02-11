# Flow2Spec 使用说明

本文档是 **Flow2Spec 的使用手册**：面向已安装或准备使用 Flow2Spec 的读者，说明 init 后日常如何使用、目录与产物约定、推荐顺序、典型流程、斜杠命令中英文及常见问题。  
**项目概览与快速开始** 见仓库根目录 [README.md](../README.md)。

---

## 一、init 做了什么

在项目根执行 `flow2spec init`（未全局安装时可使用 `npx @lands/flow2spec init`）后：

1. **OpenSpec**：若本机未安装，会自动执行 `npm install -g @fission-ai/openspec@latest`。
2. **模板写入 `.cursor/**`（来自 Flow2Spec 的 `templates/`）：

- **.cursor/commands/**：斜杠命令（文档类：generateProjectContext、deleteProjectContext、spec2context-md、pdf4code-md、**genStructureDoc**（生成项目架构说明初稿）；**OpenSpec 类**：opsx-new、opsx-ff、opsx-apply、opsx-archive、opsx-continue、opsx-explore、opsx-onboard、opsx-sync、opsx-verify、opsx-bulk-archive 等；**全局工作流**：**global-sync**、**global-fix**（/修正实现规则））。
- **.cursor/rules/**：如 **implement-tech-design.mdc**（实现技术方案的通用规则）。
- **.cursor/skills/**：OpenSpec 相关 Skills。
- **.cursor/docs/**：终稿模版等（以及你用来生成 Rules/Skills 的源文档所在目录）。
- **openspec/**：复制到**项目根目录**的 OpenSpec 配置（如 `config.yaml`），供 `openspec` CLI 使用。

已有文件不会被覆盖，仅补充缺失内容；**openspec/** 若已存在会整体覆盖（具体以当前 init 实现为准）。

---

## 二、文档目录约定（重要）


| 目录                  | 用途                                     |
| ------------------- | ----------------------------------------- |
| `**.cursor/docs/**` | 放**用于生成 Rules、Skills、索引**的源文档（如需求说明、模块说明、领域介绍）。执行 `/generateProjectContext .cursor/docs/xxx.md` 时传入此处路径。 |
| `**docs/**`         | 放**需要实现成代码的文档**（如技术方案、接口设计、表设计）。在对话中提供 `docs/xxx.md` 并说明「按该技术方案实现代码」时，AI 按 implement-tech-design 规则执行。   |


- 技术方案（含 PDF 转出的 MD）建议放在 `**docs/**`，便于按方案实现代码时直接引用。
- 仅用于给 AI 做上下文、不直接落代码的文档，放在 `**.cursor/docs/**`。

---

## 三、文档产物阶段（原稿 / 初稿 / 终稿）

文档在「转规范格式 → 生成 Rules/Skills」流程中的阶段与命名约定如下：

| 阶段 | 含义 | 典型文件名 / 来源 |
|------|------|-------------------|
| **原稿** | 原始材料（如 PDF、未结构化的 MD）。 | 任意 PDF、未规范前的 MD |
| **初稿** | **/spec2context-md** 从 **PDF 首次**转出、供人工检查与修改的 Markdown。 | `.cursor/docs/<方案名>_初稿.md` |
| **终稿** | 初稿或任意 MD 经 **/spec2context-md** 转为《终稿模版》规范格式后的**最终产物**，用于执行 **/generateProjectContext** 生成 Rules、Skills。 | `.cursor/docs/<方案名>_终稿.md` |

**与命令的对应关系：**

- **spec2context-md**：传入 PDF → 输出初稿（`_初稿.md`）；传入初稿或 MD → 输出**终稿**（`_终稿.md`）。
- **generateProjectContext**：入参为**终稿文档路径**（如 `.cursor/docs/<方案名>_终稿.md`），根据该文档生成 Rules、Skills、索引。生成的 **Rules、Skills 文件名与目录名不带 `_终稿` 后缀**（如 `.cursor/rules/<主题>-context.mdc`、`.cursor/skills/<主题>-context/SKILL.md`）。

小结：**文档**可有 原稿 → 初稿（`_初稿`）→ 终稿（`_终稿`）；**Rules、Skills** 由终稿生成，命名不加 `_终稿`。

---

## 四、推荐执行顺序

### 上下文生成

| 顺序 | 命令 | 作用 |
|------|------|------|
| 1 | **/genStructureDoc** | 生成项目架构说明**初稿** |
| 2 | **/spec2context-md** | 将初稿转为《终稿模版》规范格式，得到**终稿** |
| 3 | **/generateProjectContext** | 根据终稿生成 **Rules、Skills、文档索引**（项目上下文） |

### 提问与实现环节

若技术方案仅为 **PDF**，可先执行 **`/pdf4code-md <PDF路径>`** 转成 Markdown 并保存到 `docs/`，再进入下列步骤。

| 顺序 | 命令 | 作用 |
|------|------|------|
| 1 | **/opsx-new** | **提问**并新建变更，按 artifact 填写 proposal 等 |
| 2 | **/opsx-continue** | **继续**根据提案生成剩余产物（specs、design、tasks） |
| 3 | **/opsx-apply** | **根据规划**（tasks）生成代码 |
| 4 | **/global-fix**（/修正实现规则） | **实现后**用户指出规则错误时：修正代码并同步更新文档与全局 Rules/Skills |
| 5 | **/global-sync** | 生成全局 Skills、Rules 并**归档**（可选） |

完成「上下文生成」1～3 后，再按「提问与实现环节」1～5 进行变更留档与代码实现；**global-fix** 在实现后、用户指出某处违反规则时使用；**global-sync** 可按需执行。

---

## 五、典型流程

### 生成项目架构说明（初稿）

- 使用 **`/genStructureDoc`**（或 `/生成项目架构说明`）：根据**用户说明**（纯文字）、**已有文档路径**（如 README、设计 doc），或在不提供时**扫描代码**（不推荐），生成**项目架构说明初稿**。
- **入参**：可选。第一参数 = 一段说明文字 或 文档路径；第二参数 = 输出路径（默认 `.cursor/docs/<项目名>架构说明_初稿.md`）。
- **特点**：无固定格式，以描述清楚为准；用户说明较宽泛时会引导补充代码路径、模块划分、入口等；不推荐无输入直接扫描，若确需则先提醒再执行。
- 生成初稿后，可再执行 `/spec2context-md` 转为规范格式终稿，并配合 `/generateProjectContext` 生成 Rules、Skills。

### 文档 → 上下文（生成 Rules/Skills）

- 将需求/模块/领域说明放到 `**.cursor/docs/**`。
- 使用 **`/spec2context-md`** 将 PDF 或杂乱 MD 转为《终稿模版》规范格式：PDF 先出**初稿**（`<方案名>_初稿.md`），再执行一次出**终稿**（`<方案名>_终稿.md`）；MD 直接出终稿。
- 使用 `**/generateProjectContext .cursor/docs/<方案名>_终稿.md**` 根据终稿生成 Rules、Skills、索引（Rules、Skills 命名不带 `_终稿`，见上文「文档产物阶段」）。
- 使用 **`/global-sync`**：**一条命令**完成「技术方案 → 功能概述 → **提交到全局 Rules/Skills** → 同步规范到 openspec/specs」。可传**技术方案路径**（如 `docs/xxx技术方案.md`）或**变更名**（如 `add-auth`）；传变更名时会从该变更的 design.md / specs / proposal 取技术方案来源，提交到全局后对该变更执行 **opsx-sync**（将 delta 规范同步到 `openspec/specs/`）。适用于**全局型/公共型**设计的沉淀。

### 技术方案 → 代码（实现用文档在 docs/）

- 在对话中**提供技术方案文档路径**（通常为 `**docs/xxx.md**`，或 PDF 路径），并说明「按该技术方案实现代码」。
- AI 会按 `**.cursor/rules/implement-tech-design.mdc**` 执行：读文档、列任务、提问缺项、按顺序实现、输出待完成列表与平台配置提醒。
- **手头只有 PDF 时**：可先执行 **`/pdf4code-md <PDF路径>`** 将 PDF 转成 Markdown 并保存到 `**docs/<方案名>.md**`（可补全流程说明），再在对话中提供该 MD 路径；或直接提供 PDF 路径，规则会先按 pdf4code-md 转 MD 再继续。

### OpenSpec 变更（留档与追溯）

- `**/opsx:new <变更名>**`：新建一次变更，按 artifact 顺序填写。
- `**/opsx:ff <变更名>**`：快进建齐 proposal / design / spec / tasks。
- `**/opsx:apply**`：按 tasks 实现。
- `**/opsx:archive**`：归档该变更。

**全局工作流**（不归纳到 OpenSpec）：
- `**/global-sync**`：方案→概述→提交到全局 Rules/Skills→同步规范（可选）。
- `**/global-fix**`（**/修正实现规则**）：实现后用户指出某处违反规则时，修正代码并同步更新相关文档与全局 Rules/Skills（详见 [README-命令说明](./README-命令说明.md)）。

**产物的书写语言**：使用 `/opsx:new`、`/opsx:continue`、`/opsx:ff` 创建 proposal、design、specs、tasks 时，**正文语言与项目一致**。若技术方案、需求文档、用户对话或已有 artifact 以**中文**为主，则上述产物**全部用中文**书写（含 Requirement 描述、Scenario 的 WHEN/THEN、任务列表、决策与风险等）；若以英文为主则用英文。这样在中文项目下不会出现整份英文 spec，便于团队阅读与维护。

可与「按技术方案实现」结合：使用 **/opsx:new** 新建变更时，在描述中带上**技术方案路径**（如 `docs/xxx技术方案.md`），proposal/design 会基于该方案填写；

---

## 六、implement-tech-design.mdc 可自行改造

`**.cursor/rules/implement-tech-design.mdc**` 是通用模板，约定的是「读文档 → 列任务 → 实现前提问 → 按顺序实现 → 待完成列表与提醒」的整体流程。

**你可以按自己项目的技术栈与业务对该文件做改造**，例如：

- **目录与约定**：把「项目约定的配置注册处」「接口/路由目录」「MQ 定义处」「错误码定义处」等改成你们项目真实路径与命名（如 `src/config/`、`src/api/`、`src/mq/` 等）。
- **步骤与检查项**：增加或删减步骤（如代码规范检查、内部 Code Review、发布流程提醒）。
- **术语与示例**：把示例中的表名、接口名、错误码换成你们业务相关示例，便于 AI 与成员理解。
- **触发条件**：调整 frontmatter 里的 `globs`，使规则在你们放「要实现成代码」的文档路径下自动加载（默认含 `docs/**/*.md`；技术方案应在 `docs/`，见第二节约定）。

改造后文件保留在项目 `.cursor/rules/` 下即可；后续再次执行 `flow2spec init` 时，若采用「不覆盖已存在文件」的策略，你的修改会被保留。

---

## 七、斜杠命令中英文

斜杠命令**默认使用英文名**；你可以改为使用**对应的中文命令名**。

- **方式**：在 `.cursor/commands/` 下找到对应 `.md` 文件，将 frontmatter 里的 `name` 改为中文，保存后 Cursor 中输入 `/` 即会显示该中文名，可直接用中文调用。
- **对应关系**（可按需自行修改）：


| 英文命令 / 标识                 | 模板中的 name（中文命令名） |
| ------------------------- | ---------------- |
| `/pdf4code-md`            | `/PDF转MD`        |
| `/spec2context-md`        | `/转成概述模板`          |
| `/genStructureDoc`     | `/生成项目架构说明`     |
| `/global-sync`            | `/全局同步`（方案→概述→全局 Rules/Skills→同步规范） |
| `/generateProjectContext` | `/生成项目上下文`       |
| `/deleteProjectContext`   | `/删除项目上下文`       |
| `/opsx:new`               | `/新建变更`          |
| `/opsx:ff`                | `/快进变更`          |
| `/opsx:apply`             | `/应用变更`          |
| `/opsx:archive`           | `/归档变更`          |
| `/global-fix`             | `/修正实现规则`        |
| `/opsx:continue`          | `/继续变更`          |
| `/opsx:explore`           | `/探索模式`          |
| `/opsx:onboard`           | `/接入引导`          |
| `/opsx:sync`              | `/同步规范`          |
| `/opsx:verify`            | `/校验变更`          |
| `/opsx:bulk-archive`      | `/批量归档`          |


---

## 八、命令与规则速查


| 想做的事                 | 使用方式                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| 首次在当前项目使用 Flow2Spec  | `flow2spec init` 或 `npx @lands/flow2spec init`                                                       |
| 生成项目架构说明初稿 | `/genStructureDoc`：可传说明文字或文档路径，或不传由 AI 扫描代码（不推荐）；输出默认 `.cursor/docs/<项目名>架构说明_初稿.md` |
| 文档生成 Rules/Skills/索引 | 文档放 `.cursor/docs/`；先用 `/spec2context-md` 出**终稿**（`_终稿.md`），再执行 `/generateProjectContext .cursor/docs/<方案名>_终稿.md`；或使用 `/global-sync` 一条完成「方案→概述→提交到全局 Rules/Skills→同步规范（opsx-sync）」 |
| PDF 转 MD（要按方案实现代码时）  | `/pdf4code-md <PDF路径>`，转出保存到 `docs/`                                                                 |
| 按技术方案实现代码            | 技术方案放 `docs/`，在对话中提供 `docs/xxx.md` 并说明按该方案实现（遵循 implement-tech-design.mdc）                           |
| 新建 OpenSpec 变更       | `/opsx:new <变更名>` 或 `/opsx:ff <变更名>`                                                                 |
| 按任务实现并归档             | `/opsx:apply`、`/opsx:archive`                                                                        |
| 实现后用户指出规则错误，改代码并同步文档与规则 | `/global-fix`（/修正实现规则）                                                                        |


---

## 九、常见问题

- **init 时报 OpenSpec 安装失败**：可手动执行 `npm install -g @fission-ai/openspec@latest`；
- **希望「实现技术方案」更贴合业务**：直接编辑 `.cursor/rules/implement-tech-design.mdc`，按上文第三节改造即可。
- **斜杠命令找不到**：确认已在项目根执行过 `flow2spec init`，且 Cursor 已识别到 `.cursor/commands/` 下的模板。

