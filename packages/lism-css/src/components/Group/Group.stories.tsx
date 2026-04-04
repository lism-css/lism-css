import type { Meta, StoryObj } from '@storybook/react-vite';
import { Group } from './index';

const meta: Meta<typeof Group> = {
  title: 'Core/Group',
  component: Group,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Group>;

export const Default: Story = {
  args: {
    p: '20',
    gap: '20',
    children: 'Group content',
  },
};

export const AsSection: Story = {
  name: 'as="section"',
  args: {
    as: 'section',
    p: '20',
    gap: '20',
    bgc: 'base-2',
    children: 'section element',
  },
};
