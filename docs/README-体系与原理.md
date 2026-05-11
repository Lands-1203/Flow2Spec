# 体系与原理

Flow2Spec 的目标是把"业务知识沉淀"与"Agent 能力加载"拆开：

- **知识层**：`.Knowledge`（文档与索引）
- **执行层**：配置根 `rules/skills`（供各工具原生加载）

---

## 1. 两层结构

| 层 | 位置 | 作用 |
| --- | --- | --- |
| 知识层 | `.Knowledge/` | 保存业务文档、索引、路由 |
| 执行层 | `.cursor/.claude/.codex` | 保存规则与技能入口 |

---

## 2. 渐进式读取

统一建议顺序：

1. `.Knowledge/manifest-routing.json`
2. `.Knowledge/matchers/<matcher>.json`（按需：由 `manifest-routing.taskToTopicRules[].matcherPath` 直链定位）
3. `.Knowledge/index.md`
4. 命中的 `stock-docs` / `req-docs` 文档
5. 必要时下钻源码

读取后执行 `match → expand → verify → act` 四步流水线：命中主候选后展开依赖主题、缺口检查，置信度足够时才执行；低置信度先澄清。

同时由配置根入口（Flow2Spec 包规则：`f2s-flow2spec-unified-entry.mdc` / `f2s-flow2spec-unified-entry.md`；旧版业务仓库常见为 `main.md(c)`；以及 `AGENTS.md`）约束加载行为。  
其中 Codex 不读取 `rules/` 目录，统一通过 `.codex/AGENTS.md` + `skills/` 承载执行约束。

---

## 3. 关键链路

- 文档沉淀链：`f2s-doc-arch` → `f2s-doc-final` → `f2s-ctx-build`
- 实现链：`.Knowledge/req-docs/*.md` → `implement-tech-design` → 代码
- 维护链：`f2s-kb-fix` / `f2s-kb-feat` / `f2s-kb-sync` / `f2s-kb-merge`
- 需求规划链：`f2s-req-plan`（规划 + 实现，始终创建任务清单）
- 变更追踪链：`changeTracking.*` 配置 → `f2s-task` 规则（自动）→ `.task/` 任务清单 → 跨会话续作
- 包模板/路由形态与配置根对齐：`f2s-kb-upgrade`（**勿**将单独 `flow2spec init` 等同于「知识库升级」）；旧库结构迁入 `.Knowledge`：`f2s-kb-migrate`

---

## 4. Agent 执行模型

Flow2Spec 通过项目根 `flow2spec.config.json` 的 `subAgent`、`switchAgentVerification` 两个字段控制执行行为。

**Agent 如何读到上述真值**：多端提示 + **Read** 权威，见 [Flow2Spec使用说明 § 一（唯一详表）](./Flow2Spec使用说明.md)；设计归纳见 [Flow2Spec-设计说明 § 四、5.1](./Flow2Spec-设计说明.md)。

### 4.1 主/子 Agent 职责划分原则

**`subAgent: false`（默认）**：全部 `f2s-*` 技能在主 agent 内顺序完成，无并行拆分。

**`subAgent: true`**：达到技能正文约定的规模门槛时，允许拆分子 agent 并行处理。职责边界如下：

| 角色 | 职责边界 |
|------|----------|
| 主 agent | 统筹规划、确定任务粒度与分配策略、汇总子 agent 输出、校验跨单元一致性、最终落盘 |
| 子 agent | 处理指定单元（模块/文档/主题），按约定格式输出结果，不跨单元决策 |

子 agent 的拆分边界由各 `f2s-*` 技能正文逐步约定（如模块数、文档数、代码行数等门槛），**当前尚未在模板层给出统一阶段表**，以技能正文为准。

### 4.2 验证归属原则

**默认（谁落盘谁验）**：落盘或变更后的验证在落盘侧 agent 内完成。子 agent 落盘则子 agent 自验，主 agent 落盘则主 agent 自验。

**交叉验证（`switchAgentVerification: true`）**：由对方 agent 承担验证，适用于需要更高置信度的场景。启用条件必须**同时满足**：

1. 配置 `switchAgentVerification: true`
2. 当前执行的 `f2s-*` 技能正文**明确写出**该步骤依赖本项

交叉验证规则：

| 落盘方 | 验证方 | 前提条件 |
|--------|--------|----------|
| 子 agent 落盘 | 主 agent 验证 | 无额外条件 |
| 主 agent 落盘 | 子 agent 验证 | 须 `subAgent: true` 且实际已拆出子任务；否则仍由主 agent 自验 |

设计意图：交叉验证引入外部视角，降低落盘侧的自验盲区，但增加执行开销，因此设为显式 opt-in 而非默认行为。

### 4.3 变更追踪（changeTracking）

`changeTracking` 是独立于 `subAgent` / `switchAgentVerification` 的第三个维度，控制技能执行时是否自动创建可跨会话续作的任务清单。

```json
{
  "changeTracking": {
    "feat": false,
    "fix": false,
    "implement": false
  }
}
```

- 各技能子项独立控制，互不影响
- 开启后：技能执行前自动检查 `.task/todo.json`，创建或续接任务；完成后自动归档
- 跨会话：新会话描述相关内容，`f2s-task` 规则（`alwaysApply`）关键词匹配命中后自动加载剩余清单和对应技能上下文
- `f2s-req-plan` 不受此配置约束，始终创建任务清单

---

## 5. 设计收益

1. 跨工具共享同一业务知识源
2. 不破坏 Claude/Cursor/Codex 的规则加载习惯
3. 通过 `manifest-routing` + `matcherPath` 分片（`matchers/*.json`）控制任务路由与依赖，减少误读与全量扫描
4. 主/子 agent 职责边界清晰，主 agent 始终持有全局视图，子 agent 专注单元处理，汇总一致性由主 agent 保证
5. 验证归属可配置：默认落盘侧自验保持低开销，交叉验证按需启用提升关键场景置信度

---

## 6. 相关文档

- [Flow2Spec使用说明](./Flow2Spec使用说明.md)
- [README-命令说明](./README-命令说明.md)
- [README-目录与路径约定](./README-目录与路径约定.md)
- [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md)
