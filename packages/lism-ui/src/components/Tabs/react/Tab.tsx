'use client';
import { useContext, useEffect, useRef } from 'react';
import type { FocusEvent, KeyboardEvent, MouseEvent } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import { TabsContext } from './context';

// Omit<…, 'as'> は型が複雑になりすぎて TS2590 になるため、never との交差で as を禁止する
export type TabProps = LismComponentProps<'button'> & {
  as?: never;
  tabId?: string;
  index?: number;
  isActive?: boolean;
};

/**
 * タブボタン
 * tabId / 選択状態: Context から取得できればそれを優先、なければ props / プレースホルダー（Accordion の __LISM_ACC_ID__ と同様）
 * index: Tabs.Item 構成では Root が割り当てる。手動構成では利用者が指定する
 */
export default function Tab({
  tabId: _tabId = '__LISM_TAB_ID__',
  index = 0,
  isActive: _isActive = false,
  className,
  onClick,
  onKeyDown,
  onFocus,
  onBlur,
  ...props
}: TabProps) {
  const ctx = useContext(TabsContext);
  const tabId = ctx?.tabId || _tabId;
  const isActive = ctx ? ctx.activeIndex === index : _isActive;
  const controlId = `${tabId}-${index}`;

  // 自分にフォーカスがあるかを保持し、アンマウント時に Root へ渡す（要素が削除されても blur は起きないため、ここでしか判定できない）
  const hasFocusRef = useRef(false);
  const onTabUnmount = ctx?.onTabUnmount;
  useEffect(() => () => onTabUnmount?.(index, hasFocusRef.current), [onTabUnmount, index]);

  // 利用者のハンドラは上書きせず合成する（利用者側を先に呼び、preventDefault されたら内部処理を行わない）
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (!ctx || e.defaultPrevented) return;
    ctx.selectTab(index);
  };
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(e);
    if (!ctx || e.defaultPrevented) return;
    ctx.onTabKeyDown(e);
  };
  const handleFocus = (e: FocusEvent<HTMLButtonElement>) => {
    onFocus?.(e);
    hasFocusRef.current = true;
  };
  const handleBlur = (e: FocusEvent<HTMLButtonElement>) => {
    onBlur?.(e);
    hasFocusRef.current = false;
  };

  // as はスプレッドより後ろに置く（型を通らず as が渡されても button 固定にするため）
  return (
    <Lism
      type="button"
      set="plain"
      className={atts(className, 'b--tabs_tab')}
      id={`${controlId}-tab`}
      role="tab"
      aria-controls={controlId}
      aria-selected={isActive ? 'true' : 'false'}
      tabIndex={isActive ? 0 : -1}
      {...props}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      as="button"
    />
  );
}
