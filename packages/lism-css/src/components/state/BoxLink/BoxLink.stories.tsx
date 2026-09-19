import type { Meta, StoryObj } from '@storybook/react-vite';
import { BoxLink } from './index';

const meta: Meta<typeof BoxLink> = {
  title: 'State/BoxLink',
  component: BoxLink,
  tags: ['autodocs'],
  argTypes: {
    children: { control: false },
    href: { control: 'text', description: 'リンク先URL' },
  },
};

export default meta;
type Story = StoryObj<typeof BoxLink>;

// lism-cssはstorybook本体に依存しないため、storybook/testのexpectを使わずに検証する。
function assertTagName(canvasElement: HTMLElement, expected: string) {
  const tagName = canvasElement.querySelector('.is--boxLink')?.tagName;
  if (tagName !== expected) {
    throw new Error(`BoxLinkのタグが${expected}ではない: ${String(tagName)}`);
  }
}

export const Default: Story = {
  args: {
    href: '#',
    p: '20',
    children: <p>BoxLink content</p>,
  },
  play: ({ canvasElement }) => {
    assertTagName(canvasElement, 'A');
  },
};

export const WithoutHref: Story = {
  name: 'href なし (div)',
  args: {
    p: '20',
    children: <p>BoxLink without href renders as div</p>,
  },
  play: ({ canvasElement }) => {
    assertTagName(canvasElement, 'DIV');
  },
};
