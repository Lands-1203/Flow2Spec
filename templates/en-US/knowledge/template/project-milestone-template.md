> **Primary convention**: the template is at `.Knowledge/template/project-milestone-template.md` (written by `flow2spec init`); generated outputs go to `.Knowledge/stock-docs/<scope-name>-milestones.md`.  
> **When executing `f2s-doc-milestone`**: structure follows this template; content comes only from **req-docs, git log, .task**, and knowledge-base topics. Do not invent content.  
> **Milestone phases**: Mx is **only** for feature/capability changes. Integration testing, testing, acceptance, or pure environment/operations work must **not** become standalone phases; engineering changes are merged into the corresponding feature phase.

# (Scope Name) Milestones

> **Scope**: (user-provided semantic scope; if unspecified, write "entire project")  
> **Generated at**: `YYYY-MM-DD`  
> **Sources**: req-docs · git command/tag · `.task` paths · knowledge-base topics (`manifest-routing` / `index.md` topic overview and `topics/*.md` read in this run)

## Overview

| Phase | Time | One-liner |
| --- | --- | --- |
| M1 (feature change summary) | YYYY-MM | (verifiable feature delivery, must be supported by sources; not integration testing/testing/acceptance) |
| M2 … | … | … |

## M1 · (Phase Title)

- **Delivery**: (list, verifiable)
- **Evidence**: (optional) req `…` · commit `hash` · task `…`

## M2 · …

(Same structure as M1; each Mx row in the overview table must have a corresponding H2 heading.)

## Pending Confirmation

- (List when the three source types disagree or records are missing; otherwise write "None")
