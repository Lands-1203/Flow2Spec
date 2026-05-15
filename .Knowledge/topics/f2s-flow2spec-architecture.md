# flow2spec-architecture

## 执行边界

- 本主题用于解释 Flow2Spec 架构与职责边界。
- 强制执行口径以配置根规则/入口为准：Cursor/Claude 以 `rules/` 为准，Codex 以 `.codex/AGENTS.md` 为准。

## 目标

当用户询问 Flow2Spec 包结构、`init` 行为或目录职责时，先按本主题快速对齐架构边界，再回答具体实现问题。

## 核心结构

- `cli.js`：命令入口，解析子命令（`init`、`config`、`version`、`update`）、交互问答、flags（`--reset-knowledge`、`--yes`）。
- `lib/agents.js`：agent 列表（cursor / claude / codex）、目录常量、参数归一化。
- `lib/init.js`：目录准备、模板复制、manifest 校验、多 agent 落盘；接收 `configValues` 参数并传给 `ensureFlow2specProjectConfig`。
- `lib/flow2specConfig.js`：配置读写；含 `CONFIG_FIELDS`（字段元数据，迭代维护的唯一入口）、`getMissingConfigFields()`、`loadFlow2specConfig()`、`ensureFlow2specProjectConfig()`。
- `templates/`：规则、技能、知识模板源，`init` 时写入目标仓库。

## CLI 子命令

| 子命令 | 说明 |
| --- | --- |
| `init [agent…] [--reset-knowledge] [--yes]` | 初始化/对齐项目结构 |
| `config` | 打印解析后的 `flow2spec.config.json` |
| `version` / `--version` / `-v` | 输出当前安装的 flow2spec 版本号 |
| `update` | 检查并更新到最新版（`npm install -g @ctrip/flow2spec@latest`） |

## init 初始化行为

`flow2spec init` 按以下顺序执行：

1. **交互选择 AI 工具**（若未通过命令行参数指定）
   - raw mode 多选 UI：↑↓ 移动，空格选/取消，回车确认；默认选中 cursor。
   - 已通过参数指定（如 `flow2spec init claude`）时跳过。
2. **交互配置 `flow2spec.config.json`**
   - 调用 `getMissingConfigFields()` 检查现有配置缺哪些字段，只对缺失项逐一提问（y/N 单键）。
   - 文件不存在时提示「首次创建」，字段已全部存在时跳过全部问答。
   - 老项目升级后再跑 `init`，只补问新增字段，已有值不覆盖。
3. **补齐 `.Knowledge` 缺失模板**（默认不覆盖已有业务内容；`--reset-knowledge` 时强制覆盖）
4. **对路由清单做增量对齐**（`manifest-routing.json` + `matchers/*.json` 分片）
5. **写入各配置根**（`rules/skills` 或 Codex `AGENTS.md`）

**`--yes` 标志**：跳过所有交互问答，缺失字段直接写默认值（均 `false`），适合 CI / 管道调用。

## CONFIG_FIELDS 迭代维护

`lib/flow2specConfig.js` 中的 `CONFIG_FIELDS` 数组是配置字段的唯一描述入口，每项包含：

```js
{
  key: "fieldName",       // JSON 键名；支持点号嵌套如 "changeTracking.feat"
  type: "boolean",        // 当前仅 boolean
  default: false,         // 默认值
  question: "...",        // init 时展示给用户的问题文本
}
```

**新增配置字段时只需在此追加一项**，`cli.js` 的增量问答逻辑自动覆盖。

点号嵌套键（如 `changeTracking.feat`）对应 JSON 中的嵌套对象：`{ "changeTracking": { "feat": false } }`。`getMissingConfigFields()` 和 `ensureFlow2specProjectConfig()` 均通过 `mergeValues()` 辅助函数处理嵌套写入，调用方无需感知嵌套结构。

## changeTracking 配置结构

`changeTracking` 是嵌套对象，各技能独立控制：

```json
{
  "changeTracking": {
    "feat": false,
    "fix": false,
    "implement": false
  }
}
```

- `feat`：控制 `f2s-kb-feat` 是否在执行前后创建/归档任务清单
- `fix`：控制 `f2s-kb-fix` 是否在执行前后创建/归档任务清单
- `implement`：控制 `f2s-implement-tech-design` 是否在执行前后创建/归档任务清单

旧版布尔值（`"changeTracking": true/false`）向下兼容，`loadFlow2specConfig()` 自动将其展开为三项全开/全关。

`f2s-req-plan` 不受此配置约束，始终创建任务清单。

## 目录分层

1. 知识层：`.Knowledge/`（`stock-docs/req-docs/topics/template/index/manifest`）。
2. 执行层：配置根（`.cursor/.claude/.codex`），承载 `rules/skills` 或 `AGENTS.md`。
3. 默认 `init` 仅补齐 `.Knowledge` 缺失模板；传 `--reset-knowledge` 时强制覆盖。

## 回答原则

- 先解释"知识层 vs 执行层"分工，再展开到具体文件职责。
- 讲 `init` 时说明：默认补齐 vs `--reset-knowledge` 强制覆盖；交互问答 vs `--yes` 静默。
- 讲配置字段扩展时，指向 `lib/flow2specConfig.js` 的 `CONFIG_FIELDS`，不在 `cli.js` 里搜逻辑。
- 涉及路径冲突时，以 `.Knowledge` 主口径和 `manifest` 路由为准。
