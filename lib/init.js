const path = require("path");
const fs = require("fs");
const {
  AGENTS,
  KNOWLEDGE_ROOT,
  KNOWLEDGE_SUBDIRS,
  AGENT_SUBDIRS,
  normalizeAgentIds,
} = require("./agents");
const {
  adaptRuleMdcToClaudeMd,
  shouldWriteClaudeStyleRules,
} = require("./claudeRulesAdapter");
const {
  buildCodexAgentsMd,
  buildCodexAgentsStubMd,
} = require("./codexAgentsAdapter");
const {
  loadFlow2specConfig,
  ensureFlow2specProjectConfig,
} = require("./flow2specConfig");
const { writeClaudeAgentHooks } = require("./claudeSettingsAdapter");

const KNOWLEDGE_TOPIC_TYPES = ["feature", "module", "config", "policy"];
const KNOWLEDGE_TOPIC_CONFIDENCE = ["manual", "inferred"];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureKnowledgeDirs(cwd) {
  ensureDir(path.join(cwd, KNOWLEDGE_ROOT));
  for (const sub of KNOWLEDGE_SUBDIRS) {
    ensureDir(path.join(cwd, KNOWLEDGE_ROOT, sub));
  }
}

function ensureAgentDirs(cwd, agentId) {
  const root = AGENTS[agentId].root;
  ensureDir(path.join(cwd, root));
  for (const sub of AGENT_SUBDIRS[agentId] || []) {
    ensureDir(path.join(cwd, root, sub));
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

function copyKnowledgeTemplates(cwd, templatesDir, options = {}) {
  const { overwrite = false } = options;
  const srcRoot = path.join(templatesDir, "knowledge");
  const destRoot = path.join(cwd, KNOWLEDGE_ROOT);
  if (!fs.existsSync(srcRoot)) return;
  const result = { written: 0, skipped: 0 };
  for (const name of fs.readdirSync(srcRoot)) {
    if (name === "manifest-matchers.json") {
      continue;
    }
    copyRecursivePreserve(
      path.join(srcRoot, name),
      path.join(destRoot, name),
      overwrite,
      result,
    );
  }
  return result;
}

function copyRecursivePreserve(src, dest, overwrite, result) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      copyRecursivePreserve(
        path.join(src, name),
        path.join(dest, name),
        overwrite,
        result,
      );
    }
    return;
  }
  if (!overwrite && fs.existsSync(dest)) {
    result.skipped += 1;
    return;
  }
  fs.copyFileSync(src, dest);
  result.written += 1;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function buildDefaultMatcherPath(matcherId) {
  return `${KNOWLEDGE_ROOT}/matchers/${matcherId}.json`;
}

function normalizeMatcherShardData(raw, matcherId) {
  const safeRaw =
    raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  return {
    ...safeRaw,
    id: matcherId,
    includeAny: dedupeStringArray(safeRaw.includeAny || []),
  };
}

function dedupeStringArray(values) {
  const out = [];
  const seen = new Set();
  for (const item of values || []) {
    if (typeof item !== "string") continue;
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

function unionByKey(templateList, existingList, key, mergeItem) {
  const existingMap = new Map();
  for (const item of existingList || []) {
    if (!item || typeof item !== "object") continue;
    if (!item[key] || typeof item[key] !== "string") continue;
    existingMap.set(item[key], item);
  }

  const out = [];
  const orderedKeys = [];

  for (const item of templateList || []) {
    if (!item || typeof item !== "object") continue;
    const id = item[key];
    if (!id || typeof id !== "string") continue;
    orderedKeys.push(id);
    const existing = existingMap.get(id);
    out.push(mergeItem(item, existing));
  }

  for (const item of existingList || []) {
    if (!item || typeof item !== "object") continue;
    const id = item[key];
    if (!id || typeof id !== "string") continue;
    if (orderedKeys.includes(id)) continue;
    out.push(item);
  }

  return out;
}

function mergeTopicDependencies(templateDeps, existingDeps) {
  const out = {};
  const keys = new Set([
    ...Object.keys(templateDeps || {}),
    ...Object.keys(existingDeps || {}),
  ]);
  for (const key of keys) {
    out[key] = dedupeStringArray([
      ...(templateDeps?.[key] || []),
      ...(existingDeps?.[key] || []),
    ]);
  }
  return out;
}

function normalizeTopicMetadataEntry(entry) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
  if (!KNOWLEDGE_TOPIC_TYPES.includes(entry.primary)) return null;
  const confidence =
    typeof entry.confidence === "string" &&
    KNOWLEDGE_TOPIC_CONFIDENCE.includes(entry.confidence)
      ? entry.confidence
      : null;
  if (!confidence) return null;
  const result = { primary: entry.primary, confidence };
  if (Array.isArray(entry.tags) && entry.tags.length > 0) {
    const validTags = dedupeStringArray(entry.tags).filter(
      (t) =>
        KNOWLEDGE_TOPIC_TYPES.includes(t) &&
        t !== entry.primary,
    );
    if (validTags.length > 0) result.tags = validTags;
  }
  return result;
}

function mergeTopicMetadata(templateMetadata, existingMetadata, topicPaths) {
  const out = {};
  const topicIds = new Set(Object.keys(topicPaths || {}));
  // existingMetadata 先写，templateMetadata 后写覆盖——模板优先
  for (const metadata of [existingMetadata, templateMetadata]) {
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      continue;
    }
    for (const [topicId, entry] of Object.entries(metadata)) {
      if (!topicIds.has(topicId)) continue;
      const normalized = normalizeTopicMetadataEntry(entry);
      if (!normalized) continue;
      out[topicId] = normalized;
    }
  }
  return out;
}

