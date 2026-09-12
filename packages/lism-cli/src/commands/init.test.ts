import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { confirm, select } from '@inquirer/prompts';
import { setLang } from '../i18n';
import { logger } from '../logger';
import { writeFreshConfig } from '../config';
import { initCommand } from './init';

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
  select: vi.fn(),
}));

// 生成内容の検証は config.test.ts に任せ、ここでは渡す値だけを見る
vi.mock('../config', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../config')>()),
  writeFreshConfig: vi.fn(() => 'lism.config.js'),
}));

const cwd = process.cwd();
let tmpDir: string;
let warnSpy: ReturnType<typeof vi.spyOn>;
const originalIsTTY = process.stdin.isTTY;

const DEFAULT_DIR = 'src/components/ui';

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function setStdinTTY(value: boolean | undefined): void {
  Object.defineProperty(process.stdin, 'isTTY', { value, configurable: true });
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
  it('既に lism.config.* がある場合は中断し、prompt も writeFreshConfig も呼ばれない', async () => {
    writeFile(path.join(tmpDir, 'lism.config.js'), 'export default { tokens: {} };\n');

    await initCommand({});

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(confirm).not.toHaveBeenCalled();
    expect(writeFreshConfig).not.toHaveBeenCalled();
  });

  it('オプションなし: UI 確認に No なら framework を尋ねず ui なし（null）で生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(false);

    await initCommand({});

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(vi.mocked(confirm).mock.calls[0][0]).toMatchObject({ default: false });
    expect(select).not.toHaveBeenCalled();
    expect(writeFreshConfig).toHaveBeenCalledWith(null);
  });

  it('オプションなし: UI 確認に Yes なら framework を尋ねてその値で生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(true);
    vi.mocked(select).mockResolvedValue('react');

    await initCommand({});

    expect(select).toHaveBeenCalledTimes(1);
    expect(writeFreshConfig).toHaveBeenCalledWith({ framework: 'react', dir: DEFAULT_DIR });
  });

  it('--ui-framework 指定時: UI 確認は行う（デフォルト Yes）が framework prompt はスキップされる', async () => {
    vi.mocked(confirm).mockResolvedValue(true);

    await initCommand({ uiFramework: 'astro' });

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(vi.mocked(confirm).mock.calls[0][0]).toMatchObject({ default: true });
    expect(select).not.toHaveBeenCalled();
    expect(writeFreshConfig).toHaveBeenCalledWith({ framework: 'astro', dir: DEFAULT_DIR });
  });

  it('--ui-framework 指定時: UI 確認に No なら ui なし（null）で生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(false);

    await initCommand({ uiFramework: 'astro' });

    expect(writeFreshConfig).toHaveBeenCalledWith(null);
  });

  it('--ui-dir のみ指定時: UI 確認はスキップし framework 選択のみ行い、指定 dir で生成する', async () => {
    vi.mocked(select).mockResolvedValue('react');

    await initCommand({ uiDir: 'src/ui' });

    expect(confirm).not.toHaveBeenCalled();
    expect(select).toHaveBeenCalledTimes(1);
    expect(writeFreshConfig).toHaveBeenCalledWith({ framework: 'react', dir: 'src/ui' });
  });

  it('非対話環境: オプションなしなら確認プロンプトを出さず、ui なし（null）で生成する', async () => {
    setStdinTTY(undefined);

    await initCommand({});

    expect(confirm).not.toHaveBeenCalled();
    expect(writeFreshConfig).toHaveBeenCalledWith(null);
  });

  it('非対話環境: --ui-framework 指定なら同意とみなし、prompt 無しでその値で生成する', async () => {
    setStdinTTY(undefined);

    await initCommand({ uiFramework: 'react' });

    expect(confirm).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    expect(writeFreshConfig).toHaveBeenCalledWith({ framework: 'react', dir: DEFAULT_DIR });
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
    expect(writeFreshConfig).not.toHaveBeenCalled();
  });

  it('旧 lism-ui.json は既存 config として扱わず、警告なしで新規生成へ進む', async () => {
    vi.mocked(confirm).mockResolvedValue(false);
    writeFile(path.join(tmpDir, 'lism-ui.json'), JSON.stringify({ framework: 'react', componentsDir: DEFAULT_DIR }));

    await initCommand({});

    expect(warnSpy).not.toHaveBeenCalled();
    expect(writeFreshConfig).toHaveBeenCalledTimes(1);
  });
});
