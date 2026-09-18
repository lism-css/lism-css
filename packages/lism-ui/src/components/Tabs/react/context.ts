'use client';
import { createContext } from 'react';
import type { KeyboardEvent } from 'react';

export type TabsContextType = {
  tabId: string;
  activeIndex: number;
  selectTab: (index: number) => void;
  onTabKeyDown: (e: KeyboardEvent<HTMLElement>) => void;
} | null;

// Context: Tabs.Root → Tab / Panel へ tabId と選択状態を共有（Tabs.Item を使わない手動構成でも届く）
// Root の外で単体利用された場合は null がフォールバック
export const TabsContext = createContext<TabsContextType>(null);
