# f2s-task（路由摘要）

> 长文见配置根 **`rules/f2s-task.*`**。  
> 体系化设计说明（两种模式、目录、`todo.json`）：[Flow2Spec 任务清单与变更追踪](../stock-docs/Flow2Spec-任务清单与变更追踪.md)。

## 作用

变更追踪规则（`alwaysApply: true`）。当对应技能的 `changeTracking.*` 为 `true` 时，技能执行前后自动创建、逐步更新、最终归档 `.task/` 下的任务清单，支持跨会话续作。

## 生效范围

| 配置项 | 对应技能 |
| --- | --- |
| `changeTracking.feat` | `f2s-kb-feat` |
| `changeTracking.fix` | `f2s-kb-fix` |
| `changeTracking.implement` | `f2s-implement-tech-design` |

`f2s-req-plan` 不受配置约束，始终创建任务清单。

## 目录结构

```
.task/
├── todo.json                    ← 活跃任务索引（仅主 agent 写）
├── active/<task-name>/
│   ├── task.md                  ← checklist（执行步骤）
│   └── context.md               ← 涉及文件、文档链接
└── completed/<task-name>-YYYYMMDD/
```

## 跨会话续作

新会话开始时若存在 `todo.json`，规则自动将用户首条消息与各条目 `keywords` 匹配：
- 命中 → 展示剩余 checklist，加载 `linkedSkill` 对应技能文件作为执行上下文，提示是否继续
- 无命中 → 不打扰，正常响应

## 下一步

读配置根 `rules/f2s-task.*` 获取完整规则（目录结构、todo.json 格式、任务生命周期、Hook 配置）。
