import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
// import mdx from '@astrojs/mdx';
// import markdoc from '@astrojs/markdoc';
import sidebar from './astro-configs/sidebar';
import locales from './astro-configs/locales';
// import purgecss from 'astro-purgecss';

// https://astro.build/config
export default defineConfig({
	// markdown: {
	// 	// remarkPlugins: [remarkPlugin1],
	// 	gfm: true,
	// },

	devToolbar: {
		enabled: false,
	},
	integrations: [
		react(),
		// mdx(), // 基本はmarkdownを継承する
		starlight({
			title: 'Lism CSS',
			head: [
				// <!-- Google tag (gtag.js) -->
				{
					tag: 'script',
					content: `window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-WHLSPPNEKZ');`,
				},
				{
					tag: 'script',
					attrs: {
						src: 'https://www.googletagmanager.com/gtag/js?id=G-WHLSPPNEKZ',
						async: true,
					},
				},
				{
					tag: 'meta',
					attrs: {
						property: 'og:image',
						content: 'https://www.lism-css.com/ogimg.jpg',
					},
				},
				// {
				// 	tag: 'meta',
				// 	attrs: {
				// 		name: 'robots',
				// 		content: 'noindex',
				// 	},
				// },
			],
			// logo: {
			// 	src: './src/assets/my-logo.svg',
			// replacesTitle: true,
			// },
			// favicon: '/images/favicon.svg',

			// このサイトのデフォルト言語として英語を設定します。
			// defaultLocale: 'root',
			locales,
			customCss: [
				// @layer 読み込み順の定義
				'./src/styles/layer.scss',
				// 'lism-css/main.css',
				// 'lism-css/main.css',
				'./src/styles/lism-custom.scss',
				'./src/styles/docs.scss',
			],
			sidebar,

			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/lism-css/lism-css' },
				{ icon: 'x.com', label: 'X', href: 'https://twitter.com/lismcss' },
				{ icon: 'discord', label: 'Discord', href: 'https://discord.gg/6PMcFHvc4h' },
			],
			// editLink: {
			// 	baseUrl: 'https://github.com/lism-css/lism-css/tree/main/apps/docs',
			// },

			// コードブロックのカスタマイズ: https://starlight.astro.build/ja/reference/configuration/#expressivecode
			expressiveCode: {
				styleOverrides: {
					borderRadius: '0.25rem',
				},
				// themes: ['starlight-dark', 'starlight-light'],
				themes: ['github-dark', 'github-light'],
				useStarlightDarkModeSwitch: true,
			},
			// コンポーネントのオーバーライド: https://starlight.astro.build/guides/overriding-components/
			components: {
				// SocialIcons: './src/components/EmailLink.astro',
				MarkdownContent: './src/starlight/MarkdownContent.astro',
				ThemeSelect: './src/starlight/ThemeSelect.astro',
				Sidebar: './src/starlight/Sidebar.astro',
				// SidebarSublist: './src/starlight/SidebarSublist.astro',
				Hero: './src/starlight/Hero.astro',
			},
		}),
		// purgecss(),
	],
	vite: {
		resolve: {
			alias: {
				'~/': '/src/',
			},
		},
	},
});
