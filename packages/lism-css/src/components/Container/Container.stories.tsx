import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './index';

const meta: Meta<typeof Container> = {
	title: 'Core/Container',
	component: Container,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		size: {
			control: 'text',
			description: 'コンテンツの最大幅サイズ。プリセット値 ("s", "l") や任意のCSS値を指定可能。',
			table: { category: 'Container' },
		},
	},
};

export default meta;
type Story = StoryObj<typeof Container>;

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

export const SizeS: Story = {
	name: 'size: "s"',
	args: {
		size: 's',
		children: <DemoContent />,
	},
};

export const SizeL: Story = {
	name: 'size: "l"',
	args: {
		size: 'l',
		children: <DemoContent />,
	},
};
