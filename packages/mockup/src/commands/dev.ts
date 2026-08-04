/**
 * `lism-mockup dev` … ブラウザ確認用の dev サーバー。
 *
 * vite の `createServer` を使う薄いラッパー。データディレクトリの変更は `server.watcher` で拾い、
 * 仮想モジュールを invalidate してフルリロードする（config が全コンポーネントに効くため部分 HMR はしない）。
 */
import path from 'node:path';
import pc from 'picocolors';
import { createServer, type ViteDevServer } from 'vite';

import { MOCKUP_CONFIG_FILENAME } from '../core/data-dir.js';
import { PAGE_EXTENSIONS, PAGES_DIRNAME } from '../core/pages.js';
import { getViewerDir, isInsideDir } from '../core/paths.js';
import { prepareMockRuntime, type MockupRuntime } from '../core/runtime.js';
import { TOKENS_FILENAME } from '../core/tokens.js';
import { MockupContractError } from '../core/types.js';
import { createMockViteConfig } from '../vite/config.js';
import { RESOLVED_VIRTUAL_PAGES_ID, RESOLVED_VIRTUAL_TOKENS_CSS_ID, RESOLVED_VIRTUAL_TOKENS_DATA_ID } from '../vite/virtual-modules.js';

export interface DevCommandOptions {
  /** ビューアディレクトリの上書き（テスト用。既定は同梱ビューア）。 */
  viewerDir?: string;
}

/** watch で作り直す対象の種別。 */
export type ReloadKind = 'pages' | 'tokens';
type WatchEvent = 'add' | 'change' | 'unlink';

/** ファイル変更イベントから、作り直すべき対象を判定する。対象外は null。 */
export function classifyDataEvent(dataDir: string, event: WatchEvent, file: string): ReloadKind | null {
  const target = path.resolve(file);

  if (target === path.join(dataDir, TOKENS_FILENAME)) return 'tokens';
  if (target === path.join(dataDir, MOCKUP_CONFIG_FILENAME)) return 'pages';

  // ページ本体の内容変更は vite の HMR に任せる。列挙が変わる追加・削除だけ拾う。
  if (event === 'change') return null;
  const pagesDir = path.join(dataDir, PAGES_DIRNAME);
  if (isInsideDir(pagesDir, target) && (PAGE_EXTENSIONS as readonly string[]).includes(path.extname(target))) return 'pages';

  return null;
}

function invalidateVirtualModule(server: ViteDevServer, id: string): void {
  const mod = server.moduleGraph.getModuleById(id);
  if (mod) server.moduleGraph.invalidateModule(mod);
}

function reportWatchError(server: ViteDevServer, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  const file = error instanceof MockupContractError ? error.file : undefined;
  const detail = file ? `${message}\n  at ${file}` : message;

  // 検証エラーでサーバーは落とさない。ターミナルとブラウザのオーバーレイの両方へ出し、
  // ユーザーがファイルを直せばそのまま復帰できるようにする。
  server.config.logger.error(pc.red(`[lism-mockup] ${detail}`));
  server.ws.send({ type: 'error', err: { message: `[lism-mockup] ${detail}`, stack: '' } });
}

/** 変更種別に応じて runtime を作り直し、仮想モジュールを invalidate してフルリロードする。 */
export async function applyDataChange(server: ViteDevServer, runtime: MockupRuntime, kind: ReloadKind): Promise<void> {
  try {
    if (kind === 'tokens') {
      await runtime.refreshTokens();
      // CSS とトークン一覧は同じ tokens.json から作るため、必ず両方を作り直させる。
      invalidateVirtualModule(server, RESOLVED_VIRTUAL_TOKENS_CSS_ID);
      invalidateVirtualModule(server, RESOLVED_VIRTUAL_TOKENS_DATA_ID);
    } else {
      runtime.refreshPages();
      invalidateVirtualModule(server, RESOLVED_VIRTUAL_PAGES_ID);
    }
    server.ws.send({ type: 'full-reload' });
  } catch (error) {
    reportWatchError(server, error);
  }
}

/** データディレクトリの監視を仕掛ける。 */
export function watchDataDir(server: ViteDevServer, runtime: MockupRuntime): void {
  const { dataDir } = runtime.data;
  server.watcher.add([path.join(dataDir, PAGES_DIRNAME), path.join(dataDir, MOCKUP_CONFIG_FILENAME), path.join(dataDir, TOKENS_FILENAME)]);

  // 連続イベント（エディタの保存やファイル移動）で作り直しが重ならないよう、種別ごとに1つへまとめる。
  const pending = new Set<ReloadKind>();
  let timer: NodeJS.Timeout | null = null;

  const schedule = (kind: ReloadKind) => {
    pending.add(kind);
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const kinds = [...pending];
      pending.clear();
      void (async () => {
        for (const target of kinds) await applyDataChange(server, runtime, target);
      })();
    }, 50);
  };

  const onEvent = (event: WatchEvent) => (file: string) => {
    const kind = classifyDataEvent(dataDir, event, file);
    if (kind) schedule(kind);
  };

  server.watcher.on('add', onEvent('add'));
  server.watcher.on('change', onEvent('change'));
  server.watcher.on('unlink', onEvent('unlink'));
}

/** dev サーバーを作る（listen は呼び出し側。統合テストからも使う）。 */
export async function createMockDevServer(dir: string, options: DevCommandOptions = {}): Promise<{ server: ViteDevServer; runtime: MockupRuntime }> {
  const runtime = await prepareMockRuntime(dir);
  try {
    const server = await createServer(createMockViteConfig({ runtime, viewerDir: options.viewerDir ?? getViewerDir(), mode: 'dev' }));
    watchDataDir(server, runtime);
    return { server, runtime };
  } catch (error) {
    runtime.cleanup();
    throw error;
  }
}

export async function devCommand(dir: string, options: DevCommandOptions = {}): Promise<void> {
  const { server, runtime } = await createMockDevServer(dir, options);

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    runtime.cleanup();
  };

  // 一時ディレクトリの後始末は同期処理だけで完結させ、`server.close()` の完了は待たない。
  // deps 最適化の実行中は close が返ってこないことがあり、Ctrl+C で終われなくなるため。
  process.once('exit', cleanup);
  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      cleanup();
      process.exit(0);
    });
  }

  await server.listen();
  console.log(pc.green(`[lism-mockup] preview server for ${runtime.data.dataDir}`));
  console.log(pc.dim(`  ${runtime.data.pages.length} page(s)`));
  server.printUrls();
}
