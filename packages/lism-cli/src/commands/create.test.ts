import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadTemplate } from 'giget';
import { confirm, input, select } from '@inquirer/prompts';
import { setLang } from '../i18n';
import { runCreate, runCreateWithTemplates } from './create';

vi.mock('giget', () => ({
  downloadTemplate: vi.fn(),
}));

vi.mock('@inquirer/prompts', () => ({
  confirm: vi.fn(),
  input: vi.fn(),
  select: vi.fn(),
}));

const cwd = process.cwd();
let tmpDir: string;

function writePackageJson(dir: string, pkg: Record<string, unknown>): void {
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
}

function writeFile(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

describe('runCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setLang('en');
    tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'lism-create-')));
    process.chdir(tmpDir);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      writePackageJson(dir, { name: 'minimal-astro', dependencies: { 'lism-css': 'workspace:*' } });
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('--template指定時は選択UIを呼ばずに対象テンプレートを取得する', async () => {
    await runCreate({ template: 'minimal-astro', targetDir: 'my-app', force: true });

    expect(select).not.toHaveBeenCalled();
    expect(input).not.toHaveBeenCalled();
    expect(confirm).not.toHaveBeenCalled();
    expect(downloadTemplate).toHaveBeenCalledWith('github:lism-css/lism-css/templates/minimal/astro#main', {
      dir: path.join(tmpDir, 'my-app'),
      force: true,
      forceClean: true,
    });

    const pkg = JSON.parse(fs.readFileSync(path.join(tmpDir, 'my-app', 'package.json'), 'utf-8')) as {
      dependencies: Record<string, string>;
    };
    expect(pkg.dependencies['lism-css']).not.toBe('workspace:*');
  });

  it('stackが1件だけなら選択をスキップして自動確定する', async () => {
    vi.mocked(select).mockResolvedValue('minimal' as never);
    vi.mocked(input).mockResolvedValue('picked-app' as never);

    await runCreate({ force: true });

    expect(select).toHaveBeenCalledTimes(1);
    expect(input).toHaveBeenCalledTimes(1);
    expect(downloadTemplate).toHaveBeenCalledWith('github:lism-css/lism-css/templates/minimal/astro#main', {
      dir: path.join(tmpDir, 'picked-app'),
      force: true,
      forceClean: true,
    });
  });

  it('variantが複数ある場合はstack自動確定後に件数付きvariant選択を出す', async () => {
    vi.mocked(select)
      .mockResolvedValueOnce('blog' as never)
      .mockResolvedValueOnce('simple' as never);
    vi.mocked(input).mockResolvedValue('blog-app' as never);

    await runCreate({ force: true });

    expect(select).toHaveBeenCalledTimes(2);
    expect((vi.mocked(select).mock.calls[1][0] as { message: string }).message).toBe('Select a feature level (2 options):');
    expect(downloadTemplate).toHaveBeenCalledWith('github:lism-css/lism-css/templates/blog/astro/simple#main', {
      dir: path.join(tmpDir, 'blog-app'),
      force: true,
      forceClean: true,
    });
  });

  it('base-overlay型はbase取得後にoverlayをmergeし、package.json.nameをslugにする', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'lp-astro-saas',
        kind: 'base-overlay',
        category: 'lp',
        stack: 'astro',
        variant: 'saas',
        variantLabel: { ja: 'SaaS', en: 'SaaS' },
        basePath: 'lp/astro/_base',
        overlayPath: 'lp/astro/_variants/saas',
        description: { ja: 'SaaS LP', en: 'SaaS landing page' },
      },
    ];
    vi.mocked(downloadTemplate).mockImplementation((source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      if (String(source).includes('/_base#')) {
        writePackageJson(dir, { name: 'lp-astro-base', dependencies: { 'lism-css': 'workspace:*' } });
        writeFile(path.join(dir, 'src/pages/index.astro'), 'base');
      } else {
        writeFile(path.join(dir, 'src/pages/index.astro'), 'overlay');
        writeFile(path.join(dir, 'src/styles/variant.css'), '.hero{}');
      }
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await runCreateWithTemplates({ template: 'lp-astro-saas', targetDir: 'lp-app', force: true }, templates);

    const outDir = path.join(tmpDir, 'lp-app');
    expect(downloadTemplate).toHaveBeenCalledTimes(2);
    expect(downloadTemplate).toHaveBeenNthCalledWith(1, 'github:lism-css/lism-css/templates/lp/astro/_base#main', {
      dir: outDir,
      force: true,
      forceClean: true,
    });
    expect(downloadTemplate).toHaveBeenNthCalledWith(2, 'github:lism-css/lism-css/templates/lp/astro/_variants/saas#main', {
      dir: expect.any(String),
      force: true,
      forceClean: true,
    });
    expect(fs.readFileSync(path.join(outDir, 'src/pages/index.astro'), 'utf-8')).toBe('overlay');
    expect(fs.existsSync(path.join(outDir, 'src/styles/variant.css'))).toBe(true);
    const pkg = JSON.parse(fs.readFileSync(path.join(outDir, 'package.json'), 'utf-8')) as { name: string };
    expect(pkg.name).toBe('lp-astro-saas');
  });

  it('static-html型はpackage.jsonなしでもindex.htmlがあれば完了し、HTML向けNext stepsを出す', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'lp-html-saas',
        kind: 'static-html',
        category: 'lp',
        stack: 'html',
        variant: 'saas',
        variantLabel: { ja: 'SaaS', en: 'SaaS' },
        sourcePath: 'lp/html/_generated/saas',
        description: { ja: 'SaaS LP HTML', en: 'SaaS landing page HTML' },
      },
    ];
    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      writeFile(path.join(dir, 'index.html'), '<!doctype html>');
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await runCreateWithTemplates({ template: 'lp-html-saas', targetDir: 'html-app', force: true }, templates);

    const outDir = path.join(tmpDir, 'html-app');
    expect(fs.existsSync(path.join(outDir, 'package.json'))).toBe(false);
    expect(console.log).toHaveBeenCalledWith('  Open index.html in your browser');
  });

  it('templateNotFoundを返す', async () => {
    await expect(runCreateWithTemplates({ template: 'missing', targetDir: 'x', force: true }, [])).rejects.toThrow('Template "missing" not found');
  });

  it('project型でpackage.jsonがない場合はtemplatePackageMissingを返す', async () => {
    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      fs.mkdirSync((options as { dir: string }).dir, { recursive: true });
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await expect(runCreate({ template: 'minimal-astro', targetDir: 'broken', force: true })).rejects.toThrow('package.json');
  });

  it('static-html型でindex.htmlがない場合はtemplateIndexMissingを返す', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'lp-html-empty',
        kind: 'static-html',
        category: 'lp',
        stack: 'html',
        sourcePath: 'lp/html/_generated/empty',
        description: { ja: 'empty', en: 'empty' },
      },
    ];
    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      fs.mkdirSync((options as { dir: string }).dir, { recursive: true });
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await expect(runCreateWithTemplates({ template: 'lp-html-empty', targetDir: 'empty-html', force: true }, templates)).rejects.toThrow(
      'index.html'
    );
  });

  it('上書き確認でnoなら中断してdownloadしない', async () => {
    const outDir = path.join(tmpDir, 'occupied');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'keep.txt'), 'keep');
    vi.mocked(confirm).mockResolvedValue(false as never);

    await runCreate({ template: 'minimal-astro', targetDir: 'occupied' });

    expect(confirm).toHaveBeenCalledTimes(1);
    expect(downloadTemplate).not.toHaveBeenCalled();
  });
});
