---
name: /归档变更
id: opsx-archive
category: 工作流
description: 在实验性工作流中归档已完成的变更
---

在实验性工作流中归档一个已完成的变更。

**本命令始终做一件事**：将变更目录从 `openspec/changes/<name>` **移动**到 `openspec/changes/archive/YYYY-MM-DD-<name>/`（即「归档」= 挪到 archive 目录）。

**可选的一步（仅当该变更含有 delta spec 时）**：归档**之前**会询问是否先把变更内的 delta spec 同步到主规范 **openspec/specs/**。若用户选择「立即同步」，则先执行与 `/opsx:sync` 相同的逻辑（把 `changes/<name>/specs/` 合并进 `openspec/specs/`），再执行上述移动。因此：
- **只做归档**：变更没有 delta spec，或用户选择「不同步直接归档」→ 只执行 `mv` 到 archive。
- **先同步再归档**：变更有 delta spec 且用户选择「立即同步」→ 先 sync 到 openspec/specs，再 `mv` 到 archive。

总结：**归档**永远是把变更挪到 archive；**是否动 openspec/specs** 由用户在该变更是否有 delta spec 时的选择决定。

**输入**：可在 `/opsx:archive` 后指定变更名称（如 `/opsx:archive add-auth`）。若未提供，尝试从对话推断；若模糊或歧义，必须让用户从可用变更中选择。

**步骤**

1. **若未提供变更名称，让用户选择**

   执行 `openspec list --json` 获取变更列表，用 **AskUserQuestion 工具**让用户选择。

   仅展示活跃变更（未归档的）。
   若有 schema 信息，一并展示每个变更使用的 schema。

   **重要**：不要猜测或自动选择，始终由用户选择。

2. **检查 artifact 完成状态**

   执行 `openspec status --change "<name>" --json` 查看 artifact 完成情况。

   解析 JSON 得到：
   - `schemaName`：使用的工作流
   - `artifacts`：各 artifact 及状态（`done` 或其他）

   **若有 artifact 未为 `done`：**
   - 列出未完成 artifact 的警告
   - 询问用户是否仍继续
   - 用户确认后继续

3. **检查任务完成状态**

   读取任务文件（通常为 `tasks.md`）检查未完成任务。

   统计 `- [ ]`（未完成）与 `- [x]`（已完成）数量。

   **若存在未完成任务：**
   - 显示未完成任务数量的警告
   - 询问用户是否仍继续
   - 用户确认后继续

   **若无 tasks 文件**：跳过与任务相关的警告。

4. **评估 delta spec 同步状态**

   检查 `openspec/changes/<name>/specs/` 下是否存在 delta spec。若没有，则不必提示同步。

   **若存在 delta spec：**
   - 将每个 delta spec 与主 spec `openspec/specs/<capability>/spec.md` 对比
   - 判断会应用哪些变更（新增、修改、删除、重命名）
   - 在询问前给出汇总说明

   **询问选项：**
   - 若需要同步：「立即同步（推荐）」「不同步直接归档」
   - 若已同步：「立即归档」「仍要同步」「取消」

   若用户选择同步，则执行 `/opsx:sync` 的逻辑。无论选哪项，之后都可继续归档。

5. **执行归档**

   若归档目录不存在则创建：
   ```bash
   mkdir -p openspec/changes/archive
   ```

   用当前日期生成目标名：`YYYY-MM-DD-<change-name>`

   **检查目标是否已存在：**
   - 若存在：报错并建议重命名已有归档或换日期
   - 若不存在：将变更目录移动到 archive

   ```bash
   mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
   ```

6. **展示归档结果**

   展示归档完成摘要，包括：
   - 变更名称
   - 使用的 schema
   - 归档路径
   - spec 同步状态（已同步 / 跳过同步 / 无 delta spec）
   - 若有警告（未完成 artifact/任务）需注明

**成功时的输出示例**

```
## 归档完成

**变更：** <change-name>
**Schema：** <schema-name>
**归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs：** ✓ 已同步到主 spec

所有 artifact 已完成。所有任务已完成。
```

**成功且无 Delta Spec 时的输出示例**

```
## 归档完成

**变更：** <change-name>
**Schema：** <schema-name>
**归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs：** 无 delta spec

所有 artifact 已完成。所有任务已完成。
```

**成功但带警告时的输出示例**

```
## 归档完成（含警告）

**变更：** <change-name>
**Schema：** <schema-name>
**归档至：** openspec/changes/archive/YYYY-MM-DD-<name>/
**Specs：** 已跳过同步（用户选择跳过）

**警告：**
- 归档时仍有 2 个未完成 artifact
- 归档时仍有 3 个未完成任务
- delta spec 同步已跳过（用户选择跳过）

若非本意，请检查归档内容。
```

**错误时（归档目标已存在）的输出示例**

```
## 归档失败

**变更：** <change-name>
**目标：** openspec/changes/archive/YYYY-MM-DD-<name>/

目标归档目录已存在。

**可选操作：**
1. 重命名已有归档
2. 若为重复则删除已有归档
3. 换一天再归档
```

**约束**
- 未提供变更时始终让用户选择
- 用 artifact 图（openspec status --json）做完成度检查
- 有警告时不阻止归档，仅提示并确认
- 移动到 archive 时保留 .openspec.yaml（随目录一起移动）
- 清晰说明执行结果
- 若用户要求同步，采用 /opsx:sync 的方式（agent 驱动）
- 若存在 delta spec，归档前务必做同步评估并展示汇总再询问
