#!/usr/bin/env node
'use strict';
/**
 * flow2spec PreToolUse hook — 在任何 f2s-* Skill 执行前自动注入 flow2spec.config.json。
 * 由 flow2spec init --claude 写入 .claude/hooks/f2s-config-inject.js。
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_CFG = {
  subAgent: false,
  switchAgentVerification: false,
  changeTracking: { feat: false, fix: false, implement: false },
};

/** 与 lib/flow2specConfig.js 一致，避免 hook 依赖包内路径 */
function normalizeBool(value, fallback) {
  if (value === true || value === 'true' || value === 1 || value === '1')
    return true;
  if (value === false || value === 'false' || value === 0 || value === '0')
    return false;
  return fallback;
}

function emitAdditionalContext(lines) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        additionalContext: lines.join('\n'),
      },
    }),
  );
}

function normalizeCfg(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ...DEFAULT_CFG, changeTracking: { ...DEFAULT_CFG.changeTracking } };
  }
  const ct = raw.changeTracking;
  let changeTracking = { ...DEFAULT_CFG.changeTracking };
  if (typeof ct === 'boolean') {
    changeTracking = {
      feat: normalizeBool(ct, DEFAULT_CFG.changeTracking.feat),
      fix: normalizeBool(ct, DEFAULT_CFG.changeTracking.fix),
      implement: normalizeBool(ct, DEFAULT_CFG.changeTracking.implement),
    };
  } else if (ct && typeof ct === 'object' && !Array.isArray(ct)) {
    changeTracking = {
      feat: normalizeBool(ct.feat, DEFAULT_CFG.changeTracking.feat),
      fix: normalizeBool(ct.fix, DEFAULT_CFG.changeTracking.fix),
      implement: normalizeBool(ct.implement, DEFAULT_CFG.changeTracking.implement),
    };
  }
  const switchRaw = Object.prototype.hasOwnProperty.call(raw, 'switchAgentVerification')
    ? raw.switchAgentVerification
    : raw.subAgentVerification;
  return {
    subAgent: normalizeBool(raw.subAgent, DEFAULT_CFG.subAgent),
    switchAgentVerification: normalizeBool(
      switchRaw,
      DEFAULT_CFG.switchAgentVerification,
    ),
    changeTracking,
  };
}

function buildChangeTrackingLines(skillName, cfg) {
  const lines = [];
  const ctKeyMap = {
    'f2s-kb-feat': 'feat',
    'f2s-kb-fix': 'fix',
    'f2s-implement-tech-design': 'implement',
  };
  const ctKey = ctKeyMap[skillName];
  if (ctKey === undefined) return lines;
  const ctValue = normalizeBool(
    (cfg.changeTracking ?? {})[ctKey],
    DEFAULT_CFG.changeTracking[ctKey],
  );
  lines.push('');
  if (ctValue) {
    const stepMap = {
      feat: '步骤 0',
      fix: '步骤 0',
      implement: '步骤 2.5（写入任务清单）、2.6（随步打钩 task.md）、步骤 5（归档门禁后归档）',
    };
    lines.push(
      `changeTracking.${ctKey}=true → 本技能变更追踪【必须执行】：在 ${stepMap[ctKey]} 创建或续作 .task/active/ 任务，禁止跳过。`,
    );
  } else {
    lines.push(
      `changeTracking.${ctKey}=false → 本技能变更追踪步骤跳过，不得创建 .task/ 目录。`,
    );
  }
  return lines;
}

function buildCoreLines(cfg, sourceLabel) {
  const lines = [
    `[flow2spec] ${sourceLabel}`,
    `  subAgent = ${cfg.subAgent}`,
    `  switchAgentVerification = ${cfg.switchAgentVerification}`,
    `  changeTracking = ${JSON.stringify(cfg.changeTracking)}`,
    '',
    'subAgent=true  → 按技能 SKILL.md 中 B/C 模式派子 agent 并行扫描，主 agent 合并落盘。',
    'subAgent=false → 全部在主 agent 内完成，不派子 agent。',
    'switchAgentVerification=true → 子 agent 落盘的由主 agent 校验；主 agent 落盘的由子 agent 校验（须 subAgent=true 且实际拆出子任务）。',
  ];
  return lines;
}

const chunks = [];
process.stdin.on('data', (d) => chunks.push(d));
process.stdin.on('end', () => {
  let skillName = '';
  try {
    const input = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    skillName = String(input?.tool_input?.skill || '');
  } catch (_err) {
    process.exit(0);
    return;
  }

  if (!/^f2s-/.test(skillName)) {
    process.exit(0);
    return;
  }

  const configPath = path.resolve(process.cwd(), 'flow2spec.config.json');

  try {
    if (!fs.existsSync(configPath)) {
      const cfg = { ...DEFAULT_CFG, changeTracking: { ...DEFAULT_CFG.changeTracking } };
      const lines = [
        '[flow2spec] 项目根不存在 flow2spec.config.json；按统一入口约定，缺失字段均视为 false。',
        '',
        ...buildCoreLines(cfg, '等价配置预览（建议随后 Read 或 flow2spec init 补齐该文件）：'),
        '',
        '可执行：flow2spec init（或从包模板复制 flow2spec.config.json 到项目根）。',
        ...buildChangeTrackingLines(skillName, cfg),
      ];
      emitAdditionalContext(lines);
      process.exit(0);
      return;
    }

    let raw;
    try {
      raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (parseErr) {
      const cfg = { ...DEFAULT_CFG, changeTracking: { ...DEFAULT_CFG.changeTracking } };
      const lines = [
        `[flow2spec] flow2spec.config.json 存在但 JSON 解析失败：${parseErr.message || String(parseErr)}`,
        '在修复文件前，请按以下默认安全语义执行本技能（与「文件不存在」一致）：',
        '',
        ...buildCoreLines(cfg, '等价配置（解析失败回退）'),
        ...buildChangeTrackingLines(skillName, cfg),
      ];
      emitAdditionalContext(lines);
      process.exit(0);
      return;
    }

    const cfg = normalizeCfg(raw);
    const lines = [
      ...buildCoreLines(cfg, 'flow2spec.config.json 已自动注入，执行本 f2s-* 技能前必须遵守以下配置：'),
      '',
      '仍建议用 Read(flow2spec.config.json) 与磁盘核对，尤其在刚编辑过该文件时。',
      ...buildChangeTrackingLines(skillName, cfg),
    ];
    emitAdditionalContext(lines);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    emitAdditionalContext([
      `[flow2spec] f2s-config-inject hook 未预期异常：${msg}`,
      '请手动 Read("flow2spec.config.json") 后再执行本技能；若持续失败请检查 hook 脚本与项目根路径。',
    ]);
  }
  process.exit(0);
});
