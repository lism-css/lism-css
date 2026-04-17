#!/usr/bin/env node
/**
 * `@lism-css/cli` のビルド成果物に対する最小のスモークテスト。
 * 各サブコマンドの --help が正常に終了することだけを確認する。
 */
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const lismBin = resolve(__dirname, '..', 'packages/lism-cli/bin/lism.mjs');
const lismUiBin = resolve(__dirname, '..', 'packages/lism-cli/bin/cli.mjs');
const createLismBin = resolve(__dirname, '..', 'packages/create-lism/bin/create-lism.mjs');

const cases = [
  { bin: lismBin, args: ['--help'] },
  { bin: lismBin, args: ['--version'] },
  { bin: lismBin, args: ['create', '--help'] },
  { bin: lismBin, args: ['ui', '--help'] },
  { bin: lismBin, args: ['ui', 'add', '--help'] },
  { bin: lismBin, args: ['ui', 'list', '--help'] },
  { bin: lismBin, args: ['skill', '--help'] },
  { bin: lismBin, args: ['skill', 'add', '--help'] },
  { bin: lismUiBin, args: ['--help'] },
  { bin: createLismBin, args: ['--help'] },
];

let failed = 0;
for (const { bin, args } of cases) {
  const label = `${bin.split('/').slice(-3).join('/')} ${args.join(' ')}`;
  try {
    execFileSync('node', [bin, ...args], { stdio: 'pipe' });
    console.log(`  ✓ ${label}`);
  } catch (err) {
    console.error(`  ✗ ${label}`);
    console.error(String(err.stderr ?? err.message));
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n${failed} 件のスモークテストが失敗しました。`);
  process.exit(1);
}
console.log('\nスモークテスト OK');
