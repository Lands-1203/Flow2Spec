const path = require("path");
const fs = require("fs");

const CONFIG_FILENAME = "flow2spec.config.json";

const DEFAULTS = {
  subAgent: false,
  // switchAgentVerification：false=落盘侧同会话内验；true+技能绑定=交叉验（子落盘主验/主落盘子验）
  switchAgentVerification: false,
  changeTracking: {
    feat: true,
    fix: false,
    implement: true,
  },
  updateCheck: {
    enabled: true,
  },
};

/**
 * 所有已知配置字段描述，供 init 交互提示使用。
 * 新增字段在此追加，cli.js 会自动对缺失字段发起提问。
 * 支持点号分隔的嵌套键，如 "changeTracking.feat"（对应 { changeTracking: { feat: ... } }）。
 */
const CONFIG_FIELDS = [
  {
    key: "subAgent",
    type: "boolean",
    default: false,
    question: "启用子 Agent 并行执行？（适合大型项目；小项目建议默认 N）",
  },
  {
    key: "switchAgentVerification",
    type: "boolean",
    default: false,
    question: "启用交叉验证（子 agent 落盘 → 主 agent 验；需配合技能使用）",
  },
  {
    key: "changeTracking.feat",
    type: "boolean",
    default: true,
    question: "启用变更追踪 - f2s-kb-feat（新增能力时创建可续作的任务清单）？",
  },
  {
    key: "changeTracking.fix",
    type: "boolean",
    default: false,
    question: "启用变更追踪 - f2s-kb-fix（修正能力时创建可续作的任务清单）？",
  },
  {
    key: "changeTracking.implement",
    type: "boolean",
    default: true,
    question: "启用变更追踪 - f2s-implement-tech-design（实现技术方案时创建可续作的任务清单）？",
  },
  {
    key: "updateCheck.enabled",
    type: "boolean",
    default: true,
    question: "启用每日版本更新提示（每天第一次 Agent 对话时检查是否有新版 flow2spec）？",
  },
];

function normalizeBool(value, fallback) {
  if (value === true || value === "true" || value === 1 || value === "1")
    return true;
  if (value === false || value === "false" || value === 0 || value === "0")
    return false;
  return fallback;
}

/**
 * 读取点号分隔键对应的嵌套值，如 "changeTracking.feat" → raw.changeTracking?.feat
 */
function getNestedValue(obj, dottedKey) {
  const parts = dottedKey.split(".");
  let cur = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
}

/**
 * 读取项目根 flow2spec.config.json，与 DEFAULTS 合并。
 * 文件不存在时返回默认副本（不自动创建文件）。
 * changeTracking 兼容旧版布尔值（true/false → 全部子项同值）。
 */
function loadFlow2specConfig(cwd) {
  const abs = path.join(cwd, CONFIG_FILENAME);
  const out = {
    ...DEFAULTS,
    changeTracking: { ...DEFAULTS.changeTracking },
  };
  if (!fs.existsSync(abs)) {
    return out;
  }
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch (e) {
    throw new Error(
      `${CONFIG_FILENAME} JSON 解析失败：${e.message || String(e)}`,
    );
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return out;
  }
  if (Object.prototype.hasOwnProperty.call(raw, "subAgent")) {
    out.subAgent = normalizeBool(raw.subAgent, DEFAULTS.subAgent);
  }
  if (Object.prototype.hasOwnProperty.call(raw, "switchAgentVerification")) {
    out.switchAgentVerification = normalizeBool(
      raw.switchAgentVerification,
      DEFAULTS.switchAgentVerification,
    );
  } else if (Object.prototype.hasOwnProperty.call(raw, "subAgentVerification")) {
    // 旧键名，仍读取；新落盘请用 switchAgentVerification
    out.switchAgentVerification = normalizeBool(
      raw.subAgentVerification,
      DEFAULTS.switchAgentVerification,
    );
  }
  if (Object.prototype.hasOwnProperty.call(raw, "changeTracking")) {
    const ct = raw.changeTracking;
    if (typeof ct === "boolean") {
      // 旧版布尔值：统一应用到全部子项
      out.changeTracking = { feat: ct, fix: ct, implement: ct };
    } else if (ct && typeof ct === "object" && !Array.isArray(ct)) {
      out.changeTracking = {
        feat: normalizeBool(ct.feat, DEFAULTS.changeTracking.feat),
        fix: normalizeBool(ct.fix, DEFAULTS.changeTracking.fix),
        implement: normalizeBool(ct.implement, DEFAULTS.changeTracking.implement),
      };
    }
  }
  return out;
}

