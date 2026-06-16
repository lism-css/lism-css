/**
 * `lism-css/config.js` を user の lism.config へ alias する Vite プラグイン。
 *
 * 対象 id と差し替え先解決は bundler 非依存の `./config-alias`（`CONFIG_TARGET_ID` / `resolveConfigAliasPath`）へ
 * 集約済み。本ファイルはそれを Vite の `config` フック・HMR へ橋渡しする薄いラッパー。
 * ユーザー向けには `@lism-css/plugin` の統合APIから利用する。
 */
import path from 'node:path';
import type { Plugin } from 'vite';

import { CONFIG_TARGET_ID, resolveConfigAliasPath } from './config-alias';
import { normalizePath } from './normalize-path';

export interface LismConfigAliasOptions {
  /** lism.config の明示パス。未指定時は Vite root（無ければ cwd）から探索する。 */
  configPath?: string;
}

export function lismConfigAlias(opts: LismConfigAliasOptions = {}): Plugin {
  let userPath: string | null = null;

  return {
    name: 'lism-css:config-alias',
    enforce: 'pre',

    // config フックで alias を注入して最優先で差し替える。
    // この時点では configResolved 前のため root は user config（無ければ cwd）から取る。
    config(config) {
      const base = config.root ? path.resolve(config.root) : process.cwd();
      userPath = resolveConfigAliasPath(base, opts.configPath);

      // lism-css/config.js を deps バンドル対象から外す（user 設定変更がキャッシュで隠れないように）。
      const cfg: { optimizeDeps: { exclude: string[] }; resolve?: { alias: Record<string, string> } } = {
        optimizeDeps: { exclude: [CONFIG_TARGET_ID] },
      };
      if (userPath) {
        cfg.resolve = { alias: { [CONFIG_TARGET_ID]: userPath } };
      }
      return cfg;
    },

    // lism.config.js 変更時はフルリロード（CONFIG が全コンポーネントで使われるため部分 HMR では追従しきれない）。
    handleHotUpdate({ file, server }) {
      if (!userPath || normalizePath(file) !== userPath) return;
      server.ws.send({ type: 'full-reload' });
      return [];
    },
  };
}

export default lismConfigAlias;
