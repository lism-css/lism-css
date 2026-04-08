import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import Modal from './react';

const meta: Meta = {
  title: 'UI/Modal',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <>
      <Modal.OpenBtn modalId="story-modal-1">モーダルを開く</Modal.OpenBtn>
      <Modal.Root id="story-modal-1">
        <Modal.Inner>
          <Modal.Body>
            <p>モーダルのコンテンツです。</p>
          </Modal.Body>
          <Modal.CloseBtn modalId="story-modal-1">閉じる</Modal.CloseBtn>
        </Modal.Inner>
      </Modal.Root>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dialog = canvas.getByRole('dialog', { hidden: true });
    const openBtn = canvas.getByRole('button', { name: 'モーダルを開く' });

    // 初期状態: モーダルは閉じている
    await expect(dialog).not.toHaveAttribute('open');

    // 開くボタンをクリック
    await userEvent.click(openBtn);

    // モーダルが開いている
    await waitFor(() => expect(dialog).toHaveAttribute('open'));

    // 閉じるボタンをクリック
    const closeBtn = within(dialog).getByRole('button', { name: '閉じる' });
    await userEvent.click(closeBtn);

    // モーダルが閉じている（アニメーション完了待ち）
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'), { timeout: 2000 });
  },
};

export const WithTitle: Story = {
  name: 'タイトル付き',
  render: () => (
    <>
      <Modal.OpenBtn modalId="story-modal-2">モーダルを開く</Modal.OpenBtn>
      <Modal.Root id="story-modal-2">
        <Modal.Inner>
          <Modal.Body>
            <h2>モーダルタイトル</h2>
            <p>モーダルのコンテンツです。</p>
          </Modal.Body>
          <Modal.CloseBtn modalId="story-modal-2">閉じる</Modal.CloseBtn>
        </Modal.Inner>
      </Modal.Root>
    </>
  ),
};
