# Flow2Spec

**文档前置 + OpenSpec 变更工作流**：在项目里一键初始化 Cursor 斜杠命令与 OpenSpec 能力，先做文档与上下文，再做结构化变更与归档。

---

## 快速开始

```bash
# 在要使用的工作项目根目录执行
npx @lands/flow2spec init
# 或全局安装后
npm install -g @lands/flow2spec
flow2spec init
```

- 若未检测到 OpenSpec，会自动安装；模板会写入当前项目的 **`.cursor/`**（commands、rules、skills、docs）并将 **openspec/** 复制到项目根。
- 完成后在 Cursor 中输入 `/` 即可使用斜杠命令与 OpenSpec 工作流。

**详细说明**：init 具体做了什么、会写入哪些命令与文件，见 [Flow2Spec使用说明 - init 做了什么](./docs/Flow2Spec使用说明.md#一init-做了什么)。

---

## 能做什么（概览）

| 类型               | 说明                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------ |
| **文档与上下文**   | 技术方案/需求转规范格式 → 生成 Rules、Skills、索引（`/generateProjectContext`、`/spec2context-md`、`/genStructureDoc` 等）                                                      |
| **PDF 转 MD**      | `/pdf4code-md`：PDF 转 Markdown(半自动流程图片转换) 并保存到 `docs/`，便于按方案实现代码                                                                                        |
| **OpenSpec 变更**  | 新建变更、快进建 artifact、按任务实现、归档（`/opsx:new`、`/opsx:ff`、`/opsx:apply`、`/opsx:archive` 等）                                                                       |
| **全局工作流**     | `/global-sync`：方案→全局 Rules/Skills→同步规范；`/global-fix`：实现后按用户指出的规则错误修正代码并同步文档与规则                                                              |
| **按技术方案实现** | 对话中提供技术方案路径，AI 按 `implement-tech-design.mdc` 执行（规则可自改，见 [使用说明 - implement 改造](./docs/Flow2Spec使用说明.md#六implement-tech-designmdc-可自行改造)） |

**推荐执行顺序**：

上下文生成阶段：
- genStructureDoc → spec2context-md → generateProjectContext
  
提问与实现环节：
- pdf4code-md → opsx-new → opsx-continue → opsx-apply → global-sync（可选）

---

## 文档导航

| 文档                                                     | 说明                                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [**Flow2Spec使用说明**](./docs/Flow2Spec使用说明.md)     | **使用手册**：init 详解、目录与产物约定、推荐顺序、典型流程、斜杠命令中英文、速查、常见问题 |
| [README-命令说明](./docs/README-命令说明.md)             | 各命令的入参、输出与推荐执行顺序（按命令分条）                                              |
| [README-目录与路径约定](./docs/README-目录与路径约定.md) | `.cursor` / `docs/` / `openspec/` 结构、文档路径与链接约定、文档产物阶段                    |
| [README-体系与原理](./docs/README-体系与原理.md)         | 整体架构、设计原则、main 与 docs-index 的关系                                               |
| [OpenSpec-介绍](./docs/OpenSpec-介绍.md)                 | OpenSpec 概念、变更与 artifact、工作流                                                      |
| [OpenSpec常见问题](./docs/OpenSpec常见问题.md)           | OpenSpec 常见问题                                                                           |

**推荐执行顺序、文档目录约定、原稿/初稿/终稿阶段** 等均在使用说明中展开，README 仅作入口与导航。

---

## 命令一览（CLI）

| 命令               | 说明                                                                    |
| ------------------ | ----------------------------------------------------------------------- |
| `flow2spec init`   | 安装 OpenSpec（若未安装）并将模板写入当前项目 `.cursor/` 与 `openspec/` |
| `flow2spec --help` | 查看用法                                                                |

斜杠命令列表、中英文对应、速查表见 [Flow2Spec使用说明](./docs/Flow2Spec使用说明.md)。
