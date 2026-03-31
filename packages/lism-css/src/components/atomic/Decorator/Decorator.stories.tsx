import type { Meta, StoryObj } from '@storybook/react-vite';
import { Decorator } from './index';

const meta: Meta<typeof Decorator> = {
	title: 'Atomic/Decorator',
	component: Decorator,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Decorator>;

export const Default: Story = {
	args: {
		bgc: 'base-2',
		w: '100%',
		h: '4px',
	},
};

export const WithSize: Story = {
	name: 'size 指定（正方形）',
	args: {
		size: '100px',
		bgc: 'base-2',
		bdrs: '50%',
	},
};

export const WithTransform: Story = {
	name: 'transform 指定',
	args: {
		size: '80px',
		bgc: 'base-2',
		rotate: '45deg',
	},
};

export const WithFilter: Story = {
	name: 'filter（blur）指定',
	args: {
		size: '80px',
		bgc: 'blue',
		blur: '4px',
	},
};

export const WithClipPath: Story = {
	name: 'clipPath 指定',
	args: {
		size: '100px',
		bgc: 'blue',
		clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
	},
};
