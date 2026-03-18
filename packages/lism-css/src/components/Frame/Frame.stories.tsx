import type { Meta, StoryObj } from '@storybook/react-vite';
import { Frame } from './index';

const meta: Meta<typeof Frame> = {
	title: 'Core/Frame',
	component: Frame,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Frame>;

export const Default: Story = {
	args: {
		aspect: '16/9',
		bgc: 'base-2',
		children: <p>Frame content (16:9)</p>,
	},
};

export const Square: Story = {
	name: 'aspect: 1/1',
	args: {
		aspect: '1/1',
		bgc: 'base-2',
		children: <p>Square frame</p>,
	},
};
