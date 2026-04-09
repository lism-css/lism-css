import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack } from './index';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

const DemoItems = () => (
  <>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </>
);

export const Default: Story = {
  args: {
    g: '20',
    children: <DemoItems />,
  },
};

export const WithLargeGap: Story = {
  name: 'gap: 40',
  args: {
    g: '40',
    children: <DemoItems />,
  },
};

// ai='center' で内在的な中央寄せ（コンテンツが短い時だけ中央寄せ）
export const IntrinsicCenter: Story = {
  name: 'ai: center',
  args: {
    ai: 'center',
    g: '10',
    p: '40',
    bgc: 'base-2',
    children: (
      <>
        <p>短いテキストは中央寄せ</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </>
    ),
  },
};