function buildMergedRouting(templateRouting, existingRouting) {
  const mergedTaskRules = unionByKey(
    templateRouting.taskToTopicRules,
    existingRouting.taskToTopicRules,
    "task",
    (templateRule, existingRule) => {
      if (!existingRule) return templateRule;
      const mergedMatcherId = existingRule.matcherId || templateRule.matcherId;
      return {
        ...templateRule,
        ...existingRule,
        matcherId: mergedMatcherId,
        matcherPath:
          existingRule.matcherPath ||
          templateRule.matcherPath ||
          (mergedMatcherId ? buildDefaultMatcherPath(mergedMatcherId) : null),
        topics: dedupeStringArray([
          ...(templateRule.topics || []),
          ...(existingRule.topics || []),
        ]),
      };
    },
  );

  const knownMerged = {
    version: templateRouting.version || existingRouting.version,
    knowledgeRoot:
      existingRouting.knowledgeRoot || templateRouting.knowledgeRoot,
    generatedFrom:
      existingRouting.generatedFrom || templateRouting.generatedFrom,
    matcherKey:
      existingRouting.matcherKey || templateRouting.matcherKey || "matcherId",
    sourceOfTruth:
      existingRouting.sourceOfTruth ||
      templateRouting.sourceOfTruth ||
      `${KNOWLEDGE_ROOT}/manifest-routing.json`,
    fallbackTopic:
      existingRouting.fallbackTopic || templateRouting.fallbackTopic,
    topicDependencies: mergeTopicDependencies(
      templateRouting.topicDependencies,
      existingRouting.topicDependencies,
    ),
    topicPaths: {
      ...(templateRouting.topicPaths || {}),
      ...(existingRouting.topicPaths || {}),
    },
    taskToTopicRules: mergedTaskRules,
  };
  const mergedTopicMetadata = mergeTopicMetadata(
    templateRouting.topicMetadata,
    existingRouting.topicMetadata,
    knownMerged.topicPaths,
  );
  if (Object.keys(mergedTopicMetadata).length > 0) {
    knownMerged.topicMetadata = mergedTopicMetadata;
  }

  const knownKeys = new Set(Object.keys(knownMerged));
  const extras = {};
  for (const [key, value] of Object.entries(existingRouting || {})) {
    if (knownKeys.has(key)) continue;
    extras[key] = value;
  }

  const merged = {
    ...knownMerged,
    ...extras,
  };
  delete merged.matchersFile;
  return merged;
}

