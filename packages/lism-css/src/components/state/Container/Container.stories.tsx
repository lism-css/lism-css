import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './index';

const meta: Meta<typeof Container> = {
  title: 'State/Container',
  component: Container,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    isWrapper: {
      control: 'text',
      description: 'コンテンツの最大幅サイズ。プリセット値 ("s", "l") や任意のCSS値を指定可能。',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

const DemoContent = () => (
  <>
    <p>Content</p>
    <p>Content</p>
    <p>...</p>
  </>
);

export const Default: Story = {
  args: {
    children: <DemoContent />,
  },
};

export const WrapperS: Story = {
  name: 'isWrapper: "s"',
  args: {
    isWrapper: 's',
    children: <DemoContent />,
  },
};

export const WrapperL: Story = {
  name: 'isWrapper: "l"',
  args: {
    isWrapper: 'l',
    children: <DemoContent />,
  },
};
