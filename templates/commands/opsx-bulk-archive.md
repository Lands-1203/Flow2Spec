---
name: /批量归档
id: opsx-bulk-archive
category: 工作流
description: 一次性归档多个已完成的变更
---

一次性归档多个已完成的变更。

通过检查代码库中实际实现情况，智能处理 spec 冲突，再批量归档。

**输入**：无必填参数（会提示选择要归档的变更）

**步骤**

1. **获取活跃变更**

   执行 `openspec list --json` 获取所有活跃变更。

   若无活跃变更，告知用户并停止。

2. **让用户选择要归档的变更**

   使用 **AskUserQuestion 工具**做多选：
   - 列出每个变更及其 schema
   - 提供「全部变更」选项
   - 允许选 1 个或多个（2+ 为常见用法）

   **重要**：不要自动选择，始终由用户选择。

3. **批量校验：收集所有选中变更的状态**

   对每个选中的变更收集：

   a. **Artifact 状态**：执行 `openspec status --change "<name>" --json`
      - 解析 `schemaName` 与 `artifacts` 列表
      - 记录哪些 artifact 为 `done`、哪些为其他状态

   b. **任务完成度**：读取 `openspec/changes/<name>/tasks.md`
      - 统计 `- [ ]`（未完成）与 `- [x]`（已完成）
      - 若无 tasks 文件，记为 "No tasks"

   c. **Delta specs**：检查 `openspec/changes/<name>/specs/` 目录
      - 列出涉及哪些 capability spec
      - 对每个提取 requirement 名称（匹配 `### Requirement: <name>` 的行）

4. **检测 spec 冲突**

   构建 `capability -> [涉及该 capability 的变更]` 映射：

   ```
   auth -> [change-a, change-b]  ← 冲突（2+ 个变更）
   api  -> [change-c]            ← 无冲突（仅 1 个）
   ```

   当有 2 个及以上选中的变更对同一 capability 存在 delta spec 时，视为冲突。

5. **由 agent 解决冲突**

   **对每个冲突**，调查代码库：

   a. **读取各冲突变更的 delta spec**，理解各自声称的新增/修改

   b. **在代码库中搜索**实现证据：
      - 查找实现各 delta spec 中 requirement 的代码
      - 检查相关文件、函数或测试

   c. **决定解决方式**：
      - 若仅一个变更被实现 → 只同步该变更的 spec
      - 若两个都被实现 → 按时间顺序应用（先旧后新，后者覆盖）
      - 若都未实现 → 跳过 spec 同步并警告用户

   d. **记录每个冲突的解决方式**：
      - 应用哪个变更的 spec
      - 若两个都应用，顺序如何
      - 理由（代码库中的发现）

6. **展示汇总状态表**

   用表格汇总所有变更，例如：

   ```
   | Change               | Artifacts | Tasks | Specs   | Conflicts | Status |
   |---------------------|-----------|-------|---------|-----------|--------|
   | schema-management   | Done      | 5/5   | 2 delta | None      | Ready  |
   | project-config      | Done      | 3/3   | 1 delta | None      | Ready  |
   | add-oauth           | Done      | 4/4   | 1 delta | auth (!)  | Ready* |
   | add-verify-skill    | 1 left    | 2/5   | None    | None      | Warn   |
   ```

   对冲突展示解决方式，例如：
   ```
   * 冲突解决：
     - auth spec：将先应用 add-oauth 再应用 add-jwt（均已实现，按时间顺序）
   ```

   对未完成变更展示警告，例如：
   ```
   警告：
   - add-verify-skill：1 个未完成 artifact，3 个未完成任务
   ```

7. **确认批量操作**

   用 **AskUserQuestion 工具**做一次确认：
   - 「归档这 N 个变更？」并根据状态提供选项
   - 选项可包括：「归档全部 N 个」「仅归档 N 个就绪的（跳过未完成）」「取消」

   若有未完成变更，明确说明将带警告归档。

