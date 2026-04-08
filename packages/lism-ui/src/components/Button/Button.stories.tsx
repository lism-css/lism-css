import type { Meta, StoryObj } from '@storybook/react-vite';
import Button from './react/Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    c: { control: 'text', description: 'テキストカラー（CSS変数キー）' },
    bgc: { control: 'text', description: '背景カラー（CSS変数キー）' },
    href: { control: 'text' },
    as: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'ボタン',
    href: '#',
  },
};

export const AsButton: Story = {
  name: 'as="button"',
  args: {
    children: 'ボタン要素',
    as: 'button',
  },
};

export const WithColor: Story = {
  name: 'カラー指定',
  args: {
    children: '送信する',
    as: 'button',
    c: 'white',
    bgc: 'blue',
    bdrs: '99',
  },
};
