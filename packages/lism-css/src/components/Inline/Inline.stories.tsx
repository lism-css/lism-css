import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inline } from './index';

const meta: Meta<typeof Inline> = {
  title: 'Core/Inline',
  component: Inline,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Inline>;

export const Default: Story = {
  args: {
    children: 'Inline content',
  },
};

export const AsEm: Story = {
  name: 'as="em"',
  args: {
    as: 'em',
    c: 'accent',
    children: 'Emphasized text',
  },
};

export const AsCode: Story = {
  name: 'as="code"',
  args: {
    as: 'code',
    bgc: 'base-2',
    p: '5',
    bdrs: '5',
    fz: 's',
    children: 'inline code',
  },
};

export const AsTime: Story = {
  name: 'as="time"',
  args: {
    as: 'time',
    dateTime: '2026-04-03',
    c: 'dimmed',
    fz: 's',
    children: '2026年4月3日',
  },
};
