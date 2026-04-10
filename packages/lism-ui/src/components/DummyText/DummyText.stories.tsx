import type { Meta, StoryObj } from '@storybook/react-vite';
import DummyText from './react/DummyText';

const meta: Meta<typeof DummyText> = {
  title: 'UI/DummyText',
  component: DummyText,
  tags: ['autodocs'],
  argTypes: {
    lang: { control: 'select', options: ['en', 'ja', 'ar'] },
    length: { control: 'select', options: ['s', 'm', 'l'] },
    offset: { control: 'number' },
    pre: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof DummyText>;

export const Default: Story = {
  args: {
    lang: 'en',
    length: 'm',
  },
};

export const Japanese: Story = {
  name: '日本語',
  args: {
    lang: 'ja',
    length: 'm',
  },
};

export const Short: Story = {
  name: '短い（length: s）',
  args: {
    lang: 'en',
    length: 's',
  },
};

export const Long: Story = {
  name: '長い（length: l）',
  args: {
    lang: 'en',
    length: 'l',
  },
};
