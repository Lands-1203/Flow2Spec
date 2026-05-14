[中文](./README-命令说明.md) | [English](./commands-reference.en.md)

# Workflow and Skill Reference

## 1) Document Curation (stock-docs Pipeline)

### `f2s-doc-arch`

**Purpose**: Generates an architecture overview draft based on user descriptions or code scanning. No fixed format required; it should clearly describe the system structure, module relationships, and key decisions.

**Use Cases**:
- A new project needs architecture documentation
- An existing project needs architecture descriptions supplemented
- Architecture descriptions need updating after a system refactor

**Relationships**:
- **Prerequisite**: None
- **Next Step**: `f2s-doc-final` (normalized final draft) or direct use with `f2s-ctx-build`
- **Output**: `.Knowledge/stock-docs/<Architecture Overview>_draft.md`

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent scans the code and generates the output
- `subAgent: true`: Defaults to **B Mode** (main agent produces inventory + scan contract, sub-agents do parallel read-only table scans, main agent merges and persists); upgraded to **C Mode** (multi-round correction) when any of the following conditions are met: multi-workspace / monorepo, more than 20 source paths, first-round sub-tables have conflicts or gaps, or multi-source narratives have severe contradictions

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Produces inventory (entry points + core module names) and scan contract, aggregates sub-agent deliverables, persists stock-docs draft |
| Sub-Agent (B/C Mode) | Performs parallel read-only scans per the main agent's written inventory, delivers in a unified YAML schema (`source / scope / cross_refs / pending`), must not self-crop the scope |

---

### `f2s-doc-final`

**Purpose**: Converts PDF technical proposals or draft documents into the standardized "Final Draft Template" format, unifying the document structure for subsequent knowledge base ingestion.

**Use Cases**:
- PDF technical proposals need conversion to Markdown
- Draft documents need normalization for long-term storage
- External documents need to be incorporated into Flow2Spec management

**Relationships**:
- **Prerequisite**: PDF document or draft document
- **Next Step**: `f2s-ctx-build` (final draft imported into the knowledge base)
- **Output**: `.Knowledge/stock-docs/<Document>_final.md`

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent completes the full workflow
- `subAgent: true`: When the PDF exceeds 50 pages or 5MB, sub-agents may be used for template application and layout drafting; sub-agents must not ask the user questions, write process descriptions, or claim final-draft compliance; the main agent identifies format gaps and accepts the finalized draft

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Identifies format gaps, accepts the finalized draft against the template and clarification document |
| Sub-Agent | Applies templates and produces layout drafts; does not ask users questions or write process descriptions |

---

### `f2s-ctx-build`

**Purpose**: Synchronizes documents from `stock-docs/` (architecture, final drafts) into the knowledge base routing system, generating/updating topic files, the index, manifest-routing, and matchers.

**Use Cases**:
- After a final draft is complete, the knowledge base needs to "know about" these documents
- A new business domain needs routing mappings established
- Document content has been updated and the knowledge base index needs to be synced

**Relationships**:
- **Prerequisite**: `f2s-doc-arch`, `f2s-doc-final`, or a directly authored final draft
- **Next Step**: None (ready for use once imported into the knowledge base)
- **Input**: `.Knowledge/stock-docs/*.md`
- **Output**:
  - `.Knowledge/topics/<topic>.md`
  - `.Knowledge/index.md`
  - `.Knowledge/manifest-routing.json`
  - `.Knowledge/matchers/*.json`

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent processes each document sequentially
- `subAgent: true`: Enabled when changes exceed thresholds (more than 2 topics added/modified OR more than 1 matcher added OR cross-topic bulk reference adjustments); sub-agent A writes only to `topics/`, sub-agent B writes only to `matchers/`; the main agent handles single-point edits to `manifest-routing.json` and `index.md`; sub-agents must not cross boundaries

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Single-point persist of `manifest-routing.json` and `index.md`, overall acceptance |
| Sub-Agent (topics) | Writes only topic files under `topics/`, does not touch manifest or index |
| Sub-Agent (matchers) | Writes only shard files under `matchers/`, does not touch manifest or index |

---

### `f2s-doc-add`

