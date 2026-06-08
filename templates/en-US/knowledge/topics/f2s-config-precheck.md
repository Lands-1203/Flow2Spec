# config-precheck (routing summary)

## Purpose

- Anchors topic id **`config-precheck`** for `manifest-routing.topicPaths`.
- Relates to reading the project-root **`flow2spec.config.json`** (`subAgent`, `switchAgentVerification`, `changeTracking`) before executing any **`f2s-*` skill**. Its semantics match the top of **`.codex/AGENTS.md`** and the "unified entry".

## Complete Instructions (on demand; do not maintain a second full body in `.Knowledge`)

| Side | Path |
| --- | --- |
| Codex (init mirror, same source as template) | [f2s-config-check.md](../../.codex/topics/f2s-config-check.md) |
| Cursor | Repository-root `.cursor/rules/f2s-config-check.mdc` (`flow2spec init cursor`) |
| Claude | `.claude/rules/f2s-config-check.md`; SessionStart: `.claude/hooks/f2s-config-session.js`; PreToolUse guard: `.claude/hooks/f2s-config-inject.js` |
| Package template | `templates/<locale>/rules/f2s-config-check.mdc` |

## Required Steps

1. Use **Read** to open project-root **`flow2spec.config.json`** (must happen before any step in an `f2s-*` skill body).
2. The `{{FLOW2SPEC_PROJECT_CONFIG}}` table in **`.codex/AGENTS.md`** is an **init-time snapshot**; if it differs from disk, the **Read** result is authoritative.

## Prohibitions

- Do not enter **`f2s-*`** skill-body steps before reading **`flow2spec.config.json`** (same rule as `AGENTS` and `.codex/topics/f2s-config-check.md`). Claude's SessionStart summary and PreToolUse guard reminder do not replace this Read.
