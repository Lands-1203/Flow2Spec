---
name: f2s-doc-routing
description: 文档目录 stock-docs 与 req-docs 分工；触发词：stock-docs、req-docs、f2s-kb-build、f2s-doc-arch、f2s-kb-add、已落地能力、技术方案放哪、PDF 终稿
---

## 编排（主 / 子 agent）

- 两字段（`subAgent` / `switchAgentVerification`）语义以统一入口为唯一事实源：**Cursor/Claude** 读配置根 `rules/f2s-flow2spec-unified-entry.*`；**Codex** 读 `.codex/topics/f2s-flow2spec-unified-entry.md`（与上同源，`flow2spec init` 镜像）。
- 本技能为**说明型**，**不拆子**（无拆子收益），主 agent 短答即可。
- 落盘侧自验（本技能通常不产生落盘）。

# stock-docs 与 req-docs（技能）

## 何时使用

- 用户问「文档放哪」「PDF 转完放哪」「生成 Rules 用哪个目录」「技术方案目录」等。
- 实现或命令执行时需要选择 `.Knowledge/stock-docs/` 还是 `.Knowledge/req-docs/`。
- 区分 **f2s-doc-arch**（架构说明**初稿**）与 **f2s-kb-add**（**工作中**把**已落地能力**从多文件解析进上下文）：二者产物都落在 **stock-docs/**，与 **req-docs** 无关；分工见 **`skills/f2s-doc-arch/SKILL.md`**、**`skills/f2s-kb-add/SKILL.md`**。

## 核心对照

| 目录 | 位置 | 用途 |
|------|------|------|
| **stock-docs** | `.Knowledge/stock-docs/` | **存量上下文源** -> `f2s-kb-build` 入参；`f2s-doc-final` 初稿/终稿；`f2s-doc-arch` 架构初稿；`f2s-kb-add` 聚合读源后的初稿与终稿 |
| **req-docs** | `.Knowledge/req-docs/` | 需求与技术方案 -> 按 `implement-tech-design` 写代码、`f2s-doc-pdf` 输出 |

## 常见错误

- 把 **仅用于实现代码** 的 `.Knowledge/req-docs/xxx.md` 当作 `f2s-kb-build` 入参（应先把符合终稿范式的内容放到 `.Knowledge/stock-docs/` 再生成上下文）。
- 在 Rule 内链到 **`req-docs/`**（应链到 **stock-docs** 中的源文档）。
- 把 **f2s-kb-add** / **f2s-doc-arch** 产出的初稿、终稿误存到 **req-docs**（应始终在 **stock-docs/**）。

## 详细约定

以本技能对照表与配置根 **`skills/<技能名>/SKILL.md`**（如 **f2s-kb-build**、**f2s-kb-add**、**f2s-doc-arch**）为准；`.Knowledge/topics/f2s-stock-docs-vs-req-docs.md` 为路由摘要。
