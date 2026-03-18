import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spacer } from './index';
import { Lism } from '../../Lism';

const meta: Meta<typeof Spacer> = {
	title: 'Atomic/Spacer',
	component: Spacer,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div>
				<Lism bgc='base-2' p='20'>
					Before
				</Lism>
				<Story />
				<Lism bgc='base-2' p='20'>
					After
				</Lism>
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof Spacer>;

export const Default: Story = {
	args: {
		h: '20',
	},
};

export const Large: Story = {
	name: 'h: "50"',
	args: {
		h: '50',
	},
};

export const Responsive: Story = {
	name: 'レスポンシブ',
	args: {
		h: { base: '20', sm: '30', md: '50' },
	},
};
