import type { Meta, StoryObj } from '@storybook/react-vite';
import { Center } from './index';

const meta: Meta<typeof Center> = {
	title: 'Core/Center',
	component: Center,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Center>;

export const Default: Story = {
	args: {
		p: '20',
		minH: '200px',
		bgc: 'base-2',
		children: <p>Centered content</p>,
	},
};
