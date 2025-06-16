export default [
	{
		label: 'Start Here',
		translations: {
			ja: 'はじめに',
		},
		items: [
			// Each item here is one entry in the navigation menu.
			{
				label: 'Overview',
				link: '/overview/',
				translations: {
					ja: '概要',
				},
			},
			{
				label: 'Getting Started',
				link: '/getting-started/',
			},
			{
				label: 'Updates',
				link: '/updates/',
			},

			// {
			// 	label: 'Example Guide',
			// 	link: '/guides/example/',
			// 	badge: '新規',
			// 	translations: {
			// 		ja: 'ここからはじめる',
			// 	},
			// },
		],
	},
	{
		label: 'Lism CSS',
		// items: [],
		autogenerate: {
			directory: 'css',
			collapsed: true,
		},
	},

	{
		// index.mdxでlabel名読み取ってるので変更時は注意
		label: 'Lism Components',
		items: [
			{
				label: 'Lism',
				link: '/components/lism/',
			},
			{
				label: 'Text',
				link: '/components/text/',
			},
			{
				label: 'Link',
				link: '/components/link/',
			},
			{
				label: 'Media',
				link: '/components/media/',
			},
			{
				label: 'Dummy',
				link: '/components/dummy/',
			},
		],
	},
	{
		label: 'Layout Components',
		items: [
			{
				label: 'State',
				link: '###---',
			},
			{
				label: 'Container',
				link: '/layout/container/',
			},
			{
				label: 'Layer',
				link: '/layout/layer/',
			},
			{
				label: 'LinkBox',
				link: '/layout/linkbox/',
			},
			// {
			// 	label: 'getLismProps()',
			// 	link: '/props/get-lism-props/',
			// },

			{
				label: 'Layouts',
				link: '###---',
			},
			{
				label: '---',
				link: '###---',
			},
			{
				label: 'Flex',
				link: '/layout/flex/',
			},
			{
				label: 'Stack',
				link: '/layout/stack/',
			},
			{
				label: '---',
				link: '###---',
			},
			{
				label: 'Grid',
				link: '/layout/grid/',
			},
			{
				label: 'GridItem',
				link: '/layout/griditem/',
			},
			{
				label: 'Center',
				link: '/layout/center/',
			},
			{
				label: 'Columns',
				link: '/layout/columns/',
			},
			{
				label: '---',
				link: '###---',
			},
			{
				label: 'Box',
				link: '/layout/box/',
			},
			{
				label: 'Frame',
				link: '/layout/frame/',
			},
			{
				label: 'Divider',
				link: '/layout/divider/',
			},
			{
				label: 'WithSide',
				link: '/layout/withside/',
			},

			{
				label: '---',
				link: '###---',
			},
			{
				label: 'Decorator',
				link: '/layout/decorator/',
			},
			{
				label: 'Spacer',
				link: '/layout/spacer/',
			},
			{
				label: 'Icon',
				link: '/layout/icon/',
			},
			{
				label: 'Dynamic',
				link: '###---',
			},
			{
				label: 'Accordion',
				link: '/layout/accordion/',
			},
			{
				label: 'Modal',
				link: '/layout/modal/',
			},
			{
				label: 'Tabs',
				link: '/layout/tabs/',
			},
		],
	},
	{
		label: 'UI Components',
		link: '/lib',
		// translations: {
		// 	ja: '概要',
		// },
	},
	// {
	// 	label: 'Templates',
	// 	link: '/lib',
	// },
	// {
	// 	label: 'Lism Library',
	// 	link: '/lib',
	// },
	{
		label: 'Components',
		// autogenerate: {
		// 	directory: 'lib/components',
		// 	collapsed: true,
		// },
		items: [
			{
				label: 'Avatar',
				link: '/lib/components/avatar/',
			},
			{
				label: 'Badge',
				link: '/lib/components/badge/',
			},
			{
				label: 'Button',
				link: '/lib/components/button/',
			},
			{
				label: 'Callout',
				link: '/lib/components/callout/',
			},
			{
				label: 'Note',
				link: '/lib/components/note/',
			},
			{
				label: 'Card',
				link: '/lib/components/card/',
			},
			{
				label: 'Chat',
				link: '/lib/components/chat/',
			},
			{
				label: 'FAQ',
				link: '/lib/components/faq/',
			},
			{
				label: 'List',
				link: '/lib/components/list/',
			},
			{
				label: 'Table',
				link: '/lib/components/table/',
			},

			{
				label: 'NavMenu',
				link: '/lib/components/navmenu/',
			},
			{
				label: 'Reel',
				link: '/lib/components/reel/',
			},
			{
				label: 'ShapeDivider',
				link: '/lib/components/shapedivider/',
			},
			{
				label: 'Steps',
				link: '/lib/components/steps/',
			},
			{
				label: 'Timeline',
				link: '/lib/components/timeline/',
			},

			{
				label: '---',
				link: '###---',
			},
			{
				label: 'More Examples',
				link: '###---',
			},
			{
				label: '---',
				link: '###---',
			},
			{
				label: 'Banner',
				link: '/lib/components/banner/',
			},
			{
				label: 'Breadcrumb',
				link: '/lib/components/breadcrumb/',
			},
			{
				label: 'BalloonBox',
				link: '/lib/components/balloonbox/',
			},
			{
				label: 'Decorations',
				link: '/lib/components/decorations/',
			},
			{
				label: 'DividerLabel',
				link: '/lib/components/dividerlabel/',
			},
			{
				label: 'Hero',
				link: '/lib/components/hero/',
			},
			{
				label: 'TermList',
				link: '/lib/components/termlist/',
			},
			{
				label: '---',
				link: '###---',
			},
			{
				label: 'Others',
				link: '/lib/components/others/',
			},
		],
	},
	{
		label: 'Sections',
		// items: [],
		autogenerate: {
			directory: '/lib/sections',
		},
	},
	{
		label: 'Templates',
		// items: [],
		autogenerate: {
			directory: 'lib/page-layout',
		},
	},
	{
		label: 'Others',
		// items: [],
		autogenerate: {
			directory: 'others',
		},
	},
];
