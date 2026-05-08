# Flow2Spec 使用说明

## 一、init 做了什么

在业务仓库根执行：

```bash
flow2spec init [cursor|claude|codex ...]
# 需要强制重置 .Knowledge 到模板时：
flow2spec init [cursor|claude|codex ...] --reset-knowledge
```

| init 做 | init 不做 |
|---------|----------|
| 补齐缺失的目录与模板文件 | 撰写或更新业务文档内容 |
| 落盘各 agent 配置根 `rules/` `skills/` | 更新 `includeAny` 业务词条 |
| `manifest-routing` + `matchers/` 包级结构对齐 | 替代 `f2s-*` 技能对业务语义的书写 |
| `--reset-knowledge` 时强制覆盖 `.Knowledge` 模板文件 | （不加此参数时）覆盖已有 `.Knowledge` 内容 |

> **`init` 与「知识库升级」是两件事**：`init` 只做结构补齐，业务语义（topics 内容、路由词条、stock-docs/req-docs）由 `f2s-doc-add`、`f2s-kb-fix`、`f2s-kb-feat`、`f2s-kb-sync`、`f2s-ctx-build` 等技能维护。跨版本升级用 `f2s-kb-upgrade`，**不要把单独 `init` 当作升级命令**。

---

## 二、目录约定

核心区分：`stock-docs/` 放沉淀文档（驱动知识路由），`req-docs/` 放技术方案（驱动编码实现），两者不互换。

完整目录说明见 [README-目录与路径约定](./README-目录与路径约定.md)。

---

## 三、典型工作场景

### 需求规划并实现

```
f2s-req-plan
```

输入技术方案文档路径或需求描述，先输出任务清单草稿并等待确认，确认后按清单实现代码。始终创建 `.task/` 任务清单，不需要配置 `changeTracking`。适合希望先看清全貌再动手、或需要跨会话追踪进度的场景。

### 变更追踪与跨会话续作

```
# 自动模式：配置开启（各技能独立）
flow2spec.config.json → changeTracking.feat / fix / implement: true

# 显式模式：调用 f2s-req-plan（规划 + 实现，不依赖配置）
f2s-req-plan
```

**自动模式**：开启后，`f2s-kb-feat` / `f2s-kb-fix` / `f2s-implement-tech-design` 执行时自动在 `.task/active/` 创建任务清单，逐步勾选，完成后归档。下次会话描述相关内容，`f2s-task` 规则自动匹配并加载剩余清单，无需重新说明上下文。

**显式模式**：直接调用 `f2s-req-plan`，不管 `changeTracking` 配置，始终创建任务清单并按清单实现代码，适合希望先确认全貌再动手的场景。

### 新需求开发

```
f2s-req-clarify → f2s-req-backend → implement-tech-design → f2s-kb-feat
```

需求已明确时可跳过 `f2s-req-clarify`，直接从 `f2s-req-backend` 开始。技术方案落入 `req-docs/` 后，由 `implement-tech-design` 规则驱动编码。

### 文档沉淀

```
新增架构文档沉淀：f2s-doc-arch → f2s-doc-final → f2s-ctx-build
PDF 文档沉淀：    f2s-doc-pdf  → f2s-doc-final → f2s-ctx-build
```

把架构说明或 PDF 技术方案纳入知识路由（生成 topics/matchers/manifest-routing）。

### PDF 方案实现

```
f2s-doc-pdf → implement-tech-design
```

拿到 PDF 技术方案后直接转 Markdown 落入 `req-docs/`，再由 `implement-tech-design` 规则驱动编码。

### 存量能力补录

```
f2s-doc-add      # 多文件聚合，从源码/文档提取
f2s-kb-sync      # 从当前会话推断已实现能力
```

代码已落地但知识库没有记录时使用。`f2s-doc-add` 适合批量导入，`f2s-kb-sync` 适合会话结束时的即时沉淀。

### 日常维护

```
f2s-kb-fix       # 修复实现或规则错误，自动同步知识库
f2s-kb-feat      # 新增能力，自动同步知识库
f2s-kb-sync      # 定期同步或补录
f2s-kb-merge     # Git 合并后解决上下文冲突
```

### 知识库跨版本升级

```
f2s-kb-migrate（V1 旧库）→ f2s-kb-upgrade
f2s-kb-upgrade（V2 已有 .Knowledge）
```

---

## 四、Agent 执行配置

通过项目根 `flow2spec.config.json` 控制，字段完整规则见 [README-命令说明 § 5) 子 Agent 配置说明](./README-命令说明.md)。

**何时开启 `subAgent: true`**：任务规模较大时（多模块并行实现、批量文档入库、大规模迁移）。开启后各技能按自身规模门槛决定是否实际拆分，未达门槛的仍在主 agent 内完成。

**何时开启 `switchAgentVerification: true`**：需要更高落盘一致性时（大规模迁移、重要方案实现）。代价是增加执行轮次；常规维护场景默认 `false` 足够。须搭配 `subAgent: true` 才能触发"主落子验"方向的交叉。

**何时开启 `changeTracking.*`**：希望每次技能执行自动留下可续作的任务清单时。各技能子项独立配置，互不影响：

```json
{
  "changeTracking": {
    "feat": true,
    "fix": false,
    "implement": true
  }
}
```

不想依赖配置、希望按需显式规划任务时，直接使用 `f2s-req-plan`。

---

## 五、规则改造建议

- 项目特化「按技术方案实现」逻辑时，优先调整 **`f2s-implement-tech-design`**：Cursor `.cursor/rules/f2s-implement-tech-design.mdc`，Claude `.claude/rules/f2s-implement-tech-design.md`；Codex 以 `.codex/AGENTS.md` 与相关 `skills/` 为准
- 再次 `init` 默认仅补齐缺失模板并做包级结构对齐，**不**替代 `f2s-*` 对业务内容的维护；需用模板重置 `.Knowledge` 时加 `--reset-knowledge`

---

## 六、技能标识

技能以 `name` 与 `description` 匹配触发，文件位于 `配置根/skills/*/SKILL.md`。

---

## 七、相关文档

- [README-命令说明](./README-命令说明.md)
- [README-目录与路径约定](./README-目录与路径约定.md)
- [README-体系与原理](./README-体系与原理.md)
- [Flow2Spec-使用案例-模拟对话](./Flow2Spec-使用案例-模拟对话.md)
