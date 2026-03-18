import type { Meta, StoryObj } from '@storybook/react-vite';
import { Flow } from './index';

const meta: Meta<typeof Flow> = {
	title: 'Core/Flow',
	component: Flow,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		flow: {
			control: 'text',
			description: 'フロー方向の余白量',
			table: { category: 'Flow' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof Flow>;

const DemoContent = () => (
	<>
		<p>Paragraph 1</p>
		<p>Paragraph 2</p>
		<p>Paragraph 3</p>
	</>
);

export const Default: Story = {
	args: {
		children: <DemoContent />,
	},
};

export const WithFlowValue: Story = {
	name: 'flow 指定',
	args: {
		flow: '40',
		children: <DemoContent />,
	},
};
