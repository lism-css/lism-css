import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cluster } from './index';

const meta: Meta<typeof Cluster> = {
  title: 'Core/Cluster',
  component: Cluster,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Cluster>;

const DemoItems = () => (
  <>
    <span>Item 1</span>
    <span>Item 2</span>
    <span>Item 3</span>
    <span>Item 4</span>
    <span>Item 5</span>
  </>
);

export const Default: Story = {
  args: {
    g: '20',
    children: <DemoItems />,
  },
};

export const WithGap: Story = {
  name: 'gap 指定',
  args: {
    g: '40',
    children: <DemoItems />,
  },
};
