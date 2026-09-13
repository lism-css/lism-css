import fs from 'node:fs';
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';

import { resolveViteCacheDir } from '../core/runtime.js';
import { MockupContractError } from '../core/types.js';
import { cleanupTempDirs, createDataDir, getFixtureViewerDir, installFakePackage, MOCKUP_CONFIG, PLAIN_PAGE } from '../test-helpers/fixtures.js';
import { cleanupSharedDirs, trackCheckedDir } from '../test-helpers/shared-dirs.js';
import { checkCommand } from './check.js';

const viewerDir = getFixtureViewerDir();

function check(dir: string): Promise<void> {
  return checkCommand(trackCheckedDir(dir), { viewerDir });
}

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  cleanupSharedDirs();
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

  test('lucide-react のアイコン・Icon・createLucideIcon は仮想モジュールから bundle できる', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const dir = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['lucide-react'] }),
      'pages/home.jsx':
        `import { Bell, TrendingUp, Icon, createLucideIcon } from 'lucide-react';\n` +
        `const node = [['path', { d: 'M1 2', key: 'a' }]];\n` +
        `const Custom = createLucideIcon('custom', node);\n` +
        `export default () => <><Bell /><TrendingUp /><Icon iconNode={node} /><Custom /></>;\n`,
    });

    await expect(check(dir)).resolves.toBeUndefined();
  }, 60_000);

  test('存在しないアイコン名は候補付きの契約エラーになる', async () => {
    const dir = createDataDir({
      'mockup.config.json': JSON.stringify({ schemaVersion: 2, imports: ['lucide-react'] }),
      'pages/home.jsx': `import { bell } from 'lucide-react';\nexport default () => <div>{String(bell)}</div>;\n`,
    });

    // rollup の「そんな export は無い」ではなく、何を import すべきかが分かる文言にする。
    await expect(check(dir)).rejects.toThrow(MockupContractError);
    await expect(check(dir)).rejects.toThrow(/"bell" is not an icon of lucide-react\. Did you mean "Bell"\?/);
  }, 60_000);

  test('許可外の bare import は契約違反として非0終了する', async () => {
    const dir = createDataDir({
      'mockup.config.json': MOCKUP_CONFIG,
      'pages/home.jsx': `import _ from 'lodash';\n${PLAIN_PAGE}`,
    });

    await expect(check(dir)).rejects.toThrow(/not an allowed package entry/);
  }, 60_000);

  test('スキーマ違反は bundle 前に停止する', async () => {
    const dir = createDataDir({ 'mockup.config.json': '{}', 'pages/home.jsx': PLAIN_PAGE });

    await expect(check(dir)).rejects.toThrow(/missing "schemaVersion"/);
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

  test('一時ディレクトリは check 終了後に残らない', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const dir = createDataDir({ 'mockup.config.json': MOCKUP_CONFIG, 'pages/home.jsx': PLAIN_PAGE });
    const mkdtemp = vi.spyOn(fs, 'mkdtempSync');

    await expect(check(dir)).resolves.toBeUndefined();

    const tempDirs = mkdtemp.mock.results.map((result) => result.value as string);
    expect(tempDirs).toHaveLength(1);
    expect(fs.existsSync(tempDirs[0])).toBe(false);
    // check は依存の事前バンドルを行わないので、共有 cacheDir も作らない。
    expect(fs.existsSync(resolveViteCacheDir(dir))).toBe(false);
  }, 60_000);
});
