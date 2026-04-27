const path = require("path");
const fs = require("fs");
const { AGENTS, SUBDIRS, normalizeAgentIds } = require("./agents");
const { adaptRuleMdcToClaudeMd, shouldWriteClaudeStyleRules } = require("./claudeRulesAdapter");

function ensureDirs(cwd, agentRoot) {
  for (const sub of SUBDIRS) {
    const full = path.join(cwd, agentRoot, sub);
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

/** 复制 templates/rules：Cursor 保留 .mdc；Claude Code 写入 .md 并转换 frontmatter（globs→paths，去掉 alwaysApply） */
function copyRulesTemplates(cwd, agentRoot, templatesDir) {
  const rulesSrc = path.join(templatesDir, "rules");
  const rulesDest = path.join(cwd, agentRoot, "rules");
  if (!fs.existsSync(rulesSrc)) return;
  if (!fs.existsSync(rulesDest)) fs.mkdirSync(rulesDest, { recursive: true });

  const claudeStyle = shouldWriteClaudeStyleRules(agentRoot);
  if (claudeStyle) {
    for (const name of fs.readdirSync(rulesDest)) {
      if (name.endsWith(".mdc")) {
        fs.unlinkSync(path.join(rulesDest, name));
      }
    }
  }

  for (const name of fs.readdirSync(rulesSrc)) {
    const srcPath = path.join(rulesSrc, name);
    const st = fs.statSync(srcPath);
    if (st.isDirectory()) {
      copyRecursive(srcPath, path.join(rulesDest, name));
      continue;
    }
    if (!name.endsWith(".mdc")) {
      fs.copyFileSync(srcPath, path.join(rulesDest, name));
      continue;
    }
    const raw = fs.readFileSync(srcPath, "utf8");
    const body = claudeStyle ? adaptRuleMdcToClaudeMd(raw) : raw;
    const destName = claudeStyle ? name.replace(/\.mdc$/i, ".md") : name;
    fs.writeFileSync(path.join(rulesDest, destName), body, "utf8");
  }
}

/** 将 templates 下全部内容复制到指定配置根目录（如 .cursor、.claude） */
function copyTemplatesToAgentRoot(cwd, agentRoot) {
  const templatesDir = path.join(__dirname, "..", "templates");
  const destRoot = path.join(cwd, agentRoot);

  copyRulesTemplates(cwd, agentRoot, templatesDir);

  const skillsSrc = path.join(templatesDir, "skills");
  const skillsDest = path.join(destRoot, "skills");
  if (fs.existsSync(skillsSrc)) {
    for (const name of fs.readdirSync(skillsSrc)) {
      copyRecursive(path.join(skillsSrc, name), path.join(skillsDest, name));
    }
  }

  const templateSrc = path.join(templatesDir, "template");
  const templateDest = path.join(destRoot, "template");
  if (fs.existsSync(templateSrc)) {
    ensureDirs(cwd, agentRoot);
    copyRecursive(templateSrc, templateDest);
  }
}

/**
 * @param {string} cwd
 * @param {string[]} [agentIds]  不传则仅 cursor
 */
async function run(cwd, agentIds) {
  const ids = normalizeAgentIds(agentIds || []);
  for (const id of ids) {
    const root = AGENTS[id].root;
    ensureDirs(cwd, root);
    copyTemplatesToAgentRoot(cwd, root);
  }
  return ids;
}

module.exports = run;
