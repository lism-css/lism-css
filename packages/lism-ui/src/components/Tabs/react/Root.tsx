'use client';
import { useState, useId, useEffect, Children, isValidElement } from 'react';
import type { ElementType, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { Grid, type LayoutComponentProps, type LismComponentProps } from 'lism-css/react';
import type { GridLayoutProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';
import buildModifierClass from '../../../helper/buildModifierClass';
import { resolveTabNavKey, toTabOrientation } from '../tabsKeyNav';
import Tab, { type TabProps } from './Tab';
import TabItem from './Item';
import TabList from './List';
import TabPanel from './Panel';

import '../_style.css';

type TabsProps<T extends ElementType = 'div'> = LayoutComponentProps<T, GridLayoutProps> & {
  tabId?: string;
  defaultIndex?: number;
  listProps?: LismComponentProps;
  variant?: string;
};

export default function Tabs<T extends ElementType = 'div'>({
  tabId = '',
  defaultIndex = 1,
  listProps = {},
  variant = 'default',
  className,
  children,
  ...props
}: TabsProps<T>) {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const generatedId = useId();
  const theTabId = tabId || generatedId;

  // Tabs.Item だけを集める（総数が決まらないとindexをクランプできない）
  const tabItems: ReactElement<{ children?: ReactNode }>[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === TabItem) {
      tabItems.push(child as ReactElement<{ children?: ReactNode }>);
    }
  });

  const itemCount = tabItems.length;

  // 範囲外のindexは1にフォールバック
  const activeIndex = selectedIndex >= 1 && selectedIndex <= itemCount ? selectedIndex : 1;

  // ディープリンク（?lism-tab={パネルのID}）: SSR / ハイドレーションを崩さないようマウント後に反映。
  // タブ数の変化でユーザーの選択を上書きしないよう、マウント時の一度だけ実行する。
  // 範囲外の値は activeIndex 側のクランプで 1 に落ちるため、ここでは上限を見ない。
  useEffect(() => {
    const targetPanelId = new URLSearchParams(window.location.search).get('lism-tab');
    if (!targetPanelId) return;
    if (!targetPanelId.startsWith(`${theTabId}-`)) return;

    const index = Number(targetPanelId.slice(theTabId.length + 1));
    if (!Number.isInteger(index) || index < 1) return;

    setSelectedIndex(index);
  }, []);

  // 矢印 / Home / End でのタブ移動（フォーカス移動と選択を連動させる自動アクティベーション）
  const handleTabKeyDown = (e: KeyboardEvent<HTMLElement>, index: number) => {
    const tabList = e.currentTarget.closest('[role="tablist"]');
    const orientation = toTabOrientation(tabList?.getAttribute('aria-orientation'));

    const nextIndex = resolveTabNavKey(e.key, index, itemCount, orientation);
    if (null === nextIndex) return;

    e.preventDefault();
    setSelectedIndex(nextIndex);

    const nextBtn = tabList?.querySelectorAll<HTMLElement>('[role="tab"]')[nextIndex - 1];
    nextBtn?.focus();
  };

  // 各 Tabs.Item から Tab / Panel を取り出して状態付きで描画
  const btns: ReactElement[] = [];
  const panels: ReactElement[] = [];
  tabItems.forEach((item, i) => {
    const tabIndex = i + 1; // 1 はじまり
    const isActive = tabIndex === activeIndex;

    const nestedChildren = Children.toArray(item.props.children).filter(isValidElement);
    const tab = nestedChildren.find((nested) => nested.type === Tab);
    const panel = nestedChildren.find((nested) => nested.type === TabPanel);

    if (tab) {
      btns.push(
        <Tab
          {...(tab.props as TabProps)}
          tabId={theTabId}
          index={tabIndex}
          key={tabIndex}
          isActive={isActive}
          onClick={() => setSelectedIndex(tabIndex)}
          onKeyDown={(e: KeyboardEvent<HTMLElement>) => handleTabKeyDown(e, tabIndex)}
        />
      );
    }
    if (panel) {
      panels.push(<TabPanel {...(panel.props as LismComponentProps)} tabId={theTabId} index={tabIndex} key={tabIndex} isActive={isActive} />);
    }
  });

  return (
    <Grid className={atts(className, buildModifierClass('b--tabs', { variant }))} {...(props as object)}>
      {btns.length === 0 ? (
        // TabItemを使わず直接TabListなどを子要素に配置する場合
        children
      ) : (
        <>
          <TabList {...listProps}>{btns}</TabList>
          {panels}
        </>
      )}
    </Grid>
  );
}
