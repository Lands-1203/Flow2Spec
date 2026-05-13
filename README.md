# Flow2Spec

Flow2Spec 用于在业务仓库初始化一套可持续的 AI 协作结构：

- **业务知识文档**统一在 `.Knowledge/`
- **规则与技能能力**保留在各 agent 配置根（`.cursor/`、`.claude/`、`.codex/`）

集中管理项目知识，同时不破坏各工具原生的 rules/skills 加载机制。

> 🎬 **在线演示**：组内分享用的 13 页 HTML PPT（脱敏版）——**<https://lands-1203.github.io/Flow2Spec/>**
> `←` `→` 翻页，`S` 打开演讲者模式。源文件见 [presentations/flow2spec-intro-public/](./presentations/flow2spec-intro-public/)。

---

## 快速开始

```bash
npx @double-codeing/flow2spec@latest init
npx @double-codeing/flow2spec@latest init cursor claude codex
```

可选：全局安装 CLI 后，可在仓库根直接使用 `flow2spec init …`（与上文等价）：

```bash
npm install -g @double-codeing/flow2spec@latest
```

`init` 完成后的目录结构：

| 路径                                             | 用途                                                                                             |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `.Knowledge/stock-docs/`                         | 架构说明、终稿等沉淀文档                                                                         |
| `.Knowledge/req-docs/`                           | 需求澄清与技术方案                                                                               |
| `.Knowledge/topics/`                             | 主题路由摘要                                                                                     |
| `.Knowledge/template/`                           | 终稿与技术方案模板                                                                               |
| `.Knowledge/manifest-routing.json` + `matchers/` | 机器可读路由与关键词索引                                                                         |
| `配置根/rules/` + `配置根/skills/`               | 各工具规则与技能入口                                                                             |
| `flow2spec.config.json`                          | 控制 `subAgent`、`switchAgentVerification`、`changeTracking`（各技能独立子项），默认均为 `false` |

> `init` 只做结构与模板补齐，业务文档内容由 `f2s-*` 技能维护。详见 [Flow2Spec使用说明](./docs/Flow2Spec使用说明.md)。

包升级后可在业务仓库用 **`/f2s-kb-upgrade`** 对齐知识库模板与路由；细则见 [使用说明](./docs/Flow2Spec使用说明.md)。

---

## 工作流全景

所有技能均以 `f2s-*` 前缀或主题名在 Agent 内触发。以下按**业务场景**分组，标明推荐执行链路与前置条件。

> **前置要求**：涉及「旧库迁移」或「包模板对齐」时，需先在本地安装最新 CLI：
>
> ```bash
> npm install -g @double-codeing/flow2spec@latest
> ```
>
> 其余场景以仓库内已初始化的规则与技能为准。

### 一、需求交付链路

从 PRD 到代码落地的完整路径。

> **任务清单控制**：`f2s-req-plan` **强制**创建任务清单；`f2s-implement-tech-design` 是否使用任务清单取决于 `changeTracking.implement` 配置。

| 场景                           | 执行链                                                                              | 产出                              |
| ------------------------------ | ----------------------------------------------------------------------------------- | --------------------------------- |
| 有 PRD，需澄清后出方案并落地   | `f2s-req-clarify` → `f2s-req-backend` → `f2s-implement-tech-design` → `f2s-kb-feat` | 澄清纪要 → 技术方案 → 实现+知识库 |
| 已有方案，需强制任务清单后实现 | `f2s-req-plan`                                     
                                 | 可确认任务清单与实现编排          |

### 二、知识沉淀链路

将非结构化信息（口述、草稿、外部文档、代码）转化为可检索的知识资产。

| 场景              | 执行链                                             | 产出                           |
| ----------------- | -------------------------------------------------- | ------------------------------ |
| 从口述/草稿到终稿 | `f2s-doc-arch` → `f2s-doc-final` → `f2s-ctx-build` | 架构初稿 → 规范终稿 → 主题路由 |
| 外部文档转知识库  | `f2s-doc-final` → `f2s-ctx-build`                  | 可检索 Markdown + 路由索引     |
| 存量代码/散稿补录 | `f2s-doc-add` 或 `f2s-kb-sync`                     | 自动提取能力 → 主题索引        |

### 三、日常协作

缺陷修复、迭代与上下文同步。

| 场景           | 技能           |
| -------------- | -------------- |
| 修复缺陷       | `f2s-kb-fix`   |
| 新增功能       | `f2s-kb-feat`  |
| 同步已实现能力 | `f2s-kb-sync`  |
| 解决合并冲突   | `f2s-kb-merge` |

### 四、仓库治理

一次性或周期性的结构化维护。

| 场景                                         | 技能             | 注意事项           |
| -------------------------------------------- | ---------------- | ------------------ |
| 旧版迁移（rules/skills 散稿 → `.Knowledge`） | `f2s-kb-migrate` | 一次性；执行前备份 |
| 模板对齐（包升级后同步）                     | `f2s-kb-upgrade` | 可重复执行         |

---

## 关键原则

1. `.Knowledge/` 只放业务文档与索引，不放规则执行文件。
2. `rules/` `skills/` 始终在配置根，保证 Claude/Cursor/Codex 按各自方式加载。
3. Codex 不读取 `rules/` 目录，通过 `.codex/AGENTS.md` + `skills/ + .codex/topics/*.md`承载约束入口。

---

## 文档导航

- [Flow2Spec使用说明](./docs/Flow2Spec使用说明.md)
- [README-命令说明](./docs/README-命令说明.md)
- [README-目录与路径约定](./docs/README-目录与路径约定.md)
- [README-体系与原理](./docs/README-体系与原理.md)
- [Flow2Spec-使用案例-模拟对话](./docs/Flow2Spec-使用案例-模拟对话.md)
- [Flow2Spec-设计说明](./docs/Flow2Spec-设计说明.md)
