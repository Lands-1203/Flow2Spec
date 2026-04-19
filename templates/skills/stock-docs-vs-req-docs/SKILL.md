---
name: stock-docs-vs-req-docs
description: 文档目录 stock-docs 与 req-docs 分工；触发词：stock-docs、req-docs、配置根文档、PDF 终稿、技术方案放哪、generateProjectContext 路径
---

# stock-docs 与 req-docs（技能）

## 何时使用

- 用户问「文档放哪」「PDF 转完放哪」「生成 Rules 用哪个目录」「技术方案目录」等。
- 实现或命令执行时需要选择 **`配置根/stock-docs/`** 还是 **`配置根/req-docs/`**。

## 核心对照

| 目录 | 位置 | 用途 |
|------|------|------|
| **stock-docs** | 配置根下 | 存量上下文源 → `/generateProjectContext`、终稿/初稿/架构说明 |
| **req-docs** | 配置根下（如 `.cursor/req-docs/`） | 需求与技术方案 → 按 `implement-tech-design` **写代码**、pdf4code 输出 |

## 常见错误

- 把 **仅用于实现代码** 的 **`配置根/req-docs/xxx.md`** 当作 `/generateProjectContext` 入参（应先把符合终稿范式的内容放到 **stock-docs** 再生成上下文）。
- 在 Rule 内链到 **`req-docs/`**（应链到 **stock-docs** 中的源文档）。

## 详细约定

见 Flow2Spec 包内 `docs/README-目录与路径约定.md`；用户侧以 `配置根/commands/generateProjectContext.md` 等为准。
