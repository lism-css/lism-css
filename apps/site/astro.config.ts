import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import { directiveCallout } from './src/lib/satteri/directive-callout';
import { blockquoteCite } from './src/lib/satteri/blockquote-cite';
import { wrapTable } from './src/lib/satteri/wrap-table';
import { externalLinks } from './src/lib/satteri/external-links';
import { expressiveCodeOptions } from './src/lib/expressive-code.config';
import { loadLastmodMap } from './src/lib/sitemap-lastmod';
import docsMd from './src/integrations/docs-md';
import { astroRedirects } from './src/config/redirects';

// lism.config.jsを読み込む統合プラグイン: 動的 CSS ビルド + config alias + 型生成（lism-env.d.ts）を束ねる。
import { lismCss } from '@lism-css/plugin/astro';

// ビルド時のみ lastmod-map.json を読み込む（dev では不要）
const isBuild = process.argv.includes('build');
const lastmodMap = isBuild ? loadLastmodMap() : new Map<string, string>();

type DevServerLike = {
  watcher: {
    add(paths: string | string[]): void;
    on(event: 'change', callback: (file: string) => void): void;
  };
  moduleGraph: {
    getModulesByFile(file: string): Set<unknown> | undefined;
    invalidateModule(mod: unknown): void;
  };
  ws: {
    send(payload: { type: 'full-reload'; path?: string; triggeredBy?: string }): void;
  };
};

function normalizeFsPath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

function watchLismCoreDistCss() {
  const cssDirRaw = fileURLToPath(new URL('../../packages/lism-css/dist/css/', import.meta.url));
  const cssDir = normalizeFsPath(cssDirRaw);
  let timer: ReturnType<typeof setTimeout> | undefined;

  return {
    name: 'docs:watch-lism-core-dist-css',
    apply: 'serve' as const,
    configureServer(server: DevServerLike) {
      server.watcher.add(cssDirRaw);
      server.watcher.on('change', (file) => {
        const normalized = normalizeFsPath(file);
        if (!normalized.startsWith(cssDir) || !normalized.endsWith('.css')) return;

        const modules = server.moduleGraph.getModulesByFile(file) ?? server.moduleGraph.getModulesByFile(normalized);
        modules?.forEach((mod) => server.moduleGraph.invalidateModule(mod));

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          server.ws.send({ type: 'full-reload', path: '*', triggeredBy: file });
        }, 50);
        timer.unref?.();
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://lism-css.com/',
  // Astro 7 の既定 'jsx' はインライン要素間の空白を JSX 規則で除去し、v6 と出力が変わる。v6 と同じ空白処理を維持する。
  compressHTML: true,
  image: {
    // domains: ['cdn.lism-css.com'],
    remotePatterns: [
      { hostname: 'cdn.lism-css.com', pathname: '/img/**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // 開発サーバーのポート番号
  server: {
    port: 4000,
  },
  // 開発ツールバーを無効化
  devToolbar: {
    enabled: false,
  },

  redirects: astroRedirects,

  // パスエイリアス設定
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@ui': '/src/components/ui',
        '@templates': fileURLToPath(new URL('../../templates', import.meta.url)),
      },
    },
    server: {
      fs: {
        // monorepo ルートの templates 配下を許可
        allow: [fileURLToPath(new URL('../../', import.meta.url))],
      },
    },
    plugins: [
      watchLismCoreDistCss(),
      {
        // __で始まるディレクトリ/ファイルをビルドから除外するプラグイン
        name: 'ignore-underscore-prefix',
        resolveId(id, importer) {
          // __ で始まるディレクトリのファイルをexternalとして扱う
          if (id.includes('/__') || (importer && importer.includes('/__'))) {
            return { id, external: true };
          }
        },
      },
    ],
  },
  integrations: [
    lismCss(),
    expressiveCode(expressiveCodeOptions),
    react(),
    mdx({
      // Memo: .mdx経由の lism-ui の .astro import で style読み込まないことがある不具合の原因として怪しいのでオフにしておく
      // optimize: true,
    }),
    sitemap({
      // noindex のページは sitemap からも除外する
      // - /patterns/{category}/{id}/ と /docs/layout-demos/{category}/{id}/ : noindex,follow（一覧トップは index のため除外しない）
      // - /preview/patterns/... と /preview/layout-demos/...                : noindex,nofollow（iframe プレビュー）
      filter: (page) =>
        !/\/patterns\/[^/]+\/[^/]+\/?$/.test(page) &&
        !/\/docs\/layout-demos\/[^/]+\/[^/]+\/?$/.test(page) &&
        !/\/preview\/(patterns|layout-demos)\//.test(page),
      serialize(item) {
        const lastmod = lastmodMap.get(item.url);
        if (lastmod) {
          item.lastmod = lastmod;
        }
        return item;
      },
    }),
    docsMd(),
  ],
  // Markdown / MDX の処理。@astrojs/mdx は extendMarkdownConfig（既定 true）で同じプロセッサを使う
  markdown: {
    processor: satteri({
      features: {
        // :::type の Callout 記法（directiveCallout で変換する）
        directive: true,
        // `## 見出し {#id}` で見出し ID を指定できるようにする（hov.mdx のアンカー）
        headingAttributes: true,
        // 本文中の `--`（u--cbox 等のクラス名）をダッシュに変換しない。引用符と省略記号の変換は既定のまま
        smartPunctuation: { dashes: false },
      },
      mdastPlugins: [directiveCallout],
      // 外部リンクを別タブで開く → blockquote の出典変換 → table の横スクロール対応
      hastPlugins: [externalLinks, blockquoteCite, wrapTable],
    }),
  },
});
