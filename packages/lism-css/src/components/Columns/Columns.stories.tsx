import type { Meta, StoryObj } from '@storybook/react-vite';
import { Columns } from './index';

const meta: Meta<typeof Columns> = {
	title: 'Core/Columns',
	component: Columns,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
	},
};

export default meta;
type Story = StoryObj<typeof Columns>;

const DemoItems = () => (
	<>
		<div>Column 1</div>
		<div>Column 2</div>
		<div>Column 3</div>
	</>
);

export const Default: Story = {
	args: {
		g: '20',
		children: <DemoItems />,
	},
};

export const TwoColumns: Story = {
	name: 'cols: 2',
	args: {
		g: '20',
		cols: 2,
		children: <DemoItems />,
	},
};

export const ResponsiveColumns: Story = {
	name: 'cols: responsive',
	args: {
		g: '20',
		// TODO: null を許容するようにする
		cols: ['2', '3'],
		children: <DemoItems />,
	},
};
