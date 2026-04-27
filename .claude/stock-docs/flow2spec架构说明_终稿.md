# flow2spec 架构说明

## 核心概念

| 概念 | 说明 |
|------|------|
| flow2spec | CLI 工具兼模板分发系统，`npx @ctrip/flow2spec init` 在业务仓库写入 AI 工作流配置。包名 `@ctrip/flow2spec`，版本 2.2.0。 |
| 配置根 | AI 工具的配置目录，如 `.cursor/`、`.claude/`、`.codex/`；init 以此为写入目标根。 |
| agent | flow2spec 支持的 AI 工具标识（cursor / claude / codex），对应各自的配置根。 |
| templates/ | flow2spec 包内的模板源目录，init 时复制到业务仓库配置根。不随配置根分发；位于包的 `__dirname`。 |
| stock-docs/ | 配置根下的存量上下文源目录（初稿、终稿、架构说明等），由 f2s-* 技能读写。 |
| req-docs/ | 配置根下的需求与技术方案目录，`implement-tech-design` 规则的 globs 覆盖范围为 `**/req-docs/**/*.md`。 |
| rules/ | 配置根下的规则文件目录；Cursor 为 `.mdc`，Claude Code 为 `.md`（由 claudeRulesAdapter 转换）。 |
| skills/ | 配置根下的技能定义目录；每个技能一个子目录，含 `SKILL.md`，AI Agent 按场景加载。 |
| f2s-* 技能 | flow2spec 定义的 13 个工作流技能，覆盖文档生成、上下文管理、需求、知识库维护全链路。 |
| claudeRulesAdapter | `lib/claudeRulesAdapter.js`，将 Cursor 规则的 `.mdc` 格式（globs / alwaysApply）转为 Claude Code 的 `.md` 格式（paths）。 |
| docs-index.md | 由 f2s-ctx-build 生成的文档索引，写入配置根；main 规则加载后引导 AI 先查此索引再找 Rule/Skill。 |
| 闭环 | 知识库 → 对话实现 → 写回知识库的可持续循环，核心机制。 |

---

## 状态与流转

flow2spec 无运行时状态机，但项目文档产物有阶段演进：

- **初稿**（`stock-docs/<名>_初稿.md`）：由 f2s-doc-arch 或 f2s-doc-pdf 生成，人工可修改，为原始输入。
- **终稿**（`stock-docs/<名>_终稿.md`）：由 f2s-doc-final 规范化，符合《终稿模版》结构，作为 f2s-ctx-build 的输入。
- **Rules / Skills / docs-index**（`rules/*.md`、`skills/*/SKILL.md`、`docs-index.md`）：由 f2s-ctx-build 从终稿提炼生成，是 AI 上下文的最终产物。
- **知识库同步**：实现完成后通过 f2s-kb-sync 将会话现状沉淀进上述产物，完成闭环。

---

## 业务规则

**init 规则：**
- 默认 agent 为 `cursor`；可传多个 agent（空格分隔），去重后逐一写入。
- 未知 agent ID 抛出错误，中断 init。
- 写入策略为覆盖（`copyRecursive`），可重复执行用于升级模板版本。
- `stock-docs/` 与 `req-docs/` 为预建空目录，init 不会删除已有内容。

**格式转换规则（claudeRulesAdapter）：**
- 仅当 `agentRoot === ".claude"` 时触发。
- `globs:` → `paths:`；移除 `alwaysApply` 行；正文内 `.mdc` 引用改为 `.md`。
- 基于正则替换，幂等，对已转换文件重复执行无副作用。
- Claude Code 的 `rules/` 目录下已存在的 `.mdc` 文件会在转换前被删除。

**技能路径规则：**
- 所有 f2s-* 技能路径均相对配置根的父目录（业务仓库根）。
- stock-docs 落盘；Rule/Skill/docs-index 链出文档用 `../stock-docs/`；`sourceDoc` 为 `<配置根>/stock-docs/<文件名>.md`。
- req-docs 仅供 `implement-tech-design` 规则与 f2s-req-* 技能使用。

---

## 关键流程

1. **初始化（一次性）**
   入口：`npx @ctrip/flow2spec init [agent ...]` → `cli.js` → `lib/init.js`。
   步骤：校验 agent ID → `ensureDirs` 建五个子目录 → `copyRulesTemplates`（含格式转换）→ 复制 `skills/` → 复制 `template/`。
   结果：业务仓库配置根下写入完整工作流配置，可立即在 AI Agent 中使用。

