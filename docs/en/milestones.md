[中文](../项目里程碑.md) | [English](./milestones.md)

# Project Milestones

> **Scope**: whole project  
> **Updated**: 2026-06-15

## Overview

| Stage | Time | Summary |
| --- | --- | --- |
| M18 · f2s-kb-distill and rule refactor | 2026-06-14 | Added f2s-kb-distill knowledge extraction skill; feedback-closing refactored to single entry; Codex AGENTS.md slimmed to "two steps" guide; SessionStart hooks landed; CLI cross-platform extension handling |
| M17 · Locale-aware template initialization | 2026-06-08 | flow2spec init supports zh-CN/en-US single-choice initialization; public README defaults to English; Chinese moved to README.zh-CN.md |
| M16 · Intent recognition routing | 2026-06-08 | Added intentRecognition config switch and f2s-intent-routing rules; high-confidence operation intent can route to f2s skills automatically |
| M15 · General technical proposal and Q&A closing | 2026-06-05 | f2s-req-backend renamed to f2s-req-tech; template extended to frontend/backend/fullstack; source-code Q&A gained knowledge-backfill closing |
| M14 · f2s-git-commit quick commit | 2026-06-04 | f2s-git-commit quick commit skips knowledge coverage check while keeping diff, precise add, hooks, and commit-message display |
| M13 · Update checks and startup reminders | 2026-06-04 | Added updateCheck.enabled config, version-check hook, daily cache; Claude/Cursor/Codex SessionStart upgrade reminders |
| M12 · Topic metadata and init merge checks | 2026-06-03 | topicMetadata supports primary/tags/confidence; init gained merge validation and template-priority behavior; skills renamed to kb-/doc- prefix |
| M11 · Knowledge engineering rules and skill skeletons | 2026-06-03 | Added skill-authoring spec, f2s-kb-addRules, f2s-topic-authoring, and large-feature split strategy |
| M10 · Documentation capture rules | 2026-05-27 | f2s-doc-add added multi-module detection; dual-repo package naming rules; global negation-style constraint |
| M9 · README and task capability exposure | 2026-05-26 | README and English README expanded with usage flow, command reference, task checklist, and daily workflow |
| M8 · Document pipeline and directory boundaries | 2026-05-21 | Reorganized docs directory; doc-arch drafts must go through doc-final; new-requirement skill chain clarified |
| M7 · Four-source milestone generation | 2026-05-18 | Added f2s-doc-milestone skill and milestone template; stages backed by req-docs/git/.task/knowledge topics |
| M6 · Codex root AGENTS.md discovery | 2026-05-16 | flow2spec init codex writes full rules to root AGENTS.md; .codex/AGENTS.md becomes a pointer |
| M5 · CLI operations and task routing | 2026-05-15 | CLI added version/update commands; package template manifest includes f2s-task and f2s-req-plan routing |
| M4 · Public demo and bilingual materials | 2026-05-13 | Added presentation sources, sync-gh-pages.sh, English slides and 6 English docs; bilingual README entry points |
| M3 · .Knowledge machine-readable routing | 2026-05-08 | Introduced .Knowledge, manifest-routing.json, topics and matchers; match→expand→verify→act chain; config preflight and KB preflight rules |
| M2 · OpenSpec removal and f2s skills | 2026-04-23 | Removed OpenSpec/opsx; converted to f2s skill workflow; requirements clarification and technical proposal generation established |
| M1 · CLI bootstrap and OpenSpec workflow | 2026-02 ~ 2026-04 | Flow2Spec started as an installable CLI; early AI collaboration organized around OpenSpec/opsx change flows |

## M18 · f2s-kb-distill and Rule Refactor

- Added f2s-kb-distill skill: extracts reusable knowledge facts from Q&A, auto-decides new topic or append to existing
- Refactored f2s-kb-feedback-closing: unified suggestion entry to f2s-kb-distill, replacing f2s-kb-add/f2s-kb-sync dual entry
- Codex root AGENTS.md slimmed: removed embedded rules, replaced with "do these two things first" short guide
- Codex hooks landed: .codex/hooks.json adds SessionStart config-summary and version-check dual scripts
- CLI cross-platform extension handling: Cursor rules keep .mdc, Claude/Codex rules switch to .md, codexAgentsAdapter handles .mdc reading
- intentRecognition enabled by default in internal repo

## M17 · Locale-Aware Template Initialization

- templates/ split into zh-CN/ and en-US/ directories
- flow2spec init supports single-choice locale initialization, defaults to Chinese
- English templates cover rules, skills, knowledge, AGENTS.md and flow2spec.config.json with English filenames
- Public README defaults to English; Chinese moved to README.zh-CN.md; README.en.md kept for compatibility

## M16 · Intent Recognition Routing

- flow2spec.config.json adds intentRecognition boolean field
- Added f2s-intent-routing rules: high-confidence operation intent routes to matching f2s skill automatically
- Discussion, evaluation, low-confidence, or incomplete-requirement inputs stay in normal conversation or clarification
- Skill routing is blocked when intentRecognition is not read or set to false

## M15 · General Technical Proposal and Q&A Closing

- f2s-req-backend renamed to f2s-req-tech
- Technical proposal template upgraded from backend-only to frontend/backend/fullstack general purpose
- Added f2s-kb-feedback-closing rules: four-case knowledge-backfill suggestion closing for source-code Q&A
- Reduced unnecessary f2s-kb-add/sync prompts in ordinary Q&A flows

