import type { Meta, StoryObj } from '@storybook/react-vite';
import { Text } from './index';

const meta: Meta<typeof Text> = {
  title: 'Core/Text',
  component: Text,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'Text content',
  },
};
