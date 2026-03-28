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

// 子要素が3つのパターン
export const ThreeColumns: Story = {
	name: '3カラム',
	args: {
		g: '20',
		children: (
			<>
				<div>Column 1</div>
				<div>Column 2</div>
				<div>Column 3</div>
			</>
		),
	},
};

// 子要素の flex-grow で特定カラムを拡大
export const WithFlexGrow: Story = {
	name: '子要素の flex-grow',
	args: {
		breakSize: 's',
		g: '20',
		children: (
			<>
				<div style={{ flexGrow: 2 }}>Column 1（flexGrow: 2）</div>
				<div>Column 2</div>
			</>
		),
	},
};