**Purpose**: Parses already-implemented capabilities (aggregated from multiple files) into the knowledge base. Suitable when code already exists but lacks documentation, or when multiple documents need to be imported into the knowledge base in a unified manner.

**Use Cases**:
- Existing code needs knowledge base documentation
- Multiple related documents need aggregated import
- Bulk import of third-party documents

**Relationships**:
- **Prerequisite**: None (can be triggered directly)
- **Next Step**: None (ends once imported into the knowledge base)
- **Flow**: Draft -> Final Draft -> topics/index/manifest

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent processes sequentially
- `subAgent: true`: Enabled when any of the following thresholds are met; defaults to **B Mode** (main agent produces inventory, sub-agents do parallel read-only schema-based table fills, main agent merges and persists); upgraded to **C Mode** (multi-round correction) for multi-workspace / monorepo, first-round sub-table conflicts or gaps, or severe multi-source contradictions
  - Thresholds: 5 or more input paths OR single source exceeds 3000 lines OR total across multiple paths exceeds 10000 lines

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Produces inventory and scan contract, aggregates sub-tables, persists topics/index/manifest |
| Sub-Agent (B/C Mode) | Performs read-only scans per the main agent's written inventory, delivers tables in schema format (`source / scope / capabilities / cross_refs / pending`); must not self-crop the scope, write manifest or index, or claim "already in the knowledge base" |

**Cross-Verification (when `switchAgentVerification: true`)**:
- Topic files persisted by sub-agents -> Main agent verifies routing mapping completeness and keyword coverage
- Only effective when `subAgent: true` and sub-tasks are actually dispatched; otherwise all verification happens within the main agent

---

### `f2s-ctx-rm`

**Purpose**: Deletes corresponding knowledge topics and index mappings based on `stock-docs` documents. Only removes reference relationships in the knowledge base, not the source documents themselves.

**Use Cases**:
- A document is deprecated and needs removal from the knowledge routing
- A document was imported by mistake and its routing mapping needs revocation
- Cleaning up old mappings after document consolidation

**Relationships**:
- **Prerequisite**: A stock-docs document that has already been imported
- **Next Step**: None
- **Note**: Only deletes routing mappings, not source documents

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent handles the full workflow (single-point deletion has low sub-agent ROI)
- `subAgent: true`: Sub-agents are used only for **batch deletion of 5 or more topics**; the main agent must control scope confirmation and `fallbackTopic` re-pointing; `manifest-routing.json` and `index.md` are always persisted by the main agent

---

### `f2s-doc-pdf`

**Purpose**: Converts PDF technical proposals to Markdown format, saves to `req-docs/`, and can supplement the process description.

**Use Cases**:
- A PDF technical proposal needs to be implemented
- Historical PDF documents need to be managed
- Cross-team deliverables are in PDF format and need conversion

**Relationships**:
- **Prerequisite**: PDF document
- **Output**: `.Knowledge/req-docs/<Proposal>.md`
- **Next Step**:
  - 1. If it is a requirement to implement: provide the converted proposal path with instructions "implement according to the technical proposal", driven by the `implement-tech-design` rule
  - 2. If it is for knowledge base archival: follow the final-draft conversion flow `f2s-doc-final` -> `f2s-ctx-build`

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent completes the full workflow
- `subAgent: true`: When the PDF exceeds 50 pages or 5MB, sub-agents may be used for the PDF -> MD first draft and persist to `req-docs`; sub-agents must not ask the user questions or supplement process description sections; the main agent handles follow-up questions and process description supplementation

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Asks the user for process description supplements, completes `req-docs` deposition acceptance |
| Sub-Agent | Only performs PDF -> MD first draft and persists to `req-docs`, does not ask the user questions |

---

## 2) Requirements and Proposals

### `f2s-req-clarify`

**Purpose**: Asks clarifying questions against PRDs/requirement documents, using multi-round Q&A to define requirement boundaries, non-goals, and key flows, until the requirements are clear enough for a technical proposal.

**Use Cases**:
- First step after receiving a PRD, ensuring correct understanding
- When requirement boundaries are fuzzy or acceptance criteria are missing
- Cross-team collaboration requirements that need clear interface contracts

