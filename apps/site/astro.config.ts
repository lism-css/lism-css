import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';
import remarkDirective from 'remark-directive';
import { remarkDirectiveHandler } from './src/lib/remark-directive';
import { rehypeBlockquoteCite } from './src/lib/rehype-blockquote-cite';
import { rehypeWrapTable } from './src/lib/rehype-wrap-table';
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

// 静的ページのサーバーバンドルは描画にだけ使って捨てるので、Rollup の tree-shaking を切る。
// 469 ページ分のモジュールグラフを繰り返し走査する tree-shaking が SSR コンパイル時間の約 6 割を占めていた（#624）。
// 環境名は Astro の内部命名（静的ページは prerender、オンデマンドは ssr）に依存する。Astro のメジャー更新時は名前と rollupOptions の互換を再確認する。
// クライアントビルドには影響しない。
function disableServerTreeshake() {
  const off = { build: { rollupOptions: { treeshake: false } } };
  return {
    name: 'docs:disable-server-treeshake',
    apply: 'build' as const,
    config: () => ({ environments: { prerender: off, ssr: off } }),
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://lism-css.com/',
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
      disableServerTreeshake(),
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
  // CodeFileコンポーネント用のシンタックスハイライト設定
  markdown: {
    // remark/rehype パイプライン（unified）をプロセッサとして明示指定
    processor: unified({
      // remarkプラグイン: :::記法のパースと変換
      remarkPlugins: [
        remarkDirective, // :::記法をパース（最初に実行）
        remarkDirectiveHandler, // directive を変換（Callout変換 & 不要な :text 記法を復元）
      ],
      // 外部リンクを別タブで開く設定 & blockquoteのcite変換 & tableの横スクロール対応
      rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }], rehypeBlockquoteCite, rehypeWrapTable],
    }),
  },
});
