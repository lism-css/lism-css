import type { Meta, StoryObj } from '@storybook/react-vite';
import ShapeDivider from './react/ShapeDivider';

const WAVE_PATH =
  'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z';

const meta: Meta<typeof ShapeDivider> = {
  title: 'UI/ShapeDivider',
  component: ShapeDivider,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    level: { control: 'number' },
    flip: { control: 'select', options: [undefined, 'X', 'Y', 'XY'] },
    isAnimation: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof ShapeDivider>;

export const Default: Story = {
  args: {
    viewBox: '0 0 1200 120',
    level: 5,
  },
  render: (args) => (
    <ShapeDivider {...args}>
      <path d={WAVE_PATH} />
    </ShapeDivider>
  ),
};

export const FlipX: Story = {
  name: 'flip: X（左右反転）',
  args: {
    viewBox: '0 0 1200 120',
    level: 5,
    flip: 'X',
  },
  render: (args) => (
    <ShapeDivider {...args}>
      <path d={WAVE_PATH} />
    </ShapeDivider>
  ),
};

export const FlipY: Story = {
  name: 'flip: Y（上下反転）',
  args: {
    viewBox: '0 0 1200 120',
    level: 5,
    flip: 'Y',
  },
  render: (args) => (
    <ShapeDivider {...args}>
      <path d={WAVE_PATH} />
    </ShapeDivider>
  ),
};

export const HighLevel: Story = {
  name: 'level: 10',
  args: {
    viewBox: '0 0 1200 120',
    level: 10,
  },
  render: (args) => (
    <ShapeDivider {...args}>
      <path d={WAVE_PATH} />
    </ShapeDivider>
  ),
};

export const Animation: Story = {
  name: 'animation',
  args: {
    viewBox: '0 0 1200 120',
    level: 10,
    isAnimation: true,
  },
  render: (args) => (
    <ShapeDivider {...args}>
      <path d={WAVE_PATH} />
    </ShapeDivider>
  ),
};
