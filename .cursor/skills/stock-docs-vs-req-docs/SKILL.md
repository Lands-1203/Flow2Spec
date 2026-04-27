---
name: stock-docs-vs-req-docs
description: 文档目录 stock-docs 与 req-docs 分工；触发词：stock-docs、req-docs、f2s-ctx-build、f2s-doc-arch、f2s-doc-add、已落地能力、技术方案放哪、PDF 终稿
---

# stock-docs 与 req-docs（技能）

## 何时使用

- 用户问「文档放哪」「PDF 转完放哪」「生成 Rules 用哪个目录」「技术方案目录」等。
- 实现或命令执行时需要选择 **`配置根/stock-docs/`** 还是 **`配置根/req-docs/`**。
- 区分 **f2s-doc-arch**（架构说明**初稿**）与 **f2s-doc-add**（**工作中**把**已落地能力**从多文件解析进上下文）：二者产物都落在 **stock-docs/**，与 **req-docs** 无关；分工见 **`skills/f2s-doc-arch/SKILL.md`**、**`skills/f2s-doc-add/SKILL.md`**。

## 核心对照

| 目录 | 位置 | 用途 |
|------|------|------|
| **stock-docs** | 配置根下 | **存量上下文源** → **f2s-ctx-build** 入参；**f2s-doc-final** 的初稿/终稿；**f2s-doc-arch** 的架构初稿；**f2s-doc-add** 聚合读源后的初稿与终稿（与 f2s-doc-arch 分工不同，见该 SKILL「使用时机」） |
| **req-docs** | 配置根下（如 `.cursor/req-docs/`） | 需求与技术方案 → 按 `implement-tech-design` **写代码**、**f2s-doc-pdf** 输出 |

## 常见错误

- 把 **仅用于实现代码** 的 **`配置根/req-docs/xxx.md`** 当作 **f2s-ctx-build** 技能的入参（应先把符合终稿范式的内容放到 **stock-docs** 再生成上下文）。
- 在 Rule 内链到 **`req-docs/`**（应链到 **stock-docs** 中的源文档）。
- 把 **f2s-doc-add** / **f2s-doc-arch** 产出的初稿、终稿误存到 **req-docs**（应始终在 **stock-docs/**）。

## 详细约定

见 Flow2Spec 包内 **`docs/README-目录与路径约定.md`**；技能顺序与 **f2s-doc-arch** / **f2s-doc-add** 见 **`docs/README-命令说明.md`**。具体步骤以配置根 **`skills/<技能名>/SKILL.md`**（如 **f2s-ctx-build**、**f2s-doc-add**）为准。
