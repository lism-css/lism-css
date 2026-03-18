import type { Meta, StoryObj } from '@storybook/react-vite';
import { Grid } from './index';

const meta: Meta<typeof Grid> = {
	title: 'Core/Grid',
	component: Grid,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Grid>;

const DemoItems = () => (
	<>
		<div>Item 1</div>
		<div>Item 2</div>
		<div>Item 3</div>
		<div>Item 4</div>
	</>
);

export const Default: Story = {
	args: {
		g: '20',
		children: <DemoItems />,
	},
};

export const WithGtc: Story = {
	name: 'gtc 指定',
	args: {
		g: '20',
		gtc: '1fr 1fr 1fr',
		children: <DemoItems />,
	},
};
