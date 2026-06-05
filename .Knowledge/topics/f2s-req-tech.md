# f2s-req-tech（路由摘要）

> 长文见配置根 **`skills/f2s-req-tech/SKILL.md`**；本仓模板源见 **`templates/skills/f2s-req-tech/SKILL.md`**。

## 作用

基于已澄清的需求和项目知识库，生成可直接用于实现的技术方案文档，落盘 `.Knowledge/req-docs/`。不限于后端，适用于后端、前端、全栈、移动端、脚本工具等任意场景。

## 适用场景 / 触发词

- 用户触发 `f2s-req-tech`、生成技术方案、技术方案文档。
- 用户完成 `f2s-req-clarify` 后请求出方案。
- 用户提供需求描述或 PRD 路径，要求生成后端技术方案、接口设计、数据模型等。

## 核心规则

1. **先读模板**：执行前必须读取 `.Knowledge/template/技术方案模版.md` 作为结构参考。
2. **章节积木原则**：模板章节为可选积木，按需取用；不硬套，不为套模板强行生成无关章节。
3. **交付物与流程合一**：每个交付单元小节内同时写契约（输入/输出）与处理流程，禁止拆章重复。
4. **对齐项目约定**：读取 `.Knowledge/topics/` 和 `stock-docs/` 中相关约定，命名/结构/错误码与现有项目一致。
5. **拆子前置**：`subAgent=true` 时，主 agent 必须先产出「项目约定摘要」（< 80 行，含 6 类条款）方可拆子；未完成前置禁止拆子。

## 输出

- 默认路径：`.Knowledge/req-docs/<方案名>_技术方案.md`
- 完成后提示可据此进行代码实现（衔接 `implement-tech-design`）。

## 禁止项

- 禁止未读 `.Knowledge/template/技术方案模版.md` 直接生成文档。
- 禁止为套模板强行填写与需求无关的章节（如无消息队列时强行写消息队列章节）。
- 禁止拆章重复描述同一交付单元的流程。
- 禁止臆造与项目不符的约定；不确定时标注「待与项目约定确认」。

## 下一步

- 技能全文：`skills/f2s-req-tech/SKILL.md`
- 模板：`.Knowledge/template/技术方案模版.md`
- 前置澄清：`f2s-req-clarify`
- 实现：`implement-tech-design`（`rules/f2s-implement-tech-design.*`）
