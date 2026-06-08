---
name: f2s-kb-upgrade
description: Knowledge-base template upgrade skill (this SKILL only): **V1 flow branch** must run f2s-kb-migrate first, then run flow2spec init inside the workflow; **current repositories (flow branch V2+, including Flow2Spec npm v3.x projects already using .Knowledge)** run init to align manifest-routing + matcher shards (package `manifest-matchers.json` is only an init merge seed and is not written into .Knowledge). Triggers: f2s-kb-upgrade、一键升级迁移、旧项目升级、知识库模板升级、upgrade knowledge base、template upgrade. Note: do not call standalone flow2spec init an "upgrade command"; **V1/V2+ are flow-branch labels inside this skill, not npm package major versions**.
---

> Execution scope: this skill is used to "run shell for the user" to complete Flow2Spec **template and configuration-root alignment as defined by this SKILL**. One step runs **`flow2spec init`**, but **`init` is not an "upgrade command"**. **Upgrade command / knowledge-base upgrade** refers only to the **full `f2s-kb-upgrade` workflow**.

# f2s-kb-upgrade (Knowledge-Base Template Upgrade Skill)

**Terminology (required)**: **"upgrade", "upgrade command", and "knowledge-base upgrade"** refer only to the complete skill workflow executed according to this file **`f2s-kb-upgrade`**. **`flow2spec init`** is a CLI **initialization/write-to-disk** command; this skill runs it in **step 2**. It is **forbidden** to describe standalone user execution of `init` or `init` in CLI help as an "upgrade command".

## Boundaries (Avoid Misunderstandings)

- **`flow2spec init` does not write business knowledge**: it does not replace `f2s-kb-add`, `f2s-kb-fix`, `f2s-kb-feat`, `f2s-kb-sync`, `f2s-kb-build`, or similar maintenance of `stock-docs` / `req-docs` / `topics` bodies and business routing terms.
- This skill completes **directory, template placeholder, and routing-structure alignment under the package version**. If the user says "write the new capability into the knowledge base", guide them to **`f2s-kb-sync` / `f2s-kb-add`** etc., not just `f2s-kb-upgrade`.
- This skill is responsible for auditing existing `topicMetadata`: `primary` / `tags` are only for governance, audit, inventory, and reading expectations; they do not participate in route matching or execution requirements. Execution requirements still come from `AGENTS.md`, rules, skills, and topic bodies.

## Orchestration (main / sub-agent)

- The meaning of `subAgent` / `switchAgentVerification` uses the unified entry as the only source of truth: **Cursor/Claude** read the configuration-root `rules/f2s-flow2spec-unified-entry.*`; **Codex** reads `.codex/topics/f2s-flow2spec-unified-entry.md` (same source, mirrored by `flow2spec init`). This section does not repeat those definitions.
- **Sub-agent responsibility** (only when `subAgent=true`): run shell commands such as `flow2spec init`; only command execution is delegated, not knowledge-base body writing.
- **Main agent must control** (must not delegate):
  1. **Version branching**: **V1** runs `f2s-kb-migrate` first, then enters this skill; **current repositories (V2+)** directly enter the `init` flow (including Flow2Spec **npm v3.x** etc.; as long as step 0 "current repository" conditions are met, use this branch. **Do not** create a separate flow just because the package major version is 3).
  2. **Re-read after `init`**: re-read `f2s-kb-upgrade/SKILL.md` from disk and compare whether the identifier changed.
  3. **Rerun the whole skill**: when SKILL changed, rerun from the beginning according to the new literal text until two consecutive rounds show no changes.
  4. **Step 3b merge**: preserve the maintained section of `.Knowledge/index.md` and merge with the package version; main agent performs this.
  5. **Verification summary**: the main agent summarizes verification conclusions and output.
- **Write-authority hard rule**: `.Knowledge/index.md` is **written only by the main agent**; sub-agents **must not touch it**. `manifest-routing.json` is also written by main.
- This SKILL does not bind cross-agent verification; the writing side verifies its own work.

## Why this coexists with `f2s-kb-migrate`

