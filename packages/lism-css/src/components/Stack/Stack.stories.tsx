import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './index';

const meta: Meta<typeof Stack> = {
	title: 'Core/Stack',
	component: Stack,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Stack>;

const DemoItems = () => (
	<>
		<div>Item 1</div>
		<div>Item 2</div>
		<div>Item 3</div>
	</>
);

export const Default: Story = {
	args: {
		g: '20',
		children: <DemoItems />,
	},
};

export const WithLargeGap: Story = {
	name: 'gap: 40',
	args: {
		g: '40',
		children: <DemoItems />,
	},
};
