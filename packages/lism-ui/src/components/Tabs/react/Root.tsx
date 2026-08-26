'use client';
import { useState, useId, useEffect, Children, isValidElement } from 'react';
import type { ElementType, KeyboardEvent, MouseEvent, ReactElement, ReactNode } from 'react';
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

  // 各 Tabs.Item から Tab / Panel を先に抽出する。Tab を持たない Item を総数や index の割り当てに
  // 含めると、残ったタブの index がずれて activeIndex と噛み合わなくなるため
  const tabItems: { tab: ReactElement; panel?: ReactElement }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== TabItem) return;

    const nestedChildren = Children.toArray((child as ReactElement<{ children?: ReactNode }>).props.children).filter(isValidElement);
    const tab = nestedChildren.find((nested) => nested.type === Tab);
    if (!tab) return;

    tabItems.push({ tab, panel: nestedChildren.find((nested) => nested.type === TabPanel) });
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

  // 抽出した Tab / Panel を状態付きで描画
  const btns: ReactElement[] = [];
  const panels: ReactElement[] = [];
  tabItems.forEach(({ tab, panel }, i) => {
    const tabIndex = i + 1; // 1 はじまり
    const isActive = tabIndex === activeIndex;

    // 利用者が Tabs.Tab へ渡したハンドラは上書きせず合成する（利用者側を先に呼び、preventDefault されたら内部処理を行わない）
    const { onClick, onKeyDown } = tab.props as {
      onClick?: (e: MouseEvent<HTMLElement>) => void;
      onKeyDown?: (e: KeyboardEvent<HTMLElement>) => void;
    };

    btns.push(
      <Tab
        {...(tab.props as TabProps)}
        tabId={theTabId}
        index={tabIndex}
        key={tabIndex}
        isActive={isActive}
        onClick={(e: MouseEvent<HTMLElement>) => {
          onClick?.(e);
          if (e.defaultPrevented) return;
          setSelectedIndex(tabIndex);
        }}
        onKeyDown={(e: KeyboardEvent<HTMLElement>) => {
          onKeyDown?.(e);
          if (e.defaultPrevented) return;
          handleTabKeyDown(e, tabIndex);
        }}
      />
    );
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
