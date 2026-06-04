#!/usr/bin/env node
'use strict';
/**
 * flow2spec UserPromptSubmit hook — 只读取 SessionStart 已写入的更新检测缓存。
 * 不查 npm、不做完整版本检测；仅在缓存显示仍需升级时，把提示注入本次用户消息。
 */
const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(process.cwd(), '.Knowledge', 'manifest-routing.json');
const CACHE_FILE = path.join(process.cwd(), '.Knowledge', 'update-check.json');

function readHookInput() {
  try {
    if (process.stdin.isTTY) return {};
    const raw = fs.readFileSync(0, 'utf8').trim();
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === 'object' ? data : {};
  } catch (_) { return {}; }
}

function getHookEventName(input) {
  const name = String((input && input.hook_event_name) || '').trim();
  return name || 'UserPromptSubmit';
}

function getSessionId(input) {
  const id = String((input && input.session_id) || '').trim();
  return id || '';
}

function readCache() {
  if (!fs.existsSync(CACHE_FILE)) return null;
  try {
    const d = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (!d || typeof d !== 'object') return null;
    const checkedAt = Number(d.checkedAt || 0);
    if (!checkedAt) return null;
    if (new Date(checkedAt).toDateString() !== new Date().toDateString()) return null;
    return d;
  } catch (_) { return null; }
}

function getManifestVersion() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')).version || null;
  } catch (_) { return null; }
}

function getProjectName() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    if (pkg && pkg.name) return String(pkg.name);
  } catch (_) {}
  return path.basename(process.cwd());
}

function parseVer(v) {
  return String(v || '').replace(/^v/, '').split(/[.-]/).slice(0, 3).map((p) => {
    const n = Number.parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

function cmpVer(a, b) {
  const av = parseVer(a), bv = parseVer(b);
  for (let i = 0; i < 3; i++) {
    const d = (av[i] || 0) - (bv[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

function buildNotice(latestNpm, manifestVersion) {
  return [
    `[flow2spec] 当前项目「${getProjectName()}」的知识库版本是 v${manifestVersion}，低于最新包版本 v${latestNpm}。`,
    `如需对齐模板与路由，可以执行 f2s-kb-upgrade skill。`,
  ].join('');
}

function isEnabled() {
  try {
    const cfg = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'flow2spec.config.json'), 'utf8'
    ));
    const uc = cfg && cfg.updateCheck;
    if (uc && typeof uc.enabled === 'boolean') return uc.enabled;
    return true;
  } catch (_) { return true; }
}

function deleteCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE);
  } catch (_) {}
}

function isPromptAlreadyNotified(cache, input) {
  const sessionId = getSessionId(input);
  if (!sessionId) return false;
  const sessions = cache && cache.notifiedSessions;
  return Boolean(sessions && typeof sessions === 'object' && sessions[sessionId]);
}

function markPromptNotified(cache, input) {
  const sessionId = getSessionId(input);
  if (!sessionId) return;
  try {
    const next = Object.assign({}, cache || {});
    const sessions = next.notifiedSessions && typeof next.notifiedSessions === 'object'
      ? next.notifiedSessions
      : {};
    sessions[sessionId] = Date.now();
    next.notifiedSessions = sessions;
    fs.writeFileSync(CACHE_FILE, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  } catch (_) {}
}

function emitNotice(notice, hookEventName) {
  process.stdout.write(
    JSON.stringify({
      additional_context: notice,
      hookSpecificOutput: {
        hookEventName,
        additionalContext: notice,
      },
    }) + '\n'
  );
}

function main() {
  if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) return;
  if (!isEnabled()) return;

  const cache = readCache();
  if (!cache) return;

  const needsUpgrade = cache.needsUpgrade === true ||
    cmpVer(cache.manifestVersion, cache.latestNpm) < 0;
  if (!needsUpgrade) return;

  const currentManifestVersion = getManifestVersion();
  if (currentManifestVersion && cache.latestNpm &&
      cmpVer(currentManifestVersion, cache.latestNpm) >= 0) {
    deleteCache();
    return;
  }

  const hookInput = readHookInput();
  if (isPromptAlreadyNotified(cache, hookInput)) return;

  const notice = buildNotice(cache.latestNpm, cache.manifestVersion);
  emitNotice(notice, getHookEventName(hookInput));
  markPromptNotified(cache, hookInput);
}

main();
