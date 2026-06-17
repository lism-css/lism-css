/**
 * lism.config の変更を監視する bundler 非依存の watcher（ロードマップ P8）。
 *
 * Vite/Astro は `handleHotUpdate`、webpack は compiler の `watchRun` フックで dev 中の
 * config 変更に追従できるが、Next.js（Turbopack 主導）にはそれらに相当する汎用注入口が無い。
 * そこで Next.js では config 反映済み CSS を `.lism-css/css/*` へ事前生成 → alias で差し替える方式を取り、
 * dev 中の config 変更追従は「lism.config を `fs.watch` で監視し、変更時に CSS / 型を再生成する」本 watcher が担う。
 * 生成 CSS ファイルの変更は Turbopack（および `--webpack` dev の webpack）が module graph 経由で拾うため、
 * 再生成さえ走れば追従が成立する（P2 で実機確認済み）。
 *
 * NOTE: chokidar 等は足さず Node 標準の `fs.watch` のみで実装する（plugin の依存を増やさないため）。
 */
import fs from 'node:fs';
import path from 'node:path';

import { normalizePath } from './normalize-path';

export interface WatchLismConfigOptions {
  /** 監視対象の lism.config 絶対パス。 */
  configPath: string;
  /** 変更検知時に呼ぶ非同期コールバック（CSS 再生成 / 型再生成など）。 */
  onChange: () => Promise<void>;
  /** 連続イベントをまとめる debounce 時間（ms）。既定 80ms。 */
  debounceMs?: number;
  log?: (message: string) => void;
}

export interface ConfigWatcher {
  /** 監視を停止する。 */
  close(): void;
}

/**
 * `configPath` の変更を監視し、変更時に `onChange` を呼ぶ。
 *
 * 監視対象はファイル自身ではなく**親ディレクトリ**を `fs.watch` し、basename でフィルタする。
 * エディタの atomic save（temp へ書き込み → rename で置換）はファイル自身の watch を壊すが、
 * 親ディレクトリ側では rename イベントとして観測できるため、こちらの方が確実に追従できる。
 *
 * FSWatcher / debounce timer はいずれも `unref()` する。dev サーバーはそれ自身でプロセスを生かし続けるので
 * watcher がイベントループを掴む必要は無く、unref しておくとテストや単発実行でプロセス終了を妨げない。
 */
export function watchLismConfig(opts: WatchLismConfigOptions): ConfigWatcher {
  const { configPath, onChange, debounceMs = 80, log } = opts;
  const dir = path.dirname(configPath);
  const target = path.basename(configPath);

  let timer: ReturnType<typeof setTimeout> | null = null;
  // onChange 実行中に来た変更は取りこぼさず、完了後に 1 回だけ追い実行する（再生成の取りこぼし防止）。
  let running = false;
  let pending = false;

  const run = async (): Promise<void> => {
    if (running) {
      pending = true;
      return;
    }
    running = true;
    try {
      await onChange();
    } catch (err) {
      // dev 中の config が一時的に壊れていても watcher 自体は止めず、次の保存で復帰できるようにする。
      log?.(`⚠️ [lism-css] config watch regeneration failed: ${(err as Error).message}`);
    } finally {
      running = false;
      if (pending) {
        pending = false;
        void run();
      }
    }
  };

  const watcher = fs.watch(dir, (_event, filename) => {
    // filename は環境によって Buffer/null になり得る。target と一致する変更だけ拾う。
    if (!filename || normalizePath(filename.toString()) !== target) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void run(), debounceMs);
    timer.unref?.();
  });
  // 監視ディレクトリ消失などで FSWatcher が 'error' を出すと、未処理だとプロセスごと落ちる。握って log に留める。
  watcher.on('error', (err) => log?.(`⚠️ [lism-css] config watch error: ${err.message}`));
  watcher.unref?.();

  return {
    close() {
      if (timer) clearTimeout(timer);
      watcher.close();
    },
  };
}