2. **架构知识库沉淀**
   入口：对话中触发 f2s-doc-arch → f2s-doc-final → f2s-ctx-build。
   步骤：扫描或接收说明 → 生成 `stock-docs/*_初稿.md` → 规范化为 `stock-docs/*_终稿.md` → 提炼生成 `rules/`、`skills/`、`docs-index.md`。
   结果：AI 下次对话可通过 docs-index 渐进加载架构知识。

3. **需求驱动实现**
   入口：f2s-req-clarify（需求澄清）→ f2s-req-backend（生成技术方案）→ `req-docs/` 落盘。
   步骤：反问澄清需求 → 输出后端技术方案 MD → 开发按 `implement-tech-design` 规则实现。
   结果：技术方案与实现对齐，AI 按约定路径读取方案辅助实现。

4. **知识库维护**
   入口：f2s-kb-feat（新增能力）、f2s-kb-fix（修正规则）、f2s-kb-sync（实现后沉淀）、f2s-kb-merge（合并冲突）。
   步骤：任意时机触发 → 确认大纲 → 更新 rules/、skills/、stock-docs/、docs-index。
   结果：知识库与实现始终保持一致。

5. **已落地能力补录**
   入口：f2s-doc-add（工作中，传入多个相关文件路径）。
   步骤：解析已实现代码/文档 → 生成初稿 → 终稿 → Rules/Skills/索引一次完成。
   结果：事后补录时无需手动拆分流程。

---

## 配置 / 数据

**包分发配置（package.json `files`）：**
- 分发内容：`cli.js`、`lib/`、`templates/`、`README.md`、`docs/`
- `docs/` 为 flow2spec 自身说明，不写入业务仓库配置根

**templates/ 内容清单：**

| 路径 | 说明 |
|------|------|
| `rules/implement-tech-design.mdc` | 引导 AI 按 req-docs 方案写代码的规则 |
| `rules/stock-docs-vs-req-docs.mdc` | stock-docs 与 req-docs 职责说明规则 |
| `skills/f2s-doc-arch/SKILL.md` | 生成架构说明初稿 |
| `skills/f2s-doc-final/SKILL.md` | 初稿 → 终稿规范格式 |
| `skills/f2s-doc-pdf/SKILL.md` | PDF → Markdown |
| `skills/f2s-doc-add/SKILL.md` | 已落地能力多文件解析进知识库 |
| `skills/f2s-ctx-build/SKILL.md` | 终稿 → Rules/Skills/docs-index |
| `skills/f2s-ctx-rm/SKILL.md` | 删除文档对应的 Rules/Skills/索引 |
| `skills/f2s-req-clarify/SKILL.md` | 需求澄清 |
| `skills/f2s-req-backend/SKILL.md` | 生成后端技术文档 |
| `skills/f2s-kb-feat/SKILL.md` | 新增能力并补全文档 |
| `skills/f2s-kb-fix/SKILL.md` | 修正实现规则并同步文档 |
| `skills/f2s-kb-sync/SKILL.md` | 会话/现状沉淀进知识库 |
| `skills/f2s-kb-merge/SKILL.md` | 解决合并后上下文冲突 |
| `skills/stock-docs-vs-req-docs/SKILL.md` | 目录分工说明（技能形式） |
| `template/终稿模版.md` | f2s-doc-final 的结构参考 |
| `template/后端技术模版.md` | f2s-req-backend 的章节结构参考 |

---

## 实现位置与对接方式

**核心实现文件：**

| 文件 | 职责 |
|------|------|
| `cli.js` | CLI 入口，解析命令与 agent 参数 |
| `lib/agents.js` | Agent 注册表（ID → 配置根映射）与参数校验 |
| `lib/init.js` | 初始化主流程：建目录、复制模板、触发格式转换 |
| `lib/claudeRulesAdapter.js` | `.mdc → .md` 格式适配，仅 `.claude` 触发 |
| `templates/` | 被分发的模板源，init 时以 `__dirname` 为基准路径读取 |

**新增 agent 的接入步骤：**
1. 在 `lib/agents.js` 的 `AGENTS` 对象中添加 `{ id: { root: '.<name>', label: '...' } }`
2. 若该 agent 有特殊规则格式，在 `lib/claudeRulesAdapter.js` 增加对应适配分支并在 `lib/init.js` 的 `shouldWriteClaudeStyleRules` 判断中启用
3. `flow2spec init <id>` 即可写入

**新增/更新技能或规则：**
- 编辑 `templates/skills/<标识>/SKILL.md` 或 `templates/rules/<名>.mdc`
- 重新 `npm publish` 后，业务仓库执行 `flow2spec init` 即可更新（覆盖策略）
