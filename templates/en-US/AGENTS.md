# Flow2Spec Project Entry

This file is written by `flow2spec init` to the repository-root **`./AGENTS.md`** as the complete instruction set for [Codex auto-discovery](https://developers.openai.com/codex/guides/agents-md). **`./.codex/AGENTS.md`** is only a short pointer to this file and does not contain the complete rules. You are working in a Flow2Spec project; the knowledge base is in **`./.Knowledge/`**. Read it progressively and avoid loading large amounts of unrelated documentation at once.

## Mandatory Pre-Step Before Any f2s-* Skill

**The first action before executing any `f2s-*` skill must be to use the Read tool on the repository-root file `./flow2spec.config.json`** to obtain the actual `subAgent` and `switchAgentVerification` values before deciding the subsequent orchestration.

```
Must execute: Read("flow2spec.config.json")  <- relative to the repository root; before any step in the skill body
```

**Do not enter any execution step in the skill body before reading this file.**

## Flow2Spec Project Switches (`./flow2spec.config.json`; if missing, `flow2spec init` fills it)

**Purpose of `flow2spec init`**: write the Flow2Spec runtime structure into the current repository, including **`./.Knowledge/`** (routing structure, snapshots, and so on), repository-root **`./AGENTS.md`** (complete), **`.codex/AGENTS.md`** (pointer), and **`./.codex/`** (such as **`./.codex/skills/`** and **`./.codex/topics/*.md`**). It **does not** author business content in **`./.Knowledge/stock-docs/`** or **`./.Knowledge/topics/`**, and it does not replace **`f2s-*` skills**. In short, it writes directories and aligns shape; it is not a "knowledge-base upgrade command" (for upgrades, see the **`f2s-kb-upgrade`** skill).

Before executing any **`f2s-*` skill**, you must read the boolean fields in `./flow2spec.config.json` (missing fields or missing file are treated as `false`). The table below is written by the **most recent `flow2spec init`** from the configuration at that time; **the file on disk is authoritative**.

{{FLOW2SPEC_PROJECT_CONFIG}}

### `subAgent` and `switchAgentVerification` (same semantics as the table above; disk configuration is authoritative)

- **`subAgent`**: If an `f2s-*` skill states that a step should be executed by a sub-agent, use a sub-agent when this is **`true`** and complete it in the main session when this is **`false`**. The user may say that the main agent should **dynamically decide** which subtasks are suitable for sub-agents **only when** `subAgent` is **`true`**; that instruction is valid **only when the configuration is `true`**. When it is **`false`**, that requirement **automatically does not apply**, and no sub-agent split is allowed. **Which phases use sub-agents** is defined by each skill body; if the skill does not specify a split, do not split by default.
- **`switchAgentVerification` (agent-switch verification)**: this does **not** mean "verification always happens in the main session." When this is **`false` or cross-verification is not enabled**: whichever agent session **writes to disk** also performs verification and review in that same session (checklist comparison, diff, self-check). When this is **`true` and** the current **`f2s-*` skill body** states that it depends on this field, enable **cross-verification**: **sub-agent disk writes -> main-agent verification**; **main-agent disk writes -> sub-agent verification**. If there is no sub-agent, such as when **`subAgent` is `false`**, then "main writes -> sub-agent verifies" does not occur, and **all verification stays in the main session**.

### `intentRecognition` (intent-recognition auto-routing)

- **`intentRecognition: false` or missing field**: auto-routing is disabled; enter a skill only when the user explicitly uses `$f2s-*` or clearly asks to execute a specific skill.
- **`intentRecognition: true`**: use **`./.codex/topics/f2s-intent-routing.md`** to identify high-confidence operational intent. For questions, discussion, evaluation, low-confidence input, conflicting multiple intents, or an unfinished current flow, do not auto-switch skills; answer or clarify first.

## Global Constraints

1. **Read the machine index first**: prefer **`./.Knowledge/manifest-routing.json`** for topic routing; as needed, read the matcher shard pointed to by `taskToTopicRules[].matcherPath` (a single file, with a path such as **`./.Knowledge/matchers/<id>.json`**) to obtain match terms. If no route is hit, enter supplemental recall.
   - If `taskToTopicRules` exists, route topics by task rules first.
   - If a matched topic has `topicDependencies`, read dependency topics before the main topic.
   - If `topicMetadata` exists, use only `primary` / `tags` as reading expectations: `config` focuses on configuration items, switches, and defaults; `policy` focuses on musts, prohibitions, gates, and workflow constraints; `feature` is background for landed capabilities; `module` is background for directory/package/module boundaries. `topicMetadata` does not participate in matcher hits, does not decide whether to read a topic, and does not change mandatory execution rules. If there is no clear classification evidence, do not write metadata and list it as pending confirmation in the summary.
   - `manifest` is maintained only through `f2s-*` skill flows; do not assume an additional CLI command exists.
2. **Read the human index only as needed**: read **`./.Knowledge/index.md`** only when validating topic semantics and boundaries.
   - `index.md` is not a machine-readable source of truth; it is only human-readable navigation and semantic boundary explanation.
3. **Topics first**: based on the task, read the **routing summary** from **`./.Knowledge/topics/*.md`** (topic id, path, next-step pointer). Flow2Spec **package-level execution instructions** are written by **`flow2spec init`** into **`./.codex/topics/f2s-*.md`** (see **"Long-Form Topics"** below); open the corresponding file only when the complete instructions are needed.
4. **Long documents on demand**: read **`./.Knowledge/stock-docs/*.md`** only when background is needed.
5. **Requirement document path**: use **`./.Knowledge/req-docs/*.md`** by default.
6. Align with the knowledge base before drilling into code: if the index covers the topic, follow the knowledge-base conventions first.
7. **Complete after a hit (required)**: execute `match -> expand -> verify -> act`.
   - `match`: derive the primary candidate from routing + matcherPath first.
   - `expand`: expand `topicDependencies`, and keep the next-highest candidates (recommended top-2/top-3) for supplemental validation.
   - `verify`: before acting, perform a gap check (missing key topics, boundary conditions, or context documents).
   - `act`: execute only when confidence is sufficient; low confidence must be clarified first.
8. **Threshold for full supplemental search (required)**: cross-matcher full supplemental search (top-k) is allowed only when one of the following is true:
   - `taskToTopicRules` has no hit;
   - the margin between the primary and secondary candidate is too small (low confidence);
   - the gap check fails (missing key topic/dependency/context);
   - the user explicitly asks for "full check / don't miss anything".
9. **Prohibitions**:
   - Do not skip **`./.Knowledge/manifest-routing.json`**, the needed `matcherPath` shard, or **`./.Knowledge/topics/`** and jump straight to full-repository search or coding. **`./.Knowledge/index.md`** is read on demand and cannot replace the machine-readable chain above.
   - Within the same task line, avoid repeatedly reading the full **`./.Knowledge/manifest-routing.json`** (unless the user says routing or knowledge was updated through `f2s-kb-build` / `f2s-kb-sync` / `f2s-kb-add`, or the manifest was manually changed; **do not treat** running only `flow2spec init` as a business knowledge-base update). Do not traverse the entire **`./.Knowledge/matchers/`** directory for enumeration. Do not alternate **`./.Knowledge/index.md`** and routing just to refresh lists.
   - Do not use **`./.Knowledge/stock-docs/`** as the direct input document for "implement code from a spec".
   - Flow2Spec execution instructions are authoritative in **`./AGENTS.md`** (complete), **`./.codex/topics/f2s-*.md`**, and **`./.codex/skills/`**. **`.codex/AGENTS.md`** is only a directory pointer and cannot replace root `AGENTS.md`. Do not use same-named instruction files outside the above paths as execution authority, to avoid divergent wording.
   - Do not treat `fallbackTopic` as the final hit and directly implement changes; `fallbackTopic` is only safe fallback and pre-clarification context.
   - Do not perform cross-matcher full supplemental search unless the threshold is met.
10. **Search and response cadence**: once the KB already supports an answer, keep `grep`/disk-read scope and rounds controlled; prefer a single-point `Read` based on directories given by the topic. If the user did not request "full repository / read all dependencies", it is acceptable to **answer briefly first and drill down only as needed**. See **"Search Volume and Response Cadence"** in **`./.codex/topics/f2s-knowledge-preflight.md`**.
11. **Closure after source-code supplementation in ordinary Q&A**: when ordinary Q&A drills into source code and supplements an answer from it, first complete the initial read and gap gate in **`./.codex/topics/f2s-knowledge-preflight.md`**, then complete the final knowledge-base supplementation suggestion in **`./.codex/topics/f2s-kb-feedback-closing.md`**. Only suggest; do not automatically run `f2s-kb-add` / `f2s-kb-sync`.

## Progressive Reading Order

1. `./.Knowledge/manifest-routing.json`
2. `./.Knowledge/matchers/<matcher>.json` (as needed: locate the specific file through `taskToTopicRules[].matcherPath`)
3. `./.Knowledge/index.md` (as needed, for semantic validation)
4. `./.Knowledge/topics/<topic>.md` (summary; when it involves the unified entry, routing details, `implement-tech-design` / `f2s-doc-routing`, and so on, continue as needed to the `./.codex/topics/f2s-*.md` files listed under **"Long-Form Topics"** below)
5. `./.Knowledge/stock-docs/<doc>.md` (as needed)
6. Business code (as needed; paths follow the actual directories in the repository)

## Machine-Readable Source of Truth (must follow)

- The main machine-readable routing source of truth is **`./.Knowledge/manifest-routing.json`**; match terms come from the matcher shard pointed to by `taskToTopicRules[].matcherPath`.
- **`./.Knowledge/index.md`** is only human-readable navigation and semantic boundary validation; it does not define machine-readable fields.
- `fallbackTopic` is only for low-confidence fallback and is not final execution authority. After entering fallback, perform supplemental recall or clarify first.

## Available Topics

- Do not maintain a static topic list here, to avoid drifting from knowledge-base evolution.
- For every task, use `topicPaths`, `taskToTopicRules`, and `fallbackTopic` in **`./.Knowledge/manifest-routing.json`** as the only routing facts, and read the matcher shard from each rule's `matcherPath`. `topicMetadata` is only governance and reading expectation, not routing fact.
- If the routing manifest and **`./.Knowledge/index.md`** disagree semantically, use the routing manifest and tell the user to sync the correction.

## Long-Form Topics (`./.codex/topics/`)

**`flow2spec init`** writes these files into the current repository. Together with this file and **`./.codex/skills/`**, they form Flow2Spec's executable authority. Current runtime paths are all under **`.codex/topics/`** at the repository root:

- **Unified entry**: `./.codex/topics/f2s-flow2spec-unified-entry.md`
- **implement-tech-design**: `./.codex/topics/f2s-implement-tech-design.md`
- **f2s-doc-routing**: `./.codex/topics/f2s-stock-docs-vs-req-docs.md`

The same directory also contains:

- **`./.codex/topics/f2s-knowledge-preflight.md`**: **ordinary questions** must also first `Read` **`./.Knowledge/manifest-routing.json`** before drilling into code. When this runs alongside the unified entry, this "first tool call" rule takes precedence.
- **`./.codex/topics/f2s-kb-feedback-closing.md`**: closure for knowledge-base supplementation suggestions after ordinary Q&A reads business source code. When supplementation is needed, output only one `f2s-kb-add` / `f2s-kb-sync` command; otherwise stay silent.
- **`./.codex/topics/f2s-intent-routing.md`**: enabled only when `flow2spec.config.json.intentRecognition=true`; high-confidence operational intent may automatically enter the corresponding `f2s-*` skill. Discussion, evaluation, and low-confidence input do not auto-trigger.
- **`./.codex/topics/f2s-config-check.md`**: same as "Read **`./flow2spec.config.json`** first" above and includes the **changeTracking** detail table. Open it **only** when the detail table needs to be checked; it does not need to be read alongside the three files above by default.

When executing Flow2Spec-related tasks, first read this file (**`./AGENTS.md`**) and **`./.Knowledge/manifest-routing.json`**, then open the **`./.codex/topics/*.md`** files above as needed.

## Knowledge-Base Version Self-Check (auto-triggered on SessionStart; first time each day only when updateCheck.enabled=true)

Codex has **`.codex/hooks.json`** written by `flow2spec init codex`, which automatically runs `node .codex/hooks/f2s-update-check.js` on `SessionStart` `startup|resume` events. After the first generation or hook-content changes, Codex may require `/hooks` review and trust for the project hook.

**Rule-layer backup check** (if the hook did not run, use this section to supplement the check; this and the script cache back each other up):

1. Read `flow2spec.config.json` -> if `updateCheck.enabled` is not `true`, skip and show no notice.
2. Read `.Knowledge/update-check.json` -> if the file exists and `checkedAt` is on the same natural day as today (`new Date(checkedAt).toDateString() === new Date().toDateString()`), do not query npm again. However, if `needsUpgrade=true` or `latestNpm > manifestVersion`, the first user-facing response in this session must still remind the user to run `f2s-kb-upgrade`. If the current `.Knowledge/manifest-routing.json.version` is already no lower than `latestNpm`, delete this cache and stop reminding.
3. If neither of the above steps skipped the check: run `node .codex/hooks/f2s-update-check.js` and parse JSON from stdout:
   - If it contains `hookSpecificOutput.additionalContext`: **tell the user** that content (suggest running `/f2s-kb-upgrade`).
   - If there is no output or parsing fails: stay silent and show no notice.
4. If any step above errors, silently skip it and do not affect normal conversation.

## Available Flow2Spec Skills (auto-generated)

{{FLOW2SPEC_CODEX_SKILLS_SUMMARY}}
