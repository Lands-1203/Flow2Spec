---
description: 区分 配置根/stock-docs（存量上下文、生成 Rules/Skills）与 配置根/req-docs（需求与技术方案、按代码实现）；禁止混用路径与链出目标
paths:
  - "**/stock-docs/**/*.md"
  - "**/req-docs/**/*.md"
---

# stock-docs 与 req-docs

- **`配置根/stock-docs/`**：PDF/初稿/终稿/架构说明等**存量源文档**；**f2s-ctx-build**、**f2s-doc-final**、**f2s-doc-arch**（架构初稿）、**f2s-doc-add**（**工作中**将**已落地能力**从多文件解析进上下文：初稿→终稿→Rules/Skills；与 f2s-doc-arch 分工不同）等技能的落盘（除 PDF→初稿等另有说明外）优先在此。Rule/Skill/docs-index 链出文档用 `../stock-docs/`、`../../stock-docs/`、`stock-docs/<文件名>.md`；`sourceDoc` 为 `<配置根>/stock-docs/<文件名>.md`。
- **`req-docs/`**（**配置根**下，如 `.cursor/req-docs/`）：需求澄清、**后端技术方案**、f2s-doc-pdf 输出的「按方案实现」MD；`implement-tech-design` 的 globs 为 `**/req-docs/**/*.md`。

完整约定与链接表见仓库 **`docs/README-目录与路径约定.md`**（包内说明；用户项目无此目录时以 init 写入的 **skills** 与 **rules** 为准）。
