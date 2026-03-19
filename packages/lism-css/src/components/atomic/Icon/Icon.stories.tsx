import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './index';

const meta: Meta = {
	title: 'Atomic/Icon',
	component: Icon,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		icon: {
			control: 'text',
			description: 'プリセットアイコン名、コンポーネント、またはSVG文字列',
		},
		label: {
			control: 'text',
			description: 'アクセシブルラベル。指定するとaria-labelが設定される',
		},
	},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
	args: {
		icon: 'star',
		fz: '2rem',
	},
};

export const WithLabel: Story = {
	name: 'label 指定（アクセシブル）',
	args: {
		icon: 'info',
		label: 'Information',
		fz: '2rem',
	},
};

export const LogoIcon: Story = {
	name: 'ロゴアイコン',
	args: {
		icon: 'logo-github',
		fz: '2rem',
	},
};

export const CheckCircle: Story = {
	name: 'check-circle',
	args: {
		icon: 'check-circle',
		fz: '2rem',
		c: 'green',
	},
};

export const WarningIcon: Story = {
	name: 'warning',
	args: {
		icon: 'warning',
		fz: '2rem',
		c: 'orange',
	},
};
