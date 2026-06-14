import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';
import remarkDirective from 'remark-directive';
import { remarkDirectiveHandler } from './src/lib/remark-directive';
import { rehypeBlockquoteCite } from './src/lib/rehype-blockquote-cite';
import { expressiveCodeOptions } from './src/lib/expressive-code.config';
import { loadLastmodMap } from './src/lib/sitemap-lastmod';
import docsMd from './src/integrations/docs-md';
import { astroRedirects } from './src/config/redirects';
// 動的 CSS ビルドプラグイン（#427 P2）: lism.config.js を CSS 出力の単一情報源にする。
// lism.config.js が無ければデフォルト（= 同梱 main.css 相当）を出力する。
import { lismCssVite } from 'lism-css/vite-css';

// ビルド時のみ lastmod-map.json を読み込む（dev では不要）
const isBuild = process.argv.includes('build');
const lastmodMap = isBuild ? loadLastmodMap() : new Map<string, string>();

// https://astro.build/config
export default defineConfig({
  site: 'https://lism-css.com/',
  image: {
    // domains: ['cdn.lism-css.com'],
    remotePatterns: [{ hostname: 'cdn.lism-css.com', pathname: '/img/**' }],
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
        '@templates': new URL('../../templates', import.meta.url).pathname,
      },
    },
    server: {
      fs: {
        // monorepo ルートの templates 配下を許可
        allow: [new URL('../../', import.meta.url).pathname],
      },
    },
    // __で始まるディレクトリ/ファイルをビルドから除外するプラグイン
    plugins: [
      lismCssVite(),
      {
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
    expressiveCode(expressiveCodeOptions),
    react(),
    mdx({
      // Memo: .mdx経由の lism-ui の .astro import で style読み込まないことがある不具合の原因として怪しいのでオフにしておく
      // optimize: true,
    }),
    sitemap({
      // noindex のページは sitemap からも除外する
      // - /patterns/{category}/{id}/ : noindex,follow（一覧トップは index のため除外しない）
      // - /preview/patterns/...      : noindex,nofollow（iframe プレビュー）
      filter: (page) => !/\/patterns\/[^/]+\/[^/]+\/?$/.test(page) && !/\/preview\/patterns\//.test(page),
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
    // remarkプラグイン: :::記法のパースと変換
    remarkPlugins: [
      remarkDirective, // :::記法をパース（最初に実行）
      remarkDirectiveHandler, // directive を変換（Callout変換 & 不要な :text 記法を復元）
    ],
    // 外部リンクを別タブで開く設定 & blockquoteのcite変換
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }], rehypeBlockquoteCite],
  },
});
