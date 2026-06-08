[中文](../项目里程碑.md) | [English](./milestones.md)

# Project Milestones

> This page summarizes the product evolution of Flow2Spec. For usage details, see [Usage Guide](./usage-guide.md); for command semantics, see [Commands Reference](./commands-reference.md); for system design, see [Architecture](./architecture.md) and [Design Principles](./design-principles.md).

- **Scope**: whole project
- **Updated**: 2026-06-08
- **Sources**: `.Knowledge/manifest-routing.json`, `.Knowledge/index.md`, `docs/项目里程碑.md`, Git log/tags, `package.json`, `.task/`
- **Current package version in this repo**: `3.1.5`

## Overview

| Stage | Time | Summary |
| --- | --- | --- |
| M1 CLI bootstrap and OpenSpec workflow | 2026-02 ~ 2026-04 | Flow2Spec started as an installable CLI and initially organized AI collaboration through OpenSpec / opsx-style change flows. |
| M2 OpenSpec removal and f2s skills | 2026-04-23 ~ 2026-04-24 | OpenSpec dependencies were removed and the project moved to its own `f2s-*` skill workflow. |
| M3 `.Knowledge` machine-readable routing | 2026-05-08 ~ 2026-05-11 | Introduced `.Knowledge`, `manifest-routing.json`, topics, and matchers as the progressive context loading chain. |
| M4 Public demo and bilingual materials | 2026-05-13 ~ 2026-05-14 | Added public slides, English docs, GitHub Pages sync, and bilingual documentation entry points. |
| M5 CLI operations and task routing | 2026-05-15 | Added `version` / `update` commands and routed `f2s-task` + `f2s-req-plan` into the package template. |
| M6 Codex root `AGENTS.md` discovery | 2026-05-16 | `flow2spec init codex` writes full rules to root `AGENTS.md`; `.codex/AGENTS.md` becomes a pointer. |
| M7 Four-source milestone generation | 2026-05-18 | Added `f2s-doc-milestone` and the milestone template, based on req-docs, git, `.task`, and knowledge topics. |
| M8 Document pipeline and directory boundaries | 2026-05-21 | Clarified `req-docs` / `stock-docs`, `doc-arch` / `doc-final`, and the new-requirement development path. |
| M9 README and task capability exposure | 2026-05-26 ~ 2026-05-28 | Expanded README, command docs, task checklist descriptions, and daily workflow guidance. |
| M10 Documentation capture rules | 2026-05-27 ~ 2026-05-28 | Added multi-module detection for `f2s-doc-add`, dual-repo package naming rules, and global response discipline. |
| M11 Knowledge engineering rules and skill skeletons | 2026-06-03 | Added `skill-authoring`, `f2s-kb-addRules`, `f2s-topic-authoring`, and large-feature split guidance. |
| M12 Topic metadata and init merge checks | 2026-06-03 | Added `topicMetadata.primary/tags/confidence`, init merge validation, skill rename cleanup, and old skill directory cleanup. |
| M13 Update checks and startup reminders | 2026-06-04 | Added `updateCheck.enabled`, SessionStart hooks, daily cache, and Claude / Cursor / Codex upgrade reminders. |
| M14 Quick commit mode | 2026-06-04 | `f2s-git-commit` supports quick commit by skipping only knowledge coverage checks while keeping diff, precise add, hooks, and commit-message display. |
| M15 General technical proposal and source-answer closing | 2026-06-05 | Renamed `f2s-req-backend` to `f2s-req-tech`; the template became a general technical proposal template, and source-code Q&A gained knowledge-backfill closing. |
| M16 Intent recognition routing | 2026-06-08 | Added `intentRecognition` and `f2s-intent-routing` so high-confidence operation intent can route to skills under control. |
| M17 Locale-aware templates and English default README | 2026-06-08 | `flow2spec init` supports `zh-CN` / `en-US` template selection; public README defaults to English, with Chinese in `README.zh-CN.md`. |

## M1 · CLI Bootstrap and OpenSpec Workflow

- **Delivery**: installable CLI prototype; early AI collaboration was organized around OpenSpec / opsx change flows.
- **Trace**: early tags up to `V2.2.3`; product milestone stock-doc M0/M1.

## M2 · OpenSpec Removal and f2s Skills

- **Delivery**: removed OpenSpec / opsx and converted the collaboration model to Flow2Spec-owned skills; requirements clarification and technical proposal generation became the upstream implementation path.
- **Related docs**: [Commands Reference](./commands-reference.md), [Usage Guide](./usage-guide.md).

## M3 · `.Knowledge` Machine-Readable Routing

- **Delivery**: introduced `.Knowledge`, `manifest-routing.json`, topic shards, matcher shards, and the `match -> expand -> verify -> act` execution chain.
- **Related docs**: [Architecture](./architecture.md), [Design Principles](./design-principles.md), [Directory Conventions](./directory-conventions.md).