function buildMergedMatchers(templateMatchers, existingMatchers) {
  const templateMap = templateMatchers.matchers || {};
  const existingMap = existingMatchers.matchers || {};
  const allMatcherIds = new Set([
    ...Object.keys(templateMap),
    ...Object.keys(existingMap),
  ]);
  const mergedMatchers = {};
  for (const matcherId of allMatcherIds) {
    const templateItem = templateMap[matcherId] || {};
    const existingItem = existingMap[matcherId] || {};
    mergedMatchers[matcherId] = {
      ...templateItem,
      ...existingItem,
      includeAny: dedupeStringArray([
        ...(templateItem.includeAny || []),
        ...(existingItem.includeAny || []),
      ]),
    };
  }

  const knownMerged = {
    version: templateMatchers.version || existingMatchers.version,
    generatedFrom:
      existingMatchers.generatedFrom || templateMatchers.generatedFrom,
    matcherKey:
      existingMatchers.matcherKey || templateMatchers.matcherKey || "matcherId",
    sourceOfTruth:
      existingMatchers.sourceOfTruth ||
      templateMatchers.sourceOfTruth ||
      `${KNOWLEDGE_ROOT}/manifest-routing.json`,
    matchers: mergedMatchers,
  };

  const knownKeys = new Set(Object.keys(knownMerged));
  const extras = {};
  for (const [key, value] of Object.entries(existingMatchers || {})) {
    if (knownKeys.has(key)) continue;
    extras[key] = value;
  }

  return {
    ...knownMerged,
    ...extras,
  };
}

function ensureRoutingMatcherPaths(routing) {
  const rules = Array.isArray(routing.taskToTopicRules)
    ? routing.taskToTopicRules
    : [];
  let changed = false;
  const nextRules = rules.map((rule) => {
    if (!rule || typeof rule !== "object") return rule;
    if (!rule.matcherId || typeof rule.matcherId !== "string") return rule;
    if (rule.matcherPath && typeof rule.matcherPath === "string") return rule;
    changed = true;
    return {
      ...rule,
      matcherPath: buildDefaultMatcherPath(rule.matcherId),
    };
  });
  if (!changed) return { routing, changed };
  return {
    routing: {
      ...routing,
      taskToTopicRules: nextRules,
    },
    changed,
  };
}

function buildMatcherIdToPathMap(routing) {
  const out = new Map();
  const rules = Array.isArray(routing.taskToTopicRules)
    ? routing.taskToTopicRules
    : [];
  for (const rule of rules) {
    if (!rule || typeof rule !== "object") continue;
    if (!rule.matcherId || typeof rule.matcherId !== "string") continue;
    const matcherPath =
      rule.matcherPath && typeof rule.matcherPath === "string"
        ? rule.matcherPath
        : buildDefaultMatcherPath(rule.matcherId);
    if (!out.has(rule.matcherId)) {
      out.set(rule.matcherId, matcherPath);
    }
  }
  return out;
}

function ensureMatcherShards(cwd, routing, mergedMatchers) {
  const matcherIdToPath = buildMatcherIdToPathMap(routing);
  const matcherMap =
    mergedMatchers?.matchers && typeof mergedMatchers.matchers === "object"
      ? mergedMatchers.matchers
      : {};

  for (const matcherId of Object.keys(matcherMap)) {
    if (!matcherIdToPath.has(matcherId)) {
      matcherIdToPath.set(matcherId, buildDefaultMatcherPath(matcherId));
    }
  }

  let changed = false;
  let writtenCount = 0;
  for (const [matcherId, matcherPath] of matcherIdToPath.entries()) {
    const matcherAbs = resolveFromCwd(cwd, matcherPath);
    ensureDir(path.dirname(matcherAbs));

    const compatMatcher = matcherMap[matcherId];
    const existingShard = fs.existsSync(matcherAbs) ? readJson(matcherAbs) : {};
    const nextShard = normalizeMatcherShardData(
      {
        ...(compatMatcher && typeof compatMatcher === "object"
          ? compatMatcher
          : {}),
        ...(existingShard && typeof existingShard === "object"
          ? existingShard
          : {}),
      },
      matcherId,
    );

    const prevRaw = fs.existsSync(matcherAbs)
      ? JSON.stringify(existingShard)
      : null;
    const nextRaw = JSON.stringify(nextShard);
    if (prevRaw === nextRaw) continue;

    writeJson(matcherAbs, nextShard);
    writtenCount += 1;
    changed = true;
  }

  return { changed, writtenCount };
}

