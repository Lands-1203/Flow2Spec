# 目录与路径约定

**配置根**：`flow2spec init` 写入的目录（默认 **`.cursor/`**，亦可 **`.claude/`**、**`.codex/`**）。下文以 **`.cursor/`** 为例，其它 agent 将 `.cursor` 换成对应目录名即可。

**文档**：[Flow2Spec使用说明](./Flow2Spec使用说明.md) · [README-命令说明](./README-命令说明.md) · [README-体系与原理](./README-体系与原理.md) · [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md)

| 路径（逻辑） | 示例（Cursor） | 说明 |
|--------------|----------------|------|
| **stock-docs/** | `.cursor/stock-docs/` | 存量源文档（终稿/初稿/架构等）→ **f2s-ctx-build**；**f2s-doc-arch**（架构初稿）、**f2s-doc-add**（**工作中**已落地能力、多文件聚合进上下文）的初稿/终稿亦在此，**勿**与 **req-docs** 混用 |
| **req-docs/** | `.cursor/req-docs/` | 技术方案、澄清文档等 → **implement-tech-design** 按方案写代码 |
| **rules/** | `.cursor/rules/` | **main.mdc**（唯一 alwaysApply）+ 专题 `*-context.mdc` |
| **skills/** | `.cursor/skills/` | 各 `SKILL.md` |
| **template/** | `.cursor/template/` | 终稿模版、后端技术模版 |
| **docs-index.md** | `.cursor/docs-index.md` | 文档 ↔ Rules / Skills 索引表 |

**init**：创建上表目录并复制模板。**升级**：旧名 `docs/` 可改名为 `stock-docs/`；`req-docs` 须在**配置根内**，勿与 `.cursor` 同级。

### 1.1 Cursor 与 Claude Code：`rules/` 扩展名

| 配置根 | 规则文件扩展名 | 路径范围（frontmatter） | 说明 |
|--------|----------------|-------------------------|------|
| **`.cursor/`**（Cursor） | **`.mdc`** | **`globs:`** + **`alwaysApply:`** | Cursor 约定 |
| **`.claude/`**（Claude Code） | **`.md`** | **`paths:`**（无 `paths` 则与会话同载） | Claude Code 不识别 `.mdc`；`flow2spec init claude` 由模板自动转换 |

在 **`.claude/`** 下手工维护规则时，请使用 **`.md`** 与 **`paths:`**；勿复制 Cursor 的 **`globs:`** / **`.mdc`** 以免不生效。Claude Code **不会**把 **`.mdx`** 当作项目规则加载；请勿用 **`.mdx`** 作为 `rules/` 内规则扩展名。

---

## 2. 链接写法（生成 Rule / Skill / docs-index 时必守）

从 **rules/**、**skills/**、**docs-index.md** 指向 **stock-docs/** 的 **href** 必须如下（否则链接断）：

| 写入位置 | 链接 href |
|----------|-----------|
| `rules/*.mdc` | `../stock-docs/<文件名>.md` |
| `skills/<主题>/SKILL.md` | `../../stock-docs/<文件名>.md` |
| `docs-index.md` | `stock-docs/<文件名>.md`（无 `../`） |
| **sourceDoc**（frontmatter） | **`<配置根>/stock-docs/<文件名>.md`**（如 `.cursor/stock-docs/xxx.md`） |

**禁止**：Rule/Skill/docs-index 把 **req-docs** 当 stock-docs 链出；docs-index 的 href 写成 `../stock-docs/` 或裸绝对路径。

**记忆**：链出只认 **stock-docs**；Rule `../`，Skill `../../`，索引 `stock-docs/`；sourceDoc 用配置根全路径。

---

## 3. 文档产物阶段（均在 stock-docs/）

| 阶段 | 含义 | 典型名 |
|------|------|--------|
| 原稿 | 未纳入体系前的材料 | 任意 PDF、杂乱 MD |
| 初稿 | **f2s-doc-final**（PDF 首次）、**f2s-doc-arch**（架构说明），或 **f2s-doc-add**（**工作中**把**已落地能力**从多文件聚合成的初稿） | `*_初稿.md`、`*架构说明_初稿.md` 等；**f2s-doc-add** 与 **f2s-doc-arch** 分工见各自 `SKILL.md` |
| 终稿 | **f2s-doc-final** 规范输出 | `*_终稿.md` → **f2s-ctx-build** 入参 |

Rules/Skills **文件名不带 `_终稿`**。

---

## 4. 版本管理（sourceDoc 与 generatedAt）

每条 Rule、Skill 的 frontmatter：**sourceDoc**（同上表）、**generatedAt**（东八区 ISO 8601，如 `2026-01-28T20:00:00+08:00`）。  
**索源**：产物看 `sourceDoc`；文档看 **docs-index** 对应行；更新对同路径再跑 **f2s-ctx-build**。用法见 [README-体系与原理 §5](./README-体系与原理.md#5-版本管理与索源)。

---

## 5. template/

包内 **templates/template/** → init 复制到 **配置根/template/**。**f2s-doc-final** 读 `template/终稿模版.md`；**f2s-req-backend** 参考 `template/后端技术模版.md`。再次 init **覆盖** `template/`。

---

## 6. 小结

- **stock-docs** = 上下文源；**req-docs** = 实现用方案。  
- 链接层级见 §2；产物阶段见 §3；版本字段见 §4。

**相关文档**：[Flow2Spec使用说明](./Flow2Spec使用说明.md) | [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md) | [README-命令说明](./README-命令说明.md) | [README-体系与原理](./README-体系与原理.md)
