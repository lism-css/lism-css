import type { Meta, StoryObj } from '@storybook/react-vite';
import { SwitchCols } from './index';

const meta: Meta<typeof SwitchCols> = {
	title: 'Core/SwitchCols',
	component: SwitchCols,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		breakSize: {
			control: 'text',
			description: 'カラム切り替えのブレークポイント',
			table: { category: 'SwitchCols' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof SwitchCols>;

const DemoItems = () => (
	<>
		<div>Column 1</div>
		<div>Column 2</div>
	</>
);

export const Default: Story = {
	args: {
		g: '20',
		children: <DemoItems />,
	},
};

export const WithBreakSize: Story = {
	name: 'breakSize 指定',
	args: {
		g: '20',
		breakSize: '600px',
		children: <DemoItems />,
	},
};