function upgradeKnowledgeRoutingAndMatchers(cwd, templatesDir, options = {}) {
  const { overwrite = false } = options;
  if (overwrite) {
    return {
      upgraded: false,
      reason: "overwrite",
    };
  }

  const templateRoutingPath = path.join(
    templatesDir,
    "knowledge",
    "manifest-routing.json",
  );
  const templateMatchersPath = path.join(
    templatesDir,
    "knowledge",
    "manifest-matchers.json",
  );
  if (
    !fs.existsSync(templateRoutingPath) ||
    !fs.existsSync(templateMatchersPath)
  ) {
    return {
      upgraded: false,
      reason: "missing-routing-templates",
    };
  }

  const routingPath = path.join(cwd, KNOWLEDGE_ROOT, "manifest-routing.json");
  const matchersPath = path.join(cwd, KNOWLEDGE_ROOT, "manifest-matchers.json");

  const templateRouting = readJson(templateRoutingPath);
  const templateMatchers = readJson(templateMatchersPath);
  const hadRouting = fs.existsSync(routingPath);
  const hadMatchers = fs.existsSync(matchersPath);
  const existingRouting = hadRouting ? readJson(routingPath) : {};
  const existingMatchers = hadMatchers ? readJson(matchersPath) : {};

  const mergedRouting = buildMergedRouting(templateRouting, existingRouting);
  const mergedMatchers = buildMergedMatchers(
    templateMatchers,
    existingMatchers,
  );
  const {
    routing: mergedRoutingWithMatcherPath,
    changed: matcherPathBackfilled,
  } = ensureRoutingMatcherPaths(mergedRouting);
  const matcherShardUpgrade = ensureMatcherShards(
    cwd,
    mergedRoutingWithMatcherPath,
    mergedMatchers,
  );

  const oldRoutingRaw = JSON.stringify(existingRouting);
  const newRoutingRaw = JSON.stringify(mergedRoutingWithMatcherPath);
  const oldMatchersRaw = JSON.stringify(existingMatchers);
  const newMatchersRaw = JSON.stringify(mergedMatchers);

  if (!hadRouting || oldRoutingRaw !== newRoutingRaw) {
    writeJson(routingPath, mergedRoutingWithMatcherPath);
  }

  const routingChanged = !hadRouting || oldRoutingRaw !== newRoutingRaw;
  const legacyAggregateDiffers =
    hadMatchers && oldMatchersRaw !== newMatchersRaw;
  let legacyMatchersFileRemoved = false;
  if (fs.existsSync(matchersPath)) {
    try {
      fs.unlinkSync(matchersPath);
      legacyMatchersFileRemoved = true;
    } catch (e) {
      /* 保留文件时由下次 init 重试 */
    }
  }
  const upgraded =
    routingChanged ||
    legacyAggregateDiffers ||
    matcherShardUpgrade.changed ||
    legacyMatchersFileRemoved;

  return {
    upgraded,
    reason: upgraded ? "merged" : "up-to-date",
    routingChanged,
    legacyAggregateDiffers,
    legacyMatchersFileRemoved,
    matcherPathBackfilled,
    matcherShardChanged: matcherShardUpgrade.changed,
    matcherShardWritten: matcherShardUpgrade.writtenCount,
  };
}

function resolveFromCwd(cwd, maybeRelativePath) {
  return path.isAbsolute(maybeRelativePath)
    ? maybeRelativePath
    : path.join(cwd, maybeRelativePath);
}

