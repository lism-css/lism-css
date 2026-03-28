import type { Meta, StoryObj } from '@storybook/react-vite';
import { FluidCols } from './index';

const meta: Meta<typeof FluidCols> = {
	title: 'Core/FluidCols',
	component: FluidCols,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		autoFill: {
			control: 'boolean',
			description: 'auto-fill を使用するかどうか',
		},
	},
};

export default meta;
type Story = StoryObj<typeof FluidCols>;

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

export const WithAutoFill: Story = {
	name: 'autoFill: true',
	args: {
		g: '20',
		autoFill: true,
		children: <DemoItems />,
	},
};
