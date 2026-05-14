[中文](./README-体系与原理.md) | [English](./architecture.en.md)

# Architecture & Principles

Flow2Spec's goal is to separate "business knowledge curation" from "Agent capability loading":

- **Knowledge layer**: `.Knowledge` (documents and index)
- **Execution layer**: config root `rules/skills` (natively loaded by each tool)

---

## 1. Two-Layer Structure

| Layer | Location | Role |
| --- | --- | --- |
| Knowledge layer | `.Knowledge/` | Stores business documents, index, routing |
| Execution layer | `.cursor/.claude/.codex` | Stores rules and skill entry points |

---

## 2. Progressive Reading

The recommended unified order:

1. `.Knowledge/manifest-routing.json`
2. `.Knowledge/matchers/<matcher>.json` (on demand: directly located by `manifest-routing.taskToTopicRules[].matcherPath`)
3. `.Knowledge/index.md`
4. The matched `stock-docs` / `req-docs` documents
5. Source code drill-down when necessary

After reading, execute the four-step pipeline `match -> expand -> verify -> act`: expand dependency topics after hitting the primary candidate, perform gap analysis, execute only when confidence is sufficient; clarify first when confidence is low.

Simultaneously, loading behavior is governed by the config root entry points (Flow2Spec package rules: `f2s-flow2spec-unified-entry.mdc` / `f2s-flow2spec-unified-entry.md`; legacy business repos commonly use `main.md(c)`; and `AGENTS.md`).
Codex does not read the `rules/` directory; execution constraints are carried through `.codex/AGENTS.md` + `skills/`.

---

## 3. Key Chains

- Documentation curation chain: `f2s-doc-arch` -> `f2s-doc-final` -> `f2s-ctx-build`
- Implementation chain: `.Knowledge/req-docs/*.md` -> `implement-tech-design` -> code
- Maintenance chain: `f2s-kb-fix` / `f2s-kb-feat` / `f2s-kb-sync` / `f2s-kb-merge`
- Requirements planning chain: `f2s-req-plan` (planning + implementation, always creates task checklist)
- Change tracking chain: `changeTracking.*` config -> `f2s-task` rules (automatic) -> `.task/` task checklist -> cross-session continuation
- Package template/routing shape alignment with config root: `f2s-kb-upgrade` (**do not** equate running `flow2spec init` alone with "knowledge base upgrade"); migrate legacy repo structure into `.Knowledge`: `f2s-kb-migrate`

---

## 4. Agent Execution Model

Flow2Spec controls execution behavior through two fields in the project root `flow2spec.config.json`: `subAgent` and `switchAgentVerification`.

**How the Agent reads the above truth values**: multi-end prompts + **Read** as authority, see [usage-guide.en.md § 1 (the only detailed table)](./usage-guide.en.md); design summary see [design-principles.en.md § 4, 5.1](./design-principles.en.md).

### 4.1 Primary/Sub Agent Responsibility Division Principle

**`subAgent: false` (default)**: All `f2s-*` skills execute sequentially within the primary agent, no parallel decomposition.

**`subAgent: true`**: When the scale threshold agreed upon in the skill body is reached, sub-agents may be spawned for parallel processing. Responsibility boundaries are as follows:

| Role | Responsibility Boundary |
|------|----------|
| Primary agent | Overall planning, determining task granularity and allocation strategy, aggregating sub-agent output, verifying cross-unit consistency, final write-to-disk |
| Sub agent | Processes the assigned unit (module/document/topic), outputs results in the agreed format, does not make cross-unit decisions |

The decomposition boundaries for sub-agents are progressively defined by each `f2s-*` skill body (e.g., thresholds for module count, document count, code line count). **There is currently no unified stage table at the template layer**; the skill body takes precedence.

### 4.2 Verification Ownership Principle

**Default (whoever writes to disk verifies)**: Verification after write-to-disk or changes is performed within the agent that wrote to disk. If a sub-agent wrote, the sub-agent self-verifies; if the primary agent wrote, the primary agent self-verifies.

**Cross-verification (`switchAgentVerification: true`)**: The counterpart agent bears the verification responsibility, suitable for scenarios requiring higher confidence. The enabling conditions must be **satisfied simultaneously**:

1. Configuration `switchAgentVerification: true`
2. The currently executing `f2s-*` skill body **explicitly states** that the step depends on this field

Cross-verification rules:

| Writer | Verifier | Prerequisite |
|--------|--------|----------|
| Sub-agent writes | Primary agent verifies | No additional conditions |
| Primary agent writes | Sub-agent verifies | Requires `subAgent: true` and that sub-tasks have actually been decomposed; otherwise, the primary agent self-verifies |

Design intent: Cross-verification introduces an external perspective, reducing the blind spots in the writer's self-verification, but increases execution overhead. It is therefore an explicit opt-in rather than the default behavior.

### 4.3 Change Tracking (changeTracking)

`changeTracking` is a third dimension independent of `subAgent` / `switchAgentVerification`. It controls whether the skill automatically creates a task checklist that can be continued across sessions during execution.

```json
{
  "changeTracking": {
    "feat": false,
    "fix": false,
    "implement": false
  }
}
```

- Each skill sub-item is independently controlled and does not affect each other
- When enabled: automatically checks `.task/todo.json` before skill execution, creates or resumes tasks; automatically archives upon completion
- Cross-session: when a new session describes related content, the `f2s-task` rule (`alwaysApply`) loads the remaining checklist and corresponding skill context after keyword matching
- `f2s-req-plan` is not constrained by this configuration and always creates a task checklist

---

## 5. Design Benefits

1. Share the same business knowledge source across tools
2. Does not break the rule loading conventions of Claude/Cursor/Codex
3. Controls task routing and dependencies via `manifest-routing` + `matcherPath` shards (`matchers/*.json`), reducing misreading and full scans
4. Clear primary/sub-agent responsibility boundaries: the primary agent always holds the global view, sub-agents focus on unit processing, consistency is ensured by the primary agent
5. Configurable verification ownership: default self-verification by the writer keeps overhead low; cross-verification can be enabled on demand to boost confidence in critical scenarios

---

## 6. Related Documents

- [Usage Guide](./usage-guide.en.md)
- [Commands Reference](./commands-reference.en.md)
- [Directory Conventions](./directory-conventions.en.md)
- [Usage Scenarios](./usage-scenarios.en.md)