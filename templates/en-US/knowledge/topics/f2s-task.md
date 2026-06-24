# f2s-task (routing summary)

> For the long-form body, see configuration-root **`rules/f2s-task.*`**.  
> Systematic design notes (optional): after creating your own task-list notes in `stock-docs/`, link them from this topic or `index.md`, for example `../stock-docs/<task-list-notes>.md`.

## Purpose

Change-tracking rules (`alwaysApply: true`). When the corresponding skill's `changeTracking.*` is `true`, automatically create, incrementally update, and finally archive task lists under `.task/` before and after skill execution. Supports resuming across sessions.

## Effective Scope

| Configuration item | Corresponding skill |
| --- | --- |
| `changeTracking.feat` | `f2s-kb-feat` |
| `changeTracking.fix` | `f2s-kb-fix` |
| `changeTracking.implement` | `f2s-implement-tech-design` |

`f2s-req-plan` is not constrained by this configuration and always creates a task list.

## Directory Structure

```
.task/
├── todo.json                    ← active task index (main agent writes only)
├── active/<task-name>/
│   ├── task.md                  ← checklist (execution steps)
│   ├── context.md               ← related files and document links
│   ├── user-todos.md            ← todos the user must perform (database changes, environment setup, etc.)
│   └── acceptance.md            ← acceptance checklist: generated after every task.md item is [x] and before archiving
└── completed/<YYYYMMDD>-<task-name>/
    ├── task.md
    ├── context.md
    ├── user-todos.md
    └── acceptance.md
```

User-side todos **must** be written to **`user-todos.md`** in the same directory as `task.md`; before archiving, **`acceptance.md`** in the same directory **must** be produced (the acceptance checklist). Their responsibilities are separated: `user-todos.md` tracks user-side **todos** (things the Agent cannot do), while `acceptance.md` tracks user-side **acceptance** (whether the Agent's deliverables actually work). See configuration-root **`rules/f2s-task.*`** for details.

## Cross-Session Resume

If `todo.json` exists when a new session starts, the rule automatically matches the user's first message against each entry's `keywords`:
- Hit -> show the remaining checklist, **summarize incomplete items in `user-todos.md` if any**, **report the current state of `acceptance.md`** (placeholder / final), load the skill file corresponding to `linkedSkill` as execution context, and ask whether to continue
- No hit -> do not interrupt; respond normally

## Next Step

Read configuration-root `rules/f2s-task.*` for complete rules (directory structure, todo.json format, task lifecycle, Hook configuration).
