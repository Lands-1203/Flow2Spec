# Flow2Spec — Let AI Always Know What You're Doing

> Cures the "amnesia" of Cursor / Claude Code — with one `init` command, AI
> remembers project context across sessions. No more re-explaining every time.
>
> 🌐 **[中文](./README.md)** · 中 / EN

🎬 **[Live Demo (English)](https://lands-1203.github.io/Flow2Spec/en/)** | **[中文演示](https://lands-1203.github.io/Flow2Spec/)** (13-slide HTML PPT, `←` `→` to navigate, `S` for presenter mode)

🔧 **Quick start**:

```bash
npx @double-codeing/flow2spec@latest init
```

---

## Before / After

The exact same request, two conversations:

```
> Update the batch re-scoring of the review template library
```

**Without Flow2Spec**:

```
AI: Which module has this table?
AI: Is batchReScore sync or async?
AI: Is there a lock? What's the idempotency key?
AI: What's the response format? What's the error code?
AI: (Digging through 416 APIs, 796 files, 4.7 MB of source code…)
```

Repeated introductions · Repeated code searches · Repeated mistakes

**With Flow2Spec**:

```
[matcher hit] m-product-review-template-library
[loading deps] 4 topics · ~300 lines
AI: Known — fire-and-forget
     Redis lock smp:product-review:template-library:batch-rescore:lock (TTL 10 min)
     Max 100 items per batch · error code 101
AI: Starting implementation, 3 files affected.
```

4.7 MB → 300 lines · Pinpoint accuracy in seconds

---

## What Flow2Spec Does (3 Things)

**① Remembers project context across devices and sessions**  
`.Knowledge/` structured knowledge base: routing manifest (`manifest-routing.json`) + keyword indices (matchers) + topic shards (topics). AI only loads what's relevant.

**② Routing manifest means AI doesn't dig through your repo**  
Each task hits 1–4 topics, ~300 lines. Business constraints — Redis lock keys, error codes, batch limits — are all in the topics. AI doesn't have to guess from source code.

**③ f2s-* skills update knowledge as you code**  
`/f2s-kb-feat` writes topics while writing features, `/f2s-kb-fix` corrects topics while fixing bugs, `/f2s-git-commit` checks topic coverage before committing. Changing code == updating knowledge. No separate "documentation maintenance."

---

## Getting Started

**Minimum viable setup is an empty skeleton.**

```bash
npx @double-codeing/flow2spec@latest init
```

1 minute generates the directory structure + routing config. Empty, ready to use. **Next requirement hits whichever area → you document that area.** No upfront investment needed.

Real data from a production repo running for 3 months:

| Metric | Value |
|---|---|
| Public APIs | 416 |
| Source code | 796 files / 4.7 MB / ~100K lines |
| Flow2Spec per-task load | **≈ 300 lines** (99% noise removed) |

---

## When NOT to Use

- **One-off scripts** — throwaway code is faster with a few Markdown files for AI context
- **Solo small projects** — a single CLAUDE.md is enough; routing overhead > benefits
- **Team won't maintain .Knowledge/** — tools can't replace discipline

---

## Documentation

### English
- [Usage Guide](./docs/usage-guide.en.md) — skill chains, config details
- [Commands Reference](./docs/commands-reference.en.md) — all f2s-* command reference
- [Directory Conventions](./docs/directory-conventions.en.md)
- [Architecture & Principles](./docs/architecture.en.md)
- [Usage Scenarios](./docs/usage-scenarios.en.md)
- [Design Principles](./docs/design-principles.en.md)

### 中文
- [使用说明](./docs/Flow2Spec使用说明.md)
- [命令说明](./docs/README-命令说明.md)
- [目录与路径约定](./docs/README-目录与路径约定.md)
- [体系与原理](./docs/README-体系与原理.md)
- [使用案例·模拟对话](./docs/Flow2Spec-使用案例-模拟对话.md)
- [设计说明](./docs/Flow2Spec-设计说明.md)

## License

MIT. Copyright © 2026 兰涛