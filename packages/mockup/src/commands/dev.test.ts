import fs from 'node:fs';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import type { ViteDevServer } from 'vite';

import { prepareMockRuntime, resolveGeneratedConfigDir, resolveViteCacheDir, type MockupRuntime } from '../core/runtime.js';
import { cleanupTempDirs, createTempDir, getFixtureViewerDir, writeFiles } from '../test-helpers/fixtures.js';
import { RESOLVED_VIRTUAL_LUCIDE_ID } from '../vite/lucide-icons.js';
import { RESOLVED_VIRTUAL_PAGES_ID, RESOLVED_VIRTUAL_TOKENS_CSS_ID, RESOLVED_VIRTUAL_TOKENS_DATA_ID } from '../vite/virtual-modules.js';
import { classifyDataEvent, createMockDevServer, sameImports } from './dev.js';

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
      schemaVersion: 2,
      title: 'Integration',
      // プロジェクト側に無くても CLI 同梱の依存として解決できることを確かめる。
      imports: ['lucide-react'],
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
  // 共有の cacheDir / configDir は cleanup() では消えない（次回起動で使い回すため）。テストが作った分だけ片付ける。
  // cacheDir は cleanup() の返却で共有パスへ戻っているので、占有パスではなく共有パスを消す。
  if (runtime)
    for (const dir of [resolveViteCacheDir(dataDir, ['lucide-react']), runtime.configDir]) fs.rmSync(dir, { recursive: true, force: true });
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

  test('lucide-react はページからもビューアからも仮想モジュールへ解決される', async () => {
    // 実体（37MB のバレル）は依存に持たず、@iconify-json/lucide から生成した1モジュールを配る。
    const fromPage = await server.pluginContainer.resolveId('lucide-react', path.join(dataDir, 'pages/home.jsx'));
    const fromViewer = await server.pluginContainer.resolveId('lucide-react', path.join(getFixtureViewerDir(), 'main.js'));

    expect(fromPage?.id).toBe(RESOLVED_VIRTUAL_LUCIDE_ID);
    expect(fromViewer?.id).toBe(RESOLVED_VIRTUAL_LUCIDE_ID);

    // lucide-react 0.577.0 と同じルート属性・class 名で <svg> を組み立てる。
    const result = await server.transformRequest(RESOLVED_VIRTUAL_LUCIDE_ID);
    expect(result?.code).toContain('lucide lucide-check');
    expect(result?.code).toContain(`fill: 'none'`);
  });

  test('lucide-react のサブパスはページから import できない', async () => {
    await expect(server.pluginContainer.resolveId('lucide-react/icons/bell', path.join(dataDir, 'pages/home.jsx'))).rejects.toThrow(
      /not an allowed package entry/
    );
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

  test('cacheDir は起動間で使い回せる共有の場所を指す（tempDir 配下でもデータディレクトリでもない）', () => {
    // tempDir 配下に置くと、終了時の削除で毎回ゼロから事前バンドルし直しになる。
    expect(runtime.cacheDir.startsWith(runtime.tempDir)).toBe(false);
    expect(runtime.cacheDir).not.toContain(dataDir);
    // dev は共有パスを自 pid 名のディレクトリへ rename して占有し、終了時に共有パスへ戻す。
    expect(runtime.cacheDir).toBe(`${resolveViteCacheDir(dataDir, ['lucide-react'])}.inuse.${process.pid}`);
    expect(server.config.cacheDir).toBe(runtime.cacheDir);
    // tempDir の外にあるので、明示的に許可していないと dev で配信できない。
    expect(server.config.server.fs.allow).toContain(runtime.cacheDir);
  });

  test('cacheDir / configDir は入力でキー付けされる（同じ入力なら同じ／入力が違えば別）', () => {
    for (const resolve of [resolveViteCacheDir, resolveGeneratedConfigDir]) {
      expect(resolve(dataDir, ['lucide-react'])).toBe(resolve(dataDir, ['lucide-react']));
      // 宣言順は事前バンドルの結果に影響しないので同じキャッシュを使う。
      expect(resolve(dataDir, ['a', 'b'])).toBe(resolve(dataDir, ['b', 'a']));
      // データディレクトリが違えば別のキャッシュ（追加パッケージの解決先が変わる）。
      expect(resolve(path.join(projectDir, 'other'))).not.toBe(resolve(dataDir));
      // imports が違えば別のキャッシュ（事前バンドル対象が変わる）。
      expect(resolve(dataDir)).not.toBe(resolve(dataDir, ['lucide-react']));
    }
  });

  test('lockfile の変更は vite cacheDir だけを変える', () => {
    const lockfile = path.join(projectDir, 'package-lock.json');
    const imports = ['lucide-react'];
    const configDir = resolveGeneratedConfigDir(dataDir, imports);
    const cacheDir = resolveViteCacheDir(dataDir, imports);

    try {
      fs.writeFileSync(lockfile, '{"lockfileVersion": 3}\n');
      const changedCacheDir = resolveViteCacheDir(dataDir, imports);

      expect(changedCacheDir).not.toBe(cacheDir);
      expect(resolveGeneratedConfigDir(dataDir, imports)).toBe(configDir);

      fs.writeFileSync(lockfile, '{"lockfileVersion": 4}\n');
      expect(resolveViteCacheDir(dataDir, imports)).not.toBe(changedCacheDir);
      expect(resolveGeneratedConfigDir(dataDir, imports)).toBe(configDir);
    } finally {
      fs.rmSync(lockfile, { force: true });
    }
  });

  test('生成 config は安定パスに置く（vite の依存キャッシュキーに入るため）', () => {
    // 起動ごとにパスが変わると vite が毎回「config が変わった」と判断して事前バンドルをやり直す。
    expect(runtime.configDir).toBe(resolveGeneratedConfigDir(dataDir, ['lucide-react']));
    expect(path.dirname(runtime.configPath)).toBe(runtime.configDir);
    expect(server.config.server.fs.allow).toContain(runtime.configDir);
    // cacheDir の中には置かない（vite の watcher が `<cacheDir>/**` を無視するため、
    // 中に置くと tokens.json 変更時に config モジュールが invalidate されなくなる）。
    expect(runtime.configDir.startsWith(runtime.cacheDir)).toBe(false);
    expect(runtime.configDir.startsWith(runtime.tempDir)).toBe(false);
  });

  test('cleanup は tempDir だけを消し、cacheDir / configDir は次回起動のために残す', async () => {
    writeFiles(projectDir, {
      'reuse/mockup.config.json': JSON.stringify({ schemaVersion: 2 }),
      'reuse/pages/home.jsx': 'export default () => null;\n',
    });
    const other = await prepareMockRuntime(path.join(projectDir, 'reuse'));
    // cacheDir の実体は vite が事前バンドル時に作る。ここでは作られた状態を再現して cleanup の対象外だと確かめる。
    fs.mkdirSync(other.cacheDir, { recursive: true });
    other.cleanup();

    expect(fs.existsSync(other.tempDir)).toBe(false);
    expect(fs.existsSync(other.cacheDir)).toBe(true);
    expect(fs.existsSync(other.configPath)).toBe(true);
    // 共有ディレクトリは一時ディレクトリの後片付け対象外なので、テストが作った分はここで消す。
    for (const dir of [other.cacheDir, other.configDir]) fs.rmSync(dir, { recursive: true, force: true });
  });

  test('共有 cacheDir は占有してから使い、占有できなければ tempDir 配下へ退避する', async () => {
    // beforeAll の dev サーバーがこのデータディレクトリの共有キャッシュを占有しているため、2つ目の dev は退避する。
    const contended = await prepareMockRuntime(dataDir, { exclusiveViteCache: true });
    expect(contended.cacheDir).toBe(path.join(contended.tempDir, 'vite-cache'));
    contended.cleanup();

    // 占有しない check（build）相当は、使用中でも共有の場所を指す（cacheDir を読みも書きもしないため）。
    const shared = await prepareMockRuntime(dataDir);
    expect(shared.cacheDir).toBe(resolveViteCacheDir(dataDir, ['lucide-react']));
    shared.cleanup();
  });

  test('cleanup が占有を返すと、次の起動が共有 cacheDir を引き継げる', async () => {
    writeFiles(projectDir, {
      'claimed/mockup.config.json': JSON.stringify({ schemaVersion: 2 }),
      'claimed/pages/home.jsx': 'export default () => null;\n',
    });
    const claimedDir = path.join(projectDir, 'claimed');

    const first = await prepareMockRuntime(claimedDir, { exclusiveViteCache: true });
    expect(first.cacheDir).toBe(`${resolveViteCacheDir(claimedDir)}.inuse.${process.pid}`);
    const second = await prepareMockRuntime(claimedDir, { exclusiveViteCache: true });
    expect(second.cacheDir).toBe(path.join(second.tempDir, 'vite-cache'));
    second.cleanup();

    first.cleanup();
    const third = await prepareMockRuntime(claimedDir, { exclusiveViteCache: true });
    expect(third.cacheDir).toBe(first.cacheDir);
    third.cleanup();

    // 共有ディレクトリは一時ディレクトリの後片付け対象外なので、テストが作った分はここで消す
    // （third.cleanup() の返却で cacheDir は共有パスへ戻っている）。
    for (const dir of [resolveViteCacheDir(claimedDir), first.configDir]) fs.rmSync(dir, { recursive: true, force: true });
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
    // ダークもライトと同じ tokens 経路で作り直す（ダークの検証はマージ後のライト側が基準のため）
    expect(classifyDataEvent(dataDir, 'change', path.join(dataDir, 'tokens.dark.json'))).toBe('tokens');
    expect(classifyDataEvent(dataDir, 'change', path.join(dataDir, 'mockup.config.json'))).toBe('pages');
    expect(classifyDataEvent(dataDir, 'add', path.join(dataDir, 'pages/new.tsx'))).toBe('pages');
    expect(classifyDataEvent(dataDir, 'unlink', path.join(dataDir, 'pages/admin/old.jsx'))).toBe('pages');
    // ページ本体の内容変更は vite の HMR に任せる
    expect(classifyDataEvent(dataDir, 'change', path.join(dataDir, 'pages/home.jsx'))).toBeNull();
    // ページ以外のファイルは再列挙しない
    expect(classifyDataEvent(dataDir, 'add', path.join(dataDir, 'pages/home.css'))).toBeNull();
    expect(classifyDataEvent(dataDir, 'add', path.join(dataDir, 'README.md'))).toBeNull();
  });

  test('imports の変更検知は順序を問わず内容だけで判定する', () => {
    expect(sameImports(undefined, undefined)).toBe(true);
    expect(sameImports([], undefined)).toBe(true);
    expect(sameImports(['a', 'b'], ['b', 'a'])).toBe(true);
    expect(sameImports(['a'], ['a', 'b'])).toBe(false);
    expect(sameImports(['a'], ['b'])).toBe(false);
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
