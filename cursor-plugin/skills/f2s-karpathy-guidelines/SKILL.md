---
name: f2s-karpathy-guidelines
description: Flow2Spec 内置的 Karpathy 式编码纪律：澄清假设、极简实现、手术式修改、可验证目标。默认由同名 topic 规则 alwaysApply 随 init 落盘；显式调用本技能时重申四条。
license: MIT
---

# f2s-karpathy-guidelines

`flow2spec init` 将 npm 包内 **`templates/rules/f2s-karpathy-guidelines.mdc`** 去 frontmatter 后写入 **`./.codex/topics/f2s-karpathy-guidelines.md`**（相对仓库根，**`alwaysApply`** 语义以源 `.mdc` 的 frontmatter 为准）。

**显式使用本技能时**：在回复中简要重申并遵守以下四条（与 **`./.codex/topics/f2s-karpathy-guidelines.md`** 全文一致；冲突时以 **f2s 流程条令** 为准）。

1. **先想清楚再写代码**：假设说清；多解并列；说不清就停、先问。
2. **简单优先**：最少代码解决问题；无臆测功能/抽象/配置。
3. **手术式修改**：只动任务相关行；不顺带「优化」无关代码；只删自己改动产生的孤儿。
4. **目标驱动**：先定义可验证成功标准（测试、检查项），再迭代到满足。

cursor/claude: 完整条文以磁盘上 **`rules/f2s-karpathy-guidelines.mdc`**为准。

或 Codex 侧 **`.codex/topics/f2s-karpathy-guidelines.md`**为准。
