[中文](./README-目录与路径约定.md) | [English](./directory-conventions.en.md)

# Directory and Path Conventions

## Core Boundary

- `.Knowledge/`: **Knowledge ring** — business docs and machine-readable routing ([architecture.en.md §2](./architecture.en.md))
- `.task/`: **Task ring** — change tracking (not inside `.Knowledge/`)
- `Config Root` (`.cursor/.claude/.codex`): **Rules ring + skills ring**

See [architecture.en.md §1](./architecture.en.md) for Memory Coding four rings.

---

## Directory Responsibilities

| Path | Responsibility |
| --- | --- |
| `.Knowledge/stock-docs/` | **L3** Architecture, final drafts, reference documents |
| `.Knowledge/req-docs/` | **L3** Requirement clarification, technical proposals |
| `.Knowledge/topics/` | **L2** Topic summaries (hard constraints, boundaries, pointers) |
| `.Knowledge/template/` | Templates for final drafts / technical proposals |
| `.Knowledge/index.md` | Human-readable index |
| `.Knowledge/manifest-routing.json` | **L0** Machine-readable routing skeleton (task/topic/`topicDependencies`) |
| `.Knowledge/matchers/*.json` | **L1** Keyword fragments (`id/includeAny`); **match** reads one shard via `matcherPath` |
| `.Knowledge/migration-report.md` | Migration comparison table and deletion path list written by `f2s-kb-migrate` |
| `.task/` | Change tracking task directory (`active/` for in-progress, `completed/` for archived with directory name in the format **`<YYYYMMDD>-<task-name>`** (date first), `todo.json` for active task index); created only when `changeTracking.*` is `true` or `f2s-req-plan` is explicitly invoked |
| `Config Root/rules/` | Rule files (Cursor `.mdc`, Claude `.md`) |
| `Config Root/skills/` | Skill definitions (`SKILL.md`) |
| `Config Root/template/` | (Deprecated) No longer written to; historical directories may be cleaned up |
| `.codex/AGENTS.md` | Codex unified entry point and loading instructions |
| `flow2spec.config.json` | Project root configuration, controls `subAgent`, `switchAgentVerification`, `changeTracking` (nested object with `feat` / `fix` / `implement` sub-items) |

> See [Usage Guide Section 1](./usage-guide.en.md) for multi-platform references and path tables (detail maintained in a single table); **the authoritative source remains `Read(flow2spec.config.json)`**.

---

## Path Constraints

1. `.Knowledge/topics` is the knowledge routing topic layer; it is allowed and encouraged to be maintained via `f2s-*` skills.
2. `f2s-ctx-build` reads from `.Knowledge/stock-docs` and updates `.Knowledge/topics`, `.Knowledge/index.md`, `.Knowledge/manifest-routing.json`, `.Knowledge/matchers/*.json`.
3. Implementation tasks uniformly read from `.Knowledge/req-docs/*.md`.
4. `manifest-routing.json` and `matchers/*.json` are maintained by `f2s-*` skill workflows; `.Knowledge/manifest-matchers.json` is no longer used (`flow2spec init` will delete legacy files).

---

## Related Documents

- [Usage Guide](./usage-guide.en.md)
- [Commands Reference](./commands-reference.en.md)
- [Architecture](./architecture.en.md)
- [Usage Scenarios](./usage-scenarios.en.md)