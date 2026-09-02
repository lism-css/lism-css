import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from './react/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    name: { control: 'text' },
    alt: { control: 'text' },
    size: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
  args: {
    src: 'https://cdn.lism-css.com/dummy-image.jpg',
    alt: 'ユーザーアバター',
    size: '4rem',
  },
};

export const Small: Story = {
  name: '小サイズ',
  args: {
    src: 'https://cdn.lism-css.com/dummy-image.jpg',
    alt: '',
    size: '2rem',
  },
};

export const Large: Story = {
  name: '大サイズ',
  args: {
    src: 'https://cdn.lism-css.com/dummy-image.jpg',
    alt: '',
    size: '8rem',
  },
};

export const Initial: Story = {
  name: 'イニシャル表示（src なし）',
  args: {
    name: 'Yamada Taro',
    size: '4rem',
  },
};

export const InitialDecorative: Story = {
  name: 'イニシャル表示（装飾扱い）',
  args: {
    name: 'Yamada Taro',
    alt: '',
    size: '4rem',
  },
};
