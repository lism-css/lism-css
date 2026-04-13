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

  // リダイレクト設定（一箇所で管理）
  redirects: {
    // /docs/ → /docs/overview/ へリダイレクト
    '/docs/': '/docs/overview/',
    // 非root言語用のリダイレクト
    '/en/docs/': '/en/docs/overview/',
    // Dummy → DummyText/DummyImage 分割移動に伴うリダイレクト
    '/docs/core-components/dummy/': '/docs/ui/DummyText/',
    '/en/docs/core-components/dummy/': '/en/docs/ui/DummyText/',
    // typography → tokens/typography に移動
    '/docs/typography/': '/docs/tokens/typography/',
    '/en/docs/typography/': '/en/docs/tokens/typography/',
    // props/* → property-class/* に移動（bd / hov / max-sz）
    '/docs/props/bd/': '/docs/property-class/bd/',
    '/docs/props/hov/': '/docs/property-class/hov/',
    '/docs/props/max-sz/': '/docs/property-class/max-sz/',
    '/en/docs/props/bd/': '/en/docs/property-class/bd/',
    '/en/docs/props/hov/': '/en/docs/property-class/hov/',
    '/en/docs/props/max-sz/': '/en/docs/property-class/max-sz/',
    // module-class → primitives リネーム（#247）
    '/docs/module-class/': '/docs/primitives/',
    '/en/docs/module-class/': '/en/docs/primitives/',
    // /docs/modules/* → /docs/primitives/* リネーム（#247）
    // キャメルケース primitive 5 件（#252）はターゲットもキャメルケースで終端
    '/docs/modules/is--container/': '/docs/primitives/is--container/',
    '/docs/modules/is--wrapper/': '/docs/primitives/is--wrapper/',
    '/docs/modules/is--layer/': '/docs/primitives/is--layer/',
    '/docs/modules/is--boxlink/': '/docs/primitives/is--boxLink/',
    '/docs/modules/is--vertical/': '/docs/primitives/is--vertical/',
    '/docs/modules/l--box/': '/docs/primitives/l--box/',
    '/docs/modules/l--center/': '/docs/primitives/l--center/',
    '/docs/modules/l--frame/': '/docs/primitives/l--frame/',
    '/docs/modules/l--flow/': '/docs/primitives/l--flow/',
    '/docs/modules/l--flex/': '/docs/primitives/l--flex/',
    '/docs/modules/l--cluster/': '/docs/primitives/l--cluster/',
    '/docs/modules/l--stack/': '/docs/primitives/l--stack/',
    '/docs/modules/l--grid/': '/docs/primitives/l--grid/',
    '/docs/modules/l--tilegrid/': '/docs/primitives/l--tileGrid/',
    '/docs/modules/l--columns/': '/docs/primitives/l--columns/',
    '/docs/modules/l--fluidcols/': '/docs/primitives/l--fluidCols/',
    '/docs/modules/l--sidemain/': '/docs/primitives/l--sideMain/',
    '/docs/modules/l--switchcols/': '/docs/primitives/l--switchCols/',
    '/docs/modules/a--decorator/': '/docs/primitives/a--decorator/',
    '/docs/modules/a--divider/': '/docs/primitives/a--divider/',
    '/docs/modules/a--icon/': '/docs/primitives/a--icon/',
    '/docs/modules/a--spacer/': '/docs/primitives/a--spacer/',
    '/en/docs/modules/is--container/': '/en/docs/primitives/is--container/',
    '/en/docs/modules/is--wrapper/': '/en/docs/primitives/is--wrapper/',
    '/en/docs/modules/is--layer/': '/en/docs/primitives/is--layer/',
    '/en/docs/modules/is--boxlink/': '/en/docs/primitives/is--boxLink/',
    '/en/docs/modules/is--vertical/': '/en/docs/primitives/is--vertical/',
    '/en/docs/modules/l--box/': '/en/docs/primitives/l--box/',
    '/en/docs/modules/l--center/': '/en/docs/primitives/l--center/',
    '/en/docs/modules/l--frame/': '/en/docs/primitives/l--frame/',
    '/en/docs/modules/l--flow/': '/en/docs/primitives/l--flow/',
    '/en/docs/modules/l--flex/': '/en/docs/primitives/l--flex/',
    '/en/docs/modules/l--cluster/': '/en/docs/primitives/l--cluster/',
    '/en/docs/modules/l--stack/': '/en/docs/primitives/l--stack/',
    '/en/docs/modules/l--grid/': '/en/docs/primitives/l--grid/',
    '/en/docs/modules/l--tilegrid/': '/en/docs/primitives/l--tileGrid/',
    '/en/docs/modules/l--columns/': '/en/docs/primitives/l--columns/',
    '/en/docs/modules/l--fluidcols/': '/en/docs/primitives/l--fluidCols/',
    '/en/docs/modules/l--sidemain/': '/en/docs/primitives/l--sideMain/',
    '/en/docs/modules/l--switchcols/': '/en/docs/primitives/l--switchCols/',
    '/en/docs/modules/a--decorator/': '/en/docs/primitives/a--decorator/',
    '/en/docs/modules/a--divider/': '/en/docs/primitives/a--divider/',
    '/en/docs/modules/a--icon/': '/en/docs/primitives/a--icon/',
    '/en/docs/modules/a--spacer/': '/en/docs/primitives/a--spacer/',
    // is--linkBox → is--boxLink リネーム（#245）で漏れていた旧 URL 対応
    '/docs/modules/is--linkbox/': '/docs/primitives/is--boxLink/',
    '/en/docs/modules/is--linkbox/': '/en/docs/primitives/is--boxLink/',
    // 小文字 primitive URL → キャメルケース互換リダイレクト（#252）
    // 一時的に公開されていた小文字 URL を踏んだ場合のフォールバック
    '/docs/primitives/is--boxlink/': '/docs/primitives/is--boxLink/',
    '/docs/primitives/l--tilegrid/': '/docs/primitives/l--tileGrid/',
    '/docs/primitives/l--fluidcols/': '/docs/primitives/l--fluidCols/',
    '/docs/primitives/l--sidemain/': '/docs/primitives/l--sideMain/',
    '/docs/primitives/l--switchcols/': '/docs/primitives/l--switchCols/',
    '/en/docs/primitives/is--boxlink/': '/en/docs/primitives/is--boxLink/',
    '/en/docs/primitives/l--tilegrid/': '/en/docs/primitives/l--tileGrid/',
    '/en/docs/primitives/l--fluidcols/': '/en/docs/primitives/l--fluidCols/',
    '/en/docs/primitives/l--sidemain/': '/en/docs/primitives/l--sideMain/',
    '/en/docs/primitives/l--switchcols/': '/en/docs/primitives/l--switchCols/',
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
