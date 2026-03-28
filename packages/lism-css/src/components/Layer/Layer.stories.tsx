import type { Meta, StoryObj } from '@storybook/react-vite';
import { Layer } from './index';
import { Lism } from '../Lism';

const meta: Meta<typeof Layer> = {
	title: 'Core/Layer',
	component: Layer,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<Lism pos='relative' p='30' bgc='base-2' h='50svh'>
				<Lism as='p' o='-30' fz='2xl' ff='mono' fw='bold'>
					BACKGROUND BACKGROUND BACKGROUND BACKGROUND
				</Lism>
				<Story />
			</Lism>
		),
	],
	argTypes: {
		children: { control: false },
		blur: { control: 'text', description: 'backdrop-filter: blur()', table: { category: 'Filter' } },
		brightness: { control: 'text', description: 'backdrop-filter: brightness()', table: { category: 'Filter' } },
		grayscale: { control: 'text', description: 'backdrop-filter: grayscale()', table: { category: 'Filter' } },
	},
};

export default meta;
type Story = StoryObj<typeof Layer>;

export const Default: Story = {
	args: {
		children: <p>Layer content</p>,
	},
};

export const WithBlur: Story = {
	name: 'blur 指定',
	args: {
		blur: '4px',
		children: <p>Blurred layer</p>,
	},
};

// センター配置
export const CenterLayer: Story = {
	name: 'センター配置',
	args: {
		m: 'auto',
		w: 'fit',
		h: 'fit',
		children: <Lism>Centered layer</Lism>,
	},
};
