#!/usr/bin/env node
'use strict';
/**
 * flow2spec UserPromptSubmit hook — 每天第一次对话时检查版本更新。
 * 有新版时向 Agent 上下文注入一行提示；已检查过或出错时静默退出。
 * 由 flow2spec init --claude 写入 .claude/hooks/f2s-update-check.js。
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const TTL_MS = 24 * 60 * 60 * 1000;

function cacheFile() {
  try {
    const pkg = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', '..', 'node_modules', '.package-lock.json'), 'utf8'
    ));
    void pkg;
  } catch (_) {}
  // 用项目根目录名做区分，缓存放用户 home
  const projectSlug = path.basename(process.cwd()).replace(/[^a-z0-9_.-]+/gi, '_');
  return path.join(os.homedir(), '.flow2spec', `update-check-${projectSlug}.json`);
}

function readCache() {
  const file = cacheFile();
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!data || typeof data !== 'object') return null;
    if (Date.now() - Number(data.checkedAt || 0) > TTL_MS) return null;
    return data;
  } catch (_) {
    return null;
  }
}

function writeCache(latest) {
  try {
    const file = cacheFile();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify({ latest, checkedAt: Date.now() }, null, 2)}\n`, 'utf8');
  } catch (_) {}
}

function parseVersion(v) {
  return String(v || '').replace(/^v/, '').split(/[.-]/).slice(0, 3).map((p) => {
    const n = Number.parseInt(p, 10);
    return Number.isFinite(n) ? n : 0;
  });
}

function isNewer(latest, current) {
  const a = parseVersion(latest);
  const b = parseVersion(current);
  for (let i = 0; i < 3; i += 1) {
    const diff = (a[i] || 0) - (b[i] || 0);
    if (diff !== 0) return diff > 0;
  }
  return false;
}

function getCurrentVersion() {
  // 向上查找 package.json（hook 运行在 .claude/hooks/ 下，但 cwd 是项目根）
  const candidates = [
    path.join(__dirname, '..', '..', 'package.json'),   // 随包安装时
    path.join(__dirname, 'package.json'),
  ];
  for (const p of candidates) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8')).version || '0.0.0';
    } catch (_) {}
  }
  return '0.0.0';
}

function getPackageName() {
  const candidates = [
    path.join(__dirname, '..', '..', 'package.json'),
    path.join(__dirname, 'package.json'),
  ];
  for (const p of candidates) {
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8')).name || 'flow2spec';
    } catch (_) {}
  }
  return 'flow2spec';
}

function checkEnabled() {
  try {
    const cfg = JSON.parse(fs.readFileSync(
      path.join(process.cwd(), 'flow2spec.config.json'), 'utf8'
    ));
    // updateCheck.enabled 缺省为 true（不写也默认开启）
    const uc = cfg && cfg.updateCheck;
    if (uc && typeof uc.enabled === 'boolean' && !uc.enabled) return false;
    return true;
  } catch (_) {
    return true;
  }
}

function main() {
  // 非 TTY 或 CI 环境静默退出
  if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) return;

  if (!checkEnabled()) return;

  // 今天已经检查过，静默退出
  const cached = readCache();
  if (cached) return;

  const pkgName = getPackageName();
  const current = getCurrentVersion();

  let latest;
  try {
    latest = execFileSync('npm', ['view', pkgName, 'version'], {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch (_) {
    // 网络不通或 npm 不可用，静默退出，不写缓存（下次还会重试）
    return;
  }

  // 写缓存（无论是否有新版，今天不再重复检查）
  writeCache(latest);

  if (!isNewer(latest, current)) return;

  // 向 Agent 上下文注入一行提示
  const notice = `[flow2spec] 有新版本可用：v${latest}（当前 v${current}）。可在此项目 Agent 对话中执行 f2s-kb-upgrade 完成升级。`;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: notice,
      },
    }) + '\n'
  );
}

main();