function validateKnowledgeRouting(cwd) {
  const routingPath = path.join(cwd, KNOWLEDGE_ROOT, "manifest-routing.json");
  const matchersPath = path.join(cwd, KNOWLEDGE_ROOT, "manifest-matchers.json");
  if (!fs.existsSync(routingPath)) {
    throw new Error(
      `缺少知识库路由清单：${path.join(KNOWLEDGE_ROOT, "manifest-routing.json")}`,
    );
  }
  let routing;
  let matcherData = null;
  try {
    routing = JSON.parse(fs.readFileSync(routingPath, "utf8"));
  } catch (e) {
    throw new Error(`路由清单 JSON 解析失败：${routingPath}`);
  }
  if (fs.existsSync(matchersPath)) {
    try {
      matcherData = JSON.parse(fs.readFileSync(matchersPath, "utf8"));
    } catch (e) {
      throw new Error(`匹配清单 JSON 解析失败：${matchersPath}`);
    }
  }

  if (!routing.topicPaths || typeof routing.topicPaths !== "object") {
    throw new Error("路由清单缺少 topicPaths，无法执行主题路由。");
  }

  const topicIds = new Set(Object.keys(routing.topicPaths));
  if (topicIds.size === 0) {
    throw new Error("路由清单 topicPaths 为空，无法执行主题路由。");
  }

  for (const [topicId, topicPath] of Object.entries(routing.topicPaths)) {
    if (!topicId || typeof topicId !== "string") {
      throw new Error("topicPaths 中存在非法 topicId。");
    }
    if (!topicPath || typeof topicPath !== "string") {
      throw new Error(`topicPaths.${topicId} 必须是字符串路径。`);
    }
    const topicAbs = resolveFromCwd(cwd, topicPath);
    if (!fs.existsSync(topicAbs)) {
      throw new Error(`路由清单引用的 topic 不存在：${topicPath}`);
    }
  }

  if (routing.fallbackTopic && !topicIds.has(routing.fallbackTopic)) {
    throw new Error(
      `fallbackTopic 不存在于 topicPaths：${routing.fallbackTopic}`,
    );
  }

  if (
    routing.topicDependencies &&
    typeof routing.topicDependencies === "object"
  ) {
    for (const [topicId, deps] of Object.entries(routing.topicDependencies)) {
      if (!topicIds.has(topicId)) {
        throw new Error(`topicDependencies 引用了不存在的 topic：${topicId}`);
      }
      if (!Array.isArray(deps)) {
        throw new Error(`topicDependencies.${topicId} 必须是数组。`);
      }
      for (const depId of deps) {
        if (!topicIds.has(depId)) {
          throw new Error(
            `topicDependencies.${topicId} 引用了不存在的依赖：${depId}`,
          );
        }
      }
    }
  }

  if (routing.topicMetadata !== undefined) {
    if (
      !routing.topicMetadata ||
      typeof routing.topicMetadata !== "object" ||
      Array.isArray(routing.topicMetadata)
    ) {
      throw new Error("topicMetadata 必须是对象。");
    }
    for (const [topicId, metadata] of Object.entries(routing.topicMetadata)) {
      if (!topicIds.has(topicId)) {
        throw new Error(`topicMetadata 引用了不存在的 topic：${topicId}`);
      }
      if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
        throw new Error(`topicMetadata.${topicId} 必须是对象。`);
      }
      for (const key of Object.keys(metadata)) {
        if (!["primary", "tags", "confidence"].includes(key)) {
          throw new Error(`topicMetadata.${topicId} 包含未知字段：${key}`);
        }
      }
      if (!KNOWLEDGE_TOPIC_TYPES.includes(metadata.primary)) {
        throw new Error(
          `topicMetadata.${topicId}.primary 非法：${metadata.primary}`,
        );
      }
      if (!KNOWLEDGE_TOPIC_CONFIDENCE.includes(metadata.confidence)) {
        throw new Error(
          `topicMetadata.${topicId}.confidence 非法：${metadata.confidence}`,
        );
      }
      if (metadata.tags !== undefined) {
        if (!Array.isArray(metadata.tags)) {
          throw new Error(`topicMetadata.${topicId}.tags 必须是数组。`);
        }
        const seenTags = new Set();
        for (const tag of metadata.tags) {
          if (!KNOWLEDGE_TOPIC_TYPES.includes(tag)) {
            throw new Error(`topicMetadata.${topicId}.tags 包含非法值：${tag}`);
          }
          if (tag === metadata.primary) {
            throw new Error(
              `topicMetadata.${topicId}.tags 不应与 primary 重复：${tag}`,
            );
          }
          if (seenTags.has(tag)) {
            throw new Error(`topicMetadata.${topicId}.tags 包含重复值：${tag}`);
          }
          seenTags.add(tag);
        }
      }
    }
  }

  const matcherMap =
    matcherData?.matchers && typeof matcherData.matchers === "object"
      ? matcherData.matchers
      : null;
  if (matcherData && !matcherMap) {
    throw new Error("匹配清单缺少 matchers 对象。");
  }

  if (Array.isArray(routing.taskToTopicRules)) {
    for (const rule of routing.taskToTopicRules) {
      if (!rule || typeof rule !== "object") {
        throw new Error("taskToTopicRules 存在非法项（非对象）。");
      }
      if (!rule.task || typeof rule.task !== "string") {
        throw new Error("taskToTopicRules 每项必须包含字符串类型的 task。");
      }
      if (!Array.isArray(rule.topics) || rule.topics.length === 0) {
        throw new Error(`taskToTopicRules(${rule.task}) 必须包含非空 topics。`);
      }
      if (!rule.matcherId || typeof rule.matcherId !== "string") {
        throw new Error(`taskToTopicRules(${rule.task}) 必须包含 matcherId。`);
      }
      if (!rule.matcherPath || typeof rule.matcherPath !== "string") {
        throw new Error(`taskToTopicRules(${rule.task}) 必须包含 matcherPath。`);
      }
      const matcherAbs = resolveFromCwd(cwd, rule.matcherPath);
      if (!fs.existsSync(matcherAbs)) {
        throw new Error(
          `taskToTopicRules(${rule.task}) 引用了不存在的 matcherPath：${rule.matcherPath}`,
        );
      }
      let matcherShard;
      try {
        matcherShard = JSON.parse(fs.readFileSync(matcherAbs, "utf8"));
      } catch (e) {
        throw new Error(`matcherPath JSON 解析失败：${rule.matcherPath}`);
      }
      if (!matcherShard || typeof matcherShard !== "object") {
        throw new Error(`matcherPath 内容非法（非对象）：${rule.matcherPath}`);
      }
      if (matcherShard.id !== rule.matcherId) {
        throw new Error(
          `matcherPath(${rule.matcherPath}) 的 id 与 matcherId 不一致：${matcherShard.id} vs ${rule.matcherId}`,
        );
      }
      if (!Array.isArray(matcherShard.includeAny)) {
        throw new Error(
          `matcherPath(${rule.matcherPath}) 的 includeAny 必须为数组。`,
        );
      }
      for (const topicId of rule.topics) {
        if (!topicIds.has(topicId)) {
          throw new Error(
            `taskToTopicRules(${rule.task}) 引用了不存在的 topic：${topicId}`,
          );
        }
      }
    }
  }
}

