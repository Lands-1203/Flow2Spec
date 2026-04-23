const path = require("path");
const fs = require("fs");
const { AGENTS, SUBDIRS, normalizeAgentIds } = require("./agents");

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

/** 将 templates 下全部内容复制到指定配置根目录（如 .cursor、.claude） */
function copyTemplatesToAgentRoot(cwd, agentRoot) {
  const templatesDir = path.join(__dirname, "..", "templates");
  const destRoot = path.join(cwd, agentRoot);

  const commandsSrc = path.join(templatesDir, "commands");
  const commandsDest = path.join(destRoot, "commands");
  if (fs.existsSync(commandsSrc)) {
    ensureDirs(cwd, agentRoot);
    for (const name of fs.readdirSync(commandsSrc)) {
      if (!name.endsWith(".md")) continue;
      fs.copyFileSync(
        path.join(commandsSrc, name),
        path.join(commandsDest, name),
      );
    }
  }

  const rulesSrc = path.join(templatesDir, "rules");
  const rulesDest = path.join(destRoot, "rules");
  if (fs.existsSync(rulesSrc)) {
    for (const name of fs.readdirSync(rulesSrc)) {
      copyRecursive(path.join(rulesSrc, name), path.join(rulesDest, name));
    }
  }

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
