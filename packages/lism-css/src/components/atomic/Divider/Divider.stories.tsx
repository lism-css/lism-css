import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './index';

const meta: Meta<typeof Divider> = {
	title: 'Atomic/Divider',
	component: Divider,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
	args: {},
};

export const WithCustomStyle: Story = {
	name: 'カスタムスタイル',
	args: {
		bdw: '2px',
		bdc: 'blue',
	},
};
