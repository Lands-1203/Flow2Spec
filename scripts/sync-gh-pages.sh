#!/usr/bin/env bash
# sync-gh-pages.sh — 把 presentations/flow2spec-intro-public/ 同步到 gh-pages 分支
#
# 用法（在仓库根执行）:
#   ./scripts/sync-gh-pages.sh
#
# 做了什么:
#   1. 校验当前在 dev_v3、工作区干净
#   2. 校验 html-ppt skill assets 存在
#   3. 切 gh-pages，用 dev_v3 的 PPT 源文件 + skill assets 重新铺一遍
#   4. 改 index.html 资源路径为同级 assets/
#   5. 提交并 push
#   6. 自动切回 dev_v3

set -euo pipefail

SOURCE_BRANCH="dev_v3"
TARGET_BRANCH="gh-pages"
PUB_DIR="presentations/flow2spec-intro-public"
SKILL_ASSETS=".claude/skills/html-ppt/assets"

err() { printf '\033[31m[x]\033[0m %s\n' "$*" >&2; exit 1; }
ok()  { printf '\033[32m[ok]\033[0m %s\n' "$*"; }
info(){ printf '\033[36m[i]\033[0m %s\n' "$*"; }

# 1. 前置检查
[[ -d .git ]] || err "请在仓库根执行"

CURRENT=$(git rev-parse --abbrev-ref HEAD)
[[ "$CURRENT" == "$SOURCE_BRANCH" ]] || err "请先切到 $SOURCE_BRANCH（当前在 $CURRENT）"

if [[ -n "$(git status --porcelain)" ]]; then
  err "工作区不干净，请先提交或 stash"
fi

[[ -d "$PUB_DIR" ]]       || err "找不到 $PUB_DIR"
[[ -d "$SKILL_ASSETS" ]]  || err "找不到 $SKILL_ASSETS（需先 npx skills add html-ppt）"

# 2. 快照到临时目录
SNAP=$(mktemp -d)
trap 'rm -rf "$SNAP"' EXIT

cp "$PUB_DIR"/index.html "$PUB_DIR"/style.css "$PUB_DIR"/market-compare.md "$SNAP/"
cp -rL "$SKILL_ASSETS" "$SNAP/assets"

# 改 index.html 资源路径: ../../.claude/skills/html-ppt/assets/ → assets/
sed -i '' 's|\.\./\.\./\.claude/skills/html-ppt/assets/|assets/|g' "$SNAP/index.html"

ok "快照已准备: $SNAP"

# 3. 切 gh-pages 并更新
git checkout "$TARGET_BRANCH"

# 清空除 .git 外的内容
find . -mindepth 1 -maxdepth 1 ! -name .git ! -name .agents -exec rm -rf {} +

cp -r "$SNAP"/. .

# 写/保留 README
cat > README.md <<'MD'
# Flow2Spec · 组内分享（公开版）

13 页 HTML PPT，演示 Flow2Spec 如何让 AI 跨会话"一直知道你在做什么"。

**在线浏览**：https://lands-1203.github.io/Flow2Spec/

**键盘**：← → 翻页 · `T` 切主题 · `S` 演讲者模式 · `F` 全屏 · `O` 概览

主仓库：https://github.com/Lands-1203/Flow2Spec
MD

git add -A

if git diff --cached --quiet; then
  info "gh-pages 内容无变化，无需提交"
else
  MSG="🔄 sync: 从 $SOURCE_BRANCH @ $(git rev-parse --short "$SOURCE_BRANCH")"
  git commit -m "$MSG"
  git push origin "$TARGET_BRANCH"
  ok "已推送: $MSG"
fi

git checkout "$SOURCE_BRANCH"
ok "已切回 $SOURCE_BRANCH · 在线演示 https://lands-1203.github.io/Flow2Spec/"
