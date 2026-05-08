# Flow2Spec

Flow2Spec 用于在业务仓库初始化一套可持续的 AI 协作结构：

- **业务知识文档**统一在 `.Knowledge/`
- **规则与技能能力**保留在各 agent 配置根（`.cursor/`、`.claude/`、`.codex/`）

集中管理项目知识，同时不破坏各工具原生的 rules/skills 加载机制。

---

## 快速开始

```bash
npx @double-codeing/flow2spec init
npx @double-codeing/flow2spec init cursor claude codex
```

`init` 完成后的目录结构：

| 路径 | 用途 |
|------|------|
| `.Knowledge/stock-docs/` | 架构说明、终稿等沉淀文档 |
| `.Knowledge/req-docs/` | 需求澄清与技术方案 |
| `.Knowledge/topics/` | 主题路由摘要 |
| `.Knowledge/template/` | 终稿与技术方案模板 |
| `.Knowledge/manifest-routing.json` + `matchers/` | 机器可读路由与关键词索引 |
| `配置根/rules/` + `配置根/skills/` | 各工具规则与技能入口 |
| `flow2spec.config.json` | 控制 `subAgent`、`switchAgentVerification`、`changeTracking`（各技能独立子项），默认均为 `false` |

> `init` 只做结构与模板补齐，业务文档内容由 `f2s-*` 技能维护。详见 [Flow2Spec使用说明](./docs/Flow2Spec使用说明.md)。

---

## 工作流概览

| 场景 | 链路 |
|------|------|
| 新需求开发 | `f2s-req-clarify` → `f2s-req-backend` → `implement-tech-design` → `f2s-kb-feat` |
| 需求规划并实现（显式清单） | `f2s-req-plan` |
| 架构 文档沉淀 | `f2s-doc-arch` → `f2s-doc-final` → `f2s-ctx-build` |
| 存量能力补录 | `f2s-doc-add` 或 `f2s-kb-sync` |
| 日常维护 | `f2s-kb-fix` / `f2s-kb-feat` / `f2s-kb-sync` / `f2s-kb-merge` |
| PDF 文档沉淀 | `f2s-doc-pdf` → `f2s-doc-final` → `f2s-ctx-build` |
| PDF 方案实现 | `f2s-doc-pdf` → `implement-tech-design` |
| 旧版skills、rules知识库迁移 | `安装最新版本flow2spec` → `f2s-kb-migrate`（旧库） |
| 知识库升级 | `安装最新版本flow2spec` → `f2s-kb-upgrade` |

---

## 关键原则

1. `.Knowledge/` 只放业务文档与索引，不放规则执行文件。
2. `rules/` `skills/` 始终在配置根，保证 Claude/Cursor/Codex 按各自方式加载。
3. Codex 不读取 `rules/` 目录，通过 `.codex/AGENTS.md` + `skills/` 承载约束入口。

---

## 文档导航

- [Flow2Spec使用说明](./docs/Flow2Spec使用说明.md)
- [README-命令说明](./docs/README-命令说明.md)
- [README-目录与路径约定](./docs/README-目录与路径约定.md)
- [README-体系与原理](./docs/README-体系与原理.md)
- [Flow2Spec-使用案例-模拟对话](./docs/Flow2Spec-使用案例-模拟对话.md)
- [Flow2Spec-设计说明](./docs/Flow2Spec-设计说明.md)
- [Flow2Spec-演讲稿](./docs/Flow2Spec-演讲稿.md)
