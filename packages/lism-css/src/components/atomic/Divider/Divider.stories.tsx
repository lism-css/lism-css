import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './index';
import { Flex } from '../../Flex';

const meta: Meta<typeof Divider> = {
	title: 'Atomic/Divider',
	component: Divider,
	tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Default: Story = {
	args: {},
};

export const WithCustomStyle: Story = {
	name: 'カスタムスタイル',
	args: {
		bdw: '3px',
		bdc: 'blue',
		bds: 'dotted',
	},
};

// isVertical で縦方向の区切り線（Flex 内で使用）
export const Vertical: Story = {
	name: 'isVertical（縦方向）',
	decorators: [
		(Story) => (
			<Flex g='20' ai='stretch' h='2em'>
				<div>Left</div>
				<Story />
				<div>Right</div>
			</Flex>
		),
	],
	args: {
		isVertical: true,
		bdw: '2px',
	},
};
