import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import type { ViteDevServer } from 'vite';

import type { MockupRuntime } from '../core/runtime.js';
import { cleanupTempDirs, createTempDir, getFixtureViewerDir, writeFiles } from '../test-helpers/fixtures.js';
import { RESOLVED_VIRTUAL_PAGES_ID, RESOLVED_VIRTUAL_TOKENS_CSS_ID, RESOLVED_VIRTUAL_TOKENS_DATA_ID } from '../vite/virtual-modules.js';
import { classifyDataEvent, createMockDevServer } from './dev.js';

const HOME_PAGE = `import { Box } from 'lism-css/react';
import { Check } from 'lucide-react';
import './home.css';

export default function Home() {
  return (
    <Box c="canvas" p={30}>
      <Check />
      home
    </Box>
  );
}
`;

const USERS_PAGE = `type Props = { title: string };

function Title({ title }: Props) {
  return <h1 className="-fz:l">{title}</h1>;
}

export default function Users() {
  return <Title title="users" />;
}
`;

let projectDir: string;
let dataDir: string;
let server: ViteDevServer;
let runtime: MockupRuntime;

beforeAll(async () => {
  projectDir = createTempDir();
  writeFiles(projectDir, {
    // データディレクトリの親に同名パッケージを置いても、@lism-css/mockup 側へ解決されることを確かめる。
    'node_modules/react/package.json': JSON.stringify({ name: 'react', version: '0.0.0-fake', main: 'index.js' }),
    'node_modules/react/index.js': 'export default "fake react";\n',
    'data/mockup.config.json': JSON.stringify({
      schemaVersion: 1,
      title: 'Integration',
      pages: { home: { label: 'Home', order: 1 } },
    }),
    'data/tokens.json': JSON.stringify({ color: { canvas: '#f7f7f7' }, space: { '30': '1.5rem' } }),
    'data/pages/home.jsx': HOME_PAGE,
    'data/pages/home.css': '.home { color: var(--canvas); }\n',
    'data/pages/admin/users.tsx': USERS_PAGE,
  });
  dataDir = path.join(projectDir, 'data');

  // listen は不要（transformRequest / pluginContainer だけを使う）。ポート占有と後片付けを避ける。
  ({ server, runtime } = await createMockDevServer(dataDir, { viewerDir: getFixtureViewerDir() }));
}, 60_000);

afterAll(async () => {
  await server?.close();
  runtime?.cleanup();
  cleanupTempDirs();
}, 60_000);

