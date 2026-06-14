/**
 * `lism-css/config.js` を user の lism.config へ alias する Vite プラグイン。
 *
 * これにより JS ランタイム（`config/index.ts` が import する `lism-css/config.js`）が user 設定を読む。
 * 後方互換の単体エクスポート `vite-plugin.mjs` の TS 版で、傘エントリ `lismCss()` がこれを束ねる。
 * （`vite-plugin.mjs` は従来利用者向けにそのまま残置する）
 */
import fs from 'node:fs';
import path from 'node:path';
import { normalizePath, type Plugin } from 'vite';

const TARGET_ID = 'lism-css/config.js';
const SEARCH = ['lism.config.js', 'lism.config.mjs'];

export interface LismConfigAliasOptions {
  /** lism.config の明示パス。未指定時は Vite root（無ければ cwd）から探索する。 */
  configPath?: string;
}

export function lismConfigAlias(opts: LismConfigAliasOptions = {}): Plugin {
  let userPath: string | null = null;

  const resolveUserConfig = (base: string): string | null => {
    if (opts.configPath) {
      const abs = path.resolve(base, opts.configPath);
      if (fs.existsSync(abs)) return normalizePath(abs);
      console.error(`[lism-css] 指定された設定ファイルが存在しません: ${abs}`);
    }
    for (const cand of SEARCH) {
      const abs = path.resolve(base, cand);
      if (fs.existsSync(abs)) return normalizePath(abs);
    }
    return null;
  };

  return {
    name: 'lism-css:config-alias',
    enforce: 'pre',

    // config フックで alias を注入して最優先で差し替える。
    // この時点では configResolved 前のため root は user config（無ければ cwd）から取る。
    config(config) {
      const base = config.root ? path.resolve(config.root) : process.cwd();
      userPath = resolveUserConfig(base);

      // lism-css/config.js を deps バンドル対象から外す（user 設定変更がキャッシュで隠れないように）。
      const cfg: { optimizeDeps: { exclude: string[] }; resolve?: { alias: Record<string, string> } } = {
        optimizeDeps: { exclude: [TARGET_ID] },
      };
      if (userPath) {
        cfg.resolve = { alias: { [TARGET_ID]: userPath } };
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
