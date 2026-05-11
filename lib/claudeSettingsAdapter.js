'use strict';
/**
 * 负责合并 flow2spec hook 配置到 .claude/settings.json。
 * 仅在 init --claude 时调用。
 */
const fs = require('fs');
const path = require('path');

const HOOK_COMMAND = 'node .claude/hooks/f2s-config-inject.js';

/**
 * 判断 PreToolUse 数组里是否已存在 f2s-config-inject hook。
 * @param {Array} preToolUseArr
 * @returns {boolean}
 */
function hasF2sHook(preToolUseArr) {
  if (!Array.isArray(preToolUseArr)) return false;
  for (const group of preToolUseArr) {
    if (!group || !Array.isArray(group.hooks)) continue;
    for (const h of group.hooks) {
      if (h && h.type === 'command' && String(h.command || '').includes('f2s-config-inject')) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 将 f2s PreToolUse hook 合并进现有 settings，返回新对象（不修改原对象）。
 * @param {object} existing  现有 settings（可为 {}）
 * @returns {object}
 */
function mergeF2sHook(existing) {
  const next = JSON.parse(JSON.stringify(existing || {}));
  if (!next.hooks) next.hooks = {};
  if (!next.hooks.PreToolUse) next.hooks.PreToolUse = [];

  if (hasF2sHook(next.hooks.PreToolUse)) {
    return { settings: next, changed: false };
  }

  next.hooks.PreToolUse.push({
    matcher: 'Skill',
    hooks: [{ type: 'command', command: HOOK_COMMAND }],
  });

  return { settings: next, changed: true };
}

/**
 * 读取 .claude/settings.json（不存在则返回 {}）。
 * @param {string} claudeRoot  .claude 目录绝对路径
 * @returns {object}
 */
function readSettings(claudeRoot) {
  const settingsPath = path.join(claudeRoot, 'settings.json');
  if (!fs.existsSync(settingsPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (_err) {
    return {};
  }
}

/**
 * 写入 .claude/settings.json。
 * @param {string} claudeRoot
 * @param {object} settings
 */
function writeSettings(claudeRoot, settings) {
  const settingsPath = path.join(claudeRoot, 'settings.json');
  fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, 2)}\n`, 'utf8');
}

/**
 * 将 templates/hooks/f2s-config-inject.js 复制到 .claude/hooks/。
 * @param {string} claudeRoot
 * @param {string} templatesDir
 */
function copyHookScript(claudeRoot, templatesDir) {
  const src = path.join(templatesDir, 'hooks', 'f2s-config-inject.js');
  if (!fs.existsSync(src)) return { written: false, reason: 'missing-template' };

  const hooksDir = path.join(claudeRoot, 'hooks');
  if (!fs.existsSync(hooksDir)) fs.mkdirSync(hooksDir, { recursive: true });

  const dest = path.join(hooksDir, 'f2s-config-inject.js');
  fs.copyFileSync(src, dest);
  return { written: true };
}

/**
 * 主入口：为 claude agent 配置 f2s PreToolUse hook。
 * @param {string} cwd        项目根目录
 * @param {string} templatesDir  flow2spec 包 templates 目录
 * @returns {{ hookScriptResult, settingsChanged }}
 */
function writeClaudeAgentHooks(cwd, templatesDir) {
  const claudeRoot = path.join(cwd, '.claude');
  if (!fs.existsSync(claudeRoot)) fs.mkdirSync(claudeRoot, { recursive: true });

  const hookScriptResult = copyHookScript(claudeRoot, templatesDir);

  const existing = readSettings(claudeRoot);
  const { settings, changed } = mergeF2sHook(existing);
  if (changed) {
    writeSettings(claudeRoot, settings);
  }

  return { hookScriptResult, settingsChanged: changed };
}

module.exports = { writeClaudeAgentHooks, mergeF2sHook };