| Skill | Problem solved |
| --- | --- |
| **`f2s-kb-migrate`** | **Structural move**: `docs-index.md` / `index-doc.md`, `rules/main.md(c)`, business `skills/`, scattered `stock-docs`/`req-docs` -> **migrate into `.Knowledge`**, write `migration-report.md`, and confirm deletion list with the user. It does not run npm package upgrade. |
| **This skill `f2s-kb-upgrade`** | **Package and template alignment**: run **`flow2spec init`**, merge **`manifest-routing.json`** with **`matchers/*.json`**, refresh each agent's **`rules`/`skills`** (or Codex **`AGENTS.md`**); `init` also copies the current-language **`index.md` -> `.Knowledge/template/index.template.md`** as a comparison snapshot. **`.Knowledge/index.md`** is diff-aligned in step 3b; init **does not** automatically change its body. |

- **One-click closure for old projects**: **first `f2s-kb-migrate`** -> **then this skill** (`init`). Do not use only `init` as a substitute for full migration.
- **Projects already using new `.Knowledge`**: **run only this skill**; do not repeat migrate.

**Why does each Cursor / Claude / Codex directory have a same-named `SKILL.md`?**  
Each tool only loads `skills/` under **its own configuration root** (for example, Codex only loads `.codex/skills/`). `flow2spec init` writes the current-language skill content into the selected agent directories.

## Goal

When the user says "help me upgrade the knowledge-base template / run f2s-kb-upgrade / sync latest Flow2Spec", the Agent **executes the full `f2s-kb-upgrade` workflow in this skill** (including running `flow2spec init`, cleanup, verification, and summary). **Do not** treat only executing `init` as completing this skill.

## Default Behavior

1. When this skill's step 2 runs **`flow2spec init`**, it defaults to **incremental write** (without `--reset-knowledge`).
2. Append `--reset-knowledge` only when the user explicitly requests "overwrite reset".
3. Prefer agents specified by the user; if unspecified, default to `cursor claude codex`.

## init and Skill Self-Update (Required)

This skill executes **`flow2spec init`** in **step 2**. `init` syncs the current-language skill content into each agent **configuration root**, so after **`init` succeeds**, the repository's **`skills/f2s-kb-upgrade/SKILL.md`** may be overwritten by a new version and differ from the old instructions cached in the current conversation.

**Closed loop (avoid stale instructions)**:

1. **Before `init`** (recommended): record the current configuration-root **`skills/f2s-kb-upgrade/SKILL.md`** identifier (for example `mtime`, file size, or body hash).
2. **After `init` succeeds**: **re-read from disk** the full **`SKILL.md`** (Cursor: `.cursor/skills/f2s-kb-upgrade/SKILL.md`; Claude: `.claude/skills/...`; Codex: `.codex/skills/...`, matching the agent(s) written by this `init` run).
3. **If it changed relative to step 1** (or Flow2Spec package was just upgraded and unchanged status cannot be confirmed): **use the latest SKILL as authoritative** and **execute this skill again from "step 0"** (including version branching, whether to run `init` again, verification, and summary, all according to the new literal text). Loop until two consecutive rounds read an unchanged SKILL, or the user explicitly asks to stop.
4. **If unchanged**: continue with step 3 and later.

> Wording: **after this skill's step 2 executes `init`** -> re-read latest `f2s-kb-upgrade/SKILL.md` -> if changed, **rerun the whole skill**. Do not rely on session memory to execute **this skill**.

## Mandatory Flow

### Step 0: Version Judgment and Branching (Required, Before init)

> **Naming note**: **"V1"** and **"current repository (V2+)"** below are **flow-branch labels inside this skill**. If the **npm package is v3.x, v4.x, ...** and the repository is already in `.Knowledge` + `manifest-routing` shape, still use the **"current repository (V2+)"** branch (only `init` alignment). **Do not** interpret the npm major version number as the literal "V2" here.

**V1 - Legacy knowledge organization (must migrate before init)**  
Hit **any** strong signal:

- The configuration root still has **`docs-index.md` or `index-doc.md`**, and mostly still closes through **`rules/main.md` / `rules/main.mdc`**; or
- Business **`stock-docs` / `req-docs`, rules, and business skills** are still mainly in the old configuration-root tree and are **not** stably under `.Knowledge`.

