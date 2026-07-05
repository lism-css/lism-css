import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { confirm, select } from '@inquirer/prompts';
import { setLang } from '../i18n';
import { logger } from '../logger';
import { initCommand } from './init';

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
  select: vi.fn(),
}));

const cwd = process.cwd();
let tmpDir: string;
let warnSpy: ReturnType<typeof vi.spyOn>;
const originalIsTTY = process.stdin.isTTY;

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function setStdinTTY(value: boolean | undefined): void {
  Object.defineProperty(process.stdin, 'isTTY', { value, configurable: true });
}

function readGenerated(): string {
  return fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8');
}

beforeEach(() => {
  setLang('en');
  vi.clearAllMocks();
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-init-')));
  process.chdir(tmpDir);
  // テスト実行環境は非 TTY のため、対話プロンプト系のテストは TTY ありに固定する
  setStdinTTY(true);
  warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
  vi.spyOn(logger, 'success').mockImplementation(() => undefined);
});

afterEach(() => {
  setStdinTTY(originalIsTTY);
  process.chdir(cwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('initCommand', () => {
  it('既に lism.config.* がある場合は中断し、prompt は呼ばれずファイルも変更されない', async () => {
    const original = 'export default { tokens: {} };\n';
    writeFile(path.join(tmpDir, 'lism.config.js'), original);

    await initCommand({});

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(confirm).not.toHaveBeenCalled();
    expect(readGenerated()).toBe(original);
  });

  it('オプションなし: UI 確認に No なら ui セクション無しの core ひな形を生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(false);

    await initCommand({});

    const content = readGenerated();
    expect(content).toContain("@type {import('lism-css/config-types').LismConfig}");
    expect(content).toContain('// tokens: {},');
    expect(content).not.toContain('ui: {');
    expect(select).not.toHaveBeenCalled();
  });

  it('オプションなし: UI 確認に Yes なら framework を尋ねて ui セクション付きで生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(true);
    vi.mocked(select).mockResolvedValue('react');

    await initCommand({});

    const content = readGenerated();
    expect(content).toContain('ui: {');
    expect(content).toContain('"react"');
    expect(content).toContain('dir: "src/components/ui"');
  });

  it('--ui-framework 指定時: UI 確認は行う（デフォルト Yes）が framework prompt はスキップされる', async () => {
    vi.mocked(confirm).mockResolvedValue(true);

    await initCommand({ uiFramework: 'astro' });

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(vi.mocked(confirm).mock.calls[0][0]).toMatchObject({ default: true });
    expect(select).not.toHaveBeenCalled();
    expect(readGenerated()).toContain('"astro"');
  });

  it('--ui-framework 指定時: UI 確認に No なら core のみ生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(false);

    await initCommand({ uiFramework: 'astro' });

    expect(readGenerated()).not.toContain('ui: {');
  });

  it('--ui-dir のみ指定時: UI 確認はスキップし framework 選択のみ行い、指定 dir で生成する', async () => {
    vi.mocked(select).mockResolvedValue('react');

    await initCommand({ uiDir: 'src/ui' });

    expect(confirm).not.toHaveBeenCalled();
    expect(select).toHaveBeenCalledTimes(1);
    expect(readGenerated()).toContain('dir: "src/ui"');
  });

  it('非対話環境: オプションなしなら確認プロンプトを出さず、ui セクション無しで生成する', async () => {
    setStdinTTY(undefined);

    await initCommand({});

    expect(confirm).not.toHaveBeenCalled();
    expect(readGenerated()).not.toContain('ui: {');
  });

  it('非対話環境: --ui-framework 指定なら同意とみなし、prompt 無しで ui セクション付き生成する', async () => {
    setStdinTTY(undefined);

    await initCommand({ uiFramework: 'react' });

    expect(confirm).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    expect(readGenerated()).toContain('"react"');
  });

  it('非対話環境: --ui-dir のみ指定は framework を決められないためエラー終了する', async () => {
    setStdinTTY(undefined);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit');
    });

    await expect(initCommand({ uiDir: 'src/ui' })).rejects.toThrow('process.exit');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.existsSync(path.join(tmpDir, 'lism.config.js'))).toBe(false);
  });

  it('legacy json (lism-ui.json) 検出時は警告を出して新規生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(false);
    writeFile(path.join(tmpDir, 'lism-ui.json'), JSON.stringify({ framework: 'react', componentsDir: 'src/components/ui' }));

    await initCommand({});

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(path.join(tmpDir, 'lism.config.js'))).toBe(true);
  });
});
