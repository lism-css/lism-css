import type { Meta, StoryObj } from '@storybook/react-vite';
import { Media } from './index';

const meta = {
	title: 'Atomic/Media',
	component: Media,
	tags: ['autodocs'],
	argTypes: {
		objectFit: {
			control: 'select',
			options: ['cover', 'contain', 'fill', 'none', 'scale-down'],
			description: 'CSS object-fit',
		},
		objectPosition: {
			control: 'text',
			description: 'CSS object-position',
		},
	},
} satisfies Meta<typeof Media>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		src: 'https://picsum.photos/600/400',
		alt: 'Sample image',
		w: '300px',
	} as Story['args'],
};

export const WithObjectFitCover: Story = {
	name: 'objectFit: cover',
	args: {
		src: 'https://picsum.photos/600/400',
		alt: 'Covered image',
		w: '200px',
		h: '200px',
		objectFit: 'cover',
	} as Story['args'],
};

export const WithObjectFitContain: Story = {
	name: 'objectFit: contain',
	args: {
		src: 'https://picsum.photos/600/400',
		alt: 'Contained image',
		w: '200px',
		h: '200px',
		objectFit: 'contain',
		bgc: 'base-2',
	} as Story['args'],
};

export const WithObjectPosition: Story = {
	name: 'objectPosition 指定',
	args: {
		src: 'https://picsum.photos/600/400',
		alt: 'Positioned image',
		w: '200px',
		h: '200px',
		objectFit: 'cover',
		objectPosition: 'top left',
	} as Story['args'],
};