8. **对每个确认的变更执行归档**

   按既定顺序处理（遵守冲突解决顺序）：

   a. **若存在 delta spec 则同步 spec**：
      - 采用 openspec-sync-specs 的方式（agent 驱动智能合并）
      - 有冲突时按解决顺序应用
      - 记录是否执行了同步

   b. **执行归档**：
      ```bash
      mkdir -p openspec/changes/archive
      mv openspec/changes/<name> openspec/changes/archive/YYYY-MM-DD-<name>
      ```

   c. **记录每个变更的结果**：
      - 成功：已归档
      - 失败：归档过程报错（记录错误）
      - 跳过：用户选择不归档（若适用）

9. **展示最终摘要**

   示例：

   ```
   ## 批量归档完成

   已归档 3 个变更：
   - schema-management-cli -> archive/2026-01-19-schema-management-cli/
   - project-config -> archive/2026-01-19-project-config/
   - add-oauth -> archive/2026-01-19-add-oauth/

   已跳过 1 个变更：
   - add-verify-skill（用户选择不归档未完成项）

   Spec 同步摘要：
   - 4 个 delta spec 已同步到主 spec
   - 1 个冲突已解决（auth：按时间顺序应用了两份）
   ```

   若有失败：
   ```
   失败 1 个变更：
   - some-change：归档目录已存在
   ```

**冲突解决示例**

示例 1：仅一个被实现
```
冲突：specs/auth/spec.md 被 [add-oauth, add-jwt] 修改

检查 add-oauth：
- Delta 新增 "OAuth Provider Integration" requirement
- 搜索代码库……在 src/auth/oauth.ts 找到 OAuth 实现

检查 add-jwt：
- Delta 新增 "JWT Token Handling" requirement
- 搜索代码库……未找到 JWT 实现

解决：仅 add-oauth 被实现，只同步 add-oauth 的 spec。
```

示例 2：两个都被实现
```
冲突：specs/api/spec.md 被 [add-rest-api, add-graphql] 修改

检查 add-rest-api（创建于 2026-01-10）：
- Delta 新增 "REST Endpoints" requirement
- 搜索代码库……找到 src/api/rest.ts

检查 add-graphql（创建于 2026-01-15）：
- Delta 新增 "GraphQL Schema" requirement
- 搜索代码库……找到 src/api/graphql.ts

解决：两个均已实现。先应用 add-rest-api 的 spec，再应用 add-graphql（按时间顺序，后者优先）。
```

**成功时的输出示例**

```
## 批量归档完成

已归档 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/
- <change-2> -> archive/YYYY-MM-DD-<change-2>/

Spec 同步摘要：
- N 个 delta spec 已同步到主 spec
- 无冲突（或：M 个冲突已解决）
```

**部分成功时的输出示例**

```
## 批量归档完成（部分）

已归档 N 个变更：
- <change-1> -> archive/YYYY-MM-DD-<change-1>/

已跳过 M 个变更：
- <change-2>（用户选择不归档未完成项）

失败 K 个变更：
- <change-3>：归档目录已存在
```

**无变更时的输出示例**

```
## 无变更可归档

未找到活跃变更。使用 `/opsx:new` 可新建变更。
```

**约束**
- 允许选择任意数量的变更（1+ 即可，2+ 为常见）
- 始终让用户选择，不要自动选
- 尽早检测 spec 冲突，并通过查代码库解决
- 当两个变更都已实现时，按时间顺序应用 spec
- 仅在实现缺失时跳过 spec 同步（并警告用户）
- 确认前清晰展示每个变更的状态
- 整批操作只做一次确认
- 记录并汇报所有结果（成功/跳过/失败）
- 移动到 archive 时保留 .openspec.yaml
- 归档目标目录使用当前日期：YYYY-MM-DD-<name>
- 若归档目标已存在，该变更报错但继续处理其余变更
