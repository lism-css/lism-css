/**
 * 動的 CSS ビルド Vite プラグイン（#427 / #424 進行順序 4 の P2）。
 *
 * `import 'lism-css/main.css'` 等の CSS import を `resolveId` / `load` で捕捉し、
 * `lism.config.js` を反映した CSS をその場でコンパイルして返す（`@tailwindcss/vite` と同型）。
 * これにより `lism.config.js` が JS ランタイムと CSS 出力の単一情報源になる。
 *
 * dev では `lism.config.js` の変更を検知して再コンパイル + フルリロードする。
 *
 * NOTE: 本プラグインは `lismCss()` / `lismCssAstro()` が内部で使う低レベル部品。
 * ユーザー向けの公開入口は `lism-css/vite` の統合APIに寄せる。
 */
import type { Plugin } from 'vite';

import { createCssCompiler, type CssCompiler } from './compile-entry';
import { loadBuildConfigs, type LoadedBuildConfigs } from './load-config';
import { normalizePath } from './normalize-path';
import { scssDir, cssDistDir as cssDistDirRaw } from './paths';

export interface LismDynamicCssOptions {
  /** lism.config の明示パス。未指定時は Vite root から探索する。 */
  configPath?: string;
}

// id 比較は posix 区切りで行うため normalize しておく。
const cssDistDir = normalizePath(cssDistDirRaw);

// `lism-css/<entry>.css`（bare specifier）を捕捉する。<entry> は base/set のようなスラッシュ入りも許す。
const BARE_CSS_RE = /^lism-css\/(.+)\.css$/;

export function lismDynamicCss(options: LismDynamicCssOptions = {}): Plugin {
  let root = '';
  let configs: LoadedBuildConfigs | null = null;
  let compiler: CssCompiler | null = null;

  function getCompiler(): CssCompiler {
    if (!compiler) compiler = createCssCompiler({ scssDir });
    return compiler;
  }

  async function getConfigs(): Promise<LoadedBuildConfigs> {
    if (!configs) configs = await loadBuildConfigs(root || process.cwd(), { configPath: options.configPath });
    return configs;
  }

  /** エントリ名 → 自身の dist/css 上の絶対パス（id）。 */
  function idForEntry(entry: string): string {
    return `${cssDistDir}/${entry}.css`;
  }

  /** id（クエリ付き可）が自身の dist/css 配下の CSS なら、エントリ名を返す。 */
  function entryForId(id: string): string | null {
    const filePath = normalizePath(id.split('?')[0]);
    if (!filePath.startsWith(`${cssDistDir}/`) || !filePath.endsWith('.css')) return null;
    return filePath.slice(cssDistDir.length + 1, -'.css'.length);
  }

  return {
    name: 'lism-css:css',
    enforce: 'pre',

    configResolved(c) {
      root = c.root;
    },

    async resolveId(source) {
      const [spec, query] = source.split('?');
      const m = BARE_CSS_RE.exec(spec);
      if (!m) return null;
      const entry = m[1];
      if (!(await getCompiler().hasEntry(entry))) return null;
      // 自身の dist/css 上のパスへ解決する。実ファイルの有無に関わらず load で内容を供給する。
      return query ? `${idForEntry(entry)}?${query}` : idForEntry(entry);
    },

    async load(id) {
      const entry = entryForId(id);
      if (entry === null) return null;
      const c = getCompiler();
      if (!(await c.hasEntry(entry))) return null;
      const cfg = await getConfigs();
      // lism.config.js を watch 対象に加える（build の watch / dev の HMR 双方）。
      if (cfg.userConfigPath) this.addWatchFile(cfg.userConfigPath);
      return c.compile(entry, cfg.mainConfig, cfg.fullConfig);
    },

    async handleHotUpdate(ctx) {
      const cfgPath = configs?.userConfigPath;
      if (!cfgPath || normalizePath(ctx.file) !== normalizePath(cfgPath)) return;
      // lism.config.js が変わった: 設定を破棄して次回 load で再読込（mtime バストで新値を取得）。
      // 作業ディレクトリは config 署名の変化に応じて compile 内で作り直される。
      configs = null;
      const affected = [];
      for (const entry of await getCompiler().entries()) {
        const mod = ctx.server.moduleGraph.getModuleById(idForEntry(entry));
        if (mod) affected.push(mod);
      }
      ctx.server.ws.send({ type: 'full-reload' });
      return affected;
    },

    buildEnd() {
      compiler?.dispose();
      compiler = null;
    },
    closeBundle() {
      compiler?.dispose();
      compiler = null;
    },
  };
}

export default lismDynamicCss;
