# OpenSpec 介绍

## 一、OpenSpec 是什么

**OpenSpec** 是一套**以“变更”为中心**的工作流与工具，用来把「从想法到代码再到留档」的过程结构化、可追溯。

- **核心思想**：每次改动都是一次 **change**；每个 change 里按固定顺序写几种 **artifact**（即「产物文档」：提案、规格、设计、任务），再按任务实现、最后归档。
- **主要组成**：
  - **CLI**（`openspec`）：在项目里创建 change、查状态、归档等。
  - **目录约定**：`openspec/changes/<name>/` 存放当前进行中的 change；归档后移到 `openspec/changes/archive/`。
  - **Cursor 命令 / Skill**：在你项目里已配置好的命令（如 `/接入引导`、`/opsx:onboard`；`/新建变更`、`/opsx:new`；`/应用变更`、`/opsx:apply` 等），用来在对话里驱动这套流程。

适合：小到修一个 bug、大到上一个功能，只要你想「先想清楚再写代码、且留下记录」，都可以用 OpenSpec 走一轮。

---

## 二、核心概念

### 1. Change（变更）

- **是什么**：一次改动的**容器**，对应一个目录：`openspec/changes/<name>/`。
- **name**：用 **kebab-case** 英文（如 `add-user-auth`、`lezhuantie-todo-param-docs`），便于命令行和路径使用。
- **里面放什么**：本次改动的所有「思考与计划」——即下面四种 artifact。

### 2. Artifact（产物 / 产物文档）

**Artifact** 即「人工产出的文档」：在本流程里特指一次 change 中按顺序出现的四种文档，统称 artifact：

| 顺序 | Artifact | 回答的问题 | 典型文件 |
|------|----------|------------|----------|
| 1 | **Proposal** | 为什么要做、大致改什么 | `proposal.md` |
| 2 | **Specs** | 要做什么（可测试的需求/场景） | `specs/<capability>/spec.md` |
| 3 | **Design** | 怎么做（技术决策、取舍） | `design.md` |
| 4 | **Tasks** | 拆成哪些具体实现步骤 | `tasks.md` |

- **Proposal**：电梯演讲——Why + What Changes + 影响范围；不写实现细节。
- **Specs**：用 requirement / scenario 格式（如 WHEN/THEN/AND）写「系统应如何表现」，便于当测试用例用。
- **Design**：技术方案——Context、Goals/Non-Goals、Decisions；小改动可以很短。
- **Tasks**：带勾选的任务清单（`- [ ]` / `- [x]`），实现阶段按这个逐项做并打勾。

### 3. Schema（工作流 schema）

- **是什么**：定义「这个 change 里有哪些 artifact、顺序如何、依赖关系」的模板。
- **你项目里**：一般用默认的 **spec-driven**（在 `openspec/config.yaml` 里），即：proposal → specs → design → tasks。
- 创建 change 时可指定 `--schema <name>`，不指定则用默认。

---

## 三、目录与文件结构

```
项目根/
├── openspec/
│   ├── config.yaml          # 全局配置（schema、可选 context/rules）
│   └── changes/
│   │  ├── <change-name>/   # 进行中的 change
│   │  │   ├── .openspec.yaml
│   │  │   ├── proposal.md
│   │  │   ├── design.md
│   │  │   ├── specs/
│   │  │   │   └── <capability>/
│   │  │   │   │   └── spec.md
│   │  │   └── tasks.md
│   │  └── archive/         # 已归档的 change
│   │      └── YYYY-MM-DD-<change-name>/
│   └── specs/ #主规范有用户决定是否同步 在使用/归档的时候 会提示是否同步主规范 或者使用/opsx-sync主动同步主规范
```

- **查看当前有哪些 change**：看 `openspec/changes/` 下子目录名，或运行 `openspec status`（会列出 Available changes）。
- **归档**：执行 `openspec archive "<name>"` 后，该 change 会移动到 `openspec/changes/archive/YYYY-MM-DD-<name>/`，作为项目决策历史保留。

---

## 四、完整工作流（从想法到归档）

1. **探索（可选）**  
   还没想清楚时，用 **`/探索`**（英文：`/opsx:explore`）在代码库里看问题、画图、列注意点；不改代码。

