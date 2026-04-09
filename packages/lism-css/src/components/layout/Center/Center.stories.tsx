import type { Meta, StoryObj } from '@storybook/react-vite';
import { Center } from './index';
import HTML from '../../HTML';

const meta: Meta<typeof Center> = {
  title: 'Layout/Center',
  component: Center,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Center>;

export const Default: Story = {
  args: {
    p: '20',
    minH: '200px',
    bgc: 'base-2',
    children: <p>Centered content</p>,
  },
};

// 高さ（ar）を持つ場合、垂直方向にも中央揃えになる
export const WithAspectRatio: Story = {
  name: '高さ指定で上下左右中央揃え',
  args: {
    g: '10',
    h: '100svh',
    bgc: 'base-2',
    children: (
      <>
        <HTML.p fz="l">TEXT</HTML.p>
        <HTML.p fz="s">Lorem ipsum dolor sit amet.</HTML.p>
      </>
    ),
  },
};

// 長いテキストは左寄せになり、読みやすさを損なわない（内在的中央配置）
export const IntrinsicCenter: Story = {
  name: '内在的な中央配置',
  args: {
    bd: true,
    p: '40',
    g: '10',
    bgc: 'base-2',
    children: (
      <>
        <HTML.p fz="l">TEXT</HTML.p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </>
    ),
  },
};
