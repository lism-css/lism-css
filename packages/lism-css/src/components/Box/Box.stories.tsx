import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from './index';

const meta: Meta<typeof Box> = {
	title: 'Core/Box',
	component: Box,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Box>;

export const Default: Story = {
	args: {
		p: '20',
		children: 'Box content',
	},
};

export const WithBackground: Story = {
	name: 'bgc 指定',
	args: {
		p: '20',
		bgc: 'base-2',
		bdrs: '20',
		children: 'Box with background',
	},
};
