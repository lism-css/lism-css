import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { Tabs } from './react';

const meta: Meta = {
  title: 'UI/Tabs',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs.Root>
      <Tabs.Item>
        <Tabs.Tab>タブ 1</Tabs.Tab>
        <Tabs.Panel>タブ 1 のコンテンツです。</Tabs.Panel>
      </Tabs.Item>
      <Tabs.Item>
        <Tabs.Tab>タブ 2</Tabs.Tab>
        <Tabs.Panel>タブ 2 のコンテンツです。</Tabs.Panel>
      </Tabs.Item>
      <Tabs.Item>
        <Tabs.Tab>タブ 3</Tabs.Tab>
        <Tabs.Panel>タブ 3 のコンテンツです。</Tabs.Panel>
      </Tabs.Item>
    </Tabs.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    const [tab1, tab2, tab3] = tabs;

    // 初期状態: タブ 1 が選択されている
    await expect(tab1).toHaveAttribute('aria-selected', 'true');
    await expect(tab2).toHaveAttribute('aria-selected', 'false');
    await expect(tab3).toHaveAttribute('aria-selected', 'false');

    // タブ 2 をクリック
    await userEvent.click(tab2);
    await expect(tab1).toHaveAttribute('aria-selected', 'false');
    await expect(tab2).toHaveAttribute('aria-selected', 'true');

    // タブ 3 をクリック
    await userEvent.click(tab3);
    await expect(tab2).toHaveAttribute('aria-selected', 'false');
    await expect(tab3).toHaveAttribute('aria-selected', 'true');
  },
};

export const DefaultIndex2: Story = {
  name: 'defaultIndex: 2（2番目をデフォルト選択）',
  render: () => (
    <Tabs.Root defaultIndex={2}>
      <Tabs.Item>
        <Tabs.Tab>タブ 1</Tabs.Tab>
        <Tabs.Panel>タブ 1 のコンテンツです。</Tabs.Panel>
      </Tabs.Item>
      <Tabs.Item>
        <Tabs.Tab>タブ 2</Tabs.Tab>
        <Tabs.Panel>タブ 2 がデフォルトで選択されています。</Tabs.Panel>
      </Tabs.Item>
      <Tabs.Item>
        <Tabs.Tab>タブ 3</Tabs.Tab>
        <Tabs.Panel>タブ 3 のコンテンツです。</Tabs.Panel>
      </Tabs.Item>
    </Tabs.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');
    const [tab1, tab2] = tabs;

    // 初期状態: タブ 2 が選択されている
    await expect(tab1).toHaveAttribute('aria-selected', 'false');
    await expect(tab2).toHaveAttribute('aria-selected', 'true');
  },
};

export const Manual: Story = {
  name: '手動構成（Tabs.Item を使わず List / Tab / Panel を直接配置）',
  render: () => (
    <Tabs.Root defaultIndex={2}>
      <Tabs.List>
        <Tabs.Tab index={1}>タブ 1</Tabs.Tab>
        <Tabs.Tab index={2}>タブ 2</Tabs.Tab>
        <Tabs.Tab index={3}>タブ 3</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel index={1}>タブ 1 のコンテンツです。</Tabs.Panel>
      <Tabs.Panel index={2}>タブ 2 がデフォルトで選択されています。</Tabs.Panel>
      <Tabs.Panel index={3}>タブ 3 のコンテンツです。</Tabs.Panel>
    </Tabs.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [tab1, tab2, tab3] = canvas.getAllByRole('tab');

    // 初期状態: タブ 2 が選択されている
    await expect(tab2).toHaveAttribute('aria-selected', 'true');

    // クリックで切り替わる
    await userEvent.click(tab3);
    await expect(tab2).toHaveAttribute('aria-selected', 'false');
    await expect(tab3).toHaveAttribute('aria-selected', 'true');

    // 末尾から右キーで先頭へ戻り、フォーカスも移る
    await userEvent.keyboard('{ArrowRight}');
    await expect(tab1).toHaveAttribute('aria-selected', 'true');
    await expect(tab1).toHaveFocus();
  },
};
