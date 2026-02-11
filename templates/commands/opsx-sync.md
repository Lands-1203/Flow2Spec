---
name: /同步规范
id: opsx-sync
category: 工作流
description: 将变更中的 delta 规范同步到主规范
---

将某变更中的 delta spec 同步到主 spec。

本操作为 **agent 驱动**：由你读取 delta spec 并直接编辑主 spec 以应用变更，从而支持智能合并（例如只加一个 scenario 而不整段复制 requirement）。

**输入**：可在 `/opsx:sync` 后指定变更名称（如 `/opsx:sync add-auth`）。若未提供，尝试从对话推断；若模糊或歧义，必须让用户从可用变更中选择。

**步骤**

1. **若未提供变更名称，让用户选择**

   执行 `openspec list --json` 获取变更列表，用 **AskUserQuestion 工具**让用户选择。

   展示含有 delta spec（即存在 `specs/` 目录）的变更。

   **重要**：不要猜测或自动选择，始终由用户选择。

2. **定位 delta spec**

   在 `openspec/changes/<name>/specs/*/spec.md` 下查找 delta spec 文件。

   每个 delta spec 可包含：
   - `## ADDED Requirements`：要新增的 requirement
   - `## MODIFIED Requirements`：对已有 requirement 的修改
   - `## REMOVED Requirements`：要删除的 requirement
   - `## RENAMED Requirements`：重命名（FROM:/TO: 格式）

   若未找到 delta spec，告知用户并停止。

3. **对每个 delta spec，将变更应用到主 spec**

   对每个在 `openspec/changes/<name>/specs/<capability>/spec.md` 有 delta spec 的 capability：

   a. **读取 delta spec**，理解预期变更

   b. **读取主 spec**：`openspec/specs/<capability>/spec.md`（可能尚不存在）

   c. **智能应用变更**：

      **ADDED Requirements：**
      - 若主 spec 中不存在该 requirement → 新增
      - 若已存在 → 按 delta 更新（视为隐式 MODIFIED）

      **MODIFIED Requirements：**
      - 在主 spec 中找到该 requirement
      - 应用变更，可能包括：
        - 新增 scenario（无需复制已有 scenario）
        - 修改已有 scenario
        - 修改 requirement 描述
      - 保留 delta 中未提及的 scenario/内容

      **REMOVED Requirements：**
      - 从主 spec 中删除整个该 requirement 块

      **RENAMED Requirements：**
      - 找到 FROM 对应的 requirement，改名为 TO

   d. **若该 capability 尚无主 spec**：新建主 spec
      - 创建 `openspec/specs/<capability>/spec.md`
      - 添加 Purpose 节（可简写，标 TBD）
      - 添加 Requirements 节并写入 ADDED 的 requirement

4. **展示摘要**

   应用完所有变更后，总结：
   - 更新了哪些 capability
   - 做了哪些变更（requirement 新增/修改/删除/重命名）

**Delta Spec 格式参考**

```markdown
## ADDED Requirements

### Requirement: New Feature
The system SHALL do something new.

#### Scenario: Basic case
- **WHEN** user does X
- **THEN** system does Y

## MODIFIED Requirements

### Requirement: Existing Feature
#### Scenario: New scenario to add
- **WHEN** user does A
- **THEN** system does B

## REMOVED Requirements

### Requirement: Deprecated Feature

## RENAMED Requirements

- FROM: `### Requirement: Old Name`
- TO: `### Requirement: New Name`
```

**原则：智能合并**

与程序化合并不同，你可以做**部分更新**：
- 若只加一个 scenario，在 MODIFIED 下只写该 scenario，无需复制已有 scenario
- delta 表达的是*意图*，不是整份替换
- 合理运用判断进行合并

**成功时的输出示例**

```
## Specs 已同步：<change-name>

已更新主 spec：

**<capability-1>**：
- 新增 requirement："New Feature"
- 修改 requirement："Existing Feature"（新增 1 个 scenario）

**<capability-2>**：
- 新建 spec 文件
- 新增 requirement："Another Feature"

主 spec 已更新。变更仍为活跃状态，实现完成后再归档即可。
```

**约束**
- 修改前同时读取 delta 与主 spec
- 保留 delta 中未提及的已有内容
- 不明确时先澄清再改
- 修改时说明正在改什么
- 操作应幂等：执行两次结果一致
