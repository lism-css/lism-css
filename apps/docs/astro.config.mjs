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
			// logo: {
			// 	src: './src/assets/my-logo.svg',
			// replacesTitle: true,
			// },
			// favicon: '/images/favicon.svg',

			// このサイトのデフォルト言語として英語を設定します。
			defaultLocale: 'root',
			locales,
			customCss: [
				'./src/styles/docs.scss',
				'./src/styles/lism.scss',
				// 'lism-css/all.css',
			],
			sidebar,
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/lism-css/lism-css' },
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