**Relationships**:
- **Prerequisite**: None (can be triggered directly)
- **Next Step**: `f2s-req-backend` (generates a technical proposal after clarification)
- **Output**: Requirement clarification record (optionally saved to `.Knowledge/req-docs/`)

**Sub-Agent Invocation**: None (clarification relies on continuous dialogue and immediate user feedback throughout; no sub-agent splitting)

---

### `f2s-req-backend`

**Purpose**: Based on clarified requirements and the project knowledge base, generates a backend technical proposal document including API design, data models, flow descriptions, error codes, etc.

**Use Cases**:
- After `f2s-req-clarify` completes, output a proposal based on clarification results
- When clear requirement documents already exist, directly generate a technical proposal

**Relationships**:
- **Prerequisite**: `f2s-req-clarify` (recommended) or a clear requirement document
- **Output**: `.Knowledge/req-docs/<Technical Proposal>.md`
- **Next Step**: Provide the technical proposal path with instructions "implement according to the technical proposal", driven by the `implement-tech-design` rule

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent completes the proposal within the session
- `subAgent: true`: The main agent must first extract a project convention summary (under 80 lines) from topics/stock-docs (covering architecture conventions, API style, data model standards, etc. across 6 categories) as the mandatory sub-agent context, then dispatch sub-agents to write the `req-docs` draft in parallel; the main agent handles contract finalization and acceptance

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Extracts project convention summary, assigns writing tasks, finalizes the draft against the template, and writes to `req-docs` |
| Sub-Agent | Read-only access to multiple sources (topics / stock-docs / clarified req-docs / templates), writes `req-docs` draft per template; must not expand the read scope on its own |

**Cross-Verification (when `switchAgentVerification: true`)**:
- API/model/flow documents persisted by sub-agents -> Main agent verifies cross-chapter consistency (API signatures align with data models, flows and error handling coverage)
- Only effective when `subAgent: true` and sub-tasks are actually dispatched; otherwise all verification happens within the main agent

---

### `f2s-req-plan`

**Purpose**: Starting from a technical proposal or requirement description, **always creates a task checklist**, then implements the code accordingly. Does not depend on the `changeTracking` configuration; represents the user's explicit need for traceable task management.

**Use Cases**:
- A technical proposal document exists and needs to be broken down into a task list before implementation
- The requirement description is complex and the user wants to confirm the checklist before starting work
- The user wants to track implementation progress across sessions

**Relationships**:
- **Prerequisite**: Technical proposal document path (`.Knowledge/req-docs/*.md` or PDF) or requirement/change description
- **Output**: `.task/active/<task-name>/task.md` + `context.md`; implementation code
- **Next Step**: Optionally invoke `f2s-kb-sync` to supplement the knowledge base

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent completes parsing, confirmation, and implementation in full
- `subAgent: true`: Step 1 (document parsing) can dispatch sub-agents for parallel read-only; Step 2 (draft confirmation) must be done by the main agent; Step 4 (code implementation) can dispatch sub-agents per module; `todo.json` is always written by the main agent

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Outputs draft, gets user confirmation, writes `todo.json`, aggregates implementation summary |
| Sub-Agent (parsing) | Read-only document parsing, outputs parsing result summary, does not persist |
| Sub-Agent (implementation) | Implements code per module, does not touch `.task/` or `.Knowledge/` |

---

## 3) Git Commit

### `f2s-git-commit`

**Purpose**: Executes a Git commit after code is written. Automatically checks changed files, compares knowledge base coverage, prompts the user about capabilities not yet imported, and performs the commit after the commit message is confirmed.

**Use Cases**:
- Committing code after each feature implementation or bug fix
- Wanting reminders about knowledge base coverage at commit time
- Needing AI help to generate meaningful commit messages

**Relationships**:
- **Prerequisite**: Code has been written (after `implement-tech-design`, `f2s-kb-fix`, `f2s-kb-feat`, etc.)
- **Next Step**: None (ends when commit completes; does not auto-push)
- **Bridging**: If the knowledge base is not yet covered, you can first run `f2s-kb-sync` or `f2s-kb-feat` to supplement before committing

