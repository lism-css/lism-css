import type { Meta, StoryObj } from '@storybook/react-vite';
import { SideMain } from './index';

const meta: Meta<typeof SideMain> = {
	title: 'Core/SideMain',
	component: SideMain,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		sideW: {
			control: 'text',
			description: 'サイドバーの幅',
			table: { category: 'SideMain' },
		},
		mainW: {
			control: 'text',
			description: 'メインエリアの最小幅',
			table: { category: 'SideMain' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof SideMain>;

const DemoContent = () => (
	<>
		<div>Side</div>
		<div>Main</div>
	</>
);

export const Default: Story = {
	args: {
		g: '20',
		children: <DemoContent />,
	},
};

export const WithSideWidth: Story = {
	name: 'sideW 指定',
	args: {
		g: '20',
		sideW: '200px',
		children: <DemoContent />,
	},
};

export const WithMainWidth: Story = {
	name: 'mainW 指定',
	args: {
		g: '20',
		sideW: '200px',
		mainW: '60%',
		children: <DemoContent />,
	},
};
