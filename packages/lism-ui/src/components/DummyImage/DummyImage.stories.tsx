import type { Meta, StoryObj } from '@storybook/react-vite';
import DummyImage from './react/DummyImage';

const meta: Meta<typeof DummyImage> = {
  title: 'UI/DummyImage',
  component: DummyImage,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DummyImage>;

export const Default: Story = {
  args: {},
};

export const WithSize: Story = {
  name: 'サイズ指定',
  args: {
    w: '300px',
    h: '200px',
  },
};
