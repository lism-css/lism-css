import fs from 'node:fs';
import path from 'node:path';
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';

import { resolveGeneratedConfigDir, resolveViteCacheDir } from '../core/runtime.js';
import { MockupContractError } from '../core/types.js';
import {
  cleanupTempDirs,
  createDataDir,
  createTempDir,
  getFixtureViewerDir,
  installFakePackage,
  MOCKUP_CONFIG,
  PLAIN_PAGE,
  writeFiles,
} from '../test-helpers/fixtures.js';
import { checkCommand } from './check.js';

const viewerDir = getFixtureViewerDir();

/** check を実行したデータディレクトリ（後片付けで共有ディレクトリの場所を再現するために覚えておく）。 */
const checkedDirs: string[] = [];

function check(dir: string): Promise<void> {
  checkedDirs.push(dir);
  return checkCommand(dir, { viewerDir });
}

/** データディレクトリの `imports`（共有ディレクトリのキーの一部）。読めなければ空扱い。 */
function readImports(dir: string): string[] {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, 'mockup.config.json'), 'utf-8')) as { imports?: string[] };
    return Array.isArray(raw.imports) ? raw.imports : [];
  } catch {
    return [];
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  // cacheDir / configDir は起動間で使い回すため runtime.cleanup() では消えない。
  // テストが os.tmpdir() に作った分だけ、キーを同じ入力から再現して片付ける。
  for (const dir of checkedDirs) {
    if (!fs.existsSync(dir)) continue;
    const real = fs.realpathSync(dir);
    const imports = readImports(real);
    for (const shared of [resolveViteCacheDir(real, imports), resolveGeneratedConfigDir(real, imports)]) {
      fs.rmSync(shared, { recursive: true, force: true });
    }
  }
  cleanupTempDirs();
});

