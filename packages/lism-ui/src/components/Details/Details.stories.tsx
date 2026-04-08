import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import Details from './react';

const meta: Meta = {
  title: 'UI/Details',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Details.Root>
      <Details.Summary>
        <Details.Icon>▶</Details.Icon>
        <Details.Title>詳細を見る</Details.Title>
      </Details.Summary>
      <Details.Content>
        <p>詳細コンテンツです。クリックで開閉できます。</p>
      </Details.Content>
    </Details.Root>
  ),
  play: async ({ canvasElement }) => {
    const details = canvasElement.querySelector('details') as HTMLDetailsElement;
    const summary = canvasElement.querySelector('summary') as HTMLElement;

    // 初期状態: 閉じている
    await expect(details).not.toHaveAttribute('open');

    // クリックで開く
    await userEvent.click(summary);
    await expect(details).toHaveAttribute('open');

    // 再クリックで閉じる
    await userEvent.click(summary);
    await expect(details).not.toHaveAttribute('open');
  },
};

export const OpenByDefault: Story = {
  name: '初期展開状態',
  render: () => (
    <Details.Root open>
      <Details.Summary>
        <Details.Icon>▼</Details.Icon>
        <Details.Title>最初から開いている詳細</Details.Title>
      </Details.Summary>
      <Details.Content>
        <p>open 属性を付けると初期状態で展開されます。</p>
      </Details.Content>
    </Details.Root>
  ),
  play: async ({ canvasElement }) => {
    const details = canvasElement.querySelector('details') as HTMLDetailsElement;

    // 初期状態: 開いている
    await expect(details).toHaveAttribute('open');
  },
};
