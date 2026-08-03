import path from 'node:path';
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';

import { MockContractError } from '../core/types.js';
import { cleanupTempDirs, createDataDir, getFixtureViewerDir, MOCK_CONFIG, PLAIN_PAGE } from '../test-helpers/fixtures.js';
import { checkCommand } from './check.js';

const viewerDir = getFixtureViewerDir();

function check(dir: string): Promise<void> {
  return checkCommand(dir, { viewerDir });
}

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => {
  cleanupTempDirs();
});

describe('checkCommand', () => {
  test('正しいデータディレクトリなら全ページを bundle できてサマリを出す', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const dir = createDataDir({
      'mock.config.json': MOCK_CONFIG,
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
      'mock.config.json': MOCK_CONFIG,
      'pages/broken.jsx': 'export default function Broken() { return <div>;\n',
    });

    await expect(check(dir)).rejects.toThrow(MockContractError);
    await expect(check(dir)).rejects.toThrow(/broken\.jsx/);
  }, 60_000);

  test('許可パッケージに存在しない named export も検出する（全ページが実際に bundle される）', async () => {
    const dir = createDataDir({
      'mock.config.json': MOCK_CONFIG,
      'pages/home.jsx': `import { NoSuchComponent } from 'lism-css/react';\nexport default () => <NoSuchComponent />;\n`,
    });

    await expect(check(dir)).rejects.toThrow(/"NoSuchComponent" is not exported/);
  }, 60_000);

  test('許可外の bare import は契約違反として非0終了する', async () => {
    const dir = createDataDir({
      'mock.config.json': MOCK_CONFIG,
      'pages/home.jsx': `import _ from 'lodash';\n${PLAIN_PAGE}`,
    });

    await expect(check(dir)).rejects.toThrow(/not an allowed package entry/);
  }, 60_000);

  test('データディレクトリ外への相対 import は非0終了する', async () => {
    const dir = createDataDir({
      'mock.config.json': MOCK_CONFIG,
      'pages/home.jsx': `import '../../elsewhere/x.jsx';\n${PLAIN_PAGE}`,
    });

    await expect(check(dir)).rejects.toThrow(/Forbidden import/);
  }, 60_000);

  test('スキーマ違反は bundle 前に停止する', async () => {
    const missingVersion = createDataDir({ 'mock.config.json': '{}', 'pages/home.jsx': PLAIN_PAGE });
    await expect(check(missingVersion)).rejects.toThrow(/missing "schemaVersion"/);

    const badTokens = createDataDir({
      'mock.config.json': MOCK_CONFIG,
      'tokens.json': JSON.stringify({ space: { giant: '10rem' } }),
      'pages/home.jsx': PLAIN_PAGE,
    });
    await expect(check(badTokens)).rejects.toThrow(/is not an existing token/);

    const ghostPage = createDataDir({
      'mock.config.json': JSON.stringify({ schemaVersion: 1, pages: { missing: { label: 'x' } } }),
      'pages/home.jsx': PLAIN_PAGE,
    });
    await expect(check(ghostPage)).rejects.toThrow(/references an unknown page id "missing"/);
  });

  test('一時ディレクトリは check 終了後に残らない', async () => {
    const dir = createDataDir({ 'mock.config.json': '{ "schemaVersion": 2 }', 'pages/home.jsx': PLAIN_PAGE });
    await expect(check(dir)).rejects.toThrow(/only supports 1/);
    expect(path.isAbsolute(dir)).toBe(true);
  });
});
