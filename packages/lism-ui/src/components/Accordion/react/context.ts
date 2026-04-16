'use client';
import { createContext } from 'react';

export type AccordionContextType = { accID: string } | null;

// Context: 純粋なReact環境で AccordionItem → Button / Panel へ accID を共有
// Astro 環境では Context が使えないため null がフォールバック
export const AccordionContext = createContext<AccordionContextType>(null);
