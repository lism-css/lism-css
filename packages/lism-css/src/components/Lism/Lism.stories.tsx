import type { Meta, StoryObj } from '@storybook/react-vite';
import { Lism } from './index';

const meta = {
  title: 'Core/Lism',
  component: Lism,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Lism>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    p: '20',
    fw: 'bold',
    c: 'blue',
    bgc: 'base-2',
    bdrs: '20',
    children: 'Lism content',
  },
};

export const AsParagraph: Story = {
  name: 'as: Paragraph',
  args: {
    as: 'p',
    fz: 'l',
    children: 'Lorem ipsum texts...',
  },
};

export const WithLismClass: Story = {
  name: 'lismClass',
  args: {
    lismClass: 'c--myComponent',
    p: '10',
    children: 'Lorem ipsum texts...',
  },
};

export const WithVariant: Story = {
  name: 'variant',
  args: {
    lismClass: 'c--myComponent',
    variant: 'secondary',
    children: 'Lorem ipsum texts...',
  },
};

export const WithLayout: Story = {
  name: 'layout',
  args: {
    layout: 'flow',
    children: 'Lorem ipsum texts...',
  },
};

export const ResponsiveArray: Story = {
  name: 'Responsive (配列)',
  args: {
    p: ['20', '30', '40'],
    bgc: 'base-2',
    children: 'Responsive padding: 20 → 30 → 40',
  },
};

export const ResponsiveObject: Story = {
  name: 'Responsive (オブジェクト)',
  args: {
    p: { base: '20', sm: '30', md: '40' },
    bgc: 'base-2',
    children: 'Responsive padding: base=20, sm=30, md=40',
  },
};

export const WithCssProp: Story = {
  name: 'css prop',
  args: {
    css: { textShadow: '1px 1px 2px rgba(0,0,0,0.3)', '--my-var': '10px' },
    p: '20',
    children: 'css prop でインラインスタイルを直接指定',
  },
};
