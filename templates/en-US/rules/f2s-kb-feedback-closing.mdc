---
description: Closing rule for knowledge-base follow-up suggestions after source code was read during ordinary Q&A; only suggest f2s-kb-distill, do not write automatically
alwaysApply: true
---

# Flow2Spec Knowledge-Base Feedback Closing

This rule governs knowledge-base follow-up suggestions after ordinary Q&A reads business source code. It only decides whether the final answer should append one minimal suggestion.

## Scope

Run this rule only when all of the following are true:

- This turn is **ordinary Q&A / troubleshooting / explanation**;
- This turn has **not entered** an `f2s-*` skill, `implement-tech-design`, `f2s-git-commit`, or another existing follow-up flow;
- This turn read business source code and the final answer cites source-code facts.

If this turn is already running a knowledge-base skill, do not repeat the suggestion.

## Judgment Timing and Basis

**Judgment timing**: After generating the final answer, judge based on the knowledge content actually included in the answer, not the reading process.

**Judgment basis**:
- What knowledge did the final answer supplement that the KB did not write or wrote insufficiently
- Does this knowledge belong to "reusable knowledge facts"
- Not: all files/information encountered during the reading process

**Reusable knowledge facts** include:
- Core mechanisms (e.g., cache semantics, retry strategy, fallback logic)
- State transitions (e.g., order state machine, session lifecycle)
- Return value / error code contracts (e.g., HTTP status code semantics, business error code meanings)
- Configuration switch impacts (e.g., switch X affects behavior Y)
- Failure fallback strategies (e.g., fallback plan when primary path fails)
- Module boundaries or calling conventions (e.g., module A calling module B contract)
- Data models and field semantics (e.g., business meaning of key fields)

**Evidence only, do not trigger sync** includes:
- Line numbers (e.g., `client.py:51`)
- Function names (e.g., `send_message_to_session()`)
- Code snippets (concrete implementation code for demonstration)
- Call paths (e.g., `A → B → C` call chain)
- Local implementation expanded to answer user follow-up questions
- Source-code verification of facts already written in the topic (KB wrote it clearly, source code only confirms)

## Mechanical Gate

- After reading the first business source file, treat this turn as having triggered `sourceFallbackUsed=true`.
- When `sourceFallbackUsed=true` and the final answer cites source-code facts, this four-case self-check must run before sending the answer.
- **One of the four cases must be stated explicitly**: every closing pass must choose cases 1-4 and **output the corresponding block explicitly**; silently skipping the whole closing flow is not allowed.
- Decision logic:
  - topic matched + final answer supplemented "reusable knowledge facts" → use **case 2**
  - topic not matched + final answer supplemented "reusable knowledge facts" → use **case 1**
  - topic matched + final answer only contains "evidence content" (line numbers/function names/call paths) + KB already wrote core facts clearly → use **case 4**
  - If the gap noted before drilling down was **mechanism/contract/process-type knowledge gap**, use **case 2** afterwards
  - If the gap noted before drilling down was only **evidence/source-code location/line number/implementation provenance gap**, and the topic already covers core facts, may use **case 4**

## Four Closing Cases

1. **KB does not cover it + source code provided the answer**: append this at the end of the answer:
   ```md
   > 💡 Run `f2s-kb-distill` to ingest knowledge from this turn
   ```
   **Decision criteria**: no topic covers this capability / module / problem domain, and the final answer supplemented reusable knowledge facts.

2. **KB covers it but lacks detail + source code completed the answer**: append this at the end of the answer:
   ```md
   > 💡 Run `f2s-kb-distill` to ingest knowledge from this turn
   ```
   **Decision criteria**: an existing topic covers the direction but lacks details, and the final answer supplemented reusable knowledge facts (core mechanisms, state transitions, contracts, etc.).

3. **KB and source code disagree**: answer according to source-code facts and append this at the end of the answer:
   ```md
   > 💡 Run `f2s-kb-distill` to ingest knowledge from this turn
   ```

4. **KB fully covers it; source code was only verification**: append this at the end of the answer:
   ```md
   > **Knowledge base already covers this**: the core facts in this answer were fully provided by `<topicId>`; source-code reading was only verification.
   ```
   **Decision criteria**:
   - The relevant KB topic already states the core answer to this question (mechanisms, transitions, contracts and other reusable knowledge facts)
   - This turn's final answer did not introduce new reusable knowledge facts outside the KB
   - Source code cited in the answer was only for evidence (line numbers, function names, call paths) or to verify KB-written content
   - If the gap noted before drilling down mentioned mechanism/contract/process-type knowledge gap, case 4 is prohibited

## Boundary Between Case 1 and Case 2

- **case 1** (`f2s-kb-distill` uncovered scenario): no topic covers this capability / module / problem domain
  - Example: user asks "module X's retry mechanism", but manifest has no topic related to module X
  - Example: user asks "implementation of new feature Y", but KB has no document or topic about feature Y

- **case 2** (`f2s-kb-distill` supplement scenario): an existing topic covers the direction but lacks details
  - Example: topic wrote "cache-first strategy" but did not write concrete failure-fallback logic
  - Example: topic wrote "action-chain judgment" but did not write concrete state-checking method

This avoids misjudging "already has a topic but still suggests add".

## Output Format

- Cases 1-3: output one Markdown blockquote containing only `f2s-kb-distill` command (the skill will automatically extract Q&A context from conversation history).
- Case 4: output one Markdown blockquote stating "Knowledge base already covers this" plus the related topicId.
- Do not omit this block; do not output a list of KB paths read, a coverage comparison table, explanations, or multi-line background.
- Only suggest; do not automatically run `f2s-kb-distill`.
