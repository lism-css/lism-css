import type { Meta, StoryObj } from '@storybook/react-vite';
import { Media } from './index';

const meta: Meta = {
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
};

export default meta;
type Story = StoryObj<typeof Media>;

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/600/400',
    alt: 'Sample image',
    w: '300px',
  },
};

export const WithObjectFitCover: Story = {
  name: 'objectFit: cover',
  args: {
    src: 'https://picsum.photos/600/400',
    alt: 'Covered image',
    w: '200px',
    h: '200px',
    objectFit: 'cover',
  },
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
  },
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
  },
};
