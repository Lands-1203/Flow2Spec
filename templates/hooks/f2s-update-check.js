#!/usr/bin/env node
'use strict';
/**
 * flow2spec SessionStart hook — 每天第一次对话时检查版本更新。
 * 比较本地知识库 manifest-routing.json 的 version 与 npm 最新版本：
 *   - 一致或本地更新 → 静默退出
 *   - 落后 → 向 Agent 上下文注入一行提示（建议执行 f2s-kb-upgrade）
 * 已检查过且无需升级则静默；已检查且仍需升级时，每个新会话继续注入提醒。
 * 由 flow2spec init 写入对应 agent 的 hooks/f2s-update-check.js。
 */
const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MANIFEST_PATH = path.join(process.cwd(), '.Knowledge', 'manifest-routing.json');
const CACHE_DIR    = path.join(process.cwd(), '.Knowledge');
const CACHE_FILE   = path.join(CACHE_DIR, 'update-check.json');
const PACKAGE_NAME_PLACEHOLDER = '__FLOW2SPEC_' + 'PACKAGE_NAME__';
const PACKAGE_NAME = '__FLOW2SPEC_PACKAGE_NAME__';

// ── Hook 输入 ────────────────────────────────────────────────────────────────

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
  return name || 'SessionStart';
}

function getSessionId(input) {
  const id = String((input && input.session_id) || '').trim();
  return id || '';
}

// ── 缓存 ────────────────────────────────────────────────────────────────────

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

function getProjectName() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
    if (pkg && pkg.name) return String(pkg.name);
  } catch (_) {}
  return path.basename(process.cwd());
}

function buildNotice(latestNpm, manifestVersion) {
  return [
    `[flow2spec] 当前项目「${getProjectName()}」的知识库版本是 v${manifestVersion}，低于最新包版本 v${latestNpm}。`,
    `如需对齐模板与路由，可以执行 f2s-kb-upgrade skill。`,
  ].join(' ');
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

function writeCache(latestNpm, manifestVersion) {
  try {
    const needsUpgrade = cmpVer(manifestVersion, latestNpm) < 0;
    fs.writeFileSync(
      CACHE_FILE,
      `${JSON.stringify({
        latestNpm,
        manifestVersion,
        needsUpgrade,
        notice: needsUpgrade ? buildNotice(latestNpm, manifestVersion) : '',
        checkedAt: Date.now(),
      }, null, 2)}\n`,
      'utf8'
    );
  } catch (_) {}
}

function isPromptAlreadyNotified(cache, input, hookEventName) {
  if (hookEventName !== 'UserPromptSubmit') return false;
  const sessionId = getSessionId(input);
  if (!sessionId) return false;
  const sessions = cache && cache.notifiedSessions;
  return Boolean(sessions && typeof sessions === 'object' && sessions[sessionId]);
}

function markPromptNotified(cache, input, hookEventName) {
  if (hookEventName !== 'UserPromptSubmit') return;
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

function deleteCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) fs.unlinkSync(CACHE_FILE);
  } catch (_) {}
}

// ── 版本比较 ─────────────────────────────────────────────────────────────────

function parseVer(v) {
  return String(v || '').replace(/^v/, '').split(/[.-]/).slice(0, 3).map((p) => {
    const n = Number.parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

/** a < b → 负数；a === b → 0；a > b → 正数 */
function cmpVer(a, b) {
  const av = parseVer(a), bv = parseVer(b);
  for (let i = 0; i < 3; i++) {
    const d = (av[i] || 0) - (bv[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

// ── 读取 ─────────────────────────────────────────────────────────────────────

function getManifestVersion() {
  if (!fs.existsSync(MANIFEST_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')).version || null;
  } catch (_) { return null; }
}

function getPackageName() {
  if (PACKAGE_NAME && PACKAGE_NAME !== PACKAGE_NAME_PLACEHOLDER) {
    return PACKAGE_NAME;
  }
  return '@double-codeing/flow2spec';
}

function queryNpmLatest(pkgName) {
  return execFileSync('npm', ['view', pkgName, 'version'], {
    encoding: 'utf8',
    timeout: 5000,
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

// ── 配置开关 ──────────────────────────────────────────────────────────────────

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

// ── 主流程 ────────────────────────────────────────────────────────────────────

function main() {
  if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) return;
  if (!isEnabled()) return;
  const hookInput = readHookInput();
  const hookEventName = getHookEventName(hookInput);
  const cache = readCache();
  if (cache) {
    // 今天已检查过则不重复查 npm；若缓存显示仍需升级，每个新会话继续提醒。
    const needsUpgrade = cache.needsUpgrade === true ||
      cmpVer(cache.manifestVersion, cache.latestNpm) < 0;
    if (needsUpgrade) {
      const currentManifestVersion = getManifestVersion();
      if (currentManifestVersion && cache.latestNpm &&
          cmpVer(currentManifestVersion, cache.latestNpm) >= 0) {
        deleteCache();
        return;
      }
      if (isPromptAlreadyNotified(cache, hookInput, hookEventName)) return;
      const notice = buildNotice(cache.latestNpm, cache.manifestVersion);
      emitNotice(notice, hookEventName);
      markPromptNotified(cache, hookInput, hookEventName);
    }
    return;
  }

  const manifestVersion = getManifestVersion();
  if (!manifestVersion) return;  // 无知识库，跳过

  let latestNpm;
  try {
    const pkgName = getPackageName();
    latestNpm = queryNpmLatest(pkgName);
  } catch (_) {
    return;  // 网络不通，静默退出，不写缓存（下次还会重试）
  }

  // 写缓存（无论是否需要升级，今天不再重复检查）
  writeCache(latestNpm, manifestVersion);

  if (cmpVer(manifestVersion, latestNpm) >= 0) return;  // 已是最新

  const nextCache = readCache() || { latestNpm, manifestVersion, checkedAt: Date.now() };
  const notice = buildNotice(latestNpm, manifestVersion);
  emitNotice(notice, hookEventName);
  markPromptNotified(nextCache, hookInput, hookEventName);
}

main();
