import type { Meta, StoryObj } from '@storybook/react-vite';
import { Lism } from './index';

const meta = {
	title: 'Core/Lism',
	component: Lism,
	tags: ['autodocs'],
	argTypes: {
		// --- Common Props ---
		as: { control: 'text', table: { category: 'Common' } },
		lismClass: { control: 'text', table: { category: 'Common' } },
		variant: { control: 'text', table: { category: 'Common' } },
		layout: {
			control: 'select',
			table: { category: 'Common' },
		},

		// --- Prop Class / Typography ---
		fz: { control: 'object', table: { category: 'Prop Class', subcategory: 'Typography' } },
		fw: { control: 'text', table: { category: 'Prop Class', subcategory: 'Typography' } },
		ff: { control: 'text', table: { category: 'Prop Class', subcategory: 'Typography' } },
		lh: { control: 'text', table: { category: 'Prop Class', subcategory: 'Typography' } },
		lts: { control: 'text', table: { category: 'Prop Class', subcategory: 'Typography' } },
		ta: {
			control: 'select',
			options: ['center', 'left', 'right'],
			table: { category: 'Prop Class', subcategory: 'Typography' },
		},

		// --- Prop Class / Colors ---
		c: { control: 'text', table: { category: 'Prop Class', subcategory: 'Colors' } },
		bgc: { control: 'text', table: { category: 'Prop Class', subcategory: 'Colors' } },
		keycolor: { control: 'text', table: { category: 'Prop Class', subcategory: 'Colors' } },

		// --- Prop Class / Padding ---
		p: { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		px: { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		py: { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		'px-s': { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		'px-e': { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		'py-s': { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		'py-e': { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		pl: { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		pr: { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		pt: { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },
		pb: { control: 'object', table: { category: 'Prop Class', subcategory: 'Padding' } },

		// --- Prop Class / Margin ---
		m: { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		mx: { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		my: { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		'mx-s': { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		'mx-e': { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		'my-s': { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		'my-e': { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		ml: { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		mr: { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		mt: { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },
		mb: { control: 'object', table: { category: 'Prop Class', subcategory: 'Margin' } },

		// --- Prop Class / Sizing ---
		w: { control: 'object', table: { category: 'Prop Class', subcategory: 'Sizing' } },
		h: { control: 'object', table: { category: 'Prop Class', subcategory: 'Sizing' } },
		'min-w': { control: 'object', table: { category: 'Prop Class', subcategory: 'Sizing' } },
		'max-w': { control: 'object', table: { category: 'Prop Class', subcategory: 'Sizing' } },
		'min-h': { control: 'object', table: { category: 'Prop Class', subcategory: 'Sizing' } },
		'max-h': { control: 'object', table: { category: 'Prop Class', subcategory: 'Sizing' } },
		ar: { control: 'object', table: { category: 'Prop Class', subcategory: 'Sizing' } },

		// --- Prop Class / Display ---
		d: { control: 'object', table: { category: 'Prop Class', subcategory: 'Display' } },
		o: { control: 'text', table: { category: 'Prop Class', subcategory: 'Display' } },
		v: { control: 'text', table: { category: 'Prop Class', subcategory: 'Display' } },
		ov: {
			control: 'select',
			table: { category: 'Prop Class', subcategory: 'Display' },
		},

		// --- Prop Class / Background ---
		bg: { control: 'object', table: { category: 'Prop Class', subcategory: 'Background' } },

		// --- Prop Class / Border ---
		bd: { control: 'boolean', table: { category: 'Prop Class', subcategory: 'Border' } },
		bdc: { control: 'text', table: { category: 'Prop Class', subcategory: 'Border' } },
		bdw: { control: 'object', table: { category: 'Prop Class', subcategory: 'Border' } },
		bds: {
			control: 'select',
			options: ['dashed', 'dotted', 'double'],
			table: { category: 'Prop Class', subcategory: 'Border' },
		},
		bdrs: { control: 'object', table: { category: 'Prop Class', subcategory: 'Border' } },
		bxsh: { control: 'object', table: { category: 'Prop Class', subcategory: 'Border' } },

		// --- Prop Class / Flexbox ---
		fxw: { control: 'object', table: { category: 'Prop Class', subcategory: 'Flexbox' } },
		fxd: { control: 'object', table: { category: 'Prop Class', subcategory: 'Flexbox' } },
		fx: { control: 'object', table: { category: 'Prop Class', subcategory: 'Flexbox' } },
		fxg: { control: 'text', table: { category: 'Prop Class', subcategory: 'Flexbox' } },
		fxsh: { control: 'text', table: { category: 'Prop Class', subcategory: 'Flexbox' } },
		fxb: { control: 'object', table: { category: 'Prop Class', subcategory: 'Flexbox' } },

		// --- Prop Class / Grid ---
		gt: { control: 'object', table: { category: 'Prop Class', subcategory: 'Grid' } },
		gta: { control: 'object', table: { category: 'Prop Class', subcategory: 'Grid' } },
		gtc: { control: 'object', table: { category: 'Prop Class', subcategory: 'Grid' } },
		gtr: { control: 'object', table: { category: 'Prop Class', subcategory: 'Grid' } },
		gaf: { control: 'object', table: { category: 'Prop Class', subcategory: 'Grid' } },
		ga: { control: 'object', table: { category: 'Prop Class', subcategory: 'Grid' } },
		gc: { control: 'object', table: { category: 'Prop Class', subcategory: 'Grid' } },
		gr: { control: 'object', table: { category: 'Prop Class', subcategory: 'Grid' } },

		// --- Prop Class / Gap ---
		g: { control: 'object', table: { category: 'Prop Class', subcategory: 'Gap' } },
		'g-x': { control: 'object', table: { category: 'Prop Class', subcategory: 'Gap' } },
		'g-y': { control: 'object', table: { category: 'Prop Class', subcategory: 'Gap' } },

		// --- Prop Class / Alignment ---
		ai: { control: 'object', table: { category: 'Prop Class', subcategory: 'Alignment' } },
		ac: { control: 'object', table: { category: 'Prop Class', subcategory: 'Alignment' } },
		ji: { control: 'object', table: { category: 'Prop Class', subcategory: 'Alignment' } },
		jc: { control: 'object', table: { category: 'Prop Class', subcategory: 'Alignment' } },
		pi: { control: 'text', table: { category: 'Prop Class', subcategory: 'Alignment' } },
		pc: { control: 'text', table: { category: 'Prop Class', subcategory: 'Alignment' } },
		aslf: { control: 'text', table: { category: 'Prop Class', subcategory: 'Alignment' } },
		jslf: { control: 'text', table: { category: 'Prop Class', subcategory: 'Alignment' } },
		order: { control: 'text', table: { category: 'Prop Class', subcategory: 'Alignment' } },

		// --- Prop Class / Position ---
		pos: { control: 'text', table: { category: 'Prop Class', subcategory: 'Position' } },
		z: { control: 'text', table: { category: 'Prop Class', subcategory: 'Position' } },
		t: { control: 'text', table: { category: 'Prop Class', subcategory: 'Position' } },
		l: { control: 'text', table: { category: 'Prop Class', subcategory: 'Position' } },
		r: { control: 'text', table: { category: 'Prop Class', subcategory: 'Position' } },
		b: { control: 'text', table: { category: 'Prop Class', subcategory: 'Position' } },
		i: { control: 'text', table: { category: 'Prop Class', subcategory: 'Position' } },

		// --- State ---
		isContainer: { control: 'boolean', table: { category: 'State' } },
		isWrapper: { control: 'object', table: { category: 'State' } },
		isLayer: { control: 'boolean', table: { category: 'State' } },
		isLinkBox: { control: 'boolean', table: { category: 'State' } },
		setGutter: { control: 'boolean', table: { category: 'State' } },
		isVertical: { control: 'boolean', table: { category: 'State' } },

		// --- Other ---
		hov: { control: 'object', table: { category: 'Other' } },
		css: { control: 'object', table: { category: 'Other' } },
	},
} satisfies Meta<typeof Lism>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		p: '20',
		fw: 'bold',
		c: 'blue',
		bgc: 'base-2',
		bdrs: '20',
		children: 'Lism content',
	},
};

export const AsParagraph: Story = {
	name: 'as: Paragraph',
	args: {
		as: 'p',
		fz: 'l',
		children: 'Lorem ipsum texts...',
	},
};

export const WithLismClass: Story = {
	name: 'lismClass',
	args: {
		lismClass: 'c--myComponent',
		p: '10',
		children: 'Lorem ipsum texts...',
	},
};

export const WithVariant: Story = {
	name: 'variant',
	args: {
		lismClass: 'c--myComponent',
		variant: 'secondary',
		children: 'Lorem ipsum texts...',
	},
};

export const WithLayout: Story = {
	name: 'layout',
	args: {
		layout: 'flow',
		children: 'Lorem ipsum texts...',
	},
};

export const ResponsiveArray: Story = {
	name: 'Responsive (配列)',
	args: {
		p: ['20', '30', '40'],
		bgc: 'base-2',
		children: 'Responsive padding: 20 → 30 → 40',
	},
};

export const ResponsiveObject: Story = {
	name: 'Responsive (オブジェクト)',
	args: {
		p: { base: '20', sm: '30', md: '40' },
		bgc: 'base-2',
		children: 'Responsive padding: base=20, sm=30, md=40',
	},
};

export const WithCssProp: Story = {
	name: 'css prop',
	args: {
		css: { textShadow: '1px 1px 2px rgba(0,0,0,0.3)', '--my-var': '10px' },
		p: '20',
		children: 'css prop でインラインスタイルを直接指定',
	},
};
