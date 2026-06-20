import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { select, input } from '@inquirer/prompts';
import { setLang } from '../../i18n';
import { logger } from '../../logger';
import { runInit, initCommand } from './init';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  input: vi.fn(),
}));

const cwd = process.cwd();
let tmpDir: string;
let infoSpy: ReturnType<typeof vi.spyOn>;
let warnSpy: ReturnType<typeof vi.spyOn>;

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function mockPrompts(): void {
  vi.mocked(select).mockResolvedValue('react');
  vi.mocked(input).mockResolvedValueOnce('src/components/ui').mockResolvedValueOnce('src/components/ui/_helper');
}

beforeEach(() => {
  setLang('en');
  vi.clearAllMocks();
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-init-')));
  process.chdir(tmpDir);
  infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
  warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
  vi.spyOn(logger, 'success').mockImplementation(() => undefined);
});

afterEach(() => {
  process.chdir(cwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('runInit', () => {
  it('設定ファイルが無ければ ui: を含む新規ファイルを生成する', async () => {
    mockPrompts();

    const config = await runInit();

    expect(config).toEqual({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' });
    const content = fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8');
    expect(content).toContain('ui: {');
  });

  it('既存ファイルがある場合はファイルを書き換えず、スニペットのみ案内する', async () => {
    mockPrompts();
    const original = "export default { tokens: { space: ['10', '20'] } };\n";
    writeFile(path.join(tmpDir, 'lism.config.js'), original);

    await runInit();

    const after = fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8');
    expect(after).toBe(original);
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0]).toContain('ui: {');
  });
});

describe('initCommand', () => {
  it('既に ui セクションがある場合は中断し、prompt は呼ばれない', async () => {
    writeFile(
      path.join(tmpDir, 'lism.config.js'),
      "export default { ui: { framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' } };\n"
    );

    await initCommand({});

    expect(select).not.toHaveBeenCalled();
    expect(input).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('ui セクションが無ければ runInit まで進む', async () => {
    mockPrompts();
    writeFile(path.join(tmpDir, 'lism.config.js'), "export default { tokens: { space: ['10', '20'] } };\n");

    await initCommand({});

    expect(select).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it('legacy json 検出時は警告を出して runInit まで進む（新規 lism.config.js を生成）', async () => {
    mockPrompts();
    writeFile(
      path.join(tmpDir, 'lism-ui.json'),
      JSON.stringify({ framework: 'react', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' })
    );

    await initCommand({});

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledTimes(1);
    expect(fs.existsSync(path.join(tmpDir, 'lism.config.js'))).toBe(true);
  });
});