describe('dev サーバー', () => {
  test('.jsx ページを transform できる', async () => {
    const result = await server.transformRequest(`/@fs${path.join(dataDir, 'pages/home.jsx')}`);

    expect(result).not.toBeNull();
    expect(result?.code).toContain('jsxDEV');
    // 相対 CSS・許可パッケージの import が解決済みになっている（未解決なら import-analysis が例外を投げる）。
    expect(result?.code).toContain('home.css');
  });

  test('.tsx ページも transform できる（型は剥がすだけ）', async () => {
    const result = await server.transformRequest(`/@fs${path.join(dataDir, 'pages/admin/users.tsx')}`);

    expect(result).not.toBeNull();
    expect(result?.code).not.toContain('type Props');
  });

  test('virtual:lism-mockup/pages が列挙結果を供給する', async () => {
    const result = await server.transformRequest(RESOLVED_VIRTUAL_PAGES_ID);

    expect(result?.code).toContain('"home"');
    expect(result?.code).toContain('"admin/users"');
    expect(result?.code).toContain('"Home"');
  });

  test('virtual:lism-mockup/tokens.css に tokens.json の内容が反映される', async () => {
    const result = await server.transformRequest(RESOLVED_VIRTUAL_TOKENS_CSS_ID);

    expect(result?.code).toContain('--canvas: #f7f7f7');
    expect(result?.code).toContain('--s30: 1.5rem');
  });

  test('virtual:lism-mockup/tokens が tokens.json の反映結果を source 付きで供給する', async () => {
    const result = await server.transformRequest(RESOLVED_VIRTUAL_TOKENS_DATA_ID);

    expect(result?.code).toContain('export const tokenGroups = [');
    // color の新キーは custom、既存キーの上書きは overridden。
    expect(result?.code).toContain('"varName": "--canvas"');
    expect(result?.code).toContain('"source": "custom"');
    expect(result?.code).toContain('"varName": "--s30"');
    expect(result?.code).toContain('"source": "overridden"');
  });

  test('ビューアからの仮想モジュール指定子は解決済み id へ解決される', async () => {
    const importer = path.join(getFixtureViewerDir(), 'main.js');

    // `tokens.css` と前方一致するが、完全一致比較なので取り違えない。
    expect((await server.pluginContainer.resolveId('virtual:lism-mockup/tokens', importer))?.id).toBe(RESOLVED_VIRTUAL_TOKENS_DATA_ID);
    expect((await server.pluginContainer.resolveId('virtual:lism-mockup/tokens.css', importer))?.id).toBe(RESOLVED_VIRTUAL_TOKENS_CSS_ID);
  });

  test('ページからの react は @lism-css/mockup 側へ解決される（親の同名パッケージを見ない）', async () => {
    const resolved = await server.pluginContainer.resolveId('react', path.join(dataDir, 'pages/home.jsx'));

    expect(resolved).not.toBeNull();
    expect(resolved?.id).not.toContain(projectDir);
  });

  test('許可外の bare import は契約違反として拒否する', async () => {
    await expect(server.pluginContainer.resolveId('lodash', path.join(dataDir, 'pages/home.jsx'))).rejects.toThrow(/not an allowed package entry/);
    await expect(server.pluginContainer.resolveId('@lism-css/ui/react/NoSuchComponent', path.join(dataDir, 'pages/home.jsx'))).rejects.toThrow(
      /not an allowed package entry/
    );
  });

  test('データディレクトリ外への参照は拒否する', async () => {
    const importer = path.join(dataDir, 'pages/home.jsx');

    await expect(server.pluginContainer.resolveId('../../outside.jsx', importer)).rejects.toThrow(/Forbidden import/);
    await expect(server.pluginContainer.resolveId('/etc/passwd', importer)).rejects.toThrow(/absolute paths are not allowed/);
    await expect(server.pluginContainer.resolveId(`/@fs${projectDir}/node_modules/react/index.js`, importer)).rejects.toThrow(
      /"\/@fs\/" paths are not allowed/
    );
  });

  test('cacheDir はプロセス固有の一時ディレクトリを指す（並行起動で干渉しない）', () => {
    expect(runtime.cacheDir.startsWith(runtime.tempDir)).toBe(true);
    expect(runtime.cacheDir).not.toContain(dataDir);
    expect(server.config.cacheDir).toBe(runtime.cacheDir);
  });

  test('server.fs.allow はデータディレクトリを含み、その親は含まない（localhost 限定）', () => {
    expect(server.config.server.fs.strict).toBe(true);
    expect(server.config.server.fs.allow).toContain(dataDir);
    expect(server.config.server.fs.allow).not.toContain(projectDir);
    expect(server.config.server.host).toBe('localhost');
  });

  test('tokens.json を書き換えると config と CSS とトークン一覧を作り直す', async () => {
    writeFiles(dataDir, { 'tokens.json': JSON.stringify({ color: { canvas: '#000000' } }) });
    await runtime.refreshTokens();

    expect(runtime.tokensCss).toContain('--canvas: #000000');
    expect(runtime.tokensData.find((entry) => entry.group === 'color')?.tokens).toContainEqual({
      key: 'canvas',
      varName: '--canvas',
      value: '#000000',
      source: 'custom',
    });
    // 上書きを消した space は default に戻る。
    expect(runtime.tokensData.find((entry) => entry.group === 'space')?.tokens.every((token) => token.source === 'default')).toBe(true);

    for (const id of [RESOLVED_VIRTUAL_TOKENS_CSS_ID, RESOLVED_VIRTUAL_TOKENS_DATA_ID]) {
      const mod = server.moduleGraph.getModuleById(id);
      if (mod) server.moduleGraph.invalidateModule(mod);
    }

    expect((await server.transformRequest(RESOLVED_VIRTUAL_TOKENS_CSS_ID))?.code).toContain('--canvas: #000000');
    expect((await server.transformRequest(RESOLVED_VIRTUAL_TOKENS_DATA_ID))?.code).toContain('"value": "#000000"');
  });

  test('watch 対象の分類', () => {
    expect(classifyDataEvent(dataDir, 'change', path.join(dataDir, 'tokens.json'))).toBe('tokens');
    expect(classifyDataEvent(dataDir, 'change', path.join(dataDir, 'mockup.config.json'))).toBe('pages');
    expect(classifyDataEvent(dataDir, 'add', path.join(dataDir, 'pages/new.tsx'))).toBe('pages');
    expect(classifyDataEvent(dataDir, 'unlink', path.join(dataDir, 'pages/admin/old.jsx'))).toBe('pages');
    // ページ本体の内容変更は vite の HMR に任せる
    expect(classifyDataEvent(dataDir, 'change', path.join(dataDir, 'pages/home.jsx'))).toBeNull();
    // ページ以外のファイルは再列挙しない
    expect(classifyDataEvent(dataDir, 'add', path.join(dataDir, 'pages/home.css'))).toBeNull();
    expect(classifyDataEvent(dataDir, 'add', path.join(dataDir, 'README.md'))).toBeNull();
  });

  test('ページを追加すると再列挙されて仮想モジュールへ反映される', async () => {
    writeFiles(dataDir, { 'pages/added.jsx': 'export default () => null;\n' });
    runtime.refreshPages();

    const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_PAGES_ID);
    if (mod) server.moduleGraph.invalidateModule(mod);

    const result = await server.transformRequest(RESOLVED_VIRTUAL_PAGES_ID);
    expect(result?.code).toContain('"added"');
  });

  test('watcher が tokens.json の変更を拾って作り直す', async () => {
    writeFiles(dataDir, { 'tokens.json': JSON.stringify({ color: { canvas: '#123456' } }) });
    // OS のファイルイベント配送は環境依存（サンドボックスや CI では届かないことがある）ため、
    // chokidar が発火するはずの change イベントを直接 emit し、
    // 分類 → デバウンス → config/CSS 再生成という自前のパイプラインを決定的に検証する。
    server.watcher.emit('change', path.join(dataDir, 'tokens.json'));

    await vi.waitFor(
      () => {
        expect(runtime.tokensCss).toContain('--canvas: #123456');
      },
      { timeout: 10_000, interval: 100 }
    );

    // applyDataChange が CSS だけでなくトークン一覧の仮想モジュールも invalidate する。
    expect((await server.transformRequest(RESOLVED_VIRTUAL_TOKENS_DATA_ID))?.code).toContain('"value": "#123456"');
  }, 20_000);
});
