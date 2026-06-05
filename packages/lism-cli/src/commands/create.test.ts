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
const originalIsTTY = process.stdin.isTTY;

function setStdinTTY(value: boolean | undefined): void {
  Object.defineProperty(process.stdin, 'isTTY', { value, configurable: true });
}

/** langOverlays(en) を持つ project 型テンプレ（言語プロンプト系テスト共通） */
const LANG_OVERLAY_TEMPLATE: Parameters<typeof runCreateWithTemplates>[1] = [
  {
    slug: 'blog-astro-minimal',
    kind: 'project',
    category: 'blog',
    stack: 'astro',
    variant: 'minimal',
    sourcePath: 'blog/astro/minimal',
    langOverlays: { en: 'blog/astro/minimal/.lang/en' },
    description: { ja: 'Minimal blog', en: 'Minimal blog' },
  },
];

/** base（ja + .lang/en 同梱）と en overlay（差分のみ）を返す downloadTemplate モック */
function mockBaseWithEnOverlay(): void {
  vi.mocked(downloadTemplate).mockImplementation((source, options) => {
    const dir = (options as { dir: string }).dir;
    fs.mkdirSync(dir, { recursive: true });
    if (String(source).includes('/.lang/en#')) {
      writeFile(path.join(dir, 'src/config/site.ts'), 'export const lang = "en";');
    } else {
      writePackageJson(dir, { name: 'blog-astro-minimal', dependencies: {} });
      writeFile(path.join(dir, 'src/config/site.ts'), 'export const lang = "ja";');
      writeFile(path.join(dir, '.lang/en/src/config/site.ts'), 'export const lang = "en";');
    }
    return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
  });
}

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
    // 既定は非対話端末として扱い、言語選択プロンプトを出さない（en フォールバック）。
    // 対話プロンプトを検証するテストでは個別に setStdinTTY(true) する。
    setStdinTTY(false);
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
    setStdinTTY(originalIsTTY);
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
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'minimal-astro',
        kind: 'project',
        category: 'minimal',
        stack: 'astro',
        sourcePath: 'minimal/astro',
        description: { ja: 'Astro minimal', en: 'Astro minimal' },
      },
    ];
    vi.mocked(select).mockResolvedValue('minimal' as never);
    vi.mocked(input).mockResolvedValue('picked-app' as never);

    await runCreateWithTemplates({ force: true }, templates);

    expect(select).toHaveBeenCalledTimes(1);
    expect(input).toHaveBeenCalledTimes(1);
    expect(downloadTemplate).toHaveBeenCalledWith('github:lism-css/lism-css/templates/minimal/astro#main', {
      dir: path.join(tmpDir, 'picked-app'),
      force: true,
      forceClean: true,
    });
  });

  it('variantが複数ある場合はstack自動確定後に件数付きvariant選択を出す', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'blog-astro-minimal',
        kind: 'project',
        category: 'blog',
        stack: 'astro',
        variant: 'minimal',
        variantLabel: { ja: 'Minimal', en: 'Minimal' },
        sourcePath: 'blog/astro/minimal',
        description: { ja: 'Minimal blog', en: 'Minimal blog' },
      },
      {
        slug: 'blog-astro-techlog',
        kind: 'project',
        category: 'blog',
        stack: 'astro',
        variant: 'techlog',
        variantLabel: { ja: 'Tech Log', en: 'Tech Log' },
        sourcePath: 'blog/astro/techlog',
        description: { ja: 'Tech blog', en: 'Tech blog' },
      },
    ];
    vi.mocked(select)
      .mockResolvedValueOnce('blog' as never)
      .mockResolvedValueOnce('minimal' as never);
    vi.mocked(input).mockResolvedValue('blog-app' as never);

    await runCreateWithTemplates({ force: true }, templates);

    expect(select).toHaveBeenCalledTimes(2);
    expect((vi.mocked(select).mock.calls[1][0] as { message: string }).message).toBe('Select a type (2 options):');
    expect(downloadTemplate).toHaveBeenCalledWith('github:lism-css/lism-css/templates/blog/astro/minimal#main', {
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

  it('project型はlangOverlaysに要求言語があればbase取得後にoverlayをmergeし、.langを除去する', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'blog-astro-minimal',
        kind: 'project',
        category: 'blog',
        stack: 'astro',
        variant: 'minimal',
        sourcePath: 'blog/astro/minimal',
        langOverlays: { en: 'blog/astro/minimal/.lang/en' },
        description: { ja: 'Minimal blog', en: 'Minimal blog' },
      },
    ];
    vi.mocked(downloadTemplate).mockImplementation((source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      if (String(source).includes('/.lang/en#')) {
        // 英語 overlay（差分のみ）
        writeFile(path.join(dir, 'src/config/site.ts'), 'export const lang = "en";');
        writeFile(path.join(dir, 'src/posts/first-blog.md'), 'EN post');
      } else {
        // base（日本語 + .lang 同梱）
        writePackageJson(dir, { name: 'blog-astro-minimal', dependencies: { 'lism-css': 'workspace:*' } });
        writeFile(path.join(dir, 'src/config/site.ts'), 'export const lang = "ja";');
        writeFile(path.join(dir, 'src/posts/first-blog.md'), 'JA post');
        writeFile(path.join(dir, '.lang/en/src/config/site.ts'), 'export const lang = "en";');
      }
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await runCreateWithTemplates({ template: 'blog-astro-minimal', targetDir: 'blog-app', force: true, lang: 'en' }, templates);

    const outDir = path.join(tmpDir, 'blog-app');
    // base + overlay の 2 回取得
    expect(downloadTemplate).toHaveBeenCalledTimes(2);
    expect(downloadTemplate).toHaveBeenNthCalledWith(1, 'github:lism-css/lism-css/templates/blog/astro/minimal#main', {
      dir: outDir,
      force: true,
      forceClean: true,
    });
    expect(downloadTemplate).toHaveBeenNthCalledWith(2, 'github:lism-css/lism-css/templates/blog/astro/minimal/.lang/en#main', {
      dir: expect.any(String),
      force: true,
      forceClean: true,
    });
    // overlay が base を上書きしている
    expect(fs.readFileSync(path.join(outDir, 'src/config/site.ts'), 'utf-8')).toBe('export const lang = "en";');
    expect(fs.readFileSync(path.join(outDir, 'src/posts/first-blog.md'), 'utf-8')).toBe('EN post');
    // 言語 overlay 配信元（.lang）は生成プロジェクトに残らない
    expect(fs.existsSync(path.join(outDir, '.lang'))).toBe(false);
  });

  it('project型でも要求言語にoverlayが無ければoverlayを取得せず、.langは除去する', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'blog-astro-minimal',
        kind: 'project',
        category: 'blog',
        stack: 'astro',
        variant: 'minimal',
        sourcePath: 'blog/astro/minimal',
        langOverlays: { en: 'blog/astro/minimal/.lang/en' },
        description: { ja: 'Minimal blog', en: 'Minimal blog' },
      },
    ];
    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      writePackageJson(dir, { name: 'blog-astro-minimal', dependencies: {} });
      writeFile(path.join(dir, 'src/config/site.ts'), 'export const lang = "ja";');
      writeFile(path.join(dir, '.lang/en/src/config/site.ts'), 'export const lang = "en";');
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await runCreateWithTemplates({ template: 'blog-astro-minimal', targetDir: 'blog-ja', force: true, lang: 'ja' }, templates);

    const outDir = path.join(tmpDir, 'blog-ja');
    // base のみ（ja overlay は未定義なので overlay 取得は走らない）
    expect(downloadTemplate).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync(path.join(outDir, 'src/config/site.ts'), 'utf-8')).toBe('export const lang = "ja";');
    expect(fs.existsSync(path.join(outDir, '.lang'))).toBe(false);
  });

  it('langOverlays未定義のproject型は--lang enでもoverlayを取得しない', async () => {
    // beforeEach の mock（langOverlays 無しの minimal-astro 相当）をそのまま使う
    await runCreate({ template: 'minimal-astro', targetDir: 'my-app', force: true, lang: 'en' });

    expect(downloadTemplate).toHaveBeenCalledTimes(1);
  });

  it('--lang未指定+非TTYは言語プロンプトを出さずenにフォールバックし、enのoverlayを適用する', async () => {
    setStdinTTY(false);
    mockBaseWithEnOverlay();

    await runCreateWithTemplates({ template: 'blog-astro-minimal', targetDir: 'blog-app', force: true }, LANG_OVERLAY_TEMPLATE);

    expect(select).not.toHaveBeenCalled();
    // base + en overlay の 2 回取得（en にフォールバック）
    expect(downloadTemplate).toHaveBeenCalledTimes(2);
    expect(fs.readFileSync(path.join(tmpDir, 'blog-app', 'src/config/site.ts'), 'utf-8')).toBe('export const lang = "en";');
  });

  it('--lang未指定+TTYは最初に言語選択を出し、選択言語(en)のoverlayを適用する', async () => {
    setStdinTTY(true);
    mockBaseWithEnOverlay();
    vi.mocked(select).mockResolvedValueOnce('en' as never);

    await runCreateWithTemplates({ template: 'blog-astro-minimal', targetDir: 'blog-app', force: true }, LANG_OVERLAY_TEMPLATE);

    // template/targetDir 指定済みなので select は言語選択の1回だけ
    expect(select).toHaveBeenCalledTimes(1);
    expect((vi.mocked(select).mock.calls[0][0] as { message: string }).message).toBe('Select language / 言語を選択:');
    // 選択した en の overlay が適用される
    expect(downloadTemplate).toHaveBeenCalledTimes(2);
    expect(fs.readFileSync(path.join(tmpDir, 'blog-app', 'src/config/site.ts'), 'utf-8')).toBe('export const lang = "en";');
  });

  it('--lang未指定+TTYで言語にjaを選ぶと、enのoverlayは適用されずjaベースになる', async () => {
    setStdinTTY(true);
    mockBaseWithEnOverlay();
    vi.mocked(select).mockResolvedValueOnce('ja' as never);

    await runCreateWithTemplates({ template: 'blog-astro-minimal', targetDir: 'blog-ja', force: true }, LANG_OVERLAY_TEMPLATE);

    expect(select).toHaveBeenCalledTimes(1);
    expect(downloadTemplate).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync(path.join(tmpDir, 'blog-ja', 'src/config/site.ts'), 'utf-8')).toBe('export const lang = "ja";');
  });

  it('--lang ja明示時はTTYでも言語プロンプトを出さずjaベースを生成する', async () => {
    setStdinTTY(true);
    mockBaseWithEnOverlay();

    await runCreateWithTemplates({ template: 'blog-astro-minimal', targetDir: 'blog-ja', force: true, lang: 'ja' }, LANG_OVERLAY_TEMPLATE);

    expect(select).not.toHaveBeenCalled();
    expect(downloadTemplate).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync(path.join(tmpDir, 'blog-ja', 'src/config/site.ts'), 'utf-8')).toBe('export const lang = "ja";');
  });

  it('--lang未指定+TTYで対話が必要な場合、言語選択を一番最初に出す', async () => {
    setStdinTTY(true);
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'blog-astro-minimal',
        kind: 'project',
        category: 'blog',
        stack: 'astro',
        variant: 'minimal',
        variantLabel: { ja: 'Minimal', en: 'Minimal' },
        sourcePath: 'blog/astro/minimal',
        description: { ja: 'Minimal blog', en: 'Minimal blog' },
      },
      {
        slug: 'blog-astro-techlog',
        kind: 'project',
        category: 'blog',
        stack: 'astro',
        variant: 'techlog',
        variantLabel: { ja: 'Tech Log', en: 'Tech Log' },
        sourcePath: 'blog/astro/techlog',
        description: { ja: 'Tech blog', en: 'Tech blog' },
      },
    ];
    vi.mocked(select)
      .mockResolvedValueOnce('en' as never) // 言語
      .mockResolvedValueOnce('blog' as never) // カテゴリ
      .mockResolvedValueOnce('minimal' as never); // タイプ（variant）
    vi.mocked(input).mockResolvedValue('blog-app' as never);

    await runCreateWithTemplates({ force: true }, templates);

    // 言語 → カテゴリ → タイプ の 3 回。1 回目が言語選択であること
    expect(select).toHaveBeenCalledTimes(3);
    expect((vi.mocked(select).mock.calls[0][0] as { message: string }).message).toBe('Select language / 言語を選択:');
  });

  it('single-project-variant型は選択variantのindex.astroをsrc/pages/index.astroに持ち上げ、他variantを削除しpackage.json.nameを書き換える', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'lp-astro-interior',
        kind: 'single-project-variant',
        category: 'lp',
        stack: 'astro',
        variant: 'interior',
        variantLabel: { ja: 'Interior', en: 'Interior' },
        sourcePath: 'lp/astro',
        packageName: 'lp-astro-interior',
        description: { ja: 'Interior LP', en: 'Interior landing page' },
      },
    ];

    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      writePackageJson(dir, { name: 'lp-astro', dependencies: { 'lism-css': 'workspace:*' } });
      writeFile(path.join(dir, 'src/pages/index.astro'), 'list');
      writeFile(path.join(dir, 'src/pages/corporate/index.astro'), 'corporate');
      writeFile(path.join(dir, 'src/pages/interior/index.astro'), 'interior');
      writeFile(path.join(dir, 'src/pages/interior/_style.css'), '.interior{}');
      writeFile(path.join(dir, 'src/pages/ryokan/index.astro'), 'ryokan');
      writeFile(path.join(dir, 'src/pages/ryokan/_style.css'), '.ryokan{}');
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await runCreateWithTemplates({ template: 'lp-astro-interior', targetDir: 'lp-app', force: true }, templates);

    const outDir = path.join(tmpDir, 'lp-app');

    // 選択 variant の index.astro が src/pages/index.astro に持ち上がっている
    expect(fs.readFileSync(path.join(outDir, 'src/pages/index.astro'), 'utf-8')).toBe('interior');

    // 選択 variant の付随ファイル（_style.css）も src/pages/ に持ち上がっている
    expect(fs.readFileSync(path.join(outDir, 'src/pages/_style.css'), 'utf-8')).toBe('.interior{}');

    // 他 variant ディレクトリ + 自分の variant ディレクトリも残らない
    expect(fs.existsSync(path.join(outDir, 'src/pages/corporate'))).toBe(false);
    expect(fs.existsSync(path.join(outDir, 'src/pages/interior'))).toBe(false);
    expect(fs.existsSync(path.join(outDir, 'src/pages/ryokan'))).toBe(false);

    // src/pages 直下に残るのは index.astro と _style.css のみ
    const remaining = fs.readdirSync(path.join(outDir, 'src/pages')).sort();
    expect(remaining).toEqual(['_style.css', 'index.astro']);

    // package.json の name が packageName に書き換わる
    const pkg = JSON.parse(fs.readFileSync(path.join(outDir, 'package.json'), 'utf-8')) as {
      name: string;
      dependencies: Record<string, string>;
    };
    expect(pkg.name).toBe('lp-astro-interior');
    // workspace:* も同時に置換される
    expect(pkg.dependencies['lism-css']).not.toBe('workspace:*');
  });

  it('single-project-variant型はsrc/配下の任意のサブディレクトリの{variant}/も持ち上げ、@/{dir}/{variant}/形式のimportを書き換える', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'lp-astro-corporate',
        kind: 'single-project-variant',
        category: 'lp',
        stack: 'astro',
        variant: 'corporate',
        variantLabel: { ja: 'Corporate', en: 'Corporate' },
        sourcePath: 'lp/astro',
        packageName: 'lp-astro-corporate',
        description: { ja: 'Corporate LP', en: 'Corporate landing page' },
      },
    ];

    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      writePackageJson(dir, { name: 'lp-astro', dependencies: { 'lism-css': 'workspace:*' } });

      // pages: index は corporate のみ持ち上がる想定
      writeFile(
        path.join(dir, 'src/pages/corporate/index.astro'),
        [
          '---',
          "import Hero from '@/components/corporate/Hero.astro';",
          "import Heading from '@/components/corporate/Heading.astro';",
          "import '@/styles/corporate/main.css';",
          '---',
          '<Hero /> <Heading />',
        ].join('\n')
      );
      writeFile(path.join(dir, 'src/pages/corporate/_style.css'), '.corporate{}');
      writeFile(path.join(dir, 'src/pages/interior/index.astro'), 'interior');

      // components: variant ディレクトリ規約
      writeFile(path.join(dir, 'src/components/corporate/Hero.astro'), '<div>corp hero</div>');
      writeFile(path.join(dir, 'src/components/corporate/Heading.astro'), '<h1>corp</h1>');
      writeFile(path.join(dir, 'src/components/interior/Hero.astro'), '<div>nat hero</div>');

      // styles: variant ディレクトリ規約
      writeFile(path.join(dir, 'src/styles/corporate/main.css'), '.corp-main{}');
      writeFile(path.join(dir, 'src/styles/interior/main.css'), '.nat-main{}');

      // lib: 共通ファイル + variant 規約は存在しない（このディレクトリは触らない）
      writeFile(path.join(dir, 'src/lib/util.ts'), 'export const x = 1;');

      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await runCreateWithTemplates({ template: 'lp-astro-corporate', targetDir: 'lp-app', force: true }, templates);

    const outDir = path.join(tmpDir, 'lp-app');

    // pages: corporate が持ち上がり、他 variant + 自 variant ディレクトリは消える
    expect(fs.existsSync(path.join(outDir, 'src/pages/corporate'))).toBe(false);
    expect(fs.existsSync(path.join(outDir, 'src/pages/interior'))).toBe(false);
    expect(fs.readFileSync(path.join(outDir, 'src/pages/_style.css'), 'utf-8')).toBe('.corporate{}');

    // pages/index.astro 内の @/components/corporate/ → @/components/ に書き換え
    const indexContent = fs.readFileSync(path.join(outDir, 'src/pages/index.astro'), 'utf-8');
    expect(indexContent).toContain("import Hero from '@/components/Hero.astro';");
    expect(indexContent).toContain("import Heading from '@/components/Heading.astro';");
    expect(indexContent).toContain("import '@/styles/main.css';");
    expect(indexContent).not.toContain('/corporate/');

    // components: corporate の中身が持ち上がり、他 variant は消える
    expect(fs.existsSync(path.join(outDir, 'src/components/corporate'))).toBe(false);
    expect(fs.existsSync(path.join(outDir, 'src/components/interior'))).toBe(false);
    expect(fs.readFileSync(path.join(outDir, 'src/components/Hero.astro'), 'utf-8')).toBe('<div>corp hero</div>');
    expect(fs.readFileSync(path.join(outDir, 'src/components/Heading.astro'), 'utf-8')).toBe('<h1>corp</h1>');

    // styles: 同様
    expect(fs.existsSync(path.join(outDir, 'src/styles/corporate'))).toBe(false);
    expect(fs.existsSync(path.join(outDir, 'src/styles/interior'))).toBe(false);
    expect(fs.readFileSync(path.join(outDir, 'src/styles/main.css'), 'utf-8')).toBe('.corp-main{}');

    // lib: variant 規約のディレクトリではないので既存ファイルはそのまま
    expect(fs.readFileSync(path.join(outDir, 'src/lib/util.ts'), 'utf-8')).toBe('export const x = 1;');
  });

  it('single-project-variant型でcomponents等のvariantディレクトリが存在しなくてもエラーにならない', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'lp-astro-ryokan',
        kind: 'single-project-variant',
        category: 'lp',
        stack: 'astro',
        variant: 'ryokan',
        sourcePath: 'lp/astro',
        packageName: 'lp-astro-ryokan',
        description: { ja: 'Ryokan LP', en: 'Ryokan landing page' },
      },
    ];

    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      writePackageJson(dir, { name: 'lp-astro', dependencies: {} });
      // pages のみ variant 構造、components ディレクトリ自体が無い
      writeFile(path.join(dir, 'src/pages/ryokan/index.astro'), 'ryokan');
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await runCreateWithTemplates({ template: 'lp-astro-ryokan', targetDir: 'lp-ryokan', force: true }, templates);

    const outDir = path.join(tmpDir, 'lp-ryokan');
    expect(fs.readFileSync(path.join(outDir, 'src/pages/index.astro'), 'utf-8')).toBe('ryokan');
    expect(fs.existsSync(path.join(outDir, 'src/components'))).toBe(false);
  });

  it('single-project-variant型でvariantディレクトリが空でもエラーにならず、他variantを掃除する', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'lp-astro-corp-empty',
        kind: 'single-project-variant',
        category: 'lp',
        stack: 'astro',
        variant: 'corporate',
        sourcePath: 'lp/astro',
        packageName: 'lp-astro-corp-empty',
        description: { ja: 'corp empty', en: 'corp empty' },
      },
    ];

    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      writePackageJson(dir, { name: 'lp-astro', dependencies: {} });
      writeFile(path.join(dir, 'src/pages/corporate/index.astro'), 'corp');
      // components/corporate/ は空ディレクトリだが、他 variant には中身がある
      fs.mkdirSync(path.join(dir, 'src/components/corporate'), { recursive: true });
      writeFile(path.join(dir, 'src/components/interior/Hero.astro'), '<div>nat</div>');
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await runCreateWithTemplates({ template: 'lp-astro-corp-empty', targetDir: 'lp-corp-empty', force: true }, templates);

    const outDir = path.join(tmpDir, 'lp-corp-empty');
    // corporate ディレクトリは空でもエラーにならず、interior は掃除される
    expect(fs.existsSync(path.join(outDir, 'src/components/corporate'))).toBe(false);
    expect(fs.existsSync(path.join(outDir, 'src/components/interior'))).toBe(false);
    // 持ち上げる中身が無いので components 直下に追加ファイルは無いが、ディレクトリ自体は残る
    expect(fs.existsSync(path.join(outDir, 'src/components'))).toBe(true);
    expect(fs.readdirSync(path.join(outDir, 'src/components'))).toEqual([]);
  });

  it('single-project-variant型で対象variantが存在しない場合はvariantMissingを返す', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'lp-astro-missing',
        kind: 'single-project-variant',
        category: 'lp',
        stack: 'astro',
        variant: 'missing',
        sourcePath: 'lp/astro',
        packageName: 'lp-astro-missing',
        description: { ja: 'missing', en: 'missing' },
      },
    ];

    vi.mocked(downloadTemplate).mockImplementation((_source, options) => {
      const dir = (options as { dir: string }).dir;
      fs.mkdirSync(dir, { recursive: true });
      writePackageJson(dir, { name: 'lp-astro', dependencies: {} });
      writeFile(path.join(dir, 'src/pages/index.astro'), 'list');
      writeFile(path.join(dir, 'src/pages/corporate/index.astro'), 'corporate');
      return Promise.resolve({} as Awaited<ReturnType<typeof downloadTemplate>>);
    });

    await expect(runCreateWithTemplates({ template: 'lp-astro-missing', targetDir: 'lp-missing', force: true }, templates)).rejects.toThrow(
      'Variant "missing"'
    );
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

  it('--templateにカテゴリslugを指定するとstack選択へ降りる', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'minimal-astro',
        kind: 'project',
        category: 'minimal',
        stack: 'astro',
        sourcePath: 'minimal/astro',
        description: { ja: 'Astro minimal', en: 'Astro minimal' },
      },
      {
        slug: 'minimal-vite',
        kind: 'project',
        category: 'minimal',
        stack: 'vite',
        sourcePath: 'minimal/vite',
        description: { ja: 'Vite minimal', en: 'Vite minimal' },
      },
    ];
    vi.mocked(select).mockResolvedValueOnce('vite' as never);

    await runCreateWithTemplates({ template: 'minimal', targetDir: 'cat-app', force: true }, templates);

    expect(select).toHaveBeenCalledTimes(1);
    expect((vi.mocked(select).mock.calls[0][0] as { message: string }).message).toBe('Select a stack (2 options):');
    expect(downloadTemplate).toHaveBeenCalledWith('github:lism-css/lism-css/templates/minimal/vite#main', {
      dir: path.join(tmpDir, 'cat-app'),
      force: true,
      forceClean: true,
    });
  });

  it('--templateにカテゴリslugを指定し対象テンプレートが0件なら従来通りエラーを返す', async () => {
    const templates: Parameters<typeof runCreateWithTemplates>[1] = [
      {
        slug: 'minimal-astro',
        kind: 'project',
        category: 'minimal',
        stack: 'astro',
        sourcePath: 'minimal/astro',
        description: { ja: 'Astro minimal', en: 'Astro minimal' },
      },
    ];

    await expect(runCreateWithTemplates({ template: 'blog', targetDir: 'x', force: true }, templates)).rejects.toThrow('Template "blog" not found');
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
