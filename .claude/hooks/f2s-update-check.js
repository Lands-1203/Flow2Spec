#!/usr/bin/env node
'use strict';
/**
 * flow2spec UserPromptSubmit hook — 每天第一次对话时检查版本更新。
 * 比较本地知识库 manifest-routing.json 的 version 与 npm 最新版本：
 *   - 一致或本地更新 → 静默退出
 *   - 落后 → 向 Agent 上下文注入一行提示（建议执行 f2s-kb-upgrade）
 * 已检查过（24h 内）则完全静默，不做任何输出。
 * 由 flow2spec init 写入对应 agent 的 hooks/f2s-update-check.js。
 */
const fs   = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const MANIFEST_PATH = path.join(process.cwd(), '.Knowledge', 'manifest-routing.json');
const CACHE_DIR    = path.join(process.cwd(), '.Knowledge');
const CACHE_FILE   = path.join(CACHE_DIR, 'update-check.json');
const PACKAGE_NAME_PLACEHOLDER = '__FLOW2SPEC_' + 'PACKAGE_NAME__';
const PACKAGE_NAME = '@double-codeing/flow2spec';

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

function writeCache(latestNpm, manifestVersion) {
  try {
    fs.writeFileSync(
      CACHE_FILE,
      `${JSON.stringify({ latestNpm, manifestVersion, checkedAt: Date.now() }, null, 2)}\n`,
      'utf8'
    );
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
  if (readCache()) return;  // 今天已检查过，静默退出

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

  // 知识库落后于 npm 最新版，注入提示
  const notice = [
    `[flow2spec] 知识库版本 v${manifestVersion} 低于最新包版本 v${latestNpm}。`,
    `建议在此对话中执行 f2s-kb-upgrade 升级知识库模板与路由结构。`,
  ].join(' ');

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: notice,
      },
    }) + '\n'
  );
}

main();
