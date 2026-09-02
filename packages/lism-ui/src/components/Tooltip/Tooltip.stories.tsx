import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Cluster } from 'lism-css/react';
import { Tooltip } from './react';
import type { TooltipSide } from './react';

const meta: Meta = {
  title: 'UI/Tooltip',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const SIDES: TooltipSide[] = ['top', 'bottom', 'left', 'right', 'inline-start', 'inline-end'];

export const Default: Story = {
  render: () => (
    <Tooltip.Root>
      <Tooltip.Trigger>保存</Tooltip.Trigger>
      <Tooltip.Popup>ショートカット: ⌘S</Tooltip.Popup>
    </Tooltip.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // aria-describedby と Popup の id が配線されている
    const trigger = canvas.getByRole('button', { name: '保存' });
    const popup = canvas.getByRole('tooltip', { hidden: true });
    await expect(trigger).toHaveAttribute('aria-describedby', popup.id);

    // Esc でルートに data-dismissed が付く（表示/非表示はCSSの担当なので検証しない）
    const root = canvasElement.querySelector('.b--tooltip')!;
    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(root).toHaveAttribute('data-dismissed'));
  },
};

export const Sides: Story = {
  name: '方向（side）',
  render: () => (
    <Cluster g="40" py="60">
      {SIDES.map((side) => (
        <Tooltip.Root key={side}>
          <Tooltip.Trigger>{side}</Tooltip.Trigger>
          <Tooltip.Popup side={side}>side=&quot;{side}&quot;</Tooltip.Popup>
        </Tooltip.Root>
      ))}
    </Cluster>
  ),
};
