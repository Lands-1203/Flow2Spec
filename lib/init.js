const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const DIRS = [
  ".cursor",
  ".cursor/docs",
  ".cursor/rules",
  ".cursor/skills",
  ".cursor/commands",
];

const TECH_DESIGN_TEMPLATE = "终稿模版.md";

/** 若未安装 OpenSpec 则代为全局安装 */
function ensureOpenSpec() {
  try {
    execSync("openspec --version", { encoding: "utf8", stdio: "pipe" });
    return;
  } catch (_) {
    /* 未安装，执行安装 */
  }
  console.log("正在全局安装 OpenSpec（npm install -g @fission-ai/openspec@latest）…");
  try {
    execSync("npm install -g @fission-ai/openspec@latest", { stdio: "inherit" });
  } catch (e) {
    console.error("OpenSpec 安装失败，请手动执行：npm install -g @fission-ai/openspec@latest");
    process.exit(1);
  }
}

function ensureDirs(cwd) {
  for (const d of DIRS) {
    const full = path.join(cwd, d);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  }
}

/** 递归复制目录或文件到目标，已存在则覆盖 */
function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

/** 将 templates 下全部内容复制到用户项目的 .cursor 下 */
function copyTemplatesToCursor(cwd) {
  const templatesDir = path.join(__dirname, "..", "templates");
  const cursorDir = path.join(cwd, ".cursor");

  // templates/commands/*.md -> .cursor/commands/
  const commandsSrc = path.join(templatesDir, "commands");
  const commandsDest = path.join(cursorDir, "commands");
  if (fs.existsSync(commandsSrc)) {
    ensureDirs(cwd);
    for (const name of fs.readdirSync(commandsSrc)) {
      if (!name.endsWith(".md")) continue;
      fs.copyFileSync(path.join(commandsSrc, name), path.join(commandsDest, name));
    }
  }

  // templates/rules/* -> .cursor/rules/
  const rulesSrc = path.join(templatesDir, "rules");
  const rulesDest = path.join(cursorDir, "rules");
  if (fs.existsSync(rulesSrc)) {
    for (const name of fs.readdirSync(rulesSrc)) {
      copyRecursive(path.join(rulesSrc, name), path.join(rulesDest, name));
    }
  }

  // templates/skills/* -> .cursor/skills/
  const skillsSrc = path.join(templatesDir, "skills");
  const skillsDest = path.join(cursorDir, "skills");
  if (fs.existsSync(skillsSrc)) {
    for (const name of fs.readdirSync(skillsSrc)) {
      copyRecursive(path.join(skillsSrc, name), path.join(skillsDest, name));
    }
  }

  // templates/docs/终稿模版.md -> .cursor/docs/
  const techTemplateSrc = path.join(templatesDir, "docs", TECH_DESIGN_TEMPLATE);
  if (fs.existsSync(techTemplateSrc)) {
    const docsDest = path.join(cursorDir, "docs", TECH_DESIGN_TEMPLATE);
    fs.mkdirSync(path.join(cursorDir, "docs"), { recursive: true });
    fs.copyFileSync(techTemplateSrc, docsDest);
  }
}

/** 将 openspec 文件夹复制到用户项目根目录 */
function copyOpenspecToRoot(cwd) {
  const openspecSrc = path.join(__dirname, "..", "openspec");
  const openspecDest = path.join(cwd, "openspec");
  if (!fs.existsSync(openspecSrc)) return;
  copyRecursive(openspecSrc, openspecDest);
}

async function run(cwd) {
  ensureOpenSpec();
  ensureDirs(cwd);
  copyTemplatesToCursor(cwd);
  copyOpenspecToRoot(cwd);
}

module.exports = run;
