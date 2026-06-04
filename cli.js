#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const os = require("os");
const readline = require("readline");
const runInit = require("./lib/init");
const { AGENTS } = require("./lib/agents");
const {
  loadFlow2specConfig,
  CONFIG_FILENAME,
  CONFIG_FIELDS,
  getMissingConfigFields,
} = require("./lib/flow2specConfig");

const { execFileSync } = require("child_process");

const args = process.argv.slice(2);
const sub = args[0];

const agentList = Object.entries(AGENTS)
  .map(([id, { label }]) => `${id}(${label})`)
  .join(", ");

const pkg = require("./package.json");

const UPDATE_CHECK_TTL_MS = 24 * 60 * 60 * 1000;

function parseVersion(version) {
  return String(version || "")
    .replace(/^v/, "")
    .split(/[.-]/)
    .slice(0, 3)
    .map((part) => {
      const n = Number.parseInt(part, 10);
      return Number.isFinite(n) ? n : 0;
    });
}

function compareVersions(a, b) {
  const av = parseVersion(a);
  const bv = parseVersion(b);
  for (let i = 0; i < 3; i += 1) {
    const diff = (av[i] || 0) - (bv[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function updateCheckCacheFile() {
  const safeName = String(pkg.name || "flow2spec").replace(/[^a-z0-9_.-]+/gi, "_");
  return path.join(os.homedir(), ".flow2spec", `${safeName}-update-check.json`);
}

function readUpdateCheckCache() {
  const file = updateCheckCacheFile();
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!data || typeof data !== "object") return null;
    if (Date.now() - Number(data.checkedAt || 0) > UPDATE_CHECK_TTL_MS) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeUpdateCheckCache(latest) {
  try {
    const file = updateCheckCacheFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      `${JSON.stringify({ latest, checkedAt: Date.now() }, null, 2)}\n`,
      "utf8",
    );
  } catch {
    // 更新检查不能影响主命令。
  }
}

function queryLatestPackageVersion() {
  const cached = readUpdateCheckCache();
  if (cached?.latest) return cached.latest;
  const latest = execFileSync("npm", ["view", pkg.name, "version"], {
    encoding: "utf8",
    timeout: 2000,
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  if (latest) writeUpdateCheckCache(latest);
  return latest;
}

function shouldCheckForUpdates() {
  if (process.env.FLOW2SPEC_SKIP_UPDATE_CHECK === "1") return false;
  if (process.env.CI) return false;
  if (!process.stdout.isTTY) return false;
  return Boolean(pkg.name && pkg.version);
}

function printKnowledgeUpgradeHint(latest) {
  console.log(`
⚠ Flow2Spec 有新版本 v${latest}（当前 v${pkg.version}）
建议先更新包：
  flow2spec update

更新后请在 Agent 对话中执行：
  f2s-kb-upgrade

用于对齐项目知识库模板、manifest/matchers 与配置根产物；不要把单独 flow2spec init 当作知识库升级。
`);
}

function maybePrintUpdateNotice() {
  if (!shouldCheckForUpdates()) return;
  try {
    const latest = queryLatestPackageVersion();
    if (latest && compareVersions(latest, pkg.version) > 0) {
      printKnowledgeUpgradeHint(latest);
    }
  } catch {
    // 静默跳过，不能因为网络或 npm registry 影响主命令。
  }
}

const help = `
Flow2Spec - 统一知识库工作流（AI 配置入口）  v${pkg.version}

用法:
  flow2spec init [agent ...] [--reset-knowledge] [--yes]    在当前项目初始化：写入 .Knowledge 与所选 agent 入口
  flow2spec config              打印项目根 ${CONFIG_FILENAME} 的解析结果（缺省值合并后）
  flow2spec version             显示当前 flow2spec 版本
  flow2spec update              更新 flow2spec 到最新版本；更新后提示执行 f2s-kb-upgrade
  flow2spec --help              显示本说明

agent（可多个，空格分隔；省略时交互选择）：
  ${agentList}

示例:
  flow2spec init                  # 交互选择工具和配置
  flow2spec init claude           # 直接写入 .claude/，跳过工具选择
  flow2spec init cursor claude    # 同时写入 .cursor/ 与 .claude/
  flow2spec init --yes            # 跳过所有问答，使用默认值（适合 CI）
  flow2spec init --reset-knowledge  # 强制用模板覆盖 .Knowledge（谨慎）

init 会:
  1. 交互询问要初始化的 AI 工具（cursor / claude / codex，可多选）；已通过参数指定则跳过。
     传 --yes 或非 TTY 环境时跳过问答，使用默认值。
  2. 对 ${CONFIG_FILENAME} 中缺失的配置字段逐项提问（已有字段不覆盖）。
     传 --yes 时所有缺失字段使用各自默认值。
  3. 默认仅补齐 .Knowledge 缺失模板，并对路由清单做包级/结构增量对齐（manifest-routing + matcherPath 分片；关键词仅写在 matchers/*.json）；不替代 f2s-* 对业务文档与路由内容的写入。
     传 --reset-knowledge 时才会强制用模板覆盖 .Knowledge 中模板承载部分。
  4. 在各 agent 配置根写入 rules、skills（Claude 规则自动转 .md；Codex 在仓库根写入完整 AGENTS.md，.codex/ 写入指针）。
     Claude 额外写入 .claude/hooks/f2s-config-inject.js 与 .claude/settings.json（PreToolUse hook），
     在调用 f2s-* Skill 时注入配置摘要；配置缺失、JSON 无效或 hook 异常时也会注入默认语义说明，避免静默。
     Cursor 额外写入 f2s-config-check.mdc（alwaysApply），强制在技能首步读取配置文件；
     并写入 .cursor/hooks.json，在 sessionStart 自动检测知识库版本。
     Codex：仓库根 AGENTS.md（CLI 自动发现，完整条令）；.codex/AGENTS.md 为指针。
  5. 每次 init 将包内 templates/knowledge/index.md 复制到 .Knowledge/template/index.template.md，供 f2s-kb-upgrade 技能与 .Knowledge/index.md 对照；不自动改写 index.md。（「知识库升级」指 f2s-kb-upgrade 技能，init 本身不是升级命令。）
  6. 规则与技能在各 agent 配置根加载；其他模版类文件在 .Knowledge/template/ 等目录。

更多说明见 README.md 或 docs/使用说明.md
`;

if (sub === "--help" || sub === "-h" || !sub) {
  console.log(help.trim());
  process.exit(0);
}

if (sub === "version" || sub === "--version" || sub === "-v") {
  console.log(`flow2spec v${pkg.version}`);
  maybePrintUpdateNotice();
  process.exit(0);
}

if (sub === "update") {
  console.log(`当前版本: v${pkg.version}`);
  console.log("正在检查最新版本...");
  try {
    const latest = execFileSync("npm", ["view", pkg.name, "version"], {
      encoding: "utf8",
    }).trim();
    if (compareVersions(latest, pkg.version) <= 0) {
      console.log(`当前版本不低于 npm 最新版本 v${latest}`);
      process.exit(0);
    }
    console.log(`发现新版本: v${latest}`);
    console.log("正在更新...");
    execFileSync("npm", ["install", "-g", `${pkg.name}@latest`], {
      stdio: "inherit",
    });
    console.log(`\n✓ 已更新到 v${latest}`);
    console.log(`
下一步：请在需要升级的项目 Agent 对话中执行：
  f2s-kb-upgrade

用于对齐项目知识库模板、manifest/matchers 与配置根产物；不要把单独 flow2spec init 当作知识库升级。
`);
  } catch (e) {
    console.error("更新失败:", e.message || e);
    process.exit(1);
  }
  process.exit(0);
}

if (sub === "config") {
  const cwd = process.cwd();
  const abs = path.join(cwd, CONFIG_FILENAME);
  try {
    const cfg = loadFlow2specConfig(cwd);
    console.log(JSON.stringify({ configPath: abs, ...cfg }, null, 2));
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
  process.exit(0);
}

if (sub === "init") {
  const rawArgs = args.slice(1);
  const overwriteKnowledge = rawArgs.includes("--reset-knowledge");
  const skipPrompts = rawArgs.includes("--yes") || rawArgs.includes("-y");
  const agentArgs = rawArgs.filter(
    (a) => a !== "--reset-knowledge" && a !== "--yes" && a !== "-y",
  );

  const cwd = process.cwd();

  // ── 清除已输出的 n 行（用于多选 UI 重绘）
  function clearLines(n) {
    if (n <= 0) return;
    process.stdout.write(`\x1b[${n}A\x1b[0J`);
  }

  /**
   * 多选 UI（raw mode）：箭头键移动，空格选/取消，回车确认。
   * 非 TTY 环境直接返回默认选中项。
   */
  async function promptMultiSelect(title, items, defaultSelected = []) {
    if (!process.stdin.isTTY || skipPrompts) {
      return defaultSelected.length ? defaultSelected : [items[0].value];
    }

    const selected = new Set(defaultSelected.length ? defaultSelected : [items[0].value]);
    let cursor = 0;
    let rendered = 0;

    function render() {
      if (rendered > 0) clearLines(rendered);
      const lines = [];
      lines.push(`  ${title}`);
      for (let i = 0; i < items.length; i++) {
        const sel = selected.has(items[i].value);
        const check = sel ? "\x1b[32m◉\x1b[0m" : "○";
        const arr = i === cursor ? "\x1b[36m›\x1b[0m" : " ";
        const label = items[i].label.padEnd(10);
        const desc = items[i].desc ? `  \x1b[2m${items[i].desc}\x1b[0m` : "";
        lines.push(`  ${arr} ${check}  ${label}${desc}`);
      }
      lines.push("");
      lines.push("  \x1b[2m↑↓ 移动  空格 选/取消  回车 确认\x1b[0m");
      rendered = lines.length;
      process.stdout.write(lines.join("\n") + "\n");
    }

    render();

    return new Promise((resolve) => {
      function onKey(str, key) {
        if (!key) return;
        if (key.ctrl && key.name === "c") process.exit(0);

        if (key.name === "up") {
          cursor = (cursor - 1 + items.length) % items.length;
          render();
        } else if (key.name === "down") {
          cursor = (cursor + 1) % items.length;
          render();
        } else if (key.name === "space") {
          const val = items[cursor].value;
          if (selected.has(val)) selected.delete(val);
          else selected.add(val);
          render();
        } else if (key.name === "return") {
          process.stdin.removeListener("keypress", onKey);
          const result = selected.size ? [...selected] : [items[0].value];
          if (rendered > 0) clearLines(rendered);
          const labels = result
            .map((v) => items.find((i) => i.value === v)?.value)
            .join(", ");
          process.stdout.write(`  ${title}  \x1b[32m${labels}\x1b[0m\n`);
          resolve(result);
        }
      }
      process.stdin.on("keypress", onKey);
    });
  }

  /**
   * 单键 y/n 问答（raw mode）。
   * 非 TTY 或 skipPrompts 时直接返回默认值。
   */
  async function promptBooleanKey(question, defaultValue = false) {
    if (!process.stdin.isTTY || skipPrompts) return defaultValue;

    const hint = defaultValue
      ? "\x1b[2m[Y/n]\x1b[0m"
      : "\x1b[2m[y/N]\x1b[0m";
    process.stdout.write(`  ${question} ${hint} `);

    return new Promise((resolve) => {
      process.stdin.once("keypress", function (str, key) {
        if (key && key.ctrl && key.name === "c") process.exit(0);
        let result;
        if (!str || str.trim() === "" || key?.name === "return") {
          result = defaultValue;
        } else {
          result = str.trim().toLowerCase() === "y";
        }
        process.stdout.write((result ? "\x1b[32my\x1b[0m" : "n") + "\n");
        resolve(result);
      });
    });
  }

  async function collectInitOptions() {
    const needAgentPrompt = agentArgs.length === 0 && !skipPrompts;
    const missingFields = getMissingConfigFields(cwd);
    const needConfigPrompt = missingFields.length > 0;

    // 没有任何需要处理的事情
    if (!needAgentPrompt && !needConfigPrompt) {
      return { configValues: undefined, chosenAgents: agentArgs };
    }

    // --yes 模式：缺失字段直接用默认值，不弹交互
    if (skipPrompts) {
      const configValues = needConfigPrompt
        ? Object.fromEntries(missingFields.map((f) => [f.key, f.default]))
        : undefined;
      return { configValues, chosenAgents: agentArgs };
    }

    const isInteractive = process.stdin.isTTY;
    if (isInteractive) {
      readline.emitKeypressEvents(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.resume();
    }

    let chosenAgents = agentArgs;
    let configValues;

    try {
      process.stdout.write("\n");

      if (needAgentPrompt) {
        const agentItems = Object.entries(AGENTS).map(([id, { label }]) => ({
          value: id,
          label: id,
          desc: label,
        }));
        chosenAgents = await promptMultiSelect(
          "选择要初始化的 AI 工具（可多选）",
          agentItems,
          ["cursor"],
        );
      }

      if (needConfigPrompt) {
        if (needAgentPrompt) process.stdout.write("\n");
        const isFirstTime = missingFields.length === CONFIG_FIELDS.length;
        process.stdout.write(
          `  配置 ${CONFIG_FILENAME}${isFirstTime ? "（首次创建）" : "（补充新增字段）"}：\n\n`,
        );
        const values = {};
        for (const field of missingFields) {
          values[field.key] = await promptBooleanKey(
            field.question,
            field.default,
          );
        }
        configValues = values;
      }
    } finally {
      if (isInteractive) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
      }
    }

    process.stdout.write("\n");
    return { configValues, chosenAgents };
  }

  collectInitOptions()
    .then(({ configValues, chosenAgents }) =>
      runInit(cwd, chosenAgents, { overwriteKnowledge, configValues }),
    )
    .then(({ ids, knowledgeResult, routingUpgrade, indexSnapshot, projectConfig, claudeHooksResult }) => {
      const lines = ids.map((id) => {
        const { root, label } = AGENTS[id];
        if (id === "codex")
          return `  - ${root}/：（${label}）skills/、topics/、AGENTS.md（指针）；仓库根 AGENTS.md（完整）`;
        if (id === "claude") {
          const hookLine = claudeHooksResult?.settingsChanged
            ? "rules/、skills/、hooks/f2s-config-inject.js、settings.json（已写入 f2s PreToolUse hook）"
            : "rules/、skills/（settings.json 中 f2s hook 已存在，跳过）";
          return `  - ${root}/：（${label}）${hookLine}`;
        }
        return `  - ${root}/：（${label}）rules/、skills/`;
      });
      const knowledgeLine = overwriteKnowledge
        ? "  - .Knowledge/：已按 --reset-knowledge 强制覆盖模板"
        : `  - .Knowledge/：保留已有内容，补齐缺失模板（新增 ${knowledgeResult?.written || 0}，跳过 ${knowledgeResult?.skipped || 0}）`;
      const routingLine = overwriteKnowledge
        ? "  - .Knowledge/manifest-routing.json + .Knowledge/matchers/*：已随 reset 覆盖到模板版本（不再写入 manifest-matchers.json）"
        : routingUpgrade?.upgraded
          ? "  - 路由清单已与模板增量对齐"
          : "  - 路由清单已是最新能力路由，无需变更";
      const indexLine =
        indexSnapshot?.written === false
          ? `  - .Knowledge/template/index.template.md：未复制（${indexSnapshot?.reason || "skip"}）`
          : "  - .Knowledge/template/index.template.md：已从包内 templates/knowledge/index.md 复制（与 .Knowledge/index.md 对照见 f2s-kb-upgrade 技能）";
      const pc = projectConfig || {};
      const configLine = `  - ${CONFIG_FILENAME}：subAgent=${Boolean(pc.subAgent)}, switchAgentVerification=${Boolean(pc.switchAgentVerification)}`;
      console.log(`
✓ Flow2Spec init 完成
${knowledgeLine}
${routingLine}
${indexLine}
${configLine}
${lines.join("\n")}

建议阅读 README 或 docs/使用说明.md，按「规则在配置根、文档在 .Knowledge」的方式使用。
`);
      maybePrintUpdateNotice();
    })
    .catch((e) => {
      console.error(e.message || e);
      process.exit(1);
    });
} else {
  console.log(help.trim());
  process.exit(1);
}
