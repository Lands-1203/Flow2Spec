# Flow2Spec 对外介绍演示（仓库内草稿）

> **定位**：本仓 **产品自用** 的静态 HTML 演讲稿，用于对外分享 Flow2Spec 价值与用法；**不是**业务实现的 `req-docs` 输入，也不替代 `flow2spec init` 落盘的模板知识库。

## 入口与路径

| 说明 | 路径 |
| --- | --- |
| 当前草稿（随仓维护） | `presentations/flow2spec-intro-draft/` |
| 主页面 | `presentations/flow2spec-intro-draft/index.html` |
| 配套素材 | `presentations/flow2spec-intro-draft/style.css`、`presentations/flow2spec-intro-draft/market-compare.md` |

在仓库根用浏览器打开 `index.html` 即可本地预览（键盘翻页等行为由 html-ppt 运行时提供）。

## 与 html-ppt 技能的关系

草稿页通过相对路径引用本仓 **`.claude/skills/html-ppt/assets/`** 下的样式与动画资源；若移动演示目录或剥离为独立发布包，须同步调整 `index.html` 中的 `href` 或改为拷贝所需静态资源。

## 维护说明

- 内容迭代：优先改 `index.html` / `style.css` / `market-compare.md`，本 `stock-docs` 仅作**索源与路径约定**摘要。
- 路由：命中主题 `flow2spec-presentations` 时，可先读本文件再按需打开上述源码文件。
