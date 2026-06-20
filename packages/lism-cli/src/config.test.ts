import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setLang } from './i18n';
import { logger } from './logger';
import { readConfig, writeFreshConfig, renderUiSnippet, getDefaultConfigPath } from './config';

const cwd = process.cwd();
let tmpDir: string;
let warnSpy: ReturnType<typeof vi.spyOn>;

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

describe('readConfig', () => {
  beforeEach(() => {
    setLang('en');
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-config-')));
    process.chdir(tmpDir);
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    vi.spyOn(logger, 'info').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('設定ファイルが無ければ null を返す', async () => {
    await expect(readConfig()).resolves.toBeNull();
  });

  it('lism.config.js はあるが ui/cli セクションが無く、モジュール全体も ui 設定として無効なら null を返す', async () => {
    writeFile(path.join(tmpDir, 'lism.config.js'), "export default { tokens: { space: ['10', '20'] } };\n");
    await expect(readConfig()).resolves.toBeNull();
  });

  it('ui: セクションがあれば値を返し、deprecation警告は出さない', async () => {
    writeFile(
      path.join(tmpDir, 'lism.config.js'),
      "export default { ui: { framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' } };\n"
    );
    const result = await readConfig();
    expect(result).toEqual({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('旧 cli: セクションのみあれば値を返し、deprecation警告を出す', async () => {
    writeFile(
      path.join(tmpDir, 'lism.config.js'),
      "export default { cli: { framework: 'astro', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' } };\n"
    );
    const result = await readConfig();
    expect(result).toEqual({ framework: 'astro', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('ui: と cli: が両方あれば ui: を優先し、警告は出さない', async () => {
    writeFile(
      path.join(tmpDir, 'lism.config.js'),
      "export default { ui: { framework: 'react', componentsDir: 'a', helperDir: 'a/_helper' }, cli: { framework: 'astro', componentsDir: 'b', helperDir: 'b/_helper' } };\n"
    );
    const result = await readConfig();
    expect(result).toEqual({ framework: 'react', componentsDir: 'a', helperDir: 'a/_helper' });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('旧形式（ui/cliキー無しでモジュール全体が有効な設定）は後方互換で読み込める', async () => {
    writeFile(
      path.join(tmpDir, 'lism.config.js'),
      "export default { framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' };\n"
    );
    const result = await readConfig();
    expect(result).toEqual({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
  });

  it('framework が不正な値なら throw する', async () => {
    writeFile(
      path.join(tmpDir, 'lism.config.js'),
      "export default { ui: { framework: 'vue', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' } };\n"
    );
    await expect(readConfig()).rejects.toThrow();
  });

  it('componentsDir が文字列でなければ throw する', async () => {
    writeFile(path.join(tmpDir, 'lism.config.js'), "export default { ui: { framework: 'react', componentsDir: 123, helperDir: 'x' } };\n");
    await expect(readConfig()).rejects.toThrow();
  });

  it('構文エラーのあるファイルは config.loadFailed で throw する', async () => {
    writeFile(path.join(tmpDir, 'lism.config.js'), 'export default {{{ syntax error\n');
    await expect(readConfig()).rejects.toThrow();
  });

  it('legacy json (lism-ui.json) を読み込み、deprecation警告を出す', async () => {
    writeFile(
      path.join(tmpDir, 'lism-ui.json'),
      JSON.stringify({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' })
    );
    const result = await readConfig();
    expect(result).toEqual({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('legacy json の値が不正なら throw する', async () => {
    writeFile(path.join(tmpDir, 'lism-ui.json'), JSON.stringify({ framework: 'vue', componentsDir: 'x', helperDir: 'y' }));
    await expect(readConfig()).rejects.toThrow();
  });
});

describe('writeFreshConfig', () => {
  beforeEach(() => {
    setLang('en');
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-config-')));
    process.chdir(tmpDir);
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('ui: キーで新規 lism.config.js を生成する', () => {
    const outPath = writeFreshConfig({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
    expect(outPath).toBe(getDefaultConfigPath());
    const content = fs.readFileSync(outPath, 'utf-8');
    expect(content).toContain('ui: {');
    expect(content).not.toContain('cli: {');
    expect(content).toContain('"react"');
  });
});

describe('renderUiSnippet', () => {
  it('貼り付け用の ui: スニペット文字列を返す', () => {
    const snippet = renderUiSnippet({ framework: 'astro', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
    expect(snippet).toBe('ui: {\n  framework: "astro",\n  componentsDir: "src/components/ui",\n  helperDir: "src/components/ui/_helper",\n},');
  });
});