## M14 · f2s-git-commit Quick Commit

- f2s-git-commit supports quick commit mode, skips knowledge coverage check
- Retains diff reading, conflict checking, precise add, git hooks, and commit headline display
- Auto push/pull disabled; user confirmation preserved

## M13 · Update Checks and Startup Reminders

- flow2spec.config.json adds updateCheck.enabled config
- Version-check hook: manifest version vs npm latest; daily cache to .Knowledge/update-check.json
- Claude: writes SessionStart version-check script to .claude/settings.json
- Cursor: writes SessionStart version-check script to .cursor/hooks.json
- Codex: writes SessionStart config-summary and version-check dual scripts to .codex/hooks.json
- Rule-layer fallback: script cache and rule-layer updateCheck serve as mutual backup

## M12 · Topic Metadata and Init Merge Checks

- manifest-routing.json adds topicMetadata with primary/tags/confidence fields
- f2s-topic-authoring rules add topicMetadata classification criteria (4 primary types, confidence rules)
- init copySkills auto-removes old skill directories without deleting user-custom skills
- init supports template-priority overwrite and merge validation
- 6 skills renamed to kb-/doc- prefix convention
- Redundant skills (f2s-coding-guide, f2s-doc-routing) removed

## M11 · Knowledge Engineering Rules and Skill Skeletons

- Added skill-authoring topic + matcher: unified SKILL.md skeleton, naming, and section order for templates/skills/f2s-*
- Added f2s-kb-addRules skill (renamed from f2s-kb-capture): verbal rule capture, auto-decides new topic or merge into existing
- Added f2s-topic-authoring rules: topic authoring guidelines covering naming, skeleton, topicDependencies, and large-feature split
- Large-feature split strategy: main topic + sub-topic structure recommendation with split thresholds and exclusion rules

## M10 · Documentation Capture Rules

- f2s-doc-add (predecessor of f2s-kb-add) added multi-module detection to prevent merging unrelated modules into single output
- Dual-repo milestone stock-doc added package naming rules (public @double-codeing/flow2spec vs internal path)
- Global rules added negation-style constraint: use affirmative statements instead of "not X / non-X"

## M9 · README and Task Capability Exposure

- README added usage flow and command quick reference
- README added task checklist capability and daily workflow description
- English README synced with capability descriptions; removed misleading f2s-req-plan reference

## M8 · Document Pipeline and Directory Boundaries

- Docs directory reorganized, removed product-repo docs path coupling
- Established doc-arch → doc-final → kb-build pipeline; drafts must not drive kb-build directly
- Updated new-requirement skill chain; clarified each skill's role in the requirements→implementation→knowledge loop
- .Knowledge/stock-docs and req-docs directory conventions de-coupled from product-specific paths

## M7 · Four-Source Milestone Generation

- Added f2s-doc-milestone skill: generates milestones from req-docs, git log, .task, and knowledge topics
- Added project milestone template: defines stage structure, field conventions, and no-testing/acceptance constraint
- Milestone stages record only feature/capability changes; engineering changes merged into feature stages

## M6 · Codex Root AGENTS.md Discovery

- flow2spec init codex writes complete rules to root AGENTS.md
- .codex/AGENTS.md becomes a pointer, reducing risk of Codex missing rules
- Established unified pattern: Claude/Cursor/Codex each write rules to their own config root

## M5 · CLI Operations and Task Routing

- CLI added version command: reads package.json and outputs current version
- CLI added update command: self-update
- Package template manifest includes f2s-task and f2s-req-plan routing entries and topicDependencies

## M4 · Public Demo and Bilingual Materials

- Added presentations/flow2spec-intro-public source files
- Added sync-gh-pages.sh and GitHub Pages deployment
- Added English slides and 6 English docs
- README added bilingual entry points and demo links

## M3 · .Knowledge Machine-Readable Routing

- Introduced .Knowledge/ directory: manifest-routing.json, topics/, matchers/ structure
- Established match→expand→verify→act knowledge consumption chain
- Added f2s-knowledge-preflight rules: mandatory first-read of manifest-routing.json with gap-gate constraints
- Added f2s-config-check rules: f2s-* skills must read flow2spec.config.json first
- Added Karpathy full-platform coding behavior guidelines (f2s-karpathy-guidelines)

## M2 · OpenSpec Removal and f2s Skills

- Removed OpenSpec/opsx dependencies and change-flow organization
- Fully converted to f2s self-owned skill workflow (skills/ directory structure established)
- f2s-req-clarify and f2s-req-tech skills initialized
- f2s-* skills established as the base execution units for knowledge and requirement pipelines

## M1 · CLI Bootstrap and OpenSpec Workflow

- Flow2Spec initialized as an installable CLI tool
- Early AI collaboration organized around OpenSpec/opsx change flows
- Basic init command supports Cursor/Claude/Codex config root writing

## Pending Confirmation

- .Knowledge/req-docs/ currently has no Markdown files; milestone evidence relies primarily on git
- .task/active/lazy_loading_rule_optimization/ remains in progress and has not formed a delivered stage
- Early 2026-02 to 2026-04 OpenSpec details are supported mainly by git commit messages, without req-docs or .task closure
