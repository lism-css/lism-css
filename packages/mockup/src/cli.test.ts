import { execFile } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, test } from 'vitest';

import { resolveGeneratedConfigDir, resolveViteCacheDir } from './core/runtime.js';
import { cleanupTempDirs, createDataDir, MOCKUP_CONFIG, PLAIN_PAGE } from './test-helpers/fixtures.js';

const execFileAsync = promisify(execFile);
const cliPath = fileURLToPath(new URL('../bin/lism-mockup.mjs', import.meta.url));
const distEntry = fileURLToPath(new URL('../dist/index.js', import.meta.url));
const pkg = JSON.parse(fs.readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as { version: string };
const distReady = fs.existsSync(distEntry);

const checkedDirs: string[] = [];

type CliResult = { code: number; stdout: string; stderr: string };

async function runCli(args: string[], cwd?: string): Promise<CliResult> {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [cliPath, ...args], {
      cwd,
      encoding: 'utf8',
    });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string };
    return { code: typeof err.code === 'number' ? err.code : 1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}

const ANSI_CSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
function stripAnsi(text: string): string {
  return text.replace(ANSI_CSI, '');
}

afterAll(() => {
  for (const dir of checkedDirs) {
    if (!fs.existsSync(dir)) continue;
    const real = fs.realpathSync(dir);
    for (const shared of [resolveViteCacheDir(real), resolveGeneratedConfigDir(real)]) {
      fs.rmSync(shared, { recursive: true, force: true });
    }
  }
  cleanupTempDirs();
});

describe.skipIf(!distReady)('bin/lism-mockup.mjs', () => {
  test('--version は終了コード 0 でバージョンを出す', async () => {
    const result = await runCli(['--version']);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe(pkg.version);
  });

  test('未知サブコマンドは終了コード 1', async () => {
    const result = await runCli(['not-a-command']);
    expect(result.code).toBe(1);
    expect(stripAnsi(result.stderr)).toMatch(/unknown command/i);
  });

  test('不正なデータディレクトリへの check は終了コード 1 で at 付きエラーを出す', async () => {
    const dir = createDataDir({});
    const result = await runCli(['check', dir]);
    expect(result.code).toBe(1);
    const stderr = stripAnsi(result.stderr);
    expect(stderr).toContain('[lism-mockup]');
    expect(stderr).toMatch(/mockup\.config\.json not found/);
    expect(stderr).toContain(`at ${path.join(dir, 'mockup.config.json')}`);
  });

  test('正しいデータディレクトリへの check は終了コード 0', async () => {
    const dir = createDataDir({
      'mockup.config.json': MOCKUP_CONFIG,
      'pages/home.jsx': PLAIN_PAGE,
    });
    checkedDirs.push(dir);

    const result = await runCli(['check', dir]);
    expect(result.code).toBe(0);
    expect(stripAnsi(result.stdout)).toContain('check passed');
  }, 60_000);
});