2. **新建 change**  
   - **`/新建变更`**（英文：`/opsx:new`）：一步步创建 artifact（先 proposal，再 specs，再 design，再 tasks）。  
   - **`/快进`**（英文：`/opsx:ff`）：一次性生成所有 artifact，适合想快速落地的场景。

3. **继续写 artifact（若未写完）**  
   用 **`/继续变更 <name>`**（英文：`/opsx:continue <name>`）接着填 proposal/specs/design/tasks。

4. **实现**  
   用 **`/应用变更 <name>`**（英文：`/opsx:apply <name>`）：按 `tasks.md` 逐项写代码，并在 tasks 里把对应项勾选完成。

5. **校验（可选）**  
   用 **`/校验变更 <name>`**（英文：`/opsx:verify <name>`）：检查实现是否和 specs/design 一致。

6. **归档**  
   用 **`/归档 <name>`**（英文：`/opsx:archive <name>`）或 **`/批量归档`**（英文：`/opsx:bulk-archive`）：把已完成的 change 移到 archive，形成可查的决策记录。

7. **同步（可选）**  
   用 **`/同步规格`**（英文：`/opsx:sync`）：让本地 change 与 OpenSpec 的规格同步（按你项目里的命令说明使用）。

---

## 五、你项目里的 OpenSpec 相关命令

下表同时给出**中文命令**与**英文原命令**，便于理解含义与对照使用。

| 中文命令 | 英文命令（原命令） | 作用 |
|----------|--------------------|------|
| **/接入引导** | `/opsx:onboard` | 第一次用：带讲解走完一整轮（选任务→探索→新建 change→写 artifact→实现→归档） |
| **/探索** | `/opsx:explore` | 在实现前理清问题、看代码、画图，不改代码 |
| **/新建变更** | `/opsx:new` | 新建一个 change，按步骤填 proposal → specs → design → tasks |
| **/快进** | `/opsx:ff` | 新建 change 并一次性生成所有 artifact（fast-forward） |
| **/继续变更** | `/opsx:continue` | 继续写已有 change 的 artifact |
| **/应用变更** | `/opsx:apply` | 按 change 的 tasks 实现代码 |
| **/校验变更** | `/opsx:verify` | 校验实现是否与 artifact 一致 |
| **/归档** | `/opsx:archive` | 将已完成的 change 归档到 archive |
| **/批量归档** | `/opsx:bulk-archive` | 批量归档多个 change |
| **/同步规格** | `/opsx:sync` | 同步 OpenSpec 规格（按命令说明使用） |

- 在 Cursor Chat 里输入 **`/`** 可看到上述命令；中文与英文形式等效，按习惯任选其一即可。
- **说明**：实现后若用户指出某处违反规则，可使用**全局工作流**命令 **/global-fix**（/修正实现规则）修正代码并同步文档与 Rules/Skills；该命令不归纳到 OpenSpec，详见 [README-命令说明](./README-命令说明.md)。

---

## 六、初始化与 CLI

- **首次使用**：在项目根执行  
  `openspec init`  
  会生成 `openspec/config.yaml` 等，之后才能用 `openspec status`、`openspec new` 等。

- **常用 CLI 示例**：
  - `openspec status` — 列出当前 change
  - `openspec new change "<name>"` — 创建名为 `<name>` 的 change
  - `openspec status --change "<name>"` — 查看该 change 的 artifact 状态
  - `openspec instructions <artifact-id> --change "<name>"` — 查看某个 artifact 的填写说明
  - `openspec archive "<name>"` — 归档该 change

- **change 名称**：建议用英文 kebab-case（如 `fix-login-redirect`），避免中文或空格，便于终端和路径使用。

---


## 七、小结

- **OpenSpec** = 以 **change** 为容器，用 **proposal → specs → design → tasks** 把「为什么、做什么、怎么做、拆成哪些步骤」写清楚，再 **apply** 实现、**archive** 留档。
- 你项目里通过 **Cursor 命令 + openspec CLI** 使用；change 与 artifact 都在 `openspec/changes/` 下，归档在 `openspec/changes/archive/`。
- 想完整走一遍流程可先跑 **`/接入引导`**（`/opsx:onboard`）；
