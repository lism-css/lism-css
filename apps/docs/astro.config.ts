import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import rehypeExternalLinks from 'rehype-external-links';
import remarkDirective from 'remark-directive';
import { remarkLinkCard } from './src/lib/remark-linkcard';
import { remarkCallout } from './src/lib/remark-callout';
import { rehypeBlockquoteCite } from './src/lib/rehype-blockquote-cite';
import { expressiveCodeOptions } from './src/lib/expressive-code.config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.lism-css.com/',
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
		'/docs': '/docs/overview/',
		'/docs/': '/docs/overview/',
		// 非root言語用のリダイレクト
		'/en/docs': '/en/docs/overview/',
		'/en/docs/': '/en/docs/overview/',
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
	],
	// CodeFileコンポーネント用のシンタックスハイライト設定
	markdown: {
		// remarkプラグイン: :::記法とURL自動変換
		remarkPlugins: [
			remarkDirective, // :::記法をパース（最初に実行）
			remarkCallout, // :::type → <Callout type="...">
			remarkLinkCard, // URLだけの段落 → <LinkCard>
		],
		// 外部リンクを別タブで開く設定 & blockquoteのcite変換
		rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }], rehypeBlockquoteCite],
	},
});
