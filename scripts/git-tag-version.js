#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const pkg = require(path.join(process.cwd(), 'package.json'));
const version = String(pkg.version || '').trim();

if (!version) {
  console.error('package.json version is empty');
  process.exit(1);
}

const tag = version.startsWith('v') ? version : `v${version}`;

try {
  execFileSync('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], {
    stdio: 'ignore',
  });
  console.error(`tag already exists: ${tag}`);
  process.exit(1);
} catch (_) {
  // Missing tag is expected.
}

execFileSync('git', ['tag', '-a', tag, '-m', tag], { stdio: 'inherit' });
console.log(`created tag ${tag}`);
