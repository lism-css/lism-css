// @vitest-environment node
import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, test } from 'vitest';

const execFileAsync = promisify(execFile);
const cliPath = fileURLToPath(new URL('../bin/cli.mjs', import.meta.url));
const distEntry = fileURLToPath(new URL('../dist/builder/index.js', import.meta.url));
const distReady = fs.existsSync(distEntry);

const dirs: string[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-plugin-cli-'));
  dirs.push(dir);
  return dir;
}
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

type CliResult = { code: number; stdout: string; stderr: string };

async function runCli(args: string[], cwd: string): Promise<CliResult> {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, [cliPath, ...args], { cwd, encoding: 'utf8' });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string };
    return { code: typeof err.code === 'number' ? err.code : 1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  }
}

function cssDistDir(): string {
  return path.dirname(fileURLToPath(import.meta.resolve('lism-css/main.css')));
}

/** CLI が書き込む共有 dist/css をテスト後に戻す。 */
function withCssDistBackup<T>(fn: (cssDir: string) => Promise<T>): Promise<T> {
  const cssDir = cssDistDir();
  const backup = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-css-dist-backup-'));
  fs.cpSync(cssDir, backup, { recursive: true });
  return fn(cssDir).finally(() => {
    fs.rmSync(cssDir, { recursive: true, force: true });
    fs.cpSync(backup, cssDir, { recursive: true });
    fs.rmSync(backup, { recursive: true, force: true });
  });
}

describe.skipIf(!distReady)('bin/cli.mjs', () => {
  test('サブコマンド無しなら Usage を出して終了コード 0', async () => {
    const result = await runCli([], tmpDir());
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('Usage: lism-css <command> [options]');
    expect(result.stdout).toContain('build');
  });

  test('未知サブコマンドは stderr に出して終了コード 1', async () => {
    const result = await runCli(['not-a-command'], tmpDir());
    expect(result.code).toBe(1);
    expect(result.stderr).toContain('Unknown command: not-a-command');
  });

  test('build は主要 CSS を minify して生成する', async () => {
    await withCssDistBackup(async (cssDir) => {
      const result = await runCli(['build'], tmpDir());
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/compileCssTree\] \d+ entries/);

      const mainCss = fs.readFileSync(path.join(cssDir, 'main.css'), 'utf8');
      expect(mainCss.length).toBeGreaterThan(100);
      // minify: true（cssnano）経路。expanded の 2 スペースインデントは残らない。
      expect(mainCss).not.toContain('\n  ');
    });
  }, 60_000);

  test('--full なら full.css / full_no_layer.css も生成する', async () => {
    await withCssDistBackup(async (cssDir) => {
      const withoutFull = await runCli(['build'], tmpDir());
      expect(withoutFull.code).toBe(0);
      const withoutCount = Number(/compileCssTree\] (\d+) entries/.exec(withoutFull.stdout)?.[1]);

      const withFull = await runCli(['build', '--full'], tmpDir());
      expect(withFull.code).toBe(0);
      const withCount = Number(/compileCssTree\] (\d+) entries/.exec(withFull.stdout)?.[1]);

      expect(withoutCount).toBeGreaterThan(0);
      expect(withCount).toBeGreaterThan(withoutCount);
      expect(fs.existsSync(path.join(cssDir, 'full.css'))).toBe(true);
      expect(fs.existsSync(path.join(cssDir, 'full_no_layer.css'))).toBe(true);
    });
  }, 60_000);
});
