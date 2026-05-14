[中文](./Flow2Spec使用说明.md) | [English](./usage-guide.en.md)

# Flow2Spec Usage Guide

## 1. What `init` Does

Execute in the project root:

```bash
flow2spec init [cursor|claude|codex ...]
# To force reset .Knowledge from template:
flow2spec init [cursor|claude|codex ...] --reset-knowledge
```

| What `init` does | What `init` does NOT do |
|---------|----------|
| Fills in missing directories and template files | Write or update business document content |
| Writes agent config root `rules/` `skills/` | Update `includeAny` business terms |
| Aligns `manifest-routing` + `matchers/` package-level structure | Replace `f2s-*` skills for writing business semantics |
| Overwrites `.Knowledge` template files with `--reset-knowledge` | Override existing `.Knowledge` content (without this flag) |

> **`init` and "knowledge base upgrade" are two different things**: `init` only handles structural alignment — business semantics (topics content, routing terms, stock-docs/req-docs) are maintained by skills like `f2s-doc-add`, `f2s-kb-fix`, `f2s-kb-feat`, `f2s-kb-sync`, `f2s-ctx-build`, etc. For cross-version upgrades, use `f2s-kb-upgrade`. **Do not treat a standalone `init` as an upgrade command.**

### `f2s-*` and `flow2spec.config.json`: Multi-Client, Multi-Layered Reminders (Authority Remains the Disk JSON)

Before executing any **`f2s-*` skill**, the Agent needs to obtain the actual values of **`subAgent` / `switchAgentVerification` / `changeTracking`**, etc. Flow2Spec enforces this via **different mechanisms** on **different clients**; they **complement** each other and do **not** replace one another. **Authority always** resides in the project root **`flow2spec.config.json`** (call **Read** to verify against disk before proceeding into skill body).

| Client | `init` Output & Behavior | Description |
| --- | --- | --- |
| **Cursor** | `.cursor/rules/f2s-config-check.mdc` (`alwaysApply`) | Rule requires: **Read(`flow2spec.config.json`)** before entering skill body. |
| **Claude Code** | `.claude/hooks/f2s-config-inject.js` + `.claude/settings.json` (PreToolUse, `Skill` matching) | Injects a config summary when invoking **`f2s-*` Skill**; when **file is missing, JSON is invalid, or hook throws an unexpected exception**, it also injects a **notice + default semantics consistent with "file not found"** to avoid silent failure; it is still recommended to **Read** for confirmation when in doubt or after config changes. |
| **Codex** | `.codex/AGENTS.md` top-level mandatory step + `{{FLOW2SPEC_PROJECT_CONFIG}}` expansion table | **Read** is a hard requirement; the config table is a **snapshot from the last `flow2spec init`** — when it differs from disk, **Read** takes precedence. The adjacent **`.codex/topics/f2s-config-check.md`** shares its origin with the Cursor rule (including the **changeTracking** detail table); open it **as needed** — it does not need to be grouped with the three "topic long-form" examples as required reading. |
| **Knowledge Base (optional)** | When `.Knowledge/manifest-routing` hits **`config-precheck`** | `.Knowledge/topics/f2s-config-precheck.md` is a **routing summary** that links to the Codex long-form article; Flow2Spec does **not** maintain a second full copy in `.Knowledge`, nor does it replace a `Read` of the JSON. |

For field semantics and default value rules, see [README-命令说明 § 6) 子 Agent 配置说明](./commands-reference.en.md). For the design perspective, see [Flow2Spec-设计说明 § 四、5.1](./design-principles.en.md); for the verbal presentation, see [Flow2Spec-演讲稿.md](./Flow2Spec-演讲稿.md).

---

## 2. Directory Conventions

Core distinction: `stock-docs/` holds solidified documents (driving knowledge routing), `req-docs/` holds technical designs (driving coding implementation); they are not interchangeable.

See [README-目录与路径约定](./directory-conventions.en.md) for the full directory description.

---

## 3. Typical Workflows

### Requirements Planning and Implementation

```
f2s-req-plan
```

Provide a path to the technical design document or a requirements description. A draft task checklist is produced first and awaits confirmation. After confirmation, implementation proceeds according to the checklist. A `.task/` task checklist is always created — no `changeTracking` configuration is needed. Suitable for scenarios where you want to see the full picture before starting, or need cross-session progress tracking.

### Change Tracking and Cross-Session Continuation

```
# Automatic mode: enabled by config (independent per skill)
flow2spec.config.json → changeTracking.feat / fix / implement: true

# Explicit mode: call f2s-req-plan (planning + implementation, no config dependency)
f2s-req-plan
```

