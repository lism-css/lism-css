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
	site: 'http://localhost:4000/',
	// 開発サーバーのポート番号
	server: {
		port: 4000,
	},
	// 開発ツールバーを無効化
	devToolbar: {
		enabled: false,
	},

	// パスエイリアス設定
	vite: {
		resolve: {
			alias: {
				'@': '/src',
				'@ui': '/src/components/ui',
			},
		},
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
