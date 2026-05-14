# Flow2Spec - Cursor Plugin

文档驱动的 AI 协作骨架，让 Cursor Agent 在项目知识库上下文中精准协作。

## 功能

- **知识库路由** — `.Knowledge/` 目录承载 stock-docs/req-docs 与机读路由清单（manifest-routing），AI 按主题精准定位上下文
- **f2s-* 技能流程** — 18 个开箱即用的技能（需求澄清、技术方案、代码实现、知识库同步、Git 提交等）
- **变更追踪** — 可选开启 `.task/` 任务系统，持久化执行进度与用户代办
- **Karpathy 式编码准则** — 约束 AI 写代码的行为：先想清楚、简单优先、手术式修改、目标驱动

## 安装

在 Cursor 中搜索 `flow2spec` 插件并安装，或通过 [cursor.directory](https://cursor.directory) 添加。

## 配置

安装后项目根会生成 `flow2spec.config.json`：

```json
{
  "subAgent": false,
  "switchAgentVerification": false,
  "changeTracking": {
    "feat": false,
    "fix": false,
    "implement": false
  }
}
```

| 字段 | 说明 |
|------|------|
| `subAgent` | 是否允许技能拆分子 agent 并行执行 |
| `switchAgentVerification` | 是否启用交叉校验（子 agent 落盘→主 agent 验，反之亦然） |
| `changeTracking.feat` | f2s-kb-feat 技能是否创建变更追踪任务 |
| `changeTracking.fix` | f2s-kb-fix 技能是否创建变更追踪任务 |
| `changeTracking.implement` | f2s-implement-tech-design 是否启用任务清单 |

## 知识库结构

插件会在项目中建立以下知识库目录：

```
.Knowledge/
├── manifest-routing.json    # 机读路由清单（任务→主题映射）
├── index.md                 # 人读导航索引
├── matchers/                # 关键词匹配分片
├── topics/                  # 主题路由摘要
├── stock-docs/              # 已落地能力的概述文档
├── req-docs/                # 需求/技术方案文档
└── template/                # 文档模版
```

## 技能列表

| 技能 | 说明 |
|------|------|
| `f2s-req-clarify` | 需求澄清（反问直到清楚） |
| `f2s-req-backend` | 生成后端技术方案 |
| `f2s-req-plan` | 规划并实现任务（含任务清单） |
| `f2s-ctx-build` | 生成知识路由主题与索引 |
| `f2s-ctx-rm` | 删除知识主题 |
| `f2s-kb-feat` | 新增能力 + 同步知识库 |
| `f2s-kb-fix` | 修正实现 + 同步知识库 |
| `f2s-kb-sync` | 全局知识库同步 |
| `f2s-kb-merge` | 合并后上下文冲突处理 |
| `f2s-kb-migrate` | 旧版知识库迁移 |
| `f2s-kb-upgrade` | 知识库模板升级 |
| `f2s-doc-add` | 已有能力解析进知识库 |
| `f2s-doc-arch` | 生成项目架构说明 |
| `f2s-doc-final` | 转终稿模版格式 |
| `f2s-doc-pdf` | PDF 转 Markdown |
| `f2s-git-commit` | 智能 Git 提交 |
| `f2s-karpathy-guidelines` | 编码行为准则 |

## 链接

- [GitHub](https://github.com/Lands-1203/Flow2Spec)
- [npm](https://www.npmjs.com/package/@double-codeing/flow2spec)
- [使用文档](https://github.com/Lands-1203/Flow2Spec/tree/main/docs)
