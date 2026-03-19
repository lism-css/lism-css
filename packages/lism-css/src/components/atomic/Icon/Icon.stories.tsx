import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from './index';
import presets from './presets';
import type { PresetIconName } from './getProps';

const presetIconNames = Object.keys(presets) as PresetIconName[];

const meta: Meta = {
	title: 'Atomic/Icon',
	component: Icon,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		icon: {
			control: 'select',
			options: presetIconNames,
			description: 'プリセットアイコン名、コンポーネント、またはSVG文字列',
		},
		label: {
			control: 'text',
			description: 'アクセシブルラベル。指定するとaria-labelが設定される',
		},
	},
};

export default meta;
type Story = StoryObj<typeof Icon>;

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

export const WithViewBox: Story = {
	name: 'viewBox + path（SVG直接記述）',
	args: {
		viewBox: '0 0 256 256',
		fz: '3rem',
		c: 'blue',
		label: 'Translate icon',
	},
	render: (args) => (
		<Icon {...args}>
			<path d='M247.15,212.42l-56-112a8,8,0,0,0-14.31,0l-21.71,43.43A88,88,0,0,1,108,126.93,103.65,103.65,0,0,0,135.69,64H160a8,8,0,0,0,0-16H104V32a8,8,0,0,0-16,0V48H32a8,8,0,0,0,0,16h87.63A87.76,87.76,0,0,1,96,116.35a87.74,87.74,0,0,1-19-31,8,8,0,1,0-15.08,5.34A103.63,103.63,0,0,0,84,127a87.55,87.55,0,0,1-52,17,8,8,0,0,0,0,16,103.46,103.46,0,0,0,64-22.08,104.18,104.18,0,0,0,51.44,21.31l-26.6,53.19a8,8,0,0,0,14.31,7.16L148.94,192h70.11l13.79,27.58A8,8,0,0,0,240,224a8,8,0,0,0,7.15-11.58ZM156.94,176,184,121.89,211.05,176Z' />
		</Icon>
	),
};
