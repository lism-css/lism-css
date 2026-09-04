'use client';
import { createContext } from 'react';

export type TooltipContextType = { tooltipId: string } | null;

// Context: 純粋なReact環境で Tooltip.Root → Trigger / Popup へ tooltipId を共有
// Astro 環境では Context が使えないため null がフォールバック（プレースホルダー置換で配線する）
export const TooltipContext = createContext<TooltipContextType>(null);