**Action**: first execute the full **`f2s-kb-migrate`** workflow (including `migration-report` and deletion-list confirmation), **then** enter steps 1-5 to execute `flow2spec init`.

**Current repository (V2+) - Already on `.Knowledge` + new routing (package/shape alignment only)**  
Both conditions are met:

- **`.Knowledge/manifest-routing.json`** exists, and **`topicPaths` / `taskToTopicRules`** are usable.
- Business docs are mainly under **`.Knowledge/stock-docs`, `req-docs`, `topics`** (can also be the state right after V1 migration completes).

**Historical wording**: if the repository still has legacy single-file **`manifest.json`**, **do not** use it as the machine-readable source of truth; machine reading uses **`manifest-routing.json` + `matchers/*.json` pointed to by `matcherPath`**. `init` handles merge/backfill of shards with the template.

**Action**: directly enter steps 1-5; **no** migrate is needed unless the user explicitly asks to redo migration.

### Step 1: Confirm `init` Mode Inside This Skill (Required)

- If the user did not explicitly request "overwrite reset", this skill's step 2 defaults to **incremental `init`**.
- If the user mentions "overwrite everything according to template / reset", confirm a second time before using `--reset-knowledge`.
- **locale rule**: regular upgrade follows project `flow2spec.config.json.locale`; if missing, fill as `zh-CN`. Do not opportunistically switch languages in this skill; pass `--locale en-US` / `--locale zh-CN` only when the user explicitly requests it.

### Step 2: Execute Command (Run Shell for User)

Run one of the following in the target project root:

1. Preferred (upgrade to latest package):
   - `npx @double-codeing/flow2spec@latest init <agents...>`
2. If the project is pinned to a local install:
   - `npx flow2spec init <agents...>`
3. For overwrite reset:
   - Append `--reset-knowledge` to the above command.
4. If the user explicitly requests a template-language switch:
   - Append `--locale <zh-CN|en-US>` to the above command.

> `<agents...>` example: `cursor claude codex`.

**After step 2 completes**: immediately execute the above **"init and skill self-update"** loop: re-read **`skills/f2s-kb-upgrade/SKILL.md`**. If updated, **rerun the whole skill from step 0**, then return to step 3 (avoid using old SKILL for subsequent verification).

### Step 3: Old Topic-Template Cleanup and Reference Fixes (Required If Present)

After this skill's step 2 `flow2spec init` succeeds, first perform "old file cleanup + reference fixes":

> **skill directory auto-alignment**: `flow2spec init` now automatically deletes old directories in configuration-root `skills/` that the current version no longer provides (renamed/deleted skills such as `f2s-ctx-build`, `f2s-doc-add`, `f2s-rule-capture`, `stock-docs-vs-req-docs`, etc.). **No manual Agent cleanup is needed**.

1. Clean old-name topic files (delete only if they exist; all are old legacy names without the `f2s-` prefix):
   - `.Knowledge/topics/flow2spec-architecture.md`
   - `.Knowledge/topics/implement-tech-design.md`
2. Fix references (update only if files exist; **`.Knowledge/index.md` body is not rewritten by init**, see step 3b):
   - `.Knowledge/index.md` (manually or skill-side as needed for paths/paragraphs)
   - `.Knowledge/manifest-routing.json`
3. Reference targets (confirm current names):
   - `.Knowledge/topics/f2s-flow2spec-architecture.md`
   - `.Knowledge/topics/f2s-implement-tech-design.md`
   - `.Knowledge/topics/f2s-stock-docs-vs-req-docs.md`

> Wording: only clean "old-name topic files"; do not delete current topic files with the `f2s-` prefix.

### Step 3a: Existing `topicMetadata` Audit (Required)

