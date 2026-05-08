# Flow2Spec：任务清单与变更追踪（设计说明）

> **定位**：说明 `.task/` 任务清单的**两种触发方式**、目录与数据约定、与配置及技能的关系。  
> **执行细则**：变更追踪的 checklist 与禁止项以配置根 **`rules/f2s-task.*`** 为准；显式规划链路以 **`skills/f2s-req-plan/SKILL.md`** 为准。

---

## 1. 设计目标

1. 在业务仓库内为 AI 协作留下**可续作**的进度载体，避免跨会话丢失上下文。
2. **自动模式**与**显式模式**解耦：日常修缺陷/加能力可走配置开关；需要「先看全貌再动手」时走独立技能。
3. **`todo.json` 单写权**：降低多 agent 并发写同一索引的冲突风险。

---

## 2. 两种模式对照

| 维度 | 自动模式（变更追踪） | 显式模式（f2s-req-plan） |
| --- | --- | --- |
| **配置** | `flow2spec.config.json` → `changeTracking.feat` / `fix` / `implement` 任一为 `true` | **不依赖** `changeTracking` |
| **触发** | 执行 `f2s-kb-feat`、`f2s-kb-fix`、`f2s-implement-tech-design`（按各自子项）时，技能内按规则创建/续接任务 | 用户调用 **`f2s-req-plan`** |
| **规则入口** | 配置根 **`rules/f2s-task.*`**（`alwaysApply`） | **`skills/f2s-req-plan/SKILL.md`** |
| **典型场景** | 希望每次相关技能执行都自动留下清单并可关键词续作 | 有方案/需求文本，要先出**草稿清单**并经用户确认后再落盘与实现 |

---

## 3. 目录与文件约定

```
.task/
├── todo.json                 ← 活跃任务索引；仅主 agent 写入
├── active/<task-name>/
│   ├── task.md               ← checklist（步骤级 checkbox）
│   └── context.md            ← 涉及文件、req-docs/stock-docs 链接
└── completed/<task-name>-<YYYYMMDD>/
    ├── task.md
    └── context.md
```

- **任务名**：`snake_case`，简短描述变更内容。
- **归档**：完成后将 `active/<task-name>/` 整体移至 `completed/<task-name>-<YYYYMMDD>/`，并从 `todo.json` 删除对应条目；若数组为空可删除 `todo.json`。

---

## 4. `todo.json` 条目结构

```json
[
  {
    "name": "任务名称",
    "folder": ".task/active/<task-name>/",
    "keywords": ["关键词1", "关键词2"],
    "linkedSkill": "f2s-kb-fix",
    "createdAt": "YYYY-MM-DD"
  }
]
```

- **`linkedSkill`**：跨会话续作命中后，用于加载配置根 **`skills/<linkedSkill>/SKILL.md`**，使约束与首次调用一致。`f2s-req-plan` 落盘时常写 `"f2s-req-plan"`。
- **写权**：`todo.json` **仅主 agent**；禁止子 agent 修改。

---

## 5. 跨会话续作（自动模式侧）

当存在 `.task/todo.json` 时，`f2s-task` 规则约定：将用户首条消息与各条目的 **`keywords`** 匹配；命中则展示剩余 checklist，并可加载 **`linkedSkill`**；无命中则不打扰。

---

## 6. 显式模式要点（f2s-req-plan）

1. **步骤 2（草稿确认）**必须由主 agent 完成；**未确认前**禁止创建任务文件或写代码。
2. 确认后：主 agent 写 **`todo.json`**；`task.md` / `context.md` 在 `subAgent=true` 时可由子 agent 起草，仍以技能正文为准。
3. 实现阶段：子 agent 默认**不触碰** `.task/` 与 `.Knowledge/`；checkbox **逐项**勾选，禁止批量勾选。

---

## 7. 与 `changeTracking: false` 的关系

若对应子项为 `false` 或字段缺失，**对应技能内**的变更追踪步骤**不执行**，且**不应**仅为追踪而创建 `.task/`（见 `f2s-task` 禁止项）。`f2s-req-plan` **始终**走自己的任务清单流程。

---

## 8. 信息来源（仓库内文档）

- `docs/README-体系与原理.md` — 第 3 节链路、第 4.3 节变更追踪。
- `docs/README-命令说明.md` — `f2s-req-plan`、`f2s-task`、`changeTracking` 字段说明。
- `docs/README-目录与路径约定.md` — `.task/` 路径约定。
- `docs/Flow2Spec使用说明.md` — 自动模式与显式模式产品说明。

---

## 9. 知识库路由

- 主题 **`f2s-task`**：`.Knowledge/topics/f2s-task.md`，matcher **`m-change-tracking`**。
- 主题 **`f2s-req-plan`**：`.Knowledge/topics/f2s-req-plan.md`，matcher **`m-req-plan`**。

人读索引见 `.Knowledge/index.md` 主题表。
