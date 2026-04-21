import type { Meta, StoryObj } from '@storybook/react-vite';
import Alert from './react/Alert';
import PRESETS from './presets';

const presetTypes = Object.keys(PRESETS);

const meta: Meta<typeof Alert> = {
  title: 'UI/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    type: { control: 'select', options: presetTypes },
    layout: { control: 'select', options: ['flex', 'withSide'] },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    type: 'alert',
    children: 'アラートのメッセージです。',
  },
};

export const Point: Story = {
  args: { type: 'point', children: 'ポイントのメッセージです。' },
};

export const Warning: Story = {
  args: { type: 'warning', children: '警告のメッセージです。' },
};

export const Check: Story = {
  args: { type: 'check', children: 'チェックのメッセージです。' },
};

export const Help: Story = {
  args: { type: 'help', children: 'ヘルプのメッセージです。' },
};

export const Info: Story = {
  args: { type: 'info', children: '情報のメッセージです。' },
};

export const WithSide: Story = {
  name: 'layout: withSide',
  args: {
    type: 'alert',
    layout: 'withSide',
    children: 'サイドメインレイアウトのアラートです。',
  },
};

export const CustomIcon: Story = {
  name: 'カスタムアイコン',
  args: {
    icon: 'star',
    keycolor: 'purple',
    children: 'カスタムアイコンとカラー指定。',
  },
};