/**
 * 返回配置文件中尚未存在的字段列表（用于 init 时只提示新增字段）。
 * 文件不存在时返回全部字段。支持点号嵌套键。
 */
function getMissingConfigFields(cwd) {
  const abs = path.join(cwd, CONFIG_FILENAME);
  if (!fs.existsSync(abs)) return CONFIG_FIELDS;
  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch {
    return [];
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return CONFIG_FIELDS;
  return CONFIG_FIELDS.filter((f) => {
    const parts = f.key.split(".");
    if (parts.length === 2) {
      const parent = raw[parts[0]];
      // 旧版布尔值视为已配置，不再重复询问
      if (typeof parent === "boolean") return false;
      return !parent || !Object.prototype.hasOwnProperty.call(parent, parts[1]);
    }
    return !Object.prototype.hasOwnProperty.call(raw, f.key);
  });
}

/**
 * 将点号嵌套键的 values 对象合并入 target，支持一层嵌套。
 * 例如 { "changeTracking.feat": true } → target.changeTracking.feat = true
 */
function mergeValues(target, values) {
  const result = { ...target };
  for (const [key, val] of Object.entries(values)) {
    const parts = key.split(".");
    if (parts.length === 2) {
      result[parts[0]] = {
        ...(result[parts[0]] && typeof result[parts[0]] === "object"
          ? result[parts[0]]
          : {}),
        [parts[1]]: val,
      };
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * 若项目根不存在配置文件，则写入配置（优先用 values，其次包模板，再次 DEFAULTS）。
 * 已存在时：若 values 中有缺失字段，则补写这些字段；否则不覆盖。
 * @param {object} [options.values]  用户交互收集到的字段值，优先级高于模板文件
 */
function ensureFlow2specProjectConfig(cwd, templatesDir, options = {}) {
  const { overwrite = false, values } = options;
  const dest = path.join(cwd, CONFIG_FILENAME);
  const src = path.join(templatesDir, CONFIG_FILENAME);

  if (fs.existsSync(dest) && !overwrite) {
    if (values && typeof values === "object" && Object.keys(values).length > 0) {
      let existing;
      try {
        existing = JSON.parse(fs.readFileSync(dest, "utf8"));
      } catch {
        existing = {};
      }
      const merged = mergeValues(existing, values);
      if (JSON.stringify(merged) !== JSON.stringify(existing)) {
        fs.writeFileSync(dest, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
        return { created: false, updated: true, path: dest };
      }
    }
    return { created: false, path: dest };
  }

  let base;
  if (fs.existsSync(src)) {
    try {
      base = JSON.parse(fs.readFileSync(src, "utf8"));
    } catch {
      base = { ...DEFAULTS, changeTracking: { ...DEFAULTS.changeTracking } };
    }
  } else {
    base = { ...DEFAULTS, changeTracking: { ...DEFAULTS.changeTracking } };
  }
  const merged = values && typeof values === "object" ? mergeValues(base, values) : base;
  fs.writeFileSync(dest, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  return { created: true, path: dest };
}

module.exports = {
  CONFIG_FILENAME,
  DEFAULTS,
  CONFIG_FIELDS,
  loadFlow2specConfig,
  getMissingConfigFields,
  ensureFlow2specProjectConfig,
};
