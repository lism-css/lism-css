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
    expect(fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8')).toBe(original);
  });

  it('UI 質問に No なら ui セクション無しの core ひな形を生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(false);

    await initCommand({});

    const content = fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8');
    expect(content).toContain("@type {import('lism-css/config-types').LismConfig}");
    expect(content).toContain('// tokens: {},');
    expect(content).not.toContain('ui: {');
    expect(select).not.toHaveBeenCalled();
  });

  it('UI 質問に Yes なら framework を尋ねて ui セクション付きで生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(true);
    vi.mocked(select).mockResolvedValue('react');

    await initCommand({});

    const content = fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8');
    expect(content).toContain('ui: {');
    expect(content).toContain('"react"');
  });

  it('--framework 指定時は UI 確認・framework prompt をスキップして ui セクションを書く', async () => {
    await initCommand({ framework: 'astro' });

    expect(confirm).not.toHaveBeenCalled();
    expect(select).not.toHaveBeenCalled();
    const content = fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8');
    expect(content).toContain('"astro"');
  });

  it('非対話環境（TTY なし）では確認プロンプトを出さず、ui セクション無しで生成する', async () => {
    setStdinTTY(undefined);

    await initCommand({});

    expect(confirm).not.toHaveBeenCalled();
    const content = fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8');
    expect(content).not.toContain('ui: {');
  });

  it('legacy json (lism-ui.json) 検出時は警告を出して新規生成する', async () => {
    vi.mocked(confirm).mockResolvedValue(false);
    writeFile(
      path.join(tmpDir, 'lism-ui.json'),
      JSON.stringify({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' })
    );

    await initCommand({});

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(path.join(tmpDir, 'lism.config.js'))).toBe(true);
  });
});