**Execution Flow**:
1. `git status --short` + `git diff HEAD` to classify files into staged / unstaged / untracked; immediately terminates if merge conflict markers are found
2. Compare `.Knowledge/topics/` and `stock-docs/` to determine whether the changed capabilities have been imported; skips and notifies if `.Knowledge` does not exist
3. If not covered, prompt the user to choose: A) Import first, then commit / B) Commit now, import later / C) Cancel
4. Generate a commit message draft based on `git diff` content, wait for user confirmation or changes
5. `git add <specific files>` + `git commit`; if a hook fails, prompt for fix, do not skip
6. Output the commit hash; if option B was selected, include a reminder about capabilities not yet imported

**Constraints**:
- `git add -A` / `git add .` is forbidden; only add confirmed changed files
- `--no-verify` is forbidden; hook failures must be fixed and retried
- Auto-push is forbidden
- The commit message must be confirmed by the user; silent commits are not allowed

**Sub-Agent Invocation**: None (full interactive confirmation, handled within the main agent)

---

## 4) Knowledge Base Maintenance

### `f2s-kb-fix`

**Purpose**: Fixes code based on implementation or rule errors reported by the user, and **by default automatically syncs** the knowledge base documents and index.

**Use Cases**:
- Code implementation does not match the technical proposal
- Rule understanding errors need correction
- Documentation needs to be synced after bug fixes

**Change Tracking**: If `changeTracking.fix: true`, automatically checks `.task/todo.json` before execution, creates a task checklist, and automatically archives upon completion; cross-session continuation via keywords is supported (see `f2s-task` rules).

**Relationships**:
- **Prerequisite**: Problem discovered (code implementation error or rule deviation)
- **Next Step**: None (ends when fixes and sync are complete)
- **Feature**: No need for the user to explicitly request "please sync the knowledge base"; it is done automatically

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent completes fixes and knowledge base sync
- `subAgent: true`: Code sub-packages (bug fixes) can be outsourced to sub-agents; documentation sub-packages (rules/skills/topics style-related) default to the main agent writing directly; if sub-agents are used, they only output before/after diff snippets, not full-file rewrites; manifest and index are always persisted by the main agent

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Locates root cause, devises fix plan, persists style-compliant content, verifies knowledge base consistency |
| Sub-Agent (code) | Responsible for bug fixes in designated modules, outputs changes and reports impact scope |
| Sub-Agent (documentation, optional) | Only outputs before/after diff snippets, no full-file rewrites, does not touch manifest or index |

**Cross-Verification (when `switchAgentVerification: true`)**:
- Code changes persisted by sub-agents -> Main agent verifies fix correctness and knowledge base consistency
- Knowledge base sync persisted by the main agent -> Sub-agent reviews topic/manifest consistency (requires `subAgent: true` and sub-tasks actually dispatched; otherwise self-verification within the main agent)
- The reviewer and the persister must be different agent instances

---

### `f2s-kb-feat`

**Purpose**: When adding a new capability, completes both the implementation and the knowledge base; if the capability is already implemented, only syncs the knowledge base.

**Use Cases**:
- New feature development
- Adding knowledge base documentation for an existing feature

**Change Tracking**: If `changeTracking.feat: true`, automatically checks `.task/todo.json` before execution, creates a task checklist, and automatically archives upon completion; cross-session continuation via keywords is supported (see `f2s-task` rules).

**Relationships**:
- **Prerequisite**: None (can be triggered directly)
- **Next Step**: None (ends when implementation + sync are complete)
- **Feature**: Knowledge base sync is automatic; no additional user request needed

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent completes everything
- `subAgent: true`: Code sub-packages (new implementation) can be outsourced to sub-agents; documentation sub-packages (rules/skills/topics style-related) default to the main agent writing directly; if sub-agents are used, they only output before/after diff snippets; manifest and index are always persisted by the main agent

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Defines capability boundaries and implementation scope, persists style-compliant content, performs final verification of knowledge base consistency |
| Sub-Agent (code) | Responsible for code implementation (APIs, logic, data layer), outputs implementation checklist |
| Sub-Agent (documentation, optional) | Only outputs before/after diff snippets, no full-file rewrites, does not touch manifest or index |

