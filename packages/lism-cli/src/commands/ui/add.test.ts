import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { select, input } from '@inquirer/prompts';
import { setLang } from '../../i18n';
import { logger } from '../../logger';
import { addCommand } from './add';
import type { RegistryCatalog, RegistryComponent } from './fetcher';

vi.mock('@inquirer/prompts', () => ({
  select: vi.fn(),
  input: vi.fn(),
  confirm: vi.fn(),
}));

vi.mock('./fetcher.js', () => ({
  fetchCatalog: vi.fn(),
  fetchComponent: vi.fn(),
  fetchHelper: vi.fn(),
}));

const cwd = process.cwd();
let tmpDir: string;
let infoSpy: ReturnType<typeof vi.spyOn>;
let exitSpy: ReturnType<typeof vi.spyOn>;

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

const catalog: RegistryCatalog = {
  version: '1',
  excludeComponentFiles: [],
  components: [{ name: 'Button', helpers: [] }],
  helpers: [],
};

const buttonComponent: RegistryComponent = {
  name: 'Button',
  helpers: [],
  files: {
    shared: [],
    react: [{ path: 'Button.jsx', content: 'export default function Button() {}\n' }],
    astro: [{ path: 'Button.astro', content: '<button></button>\n' }],
  },
};

beforeEach(async () => {
  setLang('en');
  vi.clearAllMocks();
  tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-add-')));
  process.chdir(tmpDir);
  infoSpy = vi.spyOn(logger, 'info').mockImplementation(() => undefined);
  vi.spyOn(logger, 'success').mockImplementation(() => undefined);
  vi.spyOn(logger, 'log').mockImplementation(() => undefined);
  vi.spyOn(logger, 'error').mockImplementation(() => undefined);
  exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

  const fetcher = await import('./fetcher.js');
  vi.mocked(fetcher.fetchCatalog).mockResolvedValue(catalog);
  vi.mocked(fetcher.fetchComponent).mockResolvedValue(buttonComponent);
});

afterEach(() => {
  process.chdir(cwd);
  fs.rmSync(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('addCommand', () => {
  it('ui セクションが無い場合、対話で値を収集してメモリ上の値で配置し、ファイルは書き換えない', async () => {
    const original = "export default { tokens: { space: ['10', '20'] } };\n";
    writeFile(path.join(tmpDir, 'lism.config.js'), original);
    vi.mocked(select).mockResolvedValue('react');
    vi.mocked(input).mockResolvedValueOnce('src/components/ui').mockResolvedValueOnce('src/components/ui/_helper');

    await addCommand(['Button'], { overwrite: false, all: false });

    expect(select).toHaveBeenCalledTimes(1);
    // 配置はメモリ上の値で行われる
    expect(fs.existsSync(path.join(tmpDir, 'src/components/ui/Button/Button.jsx'))).toBe(true);
    // lism.config.js は書き換えられない
    expect(fs.readFileSync(path.join(tmpDir, 'lism.config.js'), 'utf-8')).toBe(original);
    // 末尾にスニペット案内が出る
    expect(infoSpy.mock.calls.some((call) => String(call[0]).includes('ui: {'))).toBe(true);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('ui セクションが既にある場合、prompt は呼ばれずスニペット案内も出ない', async () => {
    writeFile(
      path.join(tmpDir, 'lism.config.js'),
      "export default { ui: { framework: 'astro', componentsDir: 'src/components/ui', helperDir: 'src/components/ui/_helper' } };\n"
    );

    await addCommand(['Button'], { overwrite: false, all: false });

    expect(select).not.toHaveBeenCalled();
    expect(input).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(tmpDir, 'src/components/ui/Button/Button.astro'))).toBe(true);
    expect(infoSpy.mock.calls.some((call) => String(call[0]).includes('ui: {'))).toBe(false);
  });

  it('--framework 指定時は select がスキップされる', async () => {
    vi.mocked(input).mockResolvedValueOnce('src/components/ui').mockResolvedValueOnce('src/components/ui/_helper');

    await addCommand(['Button'], { overwrite: false, all: false, framework: 'react' });

    expect(select).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(tmpDir, 'src/components/ui/Button/Button.jsx'))).toBe(true);
  });

  it('設定ファイルが全く無い場合でも未捕捉エラーにならず、対話にフォールバックする（旧バグの再発防止）', async () => {
    vi.mocked(select).mockResolvedValue('react');
    vi.mocked(input).mockResolvedValueOnce('src/components/ui').mockResolvedValueOnce('src/components/ui/_helper');

    await addCommand(['Button'], { overwrite: false, all: false });

    expect(exitSpy).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(tmpDir, 'src/components/ui/Button/Button.jsx'))).toBe(true);
  });
});
