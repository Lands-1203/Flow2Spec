# Flow2Spec 项目里程碑

> **定位**：Flow2Spec **产品线**演进时间线（能力在双仓同步，发布与对外渠道分仓）。依据本仓 `.Knowledge/stock-docs`、Git 提交记录，并对照**开源仓**提交与目录约定整理。  
> **维护**：大版本或对外渠道变更后，增量修订对应里程碑行，并更新文首「当前版本」表。  
> **索源**：`flow2spec架构说明_终稿.md`、`Flow2Spec-任务清单与变更追踪.md`、`Flow2Spec-对外介绍演示.md` + 双仓 `git log`。

**当前包版本**（两仓 `package.json` 已对齐）：**3.0.19**

---

## 双仓分工（必读）

Flow2Spec 同源能力、**分仓发布**。里程碑表中「内部仓 / 开源仓」列标明**该里程碑主要落盘与对外动作**在哪一侧；核心代码与 `templates/` 通常两仓同步合并。

| 维度 | 携程内部仓（本仓） | 开源仓 |
| --- | --- | --- |
| **本地路径** | `项目/ai/flow2spec` | `项目/个人/Flow2Spec` |
| **Git 托管** | 携程内网 Git（`git.dev.sh.ctripcorp.com`） | [GitHub Lands-1203/Flow2Spec](https://github.com/Lands-1203/Flow2Spec) |
| **npm 包名** | `@ctrip/flow2spec` | `@double-codeing/flow2spec` |
| **快速体验** | `npm install @ctrip/flow2spec`（内网）| `npx @double-codeing/flow2spec@latest init` |
| **README 语言** | 中文为主 + `README.en.md`（内网文档链路） | **中英双入口**：`README.md` / `README.en.md`，顶部互链 |
| **演示稿源目录** | `presentations/flow2spec-intro-draft/` | `presentations/flow2spec-intro-public/`（中文）、`flow2spec-intro-public-en/`（英文） |
| **在线 PPT** | GitLab **Pages**（内网演示 URL，由 `scripts/sync-pages.sh` 从 draft 同步） | GitHub **Pages** 公网：[中文](https://lands-1203.github.io/Flow2Spec/) · [English](https://lands-1203.github.io/Flow2Spec/en/) |
| **PPT 发布脚本** | `scripts/sync-pages.sh` → `pages` 分支 | `scripts/sync-gh-pages.sh` → `gh-pages` 分支（根目录中文、`/en/` 英文） |
| **Cursor 插件** | 无独立提交流程（使用 init 落盘 rules/skills） | 分支 **`feat/cursor-directory-plugin`** + `scripts/sync-cursor-plugin.sh` → [cursor.directory](https://cursor.directory) 插件结构 |
| **英文文档** | `docs/` 以中文为主；对外英文以开源仓为准 | `docs/en/*.md` 等 **6 篇英文文档** + 演示稿英文化 |
| **产品知识库** | 本仓 `.Knowledge/`（里程碑、架构终稿等 **产品自用**） | 开源仓亦有 `.Knowledge/`（对外协作者可读） |

**关系一句话（中）**：内部仓负责携程场景下的 npm 发布与内网 Pages；开源仓负责 GitHub、公网演示、npm 公共包与 Cursor 插件目录提交。  
**One-liner (EN)**：The internal repo ships `@ctrip/flow2spec` and GitLab Pages; the open-source repo ships `@double-codeing/flow2spec`, bilingual GitHub Pages, and the Cursor Directory plugin branch.

**包名使用规则**：
- 内部仓（本仓，`flow2spec`）所有文档只能使用 `@ctrip/flow2spec` 前缀
- 开源仓（`Flow2Spec-public`）所有文档只能使用 `@double-codeing/flow2spec` 前缀
- 禁止跨仓混用包名（如在内部仓文档中写 `@double-codeing/flow2spec`）

---

## 总览时间线

| 阶段 | 时间 | 版本带 | 一句话 | 内部仓 | 开源仓 |
| --- | --- | --- | --- | --- | --- |
| M0 雏形 | 2026-02 | 1.0.x | CLI 可安装 | ● | — |
| M1 需求链路 | 2026-03 | 1.0.8–1.0.11 | 澄清 → 技术方案 | ● | — |
| M2 架构切换 | 2026-04-13 | 2.0.0 | 项目架构重组 | ● | ○ |
| **M2b OpenSpec 退场** | **2026-04-23** | 2.x | **移除 OpenSpec / opsx 全家桶** | ● | ● |
| M3 知识库 3.0 | 2026-04-29~30 | 3.0.1 beta | 机读路由（替代 OpenSpec 路线） | ● | ○ 随后同步 |
| M4 任务续作 | 2026-05-06~07 | 3.0.2 | `.task/` + req-plan | ● | ○ |
| M5 协作闭环 | 2026-05-08~09 | 3.0.3–3.0.5 | git-commit、KB Preflight | ● | ○ |
| M6 质量规范 | 2026-05-11 | 3.0.6–3.0.7 | Karpathy、归档命名 | ● | ○ |
| M7a 对内演示 | 2026-05-11~13 | 3.0.8+ | draft PPT、内网 Pages | ● | — |
| M7b 开源对外 | 2026-05-13~14 | 3.0.8–3.0.9 | 双语 PPT、英文文档、公网 Pages | ○ 合并 | ● |
| M7c Cursor 插件 | 2026-05-14~ | 插件 3.0.8 | cursor.directory 提交流 | — | ● |
| M8 CLI 运维 | 2026-05-15 | 3.0.10 | version / update | ● | ● |
| M9 路由补强 | 2026-05-15 | 3.0.11–3.0.12 | f2s-task + f2s-req-plan 包模板路由 | ● | ● |
| M10 Codex 入口 | 2026-05-16 | 3.0.13 | 根 `AGENTS.md` 自动发现 | ● | ● |
| M11 单仓里程碑 | 2026-05-18 | — | `f2s-doc-milestone` + `项目里程碑模版`（工作区变更中） | ● | ● |
| M12 文档打磨 | 2026-05-16 | 3.0.13 | 设计说明 / README 优化（无新版本号） | ● | ● |
| M13 知识工程规范 | 2026-06-03 | 3.0.14–3.0.19 | `skill-authoring` 骨架规范、`f2s-kb-addRules`、`f2s-topic-authoring` 创作侧准则 | ● | ● |

图例：**●** 主交付仓；**○** 跟随合并/同步。

---

## M0 · 产品雏形与 CLI 落地（2026-02）

| 项 | 内容 |
| --- | --- |
| **版本** | 1.0.1 → 1.0.7 |
| **主仓** | 内部仓（前身与现内部线同源） |
| **提交锚点** | `a4f80a3` 发布 1.0.1；`d0e32a7` opsx-fix；`94f7ce9` global-fix 1.0.7；`5507759` 修复 OpenSpec 自动安装 bug |
| **交付** | CLI 可 `npx` 安装；文档与模版迭代；**捆绑 OpenSpec 变更流**（`opsx-*` 命令 + `openspec-*` 技能，`init` 可落盘 `openspec/config.yaml`） |
| **开源** | 此阶段尚未分仓对外发布 |

**意义**：从命令/文档实验变为可在业务仓执行的协作工具；此时产品仍依赖 **OpenSpec 式「变更提案」工作流**，尚未过渡到自研 `f2s-*` + `.Knowledge`（见 **M2b**）。

---

## M1 · 需求到方案链路（2026-03）

| 项 | 内容 |
| --- | --- |
| **版本** | 1.0.8 → 1.0.11 |
| **交付** | **`f2s-req-clarify`**、**`f2s-req-backend`** |
| **知识库** | 架构终稿「流程三」上游能力成形 |

**意义**：PRD → `req-docs` 技术方案，与 `implement-tech-design` 闭环。

---

## M2 · 架构代际切换 v2.0（2026-04-13）

| 项 | 内容 |
| --- | --- |
| **版本** | **2.0.0** |
| **交付** | 目录与模块边界重组 |
| **知识库** | 交付物（`templates/`、`lib/`）与产品自用 `.Knowledge/` 分离 |

---

## M3 · 知识库 3.0 与机读路由（2026-04-29 ~ 04-30）★

| 项 | 内容 |
| --- | --- |
| **版本** | 3.0.1 → 3.0.2-beta2 |
| **内部仓** | `848be9a` beta 知识库；`fe0fab3` 完成 beta |
| **开源仓** | `feat: 引入 .Knowledge 与统一 f2s 规则`（约 2026-05-08 并入开源主线） |
| **交付** | `manifest-routing.json` + `matchers/*.json` + `topics/`；`match → expand → verify → act` |

**意义**：上下文工程平台（路由 + 关键词 + 主题分片）。

---

## M4 · 任务清单与显式规划（2026-05-06 ~ 05-07）

| 项 | 内容 |
| --- | --- |
| **版本** | **3.0.2** |
| **交付** | **`.task/`**、**`f2s-req-plan`**、`changeTracking` |
| **知识库** | stock-doc《Flow2Spec-任务清单与变更追踪》 |

---

## M5 · 协作闭环与执行纪律（2026-05-08 ~ 05-09）

| 项 | 内容 |
| --- | --- |
| **版本** | 3.0.3-beta.1 → **3.0.5** |
| **交付** | **`f2s-git-commit`**、**config-precheck**、KB Preflight、kb-upgrade 分流 |

---

## M6 · 质量准则与归档规范（2026-05-11）

| 项 | 内容 |
| --- | --- |
| **版本** | **3.0.6** → **3.0.7** |
| **交付** | **`f2s-coding-guide`**；`completed/<YYYYMMDD>-<task-name>/` |
| **开源仓** | `升至 3.0.7，补齐 config 预检、KB 预检与 Karpathy 全端模板` |

---

## M7a · 对内演示与内网 Pages（2026-05-11 ~ 13）

| 项 | 内容 |
| --- | --- |
| **主仓** | **携程内部仓** |
| **提交锚点** | `4d40d89` 演示草稿 + 知识库路由；`c3cf7ea` html-ppt；`417f95f` / 内网 `sync-pages.sh` |
| **交付（中文）** | `presentations/flow2spec-intro-draft/`；`scripts/sync-pages.sh` → **`pages` 分支** → GitLab Pages 重建 |
| **知识库** | 主题 `flow2spec-presentations`；stock-doc《Flow2Spec-对外介绍演示》（路径指向 **draft**） |

**意义**：内网宣讲与产品仓自检预览，不依赖公网 GitHub。

---

## M7b · 开源对外：双语文档 + 公网 PPT（2026-05-13 ~ 14）★

| 项 | 内容 |
| --- | --- |
| **主仓** | **开源仓**（能力经 dev_v3 合并回内部仓） |
| **提交锚点（开源）** | 纳入 `flow2spec-intro-public`；`sync-gh-pages.sh`；英文演示稿 + 部署脚本；6 篇英文 `docs`；README 双语演示链接 |
| **交付 — 中文 / English** | |
| | **中文**：`presentations/flow2spec-intro-public/` → GitHub Pages 根路径 |
| | **English**：`presentations/flow2spec-intro-public-en/` → Pages **`/en/`** |
| **在线地址** | [Demo 中文](https://lands-1203.github.io/Flow2Spec/) · [Live Demo EN](https://lands-1203.github.io/Flow2Spec/en/) |
| **文档 — 中文 / English** | |
| | **中文**：`README.md`、`docs/使用说明.md` 等 |
| | **English**：`README.en.md`、`docs/en/architecture.md`、`docs/en/directory-conventions.md` 等（约 6 篇）；修复触发词与 Demo 路径英文化 |
| **npm** | `@double-codeing/flow2spec` **public** 发布（`publishConfig.access: public`） |
| **内部仓差异** | 中文源稿 **`flow2spec-intro-draft/`**（无重复的 `flow2spec-intro-public/`）；英文 **`flow2spec-intro-public-en/`**；GitLab Pages 中+en |

**意义**：对外可分享、可英语路演、可 `npx @double-codeing/flow2spec` 零门槛试用。

---

## M7c · Cursor 插件目录提交（2026-05-14 ~）★

| 项 | 内容 |
| --- | --- |
| **主仓** | **仅开源仓** |
| **分支** | `feat/cursor-directory-plugin`（远程 `origin/feat/cursor-directory-plugin`） |
| **提交锚点** | `f03ac82` 新增 `cursor-plugin/`；`2ade402` 精简为 cursor.directory 插件结构；`5a33bde` README 指向主仓；`515a653` 安装后引导规则 |
| **同步脚本** | `scripts/sync-cursor-plugin.sh`：`templates/{rules,skills,hooks,knowledge}` → 插件根 `rules/`、`skills/`、`scripts/`、`knowledge/` |
| **插件清单** | `.cursor-plugin/plugin.json`（如 `displayName: Flow2Spec`，`version: 3.0.8`，`repository` 指 GitHub 主仓） |
| **提交流程（维护者）** | 1. 在开源仓主分支改 `templates/` → 2. `./scripts/sync-cursor-plugin.sh` → 3. `git push origin feat/cursor-directory-plugin` → 4. 向 **Cursor Directory / 插件市场** 提交审核 |
| **内部仓** | 业务侧仍用 `flow2spec init cursor` 落盘；**不**维护单独插件分支 |

**意义**：降低开源用户「只装 Cursor、不跑 init」的门槛；与 npm 包形成双入口。

---

## M8 · CLI 运维（2026-05-15）

| 项 | 内容 |
| --- | --- |
| **版本** | **3.0.10** |
| **提交锚点** | `6e9e456` feat(cli): `version` / `update` |
| **交付** | `init` / `config` / `version` / `update` |
| **双仓** | 内部 `@double-codeing/flow2spec`、开源 `@double-codeing/flow2spec` 同步发版 |

---

## M9 · 包模板路由补强（2026-05-15）

| 项 | 内容 |
| --- | --- |
| **版本** | **3.0.11–3.0.12** |
| **提交锚点** | `43d1136` · `a1b7bc6` · `4b428fc`（内网）/ `bbf71d2` · `554fb8f`（开源） |
| **交付** | `templates/knowledge/manifest-routing.json` 补齐 **f2s-req-plan** → **f2s-task** 依赖；产品仓 Agent 修包边界 stock-doc |
| **双仓** | ● ● |

---

## M10 · Codex 根 AGENTS（2026-05-16）

| 项 | 内容 |
| --- | --- |
| **版本** | **3.0.13**（tag `V3.0.13`） |
| **提交锚点** | `da7cab4`（内网）/ `508eef2`（开源） |
| **交付** | **init** 写入完整根 **`AGENTS.md`**；**.codex/AGENTS.md** 仅指针 |
| **双仓** | ● ● |

---

## M11 · 单仓四源里程碑技能（2026-05-18）

| 项 | 内容 |
| --- | --- |
| **版本** | 工作区变更中（尚未单独发版） |
| **交付** | 技能 **`f2s-doc-milestone`**；模版 **`项目里程碑模版.md`**；生成物 **`stock-docs/项目里程碑.md`**（各仓按本仓 git/`.task` 生成，勿与本文 M0–M12 混读） |
| **双仓** | ● ●（`templates/skills` 已对齐；manifest matcher 待补） |

---

## M12 · 文档打磨（2026-05-16）

| 项 | 内容 |
| --- | --- |
| **版本** | **3.0.13**（无新版本号跃迁） |
| **提交锚点** | `727a583` · `303be6b` · `183d07d`（内网）/ `d9b7f62` · `4fa1eee`（开源） |
| **交付** | 设计说明、README 与文档链路优化 |
| **双仓** | ● ● |

---

## M13 · 知识工程规范（2026-06-03）

| 项 | 内容 |
| --- | --- |
| **版本** | **3.0.14–3.0.19** |
| **交付** | **`skill-authoring`** topic + matcher（SKILL 骨架与命名约定）；**`f2s-kb-addRules`** 技能（用户口述规则沉淀进知识库）；**`f2s-topic-authoring`** 创作侧规则（topic 命名 / 骨架 / `topicDependencies` 判定 / DAG 最小化）；`f2s-kb-build` / `f2s-kb-add` / `f2s-kb-feat` / `f2s-kb-fix` / `f2s-kb-sync` / `f2s-kb-migrate` / `f2s-kb-rm` 各增创作侧准则引用注释；`f2s-flow2spec-unified-entry` 新增 Topic Authoring 指针段落 |
| **双仓** | ● ● |

---

## 能力域与主题对照

| 能力域 | 主题 / 技能 | 里程碑 | 备注 |
| --- | --- | --- | --- |
| OpenSpec / opsx | （已移除） | M2b | 由 f2s-* + `.Knowledge` 替代 |
| 机读路由 | manifest、matchers | M3 | 双仓一致；承接 M2b 之后的主路线 |
| 任务续作 | f2s-task、f2s-req-plan | M4、M6 | 双仓一致 |
| 对内演示 | flow2spec-presentations | M7a | 内部 draft + GitLab Pages |
| 对外演示 | flow2spec-presentations、html-ppt | M7b | 开源 public + gh-pages 双语 |
| Cursor 生态 | init cursor、插件分支 | M7c | **仅开源仓** |
| 国际化 | README.en、docs/en/*.md | M7b | **开源仓为主** |
| CLI 运维 | version、update | M8 | 双仓 |
| 包模板路由 | f2s-task、f2s-req-plan 依赖 | M9 | 双仓 |
| Codex 发现 | 根 AGENTS.md | M10 | 双仓 |
| 单仓里程碑 | f2s-doc-milestone | M11 | 生成物见各仓 `stock-docs/项目里程碑.md` |
| 文档维护 | README、设计说明 | M12 | 双仓 |
| 知识工程规范 | skill-authoring、f2s-kb-addRules、f2s-topic-authoring | M13 | 双仓 |

---

## 后续 Roadmap 候选（非历史）

| 项 | 内部仓 | 开源仓 |
| --- | --- | --- |
| 架构终稿 CLI 表与 3.0.10 对齐 | ● | ○ |
| Cursor 插件分支与 npm 版本号自动对齐 | — | ● |
| `sync-gh-pages` / `sync-pages` CI 一体化 | ○ | ● |
| 插件审核通过后 README 增加「从 Cursor 安装」入口 | ○ | ● |

---

## 双仓同步清单（维护者）

能力变更后，**内部仓**（`项目/ai/flow2spec`）与**开源仓**（`项目/个人/Flow2Spec`）按下表保持对齐；**禁止**长期只改一侧。

| 类别 | 路径 | 同步方式 |
| --- | --- | --- |
| **须一致** | `templates/skills/`、`templates/rules/`、`templates/knowledge/`、`lib/`、`cli.js` | 任一侧改完 **merge/复制** 到另一侧 |
| **须一致** | `.Knowledge/manifest-routing.json`、`matchers/`、`topics/`、`stock-docs/`（产品文档） | 以内网仓或先完成的一侧为源，覆盖另一侧 |
| **须一致** | `templates/skills/f2s-doc-milestone/`、`templates/knowledge/template/项目里程碑模版.md`、`.Knowledge/template/项目里程碑模版.md` | 技能与模版双仓一致；各仓 **`stock-docs/项目里程碑.md`** 由技能按本仓四源生成，可内容不同 |
| **Agent 约定（仅 KB）** | `stock-docs/Flow2Spec-产品仓-Agent修包边界.md` | 约束 Agent **勿改配置根**；**不**写入 `templates/` |
| **刻意分叉** | `package.json` | 仅 `name` / `homepage` / `publishConfig` 等不同 |
| **刻意分叉** | `presentations/`、`scripts/sync-*-pages.sh`、Cursor 插件分支 | 见上文「双仓分工」表 |

**自检**：`diff -rq templates lib .Knowledge` 两仓应无意外差异（除 `package.json` 与 presentations）。内网仓可执行 **`./scripts/sync-dual-repos.sh`**（默认 `项目/ai/flow2spec` → `项目/个人/Flow2Spec`，可用 `FLOW2SPEC_OSS` 覆盖）。

---

## 修订记录

| 日期 | 说明 |
| --- | --- |
| 2026-05-15 | 初版：M0–M8 |
| 2026-05-15 | 增补双仓分工、M7a/b/c（内网 Pages / 开源双语 PPT / Cursor 插件） |
| 2026-05-15 | 增补 **M2b OpenSpec 移除**（opsx 命令与 openspec 技能退场、M3 替代关系） |
| 2026-05-15 | 增补 **双仓同步清单**；开源仓对齐 templates / .Knowledge / lib / cli |
| 2026-05-18 | 当前版本 **3.0.13**；增补 M9–M12、`f2s-doc-milestone` 与单仓 `项目里程碑.md` 分工 |
| 2026-05-21 | **M12 文档维护**：`docs/` 去 `README-`/`Flow2Spec-` 前缀；英文迁入 **`docs/en/`**（去掉 `.en` 后缀）；删除「PDF 直驱实现」叙述；**双仓同步** `templates/`、`lib/`、`cli.js`、`docs/`、`.Knowledge` 与 README（`f2s-kb-upgrade` 仍保留各仓 npm 包名；`presentations/`、`package.json` 刻意分叉） |
| 2026-06-03 | **M13 知识工程规范**：`skill-authoring` topic + matcher（SKILL 骨架约定）、`f2s-kb-addRules` 技能（口述规则进 KB）、`f2s-topic-authoring` 创作侧规则（topic 命名/骨架/依赖判定/DAG）；各 SKILL 新增创作侧准则引用注释；**双仓同步** |