**Cross-Verification (when `switchAgentVerification: true`)**:
- Topics persisted by documentation sub-agents -> Main agent verifies consistency between the capability description and the implementation code
- Only effective when `subAgent: true` and sub-tasks are actually dispatched; otherwise all verification happens within the main agent

---

### `f2s-kb-sync`

**Purpose**: Sinks already-implemented capabilities from the conversation back into the knowledge base. Can accept an explicit capability description or infer with zero input.

**Use Cases**:
- Implementation is complete within the conversation and needs knowledge base documentation
- Reverse-documenting knowledge from code
- Periodic knowledge base organization

**Relationships**:
- **Prerequisite**: None (can be triggered directly, or with zero-input inference)
- **Next Step**: None
- **Feature**: First outputs a knowledge base update outline, then writes only after user confirmation
- **Difference from `f2s-ctx-build`**: `ctx-build` is driven from `stock-docs`; `kb-sync` infers from the conversation/code

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent completes inference and sync
- `subAgent: true`: Steps are split -- **Step 1** (aggregation and inference) can dispatch sub-agents for parallel read-only access to conversation history; **Step 2** (user confirmation of the outline) must be done by the main agent; **Step 3** (persist sync) can dispatch sub-agents to write topic/matcher files, but sub-agents must read 2-3 neighboring topic summaries for style alignment before persisting; manifest and index are always persisted by the main agent

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Outputs outline and gets confirmation, single-point persists manifest and index, final acceptance |
| Sub-Agent (aggregation) | Read-only access to conversation history, infers capability points, generates structured update outline fragments |
| Sub-Agent (sync) | Writes topic/matcher per outline, loads neighboring topic summaries for style alignment before persisting, does not touch manifest or index |

**Cross-Verification (when `switchAgentVerification: true`)**:
- Topics/matchers persisted by sync sub-agents -> Main agent verifies cross-topic routing completeness and `includeAny` keyword coverage
- Only effective when `subAgent: true` and sub-tasks are actually dispatched; otherwise all verification happens within the main agent

---

### `f2s-kb-merge`

**Purpose**: Resolves editor context conflicts after Git merges. An optional conflict file path can be provided.

**Use Cases**:
- Context conflicts arise after a Git merge/rebase
- Knowledge base file conflicts caused by multi-person collaboration
- Need to unify knowledge base state after branch merging

**Relationships**:
- **Prerequisite**: Conflicts generated by a Git merge
- **Next Step**: None (ends when conflicts are resolved)
- **Feature**: Implementation-side conflicts are only listed for the user to confirm

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent analyzes and resolves conflicts
- `subAgent: true`: Sub-agents can be dispatched for conflict scanning and classification into a comparison table (`file / category / ours_summary / theirs_summary / recommendation`); sub-agents must not merge files on their own; the main agent persists per strategy, handles implementation-side decisions, and completes acceptance

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Persists merge results per strategy, handles implementation-side conflict decisions, acceptance |
| Sub-Agent | Only performs conflict scanning and classification, delivers comparison table in the five-field schema, does not merge files on its own |

---

### `f2s-kb-migrate`

**Purpose**: Migrates an old-format knowledge base (`docs-index.md` + `rules/` pattern) into the `.Knowledge/` structure organized by topic.

**Use Cases**:
- Upgrading an old project to the new Flow2Spec version
- An existing knowledge base needs structured reorganization

**Relationships**:
- **Prerequisite**: Old-format knowledge base (`docs-index.md`, `rules/`, `skills/`)
- **Next Step**: `f2s-kb-upgrade` (**Flow V1**: old knowledge base must migrate first, then upgrade; **Current V2+ knowledge base** (including npm v3.x): see the upgrade skill Step 0)
- **Flow**:
  1. Use `docs-index.md` + `rules/main.md(c)` as the primary index
  2. Process all business `rules/` and business `skills/` in full (excluding `f2s-*` package skills)
  3. Migrate all `stock-docs`/`req-docs`
  4. Persist `.Knowledge/migration-report.md`
  5. Delete migrated old files after user confirmation

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent migrates topic by topic
- `subAgent: true`: Sub-agents only handle migration + draft migration-report fragments (delivered as patches); status files (migration-report.md, deletion execution records) are exclusively persisted by the main agent; the main agent leads the deletion confirmation and closure

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Creates migration plan, consolidates migration results, persists migration-report, leads deletion confirmation and execution closure |
| Sub-Agent | Handles topic migration and draft fragment generation (patch format) for designated topics; does not write status files or deletion execution records |

