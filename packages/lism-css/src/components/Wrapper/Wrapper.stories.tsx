import type { Meta, StoryObj } from '@storybook/react-vite';
import { Wrapper } from './index';

const meta: Meta<typeof Wrapper> = {
	title: 'Core/Wrapper',
	component: Wrapper,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		contentSize: {
			control: 'text',
			description: 'コンテンツの最大幅。プリセット値 ("s", "l") や任意のCSS値を指定可能。',
			table: { category: 'Wrapper' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof Wrapper>;

const DemoContent = () => (
	<>
		<p>Content</p>
		<p>Content</p>
		<p>...</p>
	</>
);

export const Default: Story = {
	args: {
		children: <DemoContent />,
	},
};

export const ContentSizeS: Story = {
	name: 'contentSize: "s"',
	args: {
		contentSize: 's',
		children: <DemoContent />,
	},
};

export const ContentSizeL: Story = {
	name: 'contentSize: "l"',
	args: {
		contentSize: 'l',
		children: <DemoContent />,
	},
};

export const CustomContentSize: Story = {
	name: 'contentSize: カスタム値',
	args: {
		contentSize: '400px',
		children: <DemoContent />,
	},
};

export const WithLayout: Story = {
	name: 'layout: "flow"',
	args: {
		layout: 'flow',
		contentSize: 's',
		children: <DemoContent />,
	},
};
