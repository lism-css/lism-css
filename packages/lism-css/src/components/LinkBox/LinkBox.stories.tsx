import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinkBox } from './index';

const meta: Meta<typeof LinkBox> = {
	title: 'Core/LinkBox',
	component: LinkBox,
	tags: ['autodocs'],
	argTypes: {
		children: { control: false },
		href: { control: 'text', description: 'リンク先URL', table: { category: 'LinkBox' } },
	},
};

export default meta;
type Story = StoryObj<typeof LinkBox>;

export const Default: Story = {
	args: {
		href: '#',
		p: '20',
		children: <p>LinkBox content</p>,
	},
};

export const WithoutHref: Story = {
	name: 'href なし (div)',
	args: {
		p: '20',
		children: <p>LinkBox without href renders as div</p>,
	},
};