**Cross-Verification (when `switchAgentVerification: true`)**:
- Topics migrated and persisted by sub-agents -> Main agent verifies migration completeness (whether old paths are fully covered, whether topic boundaries overlap)
- Only effective when `subAgent: true` and sub-tasks are actually dispatched; otherwise all verification happens within the main agent

---

### `f2s-kb-upgrade`

**Purpose**: Knowledge base template upgrade. Aligns manifest-routing and matchers shards.

**Use Cases**:
- After a `flow2spec` package version upgrade, upgrade the project knowledge base template
- Upgrade an old project to the latest structure

**Relationships**:
- **Prerequisite**: `f2s-kb-migrate` (V1 flow) or an existing `.Knowledge/`
- **Includes**: Internally invokes `flow2spec init` for structural alignment
- **Note**: A standalone `flow2spec init` is **not** an upgrade command

**Flow Differences (in-skill routing codes, **not** equivalent to npm major versions)**:
- **V1**: First `f2s-kb-migrate`, then runs `flow2spec init`
- **Current Knowledge Base (V2+)**: When `.Knowledge` + `manifest-routing` are already stable, runs `flow2spec init` to align manifest-routing + matchers shards (**includes Flow2Spec npm v3.x, etc.**; see `skills/f2s-kb-upgrade/SKILL.md` Step 0 for details)

**Sub-Agent Invocation**:
- `subAgent: false` (default): The main agent completes the upgrade
- `subAgent: true`: Sub-agents only handle shell command execution (running `flow2spec init`), not knowledge base content persistence; the following steps must not be delegated by the main agent: version routing (V1 / Current V2+), re-reading SKILL.md after init and determining a full skill re-run, Step 3b index.md consolidation, verification summary output

**Responsibility Matrix**:
| Role | Responsibilities |
|------|-----------------|
| Main Agent | Version routing, re-reading and determining re-run after init, Step 3b index.md consolidation, verification summary; persists `manifest-routing.json` and `index.md` |
| Sub-Agent | Only runs shell commands like `flow2spec init`, does not persist knowledge base content |

**Cross-Verification**: This skill is not bound to cross-verification; self-verification by the persisting side.

---

## 5) Rule Descriptions

The following are not skill commands but rules activated by trigger words to guide Agent behavior.

### `f2s-task`

**Trigger Words**: changeTracking, change tracking, task tracking, continuation, continue last task

**Purpose**: Change tracking rules (`alwaysApply`). When the corresponding skill's `changeTracking.*` is set to `true`, automatically creates, progressively updates, and finally archives task checklists under `.task/` before and after skill execution, supporting cross-session continuation.

**Scope**:

| Config Item | Corresponding Skill |
|-------------|-------------------|
| `changeTracking.feat` | `f2s-kb-feat` |
| `changeTracking.fix` | `f2s-kb-fix` |
| `changeTracking.implement` | `f2s-implement-tech-design` |

**Cross-Session Continuation**: When a new session starts and `.task/todo.json` exists, automatically matches the user's first message against each task's `keywords`; on a match, loads the corresponding `task.md` and `linkedSkill` skill file, displays the remaining checklist, and asks whether to continue; if there is no match, proceeds without interruption.

**Rule Location**: `Config Root/rules/f2s-task.*`

---

### `stock-docs-vs-req-docs`

**Trigger Words**: stock-docs, req-docs, implemented capability, where to put the technical proposal, PDF final draft

**Purpose**: Distinguishes the boundary between the knowledge archival directory and the requirements implementation directory.

**Directory Division**:

| Directory | Purpose | When It Is Written |
|-----------|---------|-------------------|
| `stock-docs/` | Archival of existing knowledge (architecture, final drafts) | `f2s-doc-arch`, `f2s-doc-final`, `f2s-ctx-build` |
| `req-docs/` | Requirements and technical proposals (driving implementation) | `f2s-req-backend`, `f2s-doc-pdf`, manual placement |