1. Read `.Knowledge/manifest-routing.json`, using `topicPaths` as the complete topic set.
2. Validate `topicMetadata`: keys must exist in `topicPaths`; `primary` may only be `feature` / `module` / `config` / `policy`; `tags`, if present, must be an array, elements must use the same allowed values as `primary`, and must not duplicate `primary`; `confidence` may only be `manual` / `inferred`.
3. For topics in `topicPaths` that lack metadata, perform classification analysis: **must Read the corresponding `.Knowledge/topics/<id>.md` body**; do not infer only from the topicId name. If evidence is clear, write `inferred`; if evidence is insufficient, **do not write metadata**, but list the inferred direction and basis in the summary (for example, "recommend policy because the body contains multiple mandatory constraints") for user confirmation before manual `manual` fill-in.
4. Classification follows `f2s-topic-authoring` guideline section 3. Agent judges the primary nature from the topic body and writes `primary`; when it covers multiple natures, write the rest to optional `tags`.
5. Do not create, rename, or split topics because of classification.
6. **Topic-granularity audit** (does not block upgrade; list in step 5 summary): check each item and list as "recommended split" if any signal is hit:
   - The corresponding stock-doc exceeds **300-500 lines**.
   - `includeAny` has more than **12 terms**.
   - The topic body contains second-level headings covering more than **3 unrelated responsibility domains**.
   - The topic is frequently matched by multiple unrelated task types (can be judged from `taskToTopicRules` and matcher term breadth).

### Step 3b: `index.md` Merge and `template/index.template.md` (Required)

> **Scope**: this "merge" is written to `.Knowledge/index.md` **only by the Agent in this skill**. It does **not** require or assume changes to Flow2Spec package **`cli.js` / `lib/init.js`** or other JS. `init` behavior follows the repository's current implementation (snapshot copy, etc.).

**Role of `flow2spec init` in this workflow**: copy the current-language `index.md` snapshot to **`.Knowledge/template/index.template.md`** as a **package-shell comparison snapshot**. It does **not** replace this step's merge writing for **`index.md`**.

#### Merge Rules (Required)

0. **Write ownership**: this step's `.Knowledge/index.md` merge is always performed and written by the main agent; sub-agents must not write directly (write-authority hard rule).
1. **Comparison sources**
   - **Package full text**: **`.Knowledge/template/index.template.md`**.
   - **Project current state**: **`.Knowledge/index.md`**.

2. **Project-maintained section (anchor: `## Topic Overview` in `.Knowledge/template/index.template.md`)**
   - Using `.Knowledge/template/index.template.md` as reference: from the second-level heading **`## Topic Overview`** **until the end of that section**: specifically, up to the `---` immediately before **`## Match and Execute`** (including the "Topic Overview" table and intra-section explanatory paragraphs).
   - This whole block **must preserve the body from current project `.Knowledge/index.md`** (maintained by business and **f2s-***). It is **forbidden** to wholesale replace it with the same block from the package template (to avoid losing business topic rows and summary columns).
   - **Allowed** minimal repairs inside this block: for example, add rows for package-added `topicPaths` topics, correct the "path" column according to **`manifest-routing.json` `topicPaths`**, and add new table-column explanations introduced by the package snapshot while preserving existing project behavior.

3. **Parts that must match the package template**
   - Everything outside the maintained block above (from file start to before **`## Topic Overview`**, and from **`## Match and Execute`** through file end) must match the corresponding parts of **`.Knowledge/template/index.template.md`** (package version is authoritative; after diff, overwrite old project text with the template).

4. **Output**
   - Write the complete merged **`index.md`** back to **`.Knowledge/index.md`**.
   - Include the **diff** conclusion and whether it changed in step 5 summary.

5. **Relationship to `--reset-knowledge`**
   - If the user used `reset`, `.Knowledge/index.md` may have been overwritten by the template whole-file. Still, this step must restore the "Topic Overview" block from backup or version control before performing merge rule **3**. If the repository has no backup, rebuild the topic table from `topicPaths` + snapshot and ask the user to confirm.

### Step 4: Verify This Skill's Execution Result (Required)

Verify at least:

