import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Cluster } from 'lism-css/react';
import { Popover } from './react';
import type { PopoverAlign, PopoverSide } from './react';

const meta: Meta = {
  title: 'UI/Popover',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Popover.Root>
      <Popover.Trigger>開く</Popover.Trigger>
      <Popover.Popup>
        <p>ポップオーバーのコンテンツです。</p>
        <Popover.Close />
      </Popover.Popup>
    </Popover.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole('button', { name: '開く' });
    const popup = canvasElement.querySelector('.b--popover_popup')!;

    // 初期状態: 閉じている
    await expect(popup.matches(':popover-open')).toBe(false);

    // トリガーをクリックして開く
    await userEvent.click(trigger);
    await waitFor(() => expect(popup.matches(':popover-open')).toBe(true));

    // 閉じるボタンをクリックして閉じる
    const closeBtn = within(popup as HTMLElement).getByRole('button', { name: 'Close' });
    await userEvent.click(closeBtn);
    await waitFor(() => expect(popup.matches(':popover-open')).toBe(false));
  },
};

const positions: { side: PopoverSide; align: PopoverAlign }[] = [
  { side: 'bottom', align: 'start' },
  { side: 'bottom', align: 'center' },
  { side: 'bottom', align: 'end' },
  { side: 'top', align: 'center' },
  { side: 'right', align: 'start' },
  { side: 'left', align: 'end' },
];

export const Positions: Story = {
  name: '表示位置（side / align）',
  render: () => (
    <Cluster g="30">
      {positions.map(({ side, align }) => (
        <Popover.Root key={`${side}-${align}`}>
          <Popover.Trigger>{`${side} / ${align}`}</Popover.Trigger>
          <Popover.Popup side={side} align={align}>
            <p>{`side="${side}" align="${align}"`}</p>
          </Popover.Popup>
        </Popover.Root>
      ))}
    </Cluster>
  ),
};

export const Manual: Story = {
  name: 'type="manual"',
  render: () => (
    <Popover.Root>
      <Popover.Trigger>開く</Popover.Trigger>
      <Popover.Popup type="manual">
        {/* manual は light dismiss / Esc で閉じないため、閉じるボタンが必須 */}
        <p>外側クリックや Esc では閉じません。</p>
        <Popover.Close />
      </Popover.Popup>
    </Popover.Root>
  ),
};
