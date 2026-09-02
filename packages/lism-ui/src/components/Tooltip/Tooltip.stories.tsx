import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Cluster } from 'lism-css/react';
import { Tooltip } from './react';
import type { TooltipAlign, TooltipSide } from './react';

const meta: Meta = {
  title: 'UI/Tooltip',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

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

const positions: { side: TooltipSide; align: TooltipAlign }[] = [
  { side: 'top', align: 'start' },
  { side: 'top', align: 'center' },
  { side: 'top', align: 'end' },
  { side: 'bottom', align: 'center' },
  { side: 'left', align: 'end' },
  { side: 'right', align: 'start' },
  { side: 'start', align: 'center' },
  { side: 'end', align: 'center' },
];

export const Positions: Story = {
  name: '表示位置（side / align）',
  render: () => (
    <Cluster g="40" py="60">
      {positions.map(({ side, align }) => (
        <Tooltip.Root key={`${side}-${align}`}>
          <Tooltip.Trigger>{`${side} / ${align}`}</Tooltip.Trigger>
          <Tooltip.Popup side={side} align={align}>
            {`side="${side}" align="${align}"`}
          </Tooltip.Popup>
        </Tooltip.Root>
      ))}
    </Cluster>
  ),
};
