---
name: flow2spec-architecture-context
description: Flow2spec 包结构、init 机制、配置根与 templates 关系；触发词：flow2spec 架构、init 做了什么、agents、SUBDIRS、cli.js、lib/init
sourceDoc: .cursor/stock-docs/架构说明_终稿.md
generatedAt: "2026-04-27T12:00:00+08:00"
---

# Flow2Spec 包架构与 init（技能说明）

**详细文档**：[Flow2Spec（@double-codeing/flow2spec）架构说明](../../stock-docs/架构说明_终稿.md)

## 何时使用

- 说明 **`flow2spec init` 落盘内容**、**多 agent** 行为或 **默认 cursor**。
- 修改 **`cli.js` / `lib/`** 前需要快速对齐 **边界**（无 HTTP、无 DB、仅配置根下写入）。
- 解释 **`templates/`** 与仓库内 **`.cursor/`** 可能不同步时的维护注意点。

## 核心概念（表）

| 概念 | 说明 |
|------|------|
| 配置根 | `.cursor` / `.claude` / `.codex` 等，含 `rules`、`skills`、`template`、`stock-docs`、`req-docs`。 |
| 配置根的父目录 | 执行 init 时的 `cwd`，一般为业务仓库根。 |
| templates/ | 包内权威模板；复制到各 agent 的配置根。 |

## 关键流程

1. **帮助**：`flow2spec --help` / `-h` / 无参 → 帮助文本，退出 `0`。
2. **init**：解析 agent 列表 → 每 agent 建子目录 → 从 `templates/` 复制 `rules`、`skills`、`template`。
3. **消费方**：在 IDE 中按场景加载各 `f2s-*` 等 Skill；文档放 `stock-docs`/`req-docs` 见 **stock-docs-vs-req-docs** 规则。

## 业务规则要点

- Node >= 16；未知 agent 报错；复制覆盖模板文件、不删用户文档。
- `package.json` 的 `files` 决定 npm 包内容。

## 实现位置速查

| 内容 | 路径 |
|------|------|
| 入口 | `cli.js` |
| agent 与目录常量 | `lib/agents.js` |
| init | `lib/init.js` |