**Use Cases**:
- Unsure where a document should go
- Need to clarify the division of labor between stock-docs and req-docs

---

### `implement-tech-design`

**Trigger Words**: implement according to technical proposal, implement-tech-design, implement per proposal

**Purpose**: Implements runnable code based on technical proposal documents in `req-docs/`.

**Change Tracking**: If `changeTracking.implement: true`, after outputting the task list in Step 2.5, synchronously writes to `.task/active/<task-name>/task.md`; archives the task in Step 5 during wrap-up.

**Use Cases**:
- Technical proposal is ready and needs to be coded per the proposal
- After a proposal change, code needs to be updated accordingly

**Relationships**:
- **Prerequisite**: `.Knowledge/req-docs/<Technical Proposal>.md` (via `f2s-req-backend` or manual placement)
- **Rule Location**:
  - Cursor: `.cursor/rules/f2s-implement-tech-design.mdc`
  - Claude: `.claude/rules/f2s-implement-tech-design.md`
  - Codex: `.codex/AGENTS.md` + `.codex/topics/f2s-implement-tech-design.md`

**Execution Flow (mandatory by rules)**:
1. Input normalization
2. Understand the proposal and context
3. **Output the implementation task list** (required, cannot be skipped)
4. **Ask questions before implementing** (required, cannot be skipped)
5. Implement per task list
6. **Output the remaining checklist and post-implementation reminders** (required)

**Sub-Agent Invocation**: None (rule-driven coding; the main agent completes the full workflow)

---

## 6) Sub-Agent Configuration

Controlled via `flow2spec.config.json` at the project root (all fields default to `false`).

### How Different Products "See" the Configuration (use with the field table below)

`subAgent` and similar fields are written to the **on-disk JSON**; products do not guarantee automatic file opening. Therefore, multi-layered hints are provided via **Cursor rules / Claude hooks / Codex AGENTS snapshot table / knowledge base `config-precheck` summary**, but **the authoritative source remains `Read("flow2spec.config.json")`** (design rationale at [design-principles.en.md Sec. 4.5.1](./design-principles.en.md)). **The full path and table are maintained in one place**: [usage-guide.en.md Sec. 1, `f2s-*` and `flow2spec.config.json`](./usage-guide.en.md).

### `subAgent` Field

| Value | Behavior |
|-------|----------|
| `false` (default) | All `f2s-*` skills complete within the main agent |
| `true` | Certain skills may use sub-agents per their documentation (large-scale parallel processing scenarios) |

### `switchAgentVerification` Field

| Value | Behavior |
|-------|----------|
| `false` (default) | Self-verification on the persisting side: whoever persists verifies |
| `true` | When a skill explicitly states this step, enables cross-verification: sub-agent persists -> main agent verifies; main agent persists -> sub-agent verifies (requires `subAgent: true` and sub-tasks actually dispatched) |

### `changeTracking` Field

A nested object, with each skill independently controlled:

```json
{
  "changeTracking": {
    "feat": false,
    "fix": false,
    "implement": false
  }
}
```

| Sub-field | Corresponding Skill | Effect |
|-----------|---------------------|--------|
| `feat` | `f2s-kb-feat` | Creates a task checklist before execution, archives on completion, supports cross-session continuation |
| `fix` | `f2s-kb-fix` | Same as above |
| `implement` | `f2s-implement-tech-design` | Same as above |

> `f2s-req-plan` is not constrained by this configuration; it always creates a task checklist. Legacy boolean values (`"changeTracking": true/false`) are backward-compatible and automatically expand to all three sub-fields on/off.

For full principles and design intent, see [architecture.en.md Sec. 4. Agent Execution Model](./architecture.en.md).

---

## 7) Quick Reference

For typical work scenarios and full workflows, see [Usage Guide § 3. Typical Workflows](./usage-guide.en.md).

For a complete directory description, see [Directory Conventions](./directory-conventions.en.md).

---

Related Documents:
- [Usage Guide](./usage-guide.en.md)
- [Directory Conventions](./directory-conventions.en.md)
- [Architecture](./architecture.en.md)
- [Usage Scenarios](./usage-scenarios.en.md)