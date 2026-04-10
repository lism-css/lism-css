import type { Meta, StoryObj } from '@storybook/react-vite';
import Callout from './react/Callout';
import PRESETS from './presets';

const presetTypes = Object.keys(PRESETS);

const meta: Meta<typeof Callout> = {
  title: 'UI/Callout',
  component: Callout,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    type: { control: 'select', options: presetTypes },
    title: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Callout>;

export const Default: Story = {
  args: {
    type: 'note',
    children: 'コールアウトのメッセージです。',
  },
};

export const WithTitle: Story = {
  name: 'タイトルあり',
  args: {
    type: 'note',
    title: 'メモ',
    children: 'タイトル付きのコールアウトです。',
  },
};

export const Alert: Story = {
  args: { type: 'alert', title: '警告', children: '警告のメッセージです。' },
};

export const Point: Story = {
  args: { type: 'point', title: 'ポイント', children: 'ポイントのメッセージです。' },
};

export const Warning: Story = {
  args: { type: 'warning', title: '注意', children: '注意のメッセージです。' },
};

export const Check: Story = {
  args: { type: 'check', title: 'OK', children: 'チェックのメッセージです。' },
};

export const Help: Story = {
  args: { type: 'help', title: 'ヘルプ', children: 'ヘルプのメッセージです。' },
};
