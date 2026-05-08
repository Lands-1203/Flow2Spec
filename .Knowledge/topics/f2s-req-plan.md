# f2s-req-plan（路由摘要）

> 长文见 **`skills/f2s-req-plan/SKILL.md`**。  
> 与「自动变更追踪」的对照与设计背景：[Flow2Spec 任务清单与变更追踪](../stock-docs/Flow2Spec-任务清单与变更追踪.md)。

## 作用

从技术方案或需求描述出发，完整覆盖「规划 → 实现」链路：

1. 解析输入（文档路径或自由文本描述）
2. 输出任务清单草稿并等待用户确认
3. 落盘 `.task/active/<task-name>/task.md` + `context.md` + `todo.json`
4. 按清单实现代码（`subAgent=true` 时可拆子 agent 并行实现各模块）
5. 归档任务

知识库同步不在本命令范围内，完成后可按需调用 `f2s-kb-sync`。

## 关键约束

- 不依赖 `changeTracking` 配置，始终创建任务清单
- 步骤 2（草稿确认）必须主 agent，未确认前禁止落盘
- `todo.json` 恒主 agent 单点写入

## 下一步

读 **`skills/f2s-req-plan/SKILL.md`** 获取完整步骤与编排规则。
