import type { Meta, StoryObj } from '@storybook/react-vite';
import Chat from './react/Chat';

const meta: Meta<typeof Chat> = {
  title: 'UI/Chat',
  component: Chat,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    name: { control: 'text' },
    avatar: { control: 'text' },
    direction: { control: 'select', options: ['start', 'end'] },
    variant: { control: 'select', options: ['speak', 'think'] },
    keycolor: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Chat>;

const AVATAR_SRC = 'https://cdn.lism-css.com/dummy-image.jpg';

export const Default: Story = {
  args: {
    name: 'ユーザー',
    avatar: AVATAR_SRC,
    children: 'こんにちは！チャットコンポーネントのデモです。',
  },
};

export const End: Story = {
  name: 'direction: end（右寄せ）',
  args: {
    name: '自分',
    avatar: AVATAR_SRC,
    direction: 'end',
    keycolor: 'blue',
    children: '右寄せのチャットメッセージです。',
  },
};

export const NoAvatar: Story = {
  name: 'アバターなし',
  args: {
    name: 'ゲスト',
    children: 'アバターなしのチャットです。',
  },
};

export const Think: Story = {
  name: 'variant: think',
  args: {
    name: 'キャラ',
    avatar: AVATAR_SRC,
    variant: 'think',
    children: '考え中のバリアントです。',
  },
};
