# f2s-task（变更追踪规则）

## 生效条件

各技能按自身子项判断：

- `f2s-kb-feat`：读 `changeTracking.feat`
- `f2s-kb-fix`：读 `changeTracking.fix`
- `f2s-implement-tech-design`：读 `changeTracking.implement`

若对应子项为 `false` 或字段不存在，**该技能内的变更追踪步骤不执行**，直接跳过。

> `f2s-req-plan` 命令不受此条件约束，始终执行（见 `skills/f2s-req-plan/SKILL.md`）。

## 目录结构

```
.task/
├── todo.json                          ← 活跃任务索引，仅主 agent 写
├── active/
│   └── <task-name>/
│       ├── task.md                    ← checklist（执行步骤）
│       └── context.md                 ← 涉及文件路径、相关资料链接
└── completed/
    └── <task-name>-<YYYYMMDD>/
        ├── task.md
        └── context.md
```

## todo.json 结构

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

**写权约束**：`todo.json` 仅由主 agent 写，禁止子 agent 修改。

## 任务开始（代码变更前）

1. 检查 `.task/todo.json` 是否存在活跃任务。
2. 将用户输入与各条目 `keywords` 匹配：
   - 命中一个 → 加载对应 `task.md` 和 `context.md`，展示剩余清单
   - 命中多个 → 列出候选，让用户选择
   - 无命中 → 确认任务名称后创建新任务
3. 创建新任务（无命中时）：
   a. 确认任务名称（snake_case，简短描述变更内容）
   b. 在 `.task/active/<task-name>/` 创建文件夹
   c. 将本次工作步骤写入 `task.md`
   d. 将涉及文件路径和相关资料链接写入 `context.md`
   e. 在 `todo.json` 新增条目（仅主 agent 写）

## 执行中

- 每完成一个步骤，立即更新 `task.md` 中对应 checkbox（`[ ]` → `[x]`）
- 禁止批量勾选或跳步

## 任务完成

1. 将 `.task/active/<task-name>/` 整体移至 `.task/completed/<task-name>-<YYYYMMDD>/`
2. 从 `todo.json` 删除该条目
3. 若 `todo.json` 变为空数组，删除该文件

## 新会话续作

新会话开始时，若存在 `.task/todo.json`：

1. 读取全部活跃任务
2. 将用户首条消息与各条目 `keywords` 匹配
3. 命中则展示剩余 checklist 并提示「检测到未完成任务，是否继续？」
4. 用户确认后：**若 `linkedSkill` 非空，先加载对应技能规则文件（配置根 `skills/<linkedSkill>/SKILL.md`）作为执行上下文**，再按 `task.md` 剩余步骤继续——技能的落盘约束、文风规则、自检清单全部生效，与首次调用一致
5. 无命中则不打扰，正常响应

## task.md 格式

```markdown
# <任务名>

## 步骤
- [ ] 步骤1
- [ ] 步骤2
- [x] 步骤3（已完成）

## 备注
<执行中的发现、决策等>
```

## context.md 格式

```markdown
# <任务名> 上下文

## 涉及文件
- `src/payment/callback.js`
- `src/payment/retry.js`

## 相关资料
- `.Knowledge/req-docs/payment-spec.md`
- `.Knowledge/stock-docs/payment-arch.md`
```

## 推荐 Hook 配置（Claude Code）

在项目 `.claude/settings.json` 中添加，每次文件变更前将活跃任务注入上下文：

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "node -e \"try{const f='.task/todo.json',fs=require('fs');if(fs.existsSync(f)){const t=JSON.parse(fs.readFileSync(f,'utf8'));if(t.length)console.log('[task] 活跃任务: '+t.map(x=>x.name).join(', '))}}catch(e){}\" 2>/dev/null || true"
      }]
    }]
  }
}
```

## 禁止项

- 禁止子 agent 写入 `todo.json`
- 禁止在所有步骤完成前将任务移至 `completed/`
- 禁止批量勾选 checkbox（必须逐步勾选）
- 禁止在 `changeTracking.feat` / `changeTracking.fix` / `changeTracking.implement` 均为 `false` 或字段不存在时创建 `.task/` 目录（`f2s-req-plan` 不受此约束）
