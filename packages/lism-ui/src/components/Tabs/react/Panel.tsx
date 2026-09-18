'use client';
import { useContext } from 'react';
import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { TabsContext } from './context';

type TabPanelProps<T extends ElementType = 'div'> = LismComponentProps<T> & {
  tabId?: string;
  isActive?: boolean;
  index?: number;
};

// tabId / 選択状態: Context から取得できればそれを優先、なければ props / プレースホルダー（Tab と同じ規約）
export default function TabPanel<T extends ElementType = 'div'>({
  tabId: _tabId = '__LISM_TAB_ID__',
  isActive: _isActive = false,
  index = 0,
  className,
  ...props
}: TabPanelProps<T>) {
  const ctx = useContext(TabsContext);
  const tabId = ctx?.tabId || _tabId;
  const isActive = ctx ? ctx.activeIndex === index : _isActive;
  const controlId = `${tabId}-${index}`;

  return (
    <Lism
      id={controlId}
      role="tabpanel"
      aria-labelledby={`${controlId}-tab`}
      tabIndex={0}
      hidden={!isActive}
      className={atts(className, 'b--tabs_panel')}
      {...(props as object)}
    />
  );
}