**Automatic mode**: When enabled, `f2s-kb-feat` / `f2s-kb-fix` / `f2s-implement-tech-design` automatically create a task checklist under `.task/active/`, check off steps progressively, and archive upon completion. In subsequent sessions, when describing related content, the `f2s-task` rule automatically matches and loads the remaining checklist — no need to re-explain the context.

**Explicit mode**: Call `f2s-req-plan` directly — regardless of the `changeTracking` configuration, a task checklist is always created and code is implemented against it. Suitable for scenarios where you want to confirm the full picture before taking action.

### New Feature Development

```
f2s-req-clarify → f2s-req-backend → implement-tech-design → f2s-kb-feat
```

When requirements are already clear, `f2s-req-clarify` can be skipped, starting directly from `f2s-req-backend`. After the technical design is written into `req-docs/`, the `implement-tech-design` rule drives coding.

### Document Ingestion

```
New architecture document ingestion: f2s-doc-arch → f2s-doc-final → f2s-ctx-build
PDF document ingestion:          f2s-doc-pdf  → f2s-doc-final → f2s-ctx-build
```

Integrate architecture descriptions or PDF technical designs into the knowledge routing (generates topics/matchers/manifest-routing).

### PDF-Based Implementation

```
f2s-doc-pdf → implement-tech-design
```

Convert a PDF technical design to Markdown and place it in `req-docs/`, then let the `implement-tech-design` rule drive coding.

### Backfilling Existing Capabilities

```
f2s-doc-add      # Aggregate multiple files, extract from source code / documents
f2s-kb-sync      # Infer already-implemented capabilities from current session
```

Use these when code has already been shipped but the knowledge base has no record. `f2s-doc-add` is suitable for batch imports; `f2s-kb-sync` is suitable for real-time consolidation at the end of a session.

### Routine Maintenance

```
f2s-kb-fix       # Fix implementation or rule errors, auto-sync knowledge base
f2s-kb-feat      # Add new capabilities, auto-sync knowledge base
f2s-kb-sync      # Periodic sync or backfill
f2s-kb-merge     # Resolve context conflicts after Git merges
```

### Cross-Version Knowledge Base Upgrade

```
f2s-kb-migrate (Legacy V1: old knowledge base) → f2s-kb-upgrade
f2s-kb-upgrade (Current V2+: already has .Knowledge; includes npm v3.x projects, etc.; see skill step 0)
```

---

## 4. Agent Execution Configuration

Controlled via the project root `flow2spec.config.json`. For complete field rules, see [README-命令说明 § 6) 子 Agent 配置说明](./commands-reference.en.md). **How each client is reminded to read the config, and why `Read` remains authoritative** — see **§ 1** (this § only explains **when** to toggle each switch).

**When to enable `subAgent: true`**: When the task is large (multi-module parallel implementation, batch document ingestion, large-scale migration). When enabled, each skill decides whether to actually split based on its own size threshold; tasks below the threshold are still completed within the main agent.

**When to enable `switchAgentVerification: true`**: When higher write consistency is needed (large-scale migration, critical design implementation). The trade-off is increased execution rounds; for routine maintenance, the default `false` is sufficient. Requires `subAgent: true` to trigger the "main-writes, sub-verifies" cross-check direction.

**When to enable `changeTracking.*`**: When you want each skill execution to automatically leave a resumable task checklist. Each skill sub-item is independently configurable without mutual interference:

```json
{
  "changeTracking": {
    "feat": true,
    "fix": false,
    "implement": true
  }
}
```

If you prefer not to rely on configuration and want to explicitly plan tasks on demand, use `f2s-req-plan` directly.

---

## 5. Customization Suggestions

- When customizing the "implement from technical design" logic for your project, prioritize adjusting **`f2s-implement-tech-design`**: Cursor `.cursor/rules/f2s-implement-tech-design.mdc`, Claude `.claude/rules/f2s-implement-tech-design.md`; Codex uses `.codex/AGENTS.md` and associated `skills/` as the source of truth.
- Running `init` again by default only fills in missing templates and performs package-level structural alignment — it does **not** replace `f2s-*` skills for maintaining business content. To reset `.Knowledge` from the template, add `--reset-knowledge`.

---

## 6. Skill Identification

Skills are triggered by matching `name` and `description`. Files are located under `config-root/skills/*/SKILL.md`.

---

## 7. Related Documents

- [README-命令说明](./commands-reference.en.md)
- [README-目录与路径约定](./directory-conventions.en.md)
- [README-体系与原理](./architecture.en.md)
- [Flow2Spec-使用案例-模拟对话](./usage-scenarios.en.md)