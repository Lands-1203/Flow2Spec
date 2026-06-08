---
name: f2s-req-clarify
description: Clarify a PRD or requirement through follow-up questions until it is actionable, then use f2s-req-tech to produce a technical design; triggers: 需求澄清、PRD 澄清、requirement clarification、PRD clarification
---

## Orchestration (main / sub agent)

- The semantics of `subAgent` / `switchAgentVerification` use the unified entry as the only source of truth: **Cursor/Claude** read the config-root `rules/f2s-flow2spec-unified-entry.*`; **Codex** reads `.codex/topics/f2s-flow2spec-unified-entry.md` (same source, mirrored by `flow2spec init`). This skill does not restate those semantics.
- This skill does **not** split work by default: regardless of the `subAgent` value, the clarification process stays entirely in the main conversation. Follow-up questions and alignment with the user strongly depend on continuous context; sub-agent splitting would break that context.
- Verification is performed by the agent that writes the artifact. This skill does not bind to cross-agent verification.

# Requirement Clarification

> Execution scope: clarification documents are written to `.Knowledge/req-docs/`.

**Input**: Optional. The full PRD, a requirement description, or a document path (for example `.Knowledge/req-docs/xxx.md`). If omitted, clarify based on the current conversation. Later replies may add requirement conditions.

**Behavior**: Identify vague wording, undefined concepts, missing information, contradictions, and implementation-relevant details that are not specified. Group them, ask concrete answerable follow-up questions, then iterate based on the answers until the flow, boundaries, exceptions, and key concepts are unambiguous. Do not make business assumptions for the user; ask when something is unclear.

**Completion**: When the information is clear enough, output a Markdown "requirement clarification document" that can be written directly to disk. The document must include at least: background and goals, scope (included / excluded), key flows, boundaries and exceptions, key concept definitions, acceptance criteria, and open questions if any. Recommend saving it under `.Knowledge/req-docs/`. After outputting the document, prompt the user to use `f2s-req-tech` to generate a technical design for later implementation.
