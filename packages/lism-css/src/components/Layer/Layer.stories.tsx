import type { Meta, StoryObj } from '@storybook/react-vite';
import { Layer } from './index';

const meta: Meta<typeof Layer> = {
	title: 'Core/Layer',
	component: Layer,
	tags: ['autodocs'],
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
		bgc: 'base-2',
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
