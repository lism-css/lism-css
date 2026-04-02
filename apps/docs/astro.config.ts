import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';
import remarkDirective from 'remark-directive';
import { remarkLinkCard } from './src/lib/remark-linkcard';
import { remarkDirectiveHandler } from './src/lib/remark-directive';
import { rehypeBlockquoteCite } from './src/lib/rehype-blockquote-cite';
import { expressiveCodeOptions } from './src/lib/expressive-code.config';
import { loadLastmodMap } from './src/lib/sitemap-lastmod';

// ビルド時のみ lastmod-map.json を読み込む（dev では不要）
const isBuild = process.argv.includes('build');
const lastmodMap = isBuild ? loadLastmodMap() : new Map<string, string>();

// https://astro.build/config
export default defineConfig({
  site: 'https://lism-css.com/',
  // 開発サーバーのポート番号
  server: {
    port: 4000,
  },
  // 開発ツールバーを無効化
  devToolbar: {
    enabled: false,
  },

  // リダイレクト設定（一箇所で管理）
  redirects: {
    // /docs/ → /docs/overview/ へリダイレクト
    '/docs/': '/docs/overview/',
    // 非root言語用のリダイレクト
    '/en/docs/': '/en/docs/overview/',
    // Dummy → DummyText/DummyImage 分割移動に伴うリダイレクト
    '/docs/core-components/dummy/': '/docs/ui/DummyText/',
    '/en/docs/core-components/dummy/': '/en/docs/ui/DummyText/',
  },

  // パスエイリアス設定
  vite: {
    resolve: {
      alias: {
        '@': '/src',
        '@ui': '/src/components/ui',
      },
    },
    // __で始まるディレクトリ/ファイルをビルドから除外するプラグイン
    plugins: [
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
      optimize: true,
    }),
    sitemap({
      serialize(item) {
        const lastmod = lastmodMap.get(item.url);
        if (lastmod) {
          item.lastmod = lastmod;
        }
        return item;
      },
    }),
  ],
  // CodeFileコンポーネント用のシンタックスハイライト設定
  markdown: {
    // remarkプラグイン: :::記法とURL自動変換
    remarkPlugins: [
      remarkDirective, // :::記法をパース（最初に実行）
      remarkDirectiveHandler, // directive を変換（Callout変換 & 不要な :text 記法を復元）
      remarkLinkCard, // URLだけの段落 → <LinkCard>
    ],
    // 外部リンクを別タブで開く設定 & blockquoteのcite変換
    rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }], rehypeBlockquoteCite],
  },
});
