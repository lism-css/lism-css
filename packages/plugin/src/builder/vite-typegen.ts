/**
 * 型 `.d.ts` 自動生成 Vite プラグイン（#427 / P4-P5）。
 *
 * 生成 / 更新 / 削除の実処理は bundler 非依存の `./typegen`（`syncLismEnvDts` / `writeLismEnvDts`）へ分離した。
 * 本ファイルは dev / build 起動時の同期と、dev 中の lism.config.js 変更追従だけを担う薄い Vite ラッパー。
 *
 * Astro の `astro check`（型チェック）は本プラグインを動かさないため、コミット済み生成ファイルが型チェックの拠り所になる。
 */
import type { Plugin } from 'vite';

import { findUserConfigPath } from './load-config';
import { syncLismEnvDts } from './typegen';
import { normalizePath } from './normalize-path';

// 後方互換のため、中立コアの公開 API を本エントリからも re-export する。
export { TYPES_FILENAME, writeLismEnvDts, syncLismEnvDts, type SyncTypesOptions } from './typegen';

export interface LismTypegenOptions {
  /** 型 `.d.ts` 自動生成を無効化する。 */
  disabled?: boolean;
  /** lism.config の明示パス。未指定時は Vite root から探索する。 */
  configPath?: string;
}

/**
 * 型 `.d.ts` を dev / build 起動時に同期し、dev 中の lism.config.js 変更にも追従する Vite プラグイン。
 */
export function lismTypegen(options: LismTypegenOptions = {}): Plugin {
  let root = '';
  // handleHotUpdate で「変更ファイルが lism.config か」を判定するために控える。
  let userConfigPath: string | null = null;
  return {
    name: 'lism-css:typegen',
    enforce: 'pre',
    configResolved(c) {
      root = c.root;
    },
    async buildStart() {
      if (options.disabled) return;
      userConfigPath = findUserConfigPath(root || process.cwd(), options.configPath);
      await syncLismEnvDts(root || process.cwd(), { configPath: options.configPath });
    },
    // dev 中に lism.config.js の breakpoints / props / traits を変更したら .d.ts を再生成する。
    // dynamic-css / config-alias は full-reload を送るが、型生成は副作用として別途追従させる必要がある。
    // （writeLismEnvDts は内容不変なら書き込まないため、生成物自身の変更で HMR ループにはならない）
    async handleHotUpdate(ctx) {
      if (options.disabled || !userConfigPath) return;
      if (normalizePath(ctx.file) !== normalizePath(userConfigPath)) return;
      await syncLismEnvDts(root || process.cwd(), { configPath: options.configPath });
    },
  };
}

export default lismTypegen;
