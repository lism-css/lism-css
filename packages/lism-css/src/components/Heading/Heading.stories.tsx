import type { Meta, StoryObj } from '@storybook/react-vite';
import { Heading } from './index';

const meta: Meta<typeof Heading> = {
  title: 'Core/Heading',
  component: Heading,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    level: {
      control: { type: 'select' },
      options: ['1', '2', '3', '4', '5', '6'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Default: Story = {
  args: {
    level: '2',
    children: 'Heading text',
  },
};

export const AllLevels: Story = {
  name: 'level 一覧',
  render: () => (
    <>
      <Heading level="1">Heading Level 1</Heading>
      <Heading level="2">Heading Level 2</Heading>
      <Heading level="3">Heading Level 3</Heading>
      <Heading level="4">Heading Level 4</Heading>
      <Heading level="5">Heading Level 5</Heading>
      <Heading level="6">Heading Level 6</Heading>
    </>
  ),
};