1. Step 2 `flow2spec init` exited successfully (exit code = 0).
2. init output includes the conclusion for **routing manifest and `.Knowledge`** (aligned/latest/reset overwrite, etc.) and a line indicating **`index.template.md` was copied** (if the package lacks `index.md`, this line may be absent).
3. `manifest-routing` and every `matcherPath` shard are parseable, and all `topicPaths` / `matcherId` references are valid.
4. **`.Knowledge/template/index.template.md`** exists; step **3b** completed the **`index.md` merge** (maintained block preserved + rest matches package version), or the reason pending user handling is written.
5. Configuration-root artifacts exist:
   - Cursor/Claude: `rules/`, `skills/`
   - Codex: `.codex/AGENTS.md`, `skills/`
6. After this skill succeeds, delete `.Knowledge/update-check.json` if it exists so the next new session rechecks and clears stale upgrade hints; if deletion fails, state it in the step 5 summary.

### Step 5: Output Result Summary (Required)

Output:

- Executed command (including agents and whether reset was used)
- Whether it succeeded
- Old topic-template cleanup conclusion (what was deleted / what did not exist)
- `index/manifest` reference-fix conclusion
- **index**: whether `index.template.md` was generated; whether **`index.md` merge** completed (anchor **lines 18-19 "Topic Overview" section** preserved, rest matching package version) and `topicPaths` / diff conclusion (step 3b)
- **SKILL self-update**: whether `f2s-kb-upgrade/SKILL.md` was re-read after `init`; whether file changes caused a **whole-skill rerun** and how many rounds (see "init and skill self-update")
- manifest / matchers alignment conclusion (from init output)
- Key file verification conclusion
- `.Knowledge/update-check.json` cleanup conclusion (deleted / absent / deletion failed)
- If failed, provide the next executable repair suggestion

## Output Summary Template (Recommended)

```markdown
## f2s-kb-upgrade Execution Result

- Command run inside this skill: `<actual flow2spec init ...>`
- init mode: `incremental` / `overwrite reset (--reset-knowledge)`
- Result: `success` / `failure`

### Core Verification
- Old topic files: `cleaned` / `no cleanup needed`
- Reference fixes: `updated` / `already consistent`
- **index (snapshot + merge)**: `snapshot copied` / `index.md merged` / `pending (see notes)`
- **topicMetadata (existing audit)**: `filled` / `pending user confirmation`; list added / fixed / deleted topicIds
- **f2s-kb-upgrade SKILL**: `unchanged after init` / `rerun N rounds with newer version` / `pending confirmation`
- manifest-routing / matcher shards: `aligned with template` / `already latest` / `reset overwrite`
- topics.path: `all exist` / `missing paths (see below)`
- agent artifacts: `pass` / `issue (see below)`
- update-check cache: `deleted` / `absent` / `delete failed`

### Notes
- <failure reason or next suggestion>
```

## Constraints

- Do not default to "ask the user to run the command themselves"; the Agent should run it directly.
- Do not execute `--reset-knowledge` without explicit consent.
- Do not modify business code; only verify according to **this `f2s-kb-upgrade`** workflow and result.
- Step 3b `.Knowledge/index.md` merge and `manifest-routing.json` are always written by the main agent (write-authority hard rule); sub-agents may only run shell commands.

## Completion Self-Check

1. **Step 0** was performed: V1 did not skip migrate, and **current repositories (V2+)** did not incorrectly run migrate.
2. After **step 2 `init`**, **`f2s-kb-upgrade/SKILL.md`** was re-read, and if changed, the **whole skill was rerun** (see "init and skill self-update").
3. A shell command was actually executed, not only suggested.
4. Incremental or reset mode was clearly labeled.
5. Old topic-file cleanup and `index/manifest` reference fixes were handled.
6. **Step 3a** was executed: `topicMetadata` audited, with no orphan keys / illegal primary / illegal confidence; missing old topics were filled with `inferred` based on evidence or listed as pending confirmation.
7. **Step 3b** was executed: `index.md` was **merged** (from **`Topic Overview`** section through before "Match and Execute" is project-maintained; the rest matches the package version), and `topicPaths` were checked.
8. Manifest and key-path verification results were output.
9. If failed, a concrete next command suggestion was provided.
10. Step 3b `index.md` merge was completed and written by the main agent, with no unauthorized sub-agent write.
11. After successful upgrade, `.Knowledge/update-check.json` was deleted to avoid stale upgrade hints in new sessions that day.
