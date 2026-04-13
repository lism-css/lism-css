import type { Meta, StoryObj } from '@storybook/react-vite';
import { BoxLink } from './index';

const meta: Meta<typeof BoxLink> = {
  title: 'State/BoxLink',
  component: BoxLink,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    href: { control: 'text', description: 'リンク先URL' },
  },
};

export default meta;
type Story = StoryObj<typeof BoxLink>;

export const Default: Story = {
  args: {
    href: '#',
    p: '20',
    children: <p>BoxLink content</p>,
  },
};

export const WithoutHref: Story = {
  name: 'href なし (div)',
  args: {
    p: '20',
    children: <p>BoxLink without href renders as div</p>,
  },
};
