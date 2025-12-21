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
				label: 'Changelog',
				link: '/changelog/',
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
				label: 'HTML',
				link: '/components/html/',
			},
			{
				label: 'Dummy',
				link: '/components/dummy/',
			},
		],
	},
	{
		label: 'State Modules',
		items: [
			{
				label: 'Container',
				link: '/modules/state/container/',
			},
			{
				label: 'Wrapper',
				link: '/modules/state/wrapper/',
			},
			{
				label: 'Layer',
				link: '/modules/state/layer/',
			},
			{
				label: 'LinkBox',
				link: '/modules/state/linkbox/',
			},
		],
	},
	{
		label: 'Layout Modules',
		items: [
			{
				label: 'Box',
				link: '/modules/layout/box/',
			},
			{
				label: 'Flow',
				link: '/modules/layout/flow/',
			},
			{
				label: 'Frame',
				link: '/modules/layout/frame/',
			},
			{
				label: '---',
				link: '###---',
			},
			{
				label: 'Flex',
				link: '/modules/layout/flex/',
			},
			{
				label: 'Cluster',
				link: '/modules/layout/cluster/',
			},
			{
				label: 'Stack',
				link: '/modules/layout/stack/',
			},
			{
				label: 'SwitchCols',
				link: '/modules/layout/switchcols/',
			},
			{
				label: 'WithSide',
				link: '/modules/layout/withside/',
			},
			{
				label: '---',
				link: '###---',
			},
			{
				label: 'Grid',
				link: '/modules/layout/grid/',
			},
			{
				label: 'Center',
				link: '/modules/layout/center/',
			},
			{
				label: 'LiquidGrid',
				link: '/modules/layout/liquidgrid/',
			},
			{
				label: 'Columns',
				link: '/modules/layout/columns/',
			},
			{
				label: '---',
				link: '###---',
			},
		],
	},
	{
		label: 'Atomic Modules',
		items: [
			{
				label: 'Decorator',
				link: '/modules/atomic/decorator/',
			},
			{
				label: 'Divider',
				link: '/modules/atomic/divider/',
			},
			{
				label: 'Icon',
				link: '/modules/atomic/icon/',
			},
			{
				label: 'Media',
				link: '/modules/atomic/media/',
			},
			{
				label: 'Spacer',
				link: '/modules/atomic/spacer/',
			},
		],
	},
	{
		label: 'Docs',
		link: '/overview/',
	},
	{
		label: 'Template Library',
		link: '/lib',
	},
	// {
	// 	label: 'Templates',
	// 	link: '/lib?tab=templates',
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
				label: 'Accordion',
				link: '/lib/components/accordion/',
			},
			{
				label: 'Modal',
				link: '/lib/components/modal/',
			},
			{
				label: 'Tabs',
				link: '/lib/components/tabs/',
			},
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
				label: 'Chat',
				link: '/lib/components/chat/',
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
				label: 'ShapeDivider',
				link: '/lib/components/shapedivider/',
			},
			{
				label: 'Timeline',
				link: '/lib/components/timeline/',
			},
			{
				label: 'UI Blocks',
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
				label: 'Card',
				link: '/lib/components/card/',
			},
			{
				label: 'DividerLabel',
				link: '/lib/components/dividerlabel/',
			},
			{
				label: 'Reel',
				link: '/lib/components/reel/',
			},
			{
				label: 'FAQ',
				link: '/lib/components/faq/',
			},
			{
				label: 'Hero',
				link: '/lib/components/hero/',
			},
			{
				label: 'Steps',
				link: '/lib/components/steps/',
			},
			{
				label: 'Decorations',
				link: '###---',
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
				label: '---',
				link: '###---',
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
		label: 'Templates',
		// items: [],
		autogenerate: {
			directory: 'lib/templates',
		},
	},
	{
		label: 'Page Layout',
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
