import type { Meta, StoryObj } from '@storybook/react-vite';
import { AutoColumns } from './index';

const meta: Meta<typeof AutoColumns> = {
  title: 'Layout/AutoColumns',
  component: AutoColumns,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    autoFill: {
      control: 'boolean',
      description: 'auto-fill を使用するかどうか',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AutoColumns>;

const DemoItems = () => (
  <>
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
    <div>Item 4</div>
  </>
);

export const Default: Story = {
  args: {
    g: '20',
    children: <DemoItems />,
  },
};

export const WithAutoFill: Story = {
  name: 'autoFill: true',
  args: {
    g: '20',
    autoFill: true,
    children: <DemoItems />,
  },
};