describe('checkCommand', () => {
  test('正しいデータディレクトリなら全ページを bundle できてサマリを出す', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const dir = createDataDir({
      'mockup.config.json': MOCKUP_CONFIG,
      'tokens.json': JSON.stringify({ color: { canvas: '#f7f7f7' } }),
      'pages/home.jsx': `import { Box } from 'lism-css/react';\nimport './home.css';\n\nexport default function Home() {\n  return <Box c="canvas">home</Box>;\n}\n`,
      'pages/home.css': '.home { color: var(--canvas); }\n',
      'pages/admin/users.tsx': `type Props = { title: string };\nexport default function Users({ title = 'users' }: Partial<Props>) {\n  return <div>{title}</div>;\n}\n`,
    });

    await expect(check(dir)).resolves.toBeUndefined();

    const output = log.mock.calls.map((args) => String(args[0])).join('\n');
    expect(output).toContain('check passed');
    expect(output).toContain('pages: 2 (admin/users, home)');
    expect(output).toContain('tokens: 1 override(s)');
  }, 60_000);

  test('ページの構文エラーは対象ファイル付きで非0終了する', async () => {
    const dir = createDataDir({
      'mockup.config.json': MOCKUP_CONFIG,
      'pages/broken.jsx': 'export default function Broken() { return <div>;\n',
    });

    await expect(check(dir)).rejects.toThrow(MockupContractError);
    await expect(check(dir)).rejects.toThrow(/broken\.jsx/);
  }, 60_000);

  test('許可パッケージに存在しない named export も検出する（全ページが実際に bundle される）', async () => {
    const dir = createDataDir({
      'mockup.config.json': MOCKUP_CONFIG,
      'pages/home.jsx': `import { NoSuchComponent } from 'lism-css/react';\nexport default () => <NoSuchComponent />;\n`,
    });

    await expect(check(dir)).rejects.toThrow(/"NoSuchComponent" is not exported/);
  }, 60_000);

  test('lucide-react のアイコンは仮想モジュールから bundle できる', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const dir = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['lucide-react'] }),
      'pages/home.jsx': `import { Bell, TrendingUp, Trash2, Sidebar } from 'lucide-react';\nexport default () => <><Bell /><TrendingUp /><Trash2 /><Sidebar /></>;\n`,
    });

    await expect(check(dir)).resolves.toBeUndefined();
  }, 60_000);

  test('存在しないアイコン名は bundle 時に検出する', async () => {
    const dir = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['lucide-react'] }),
      'pages/home.jsx': `import { NoSuchIcon } from 'lucide-react';\nexport default () => <NoSuchIcon />;\n`,
    });

    await expect(check(dir)).rejects.toThrow(/"NoSuchIcon" is not exported/);
  }, 60_000);

  test('許可外の bare import は契約違反として非0終了する', async () => {
    const dir = createDataDir({
      'mockup.config.json': MOCKUP_CONFIG,
      'pages/home.jsx': `import _ from 'lodash';\n${PLAIN_PAGE}`,
    });

    await expect(check(dir)).rejects.toThrow(/not an allowed package entry/);
  }, 60_000);

  test('データディレクトリ外への相対 import は非0終了する', async () => {
    const dir = createDataDir({
      'mockup.config.json': MOCKUP_CONFIG,
      'pages/home.jsx': `import '../../elsewhere/x.jsx';\n${PLAIN_PAGE}`,
    });

    await expect(check(dir)).rejects.toThrow(/Forbidden import/);
  }, 60_000);

  test('スキーマ違反は bundle 前に停止する', async () => {
    const missingVersion = createDataDir({ 'mockup.config.json': '{}', 'pages/home.jsx': PLAIN_PAGE });
    await expect(check(missingVersion)).rejects.toThrow(/missing "schemaVersion"/);

    const badTokens = createDataDir({
      'mockup.config.json': MOCKUP_CONFIG,
      'tokens.json': JSON.stringify({ space: { giant: '10rem' } }),
      'pages/home.jsx': PLAIN_PAGE,
    });
    await expect(check(badTokens)).rejects.toThrow(/is not an existing token/);

    const ghostPage = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, pages: { missing: { label: 'x' } } }),
      'pages/home.jsx': PLAIN_PAGE,
    });
    await expect(check(ghostPage)).rejects.toThrow(/references an unknown page id "missing"/);
  });

  test('imports で宣言したパッケージはプロジェクト側から解決して bundle できる', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    // データディレクトリをプロジェクト直下に置く（node_modules がデータディレクトリ配下に入る構成）。
    const project = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['fake-ui'] }),
      'pages/home.jsx': `import { Badge } from 'fake-ui';\nexport default function Home() {\n  return <div>{Badge}</div>;\n}\n`,
    });
    installFakePackage(project, 'fake-ui', {
      'package.json': JSON.stringify({ name: 'fake-ui', version: '1.0.0', type: 'module', exports: { '.': './index.js' } }),
      'index.js': `export const Badge = 'badge';\n`,
    });

    await expect(check(project)).resolves.toBeUndefined();
  }, 60_000);

  test('exports の無い追加パッケージの `..` サブパスからデータディレクトリ外のファイルへ抜けられない', async () => {
    // データディレクトリの外にファイルを置くため、一段深い場所をデータディレクトリにする。
    const project = createTempDir();
    writeFiles(project, {
      'outside.js': `export const secret = 'secret';\n`,
      'data/mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['fake-plain'] }),
      'data/pages/home.jsx': `import { secret } from 'fake-plain/../../outside.js';\nexport default function Home() {\n  return <div>{secret}</div>;\n}\n`,
    });
    installFakePackage(project, 'fake-plain', {
      'package.json': JSON.stringify({ name: 'fake-plain', version: '1.0.0', type: 'module' }),
      'index.js': `export const ok = 1;\n`,
    });

    await expect(check(path.join(project, 'data'))).rejects.toThrow(/not an allowed package entry/);
  }, 60_000);

  test('拡張子省略の import でパッケージ外を指すシンボリックリンクを辿れない', async () => {
    const project = createTempDir();
    writeFiles(project, {
      'outside.js': `export const secret = 'secret';\n`,
      'data/mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['fake-plain'] }),
      // `escape.js` は node_modules 外を指すリンク。拡張子を省くと許可リストの文字列判定を通ってしまう。
      'data/pages/home.jsx': `import { secret } from 'fake-plain/escape';\nexport default function Home() {\n  return <div>{secret}</div>;\n}\n`,
    });
    installFakePackage(project, 'fake-plain', {
      'package.json': JSON.stringify({ name: 'fake-plain', version: '1.0.0', type: 'module' }),
      'index.js': `export const ok = 1;\n`,
    });
    fs.symlinkSync(path.join(project, 'outside.js'), path.join(project, 'node_modules', 'fake-plain', 'escape.js'));

    await expect(check(path.join(project, 'data'))).rejects.toThrow(/resolves outside the allowed packages/);
  }, 60_000);

  test('imports で宣言したパッケージが未インストールなら bundle 前に停止する', async () => {
    const dir = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['not-installed-anywhere'] }),
      'pages/home.jsx': PLAIN_PAGE,
    });

    await expect(check(dir)).rejects.toThrow(/not installed: "not-installed-anywhere"/);
  });

  test('一時ディレクトリは check 終了後に残らない', async () => {
    const dir = createDataDir({ 'mockup.config.json': '{ "schemaVersion": 1 }', 'pages/home.jsx': PLAIN_PAGE });
    await expect(check(dir)).rejects.toThrow(/only supports 2/);
    expect(path.isAbsolute(dir)).toBe(true);
  });
});
