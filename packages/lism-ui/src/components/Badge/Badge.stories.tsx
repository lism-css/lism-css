import type { Meta, StoryObj } from '@storybook/react-vite';
import Badge from './react/Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    c: { control: 'text', description: 'テキストカラー（CSS変数キー）' },
    bgc: { control: 'text', description: '背景カラー（CSS変数キー）' },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const WithColor: Story = {
  name: 'カラー指定',
  args: {
    children: 'New',
    c: 'white',
    bgc: 'red',
  },
};

export const Secondary: Story = {
  name: 'セカンダリカラー',
  args: {
    children: 'Info',
    c: 'white',
    bgc: 'blue',
  },
};
