import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import Accordion from './react';

const meta: Meta = {
  title: 'UI/Accordion',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Accordion.Root>
      <Accordion.Item>
        <Accordion.Heading>
          <Accordion.Button>アコーディオン 1</Accordion.Button>
        </Accordion.Heading>
        <Accordion.Panel>
          <p>アコーディオン 1 のコンテンツです。</p>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // 初期状態: 閉じている
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    // クリックで開く
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'true'));

    // 再クリックで閉じる
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
  },
};

export const Multiple: Story = {
  name: '複数アイテム',
  render: () => (
    <Accordion.Root>
      {[1, 2, 3].map((i) => (
        <Accordion.Item key={i}>
          <Accordion.Heading>
            <Accordion.Button>アコーディオン {i}</Accordion.Button>
          </Accordion.Heading>
          <Accordion.Panel>
            <p>アコーディオン {i} のコンテンツです。</p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    const [btn1, btn2] = buttons;

    // 1つ目を開く
    await userEvent.click(btn1);
    await waitFor(() => expect(btn1).toHaveAttribute('aria-expanded', 'true'));

    // 2つ目を開く → 1つ目が閉じる（allowMultiple なし）
    await userEvent.click(btn2);
    await waitFor(() => expect(btn2).toHaveAttribute('aria-expanded', 'true'));
    await waitFor(() => expect(btn1).toHaveAttribute('aria-expanded', 'false'));
  },
};

export const AllowMultiple: Story = {
  name: 'allowMultiple（複数同時展開可）',
  render: () => (
    <Accordion.Root allowMultiple>
      {[1, 2, 3].map((i) => (
        <Accordion.Item key={i}>
          <Accordion.Heading>
            <Accordion.Button>アコーディオン {i}</Accordion.Button>
          </Accordion.Heading>
          <Accordion.Panel>
            <p>アコーディオン {i} のコンテンツです。複数同時に開けます。</p>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    const [btn1, btn2] = buttons;

    // 1つ目を開く
    await userEvent.click(btn1);
    await waitFor(() => expect(btn1).toHaveAttribute('aria-expanded', 'true'));

    // 2つ目を開く → 1つ目はそのまま開いている
    await userEvent.click(btn2);
    await waitFor(() => expect(btn2).toHaveAttribute('aria-expanded', 'true'));
    await expect(btn1).toHaveAttribute('aria-expanded', 'true');
  },
};