## M4 · Public Demo and Bilingual Materials

- **Delivery**: added public presentation sources, English docs, GitHub Pages publishing scripts, and bilingual documentation links.
- **Related docs**: [Usage Scenarios](./usage-scenarios.md).

## M5 · CLI Operations and Task Routing

- **Delivery**: added CLI `version` / `update`; package routing included `f2s-task` and `f2s-req-plan`.
- **Related docs**: [Commands Reference](./commands-reference.md).

## M6 · Codex Root `AGENTS.md` Discovery

- **Delivery**: Codex initialization writes complete rules to root `AGENTS.md`; `.codex/AGENTS.md` only points to it.
- **Related docs**: [Usage Guide](./usage-guide.md), [Design Principles](./design-principles.md).

## M7 · Four-Source Milestone Generation

- **Delivery**: added `f2s-doc-milestone` and `project milestone` template; milestones must be backed by req-docs, git, `.task`, and knowledge-topic semantics.
- **Related docs**: this document and [Commands Reference](./commands-reference.md).

## M8 · Document Pipeline and Directory Boundaries

- **Delivery**: clarified that `stock-docs/` stores stable knowledge inputs while `req-docs/` stores implementation-driving technical proposals; `doc-arch` drafts must be normalized through `doc-final` before `kb-build`.
- **Related docs**: [Directory Conventions](./directory-conventions.md), [Usage Guide](./usage-guide.md).

## M9 · README and Task Capability Exposure

- **Delivery**: README and command docs describe task checklists, daily workflows, and Flow2Spec capabilities more explicitly.
- **Related docs**: [Usage Guide](./usage-guide.md), [Commands Reference](./commands-reference.md).

## M10 · Documentation Capture Rules

- **Delivery**: added multi-module detection to prevent unrelated modules from being merged into one knowledge output; documented dual-repo package naming and response-style constraints.
- **Related docs**: [Directory Conventions](./directory-conventions.md), [Design Principles](./design-principles.md).

## M11 · Knowledge Engineering Rules and Skill Skeletons

- **Delivery**: added `skill-authoring` rules, `f2s-kb-addRules`, topic authoring guidance, and large-feature split recommendations.
- **Related docs**: [Architecture](./architecture.md), [Design Principles](./design-principles.md).

## M12 · Topic Metadata and Init Merge Checks

- **Delivery**: `manifest-routing.json` supports topic metadata (`primary`, `tags`, `confidence`); `init` gained merge validation, template-priority behavior, and old skill directory cleanup.
- **Related docs**: [Architecture](./architecture.md), [Directory Conventions](./directory-conventions.md).

## M13 · Update Checks and Startup Reminders

- **Delivery**: added `updateCheck.enabled`, hook-based version checks, `.Knowledge/update-check.json`, and startup reminders across Claude, Cursor, and Codex.
- **Related docs**: [Usage Guide](./usage-guide.md), [Commands Reference](./commands-reference.md).

## M14 · Quick Commit Mode

- **Delivery**: `f2s-git-commit` quick commit skips only the knowledge coverage check; it still reads diff, checks conflicts, adds files precisely, keeps hooks, and displays the commit headline.
- **Related docs**: [Commands Reference](./commands-reference.md).

## M15 · General Technical Proposal and Source-Answer Closing

- **Delivery**: `f2s-req-backend` became `f2s-req-tech`; the backend-specific template became a general technical proposal template. Ordinary source-code Q&A now ends with a knowledge-backfill suggestion when the answer relies on facts missing from the knowledge base.
- **Related docs**: [Usage Guide](./usage-guide.md), [Commands Reference](./commands-reference.md).

## M16 · Intent Recognition Routing

- **Delivery**: added `intentRecognition` and `f2s-intent-routing`; high-confidence operation intent can enter the matching skill, while discussion, evaluation, low confidence, and conflicting intents stay in normal conversation or clarification.
- **Related docs**: [Usage Guide](./usage-guide.md), [Design Principles](./design-principles.md).

## M17 · Locale-Aware Templates and English Default README

- **Delivery**: templates are split into `templates/zh-CN` and `templates/en-US`; `flow2spec init` supports single-choice locale selection with Chinese as default; English template filenames are localized; downstream runtime docs no longer expose package-internal template paths; public `README.md` is English by default and Chinese moved to `README.zh-CN.md`.
- **Trace**: package/tag version `3.1.5`; npm publication still requires OTP / permission handling.
- **Related docs**: [Usage Guide](./usage-guide.md), [Commands Reference](./commands-reference.md), [Directory Conventions](./directory-conventions.md).

## Open Items

- `.Knowledge/req-docs/` currently has no Markdown source for this repo-level milestone.
- `.task/active/lazy_loading_rule_optimization/` remains active and is not recorded as a delivered milestone yet.
- `v3.1.5` tags exist, but npm publishing has not completed because public publishing needs OTP and internal publishing returned a permission error.