/**
 * 将包内 templates/knowledge/index.md 原样复制到目标 cwd 下 .Knowledge/template/index.template.md，
 * 供 f2s-kb-upgrade 技能步骤 3b 与宿主仓 .Knowledge/index.md 对照；init 不修改 index.md 正文。
 * 注意：模板正文声明「.Knowledge」指宿主仓；与 flow2spec 开发仓根 .Knowledge（产品自用知识库）职责不同。
 */
function copyKnowledgeIndexTemplateSnapshot(cwd, templatesDir) {
  const src = path.join(templatesDir, "knowledge", "index.md");
  const destDir = path.join(cwd, KNOWLEDGE_ROOT, "template");
  const dest = path.join(destDir, "index.template.md");
  if (!fs.existsSync(src)) {
    return { written: false, reason: "missing-template-index" };
  }
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
  return { written: true };
}

function copyRulesTemplates(cwd, agentRoot, templatesDir) {
  const rulesSrc = path.join(templatesDir, "rules");
  const rulesDest = path.join(cwd, agentRoot, "rules");
  if (!fs.existsSync(rulesSrc)) return;
  ensureDir(rulesDest);

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

function copySkills(cwd, agentRoot, templatesDir) {
  const destRoot = path.join(cwd, agentRoot);
  const skillsSrc = path.join(templatesDir, "skills");

  if (fs.existsSync(skillsSrc)) {
    const skillsDest = path.join(destRoot, "skills");
    ensureDir(skillsDest);
    const templateNames = new Set(fs.readdirSync(skillsSrc));
    for (const name of templateNames) {
      copyRecursive(path.join(skillsSrc, name), path.join(skillsDest, name));
    }
    // 删除配置根中以 f2s- 开头、但已不存在于 templates/skills/ 的旧 skill 目录
    // 只清理 Flow2Spec 管理的 skill，不触碰用户自定义 skill
    // LEGACY_SKILLS：非 f2s- 开头的历史旧名，也需一并清理
    const LEGACY_SKILLS = new Set(["stock-docs-vs-req-docs"]);
    if (fs.existsSync(skillsDest)) {
      for (const name of fs.readdirSync(skillsDest)) {
        if ((name.startsWith("f2s-") || LEGACY_SKILLS.has(name)) && !templateNames.has(name)) {
          fs.rmSync(path.join(skillsDest, name), { recursive: true, force: true });
        }
      }
    }
  }
}

function removeLegacyAgentTemplateDir(cwd, agentRoot) {
  const templateDir = path.join(cwd, agentRoot, "template");
  if (fs.existsSync(templateDir)) {
    fs.rmSync(templateDir, { recursive: true, force: true });
  }
}

function stripMdcFrontmatter(src) {
  return src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

function writeCodexTopicMirrors(cwd, templatesDir) {
  const rulesDir = path.join(templatesDir, "rules");
  const outDir = path.join(cwd, ".codex", "topics");
  ensureDir(outDir);
  if (!fs.existsSync(rulesDir)) return;
  // 与 `.cursor/rules/*.mdc` 同源：Codex 不读 rules/，故镜像全部包模板规则到 `.codex/topics/*.md`
  const names = fs
    .readdirSync(rulesDir)
    .filter((n) => n.toLowerCase().endsWith(".mdc"))
    .sort();
  for (const name of names) {
    const srcPath = path.join(rulesDir, name);
    if (!fs.statSync(srcPath).isFile()) continue;
    const raw = fs.readFileSync(srcPath, "utf8");
    const body = stripMdcFrontmatter(raw).trimStart();
    const outName = name.replace(/\.mdc$/i, ".md");
    fs.writeFileSync(path.join(outDir, outName), body, "utf8");
  }
}

/**
 * Codex 官方从仓库根向下扫描 AGENTS.md（见 developers.openai.com/codex/guides/agents-md）。
 * 完整条令写仓库根；.codex/AGENTS.md 仅为指针，避免双份全文重复与 cwd 在 .codex 时双倍拼接。
 */
function writeCodexEntry(cwd, templatesDir, projectConfig) {
  const full = buildCodexAgentsMd(templatesDir, projectConfig);
  const stub = buildCodexAgentsStubMd(templatesDir);
  fs.writeFileSync(path.join(cwd, "AGENTS.md"), full, "utf8");
  fs.writeFileSync(path.join(cwd, ".codex", "AGENTS.md"), stub, "utf8");
  writeCodexTopicMirrors(cwd, templatesDir);
}

function writeAgentArtifacts(cwd, agentId, templatesDir, projectConfig) {
  const root = AGENTS[agentId].root;
  copySkills(cwd, root, templatesDir);
  removeLegacyAgentTemplateDir(cwd, root);
  if (agentId !== "codex") {
    copyRulesTemplates(cwd, root, templatesDir);
  } else {
    writeCodexEntry(cwd, templatesDir, projectConfig);
  }
}

/**
 * @param {string} cwd
 * @param {string[]} [agentIds]  不传则仅 cursor
 * @param {object}  [options]
 * @param {boolean} [options.overwriteKnowledge]
 * @param {object}  [options.configValues]  init 交互收集的配置字段值
 */
async function run(cwd, agentIds, options = {}) {
  const { overwriteKnowledge = false, configValues } = options;
  const ids = normalizeAgentIds(agentIds || []);
  const templatesDir = path.join(__dirname, "..", "templates");

  ensureKnowledgeDirs(cwd);
  ensureFlow2specProjectConfig(cwd, templatesDir, {
    overwrite: false,
    values: configValues,
  });
  const knowledgeResult = copyKnowledgeTemplates(cwd, templatesDir, {
    overwrite: overwriteKnowledge,
  });
  const routingUpgrade = upgradeKnowledgeRoutingAndMatchers(cwd, templatesDir, {
    overwrite: overwriteKnowledge,
  });
  validateKnowledgeRouting(cwd);

  const indexSnapshot = copyKnowledgeIndexTemplateSnapshot(cwd, templatesDir);

  const projectConfig = loadFlow2specConfig(cwd);

  const claudeHooksResult = {};
  for (const id of ids) {
    ensureAgentDirs(cwd, id);
    writeAgentArtifacts(cwd, id, templatesDir, projectConfig);
    if (id === "claude") {
      const result = writeClaudeAgentHooks(cwd, templatesDir);
      claudeHooksResult.hookScriptWritten = result.hookScriptResult?.written ?? false;
      claudeHooksResult.settingsChanged = result.settingsChanged;
    }
  }
  return {
    ids,
    knowledgeResult,
    overwriteKnowledge,
    routingUpgrade,
    indexSnapshot,
    projectConfig,
    claudeHooksResult,
  };
}

module.exports = run;
