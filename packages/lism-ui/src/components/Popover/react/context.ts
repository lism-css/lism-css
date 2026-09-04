'use client';
import { createContext } from 'react';

export type PopoverContextType = { popoverId: string } | null;

// Context: 純粋なReact環境で Popover.Root → Trigger / Popup / Close へ popoverId を共有
// Astro 環境では Context が使えないため null がフォールバック
export const PopoverContext = createContext<PopoverContextType>(null);
