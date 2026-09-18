'use client';
import { useState, useId, useEffect, useRef, useCallback, Children, isValidElement } from 'react';
import type { ElementType, KeyboardEvent, ReactElement, ReactNode } from 'react';
import { Grid, type LayoutComponentProps, type LismComponentProps } from 'lism-css/react';
import type { GridLayoutProps } from 'lism-css/lib/types/LayoutProps';
import atts from 'lism-css/lib/helper/atts';
import buildModifierClass from '../../../helper/buildModifierClass';
import { resolveTabNavKey, toTabOrientation } from '../tabsKeyNav';
import { TabsContext } from './context';
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

// `{tabId}-{index}` 形式のパネルIDから index を取り出す。形式が違えば null
function parsePanelIndex(panelId: string | null | undefined, tabId: string): number | null {
  if (!panelId?.startsWith(`${tabId}-`)) return null;

  const index = Number(panelId.slice(tabId.length + 1));
  return Number.isInteger(index) && index >= 1 ? index : null;
}

// 手動構成で isActive 付きの Tab を探して index を返す（defaultIndex 未指定時の初期選択用）。
// Panel と入れ子の Tabs は別のタブ群を含みうるため辿らない
function findActiveTabIndex(node: ReactNode): number | undefined {
  if (Array.isArray(node)) {
    for (const child of node as ReactNode[]) {
      const found = findActiveTabIndex(child);
      if (undefined !== found) return found;
    }
    return undefined;
  }
  if (!isValidElement(node) || node.type === TabPanel || node.type === Tabs) return undefined;

  const { isActive, index, children } = node.props as TabProps;
  return node.type === Tab && isActive ? index : findActiveTabIndex(children);
}

export default function Tabs<T extends ElementType = 'div'>({
  tabId = '',
  defaultIndex,
  listProps = {},
  variant = 'default',
  className,
  children,
  ...props
}: TabsProps<T>) {
  // 各 Tabs.Item から Tab / Panel を抽出して index を割り当てる。Tab を持たない Item を index の割り当てに
  // 含めると、残ったタブの index がずれて activeIndex と噛み合わなくなるため除外する
  const btns: ReactElement[] = [];
  const panels: ReactElement[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child) || child.type !== TabItem) return;

    const nestedChildren = Children.toArray((child as ReactElement<{ children?: ReactNode }>).props.children).filter(isValidElement);
    const tab = nestedChildren.find((nested) => nested.type === Tab);
    if (!tab) return;

    const index = btns.length + 1; // 1 はじまり
    btns.push(<Tab {...(tab.props as TabProps)} index={index} key={index} />);

    const panel = nestedChildren.find((nested) => nested.type === TabPanel);
    if (panel) panels.push(<TabPanel {...(panel.props as LismComponentProps)} index={index} key={index} />);
  });

  // Tabs.Item が無ければ、List / Tab / Panel を直接配置する手動構成として扱う
  const itemCount = btns.length;
  const hasItems = itemCount > 0;

  // 初期選択: defaultIndex → 手動構成のみ isActive 付きの Tab → 1
  const [selectedIndex, setSelectedIndex] = useState(() => defaultIndex ?? (hasItems ? undefined : findActiveTabIndex(children)) ?? 1);
  const generatedId = useId();
  const theTabId = tabId || generatedId;

  // 範囲外のindexは1にフォールバック。手動構成はタブ数を描画時に知れないため対象外
  const activeIndex = !hasItems || (selectedIndex >= 1 && selectedIndex <= itemCount) ? selectedIndex : 1;

  // SSRと選択状態を保つため、ディープリンクはマウント時に一度だけ反映する。
  // 手動構成ではタブ数を知れないため、対象タブの実在はDOMで確かめる
  useEffect(() => {
    const targetPanelId = new URLSearchParams(window.location.search).get('lism-tab');
    const index = parsePanelIndex(targetPanelId, theTabId);
    if (null === index || !document.getElementById(`${targetPanelId}-tab`)) return;

    setSelectedIndex(index);
  }, []);

  // アンマウント時のハンドラから読むため、直前の選択indexを保持する
  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // 選択中のTabが取り除かれると、残るTabはすべて tabIndex=-1 ・Panelはすべて hidden になり、キーボードでタブ群へ戻れなくなる。
  // DOMから実際に消えた時だけ（StrictMode等の擬似アンマウントは要素が残る）、DOM順で先頭のTabへ選択を移す
  const handleTabUnmount = useCallback(
    (index: number, wasFocused: boolean) => {
      if (activeIndexRef.current !== index || document.getElementById(`${theTabId}-${index}-tab`)) return;

      for (const btn of Array.from(document.querySelectorAll<HTMLElement>('[role="tab"]'))) {
        const nextIndex = parsePanelIndex(btn.getAttribute('aria-controls'), theTabId);
        if (null === nextIndex) continue;

        setSelectedIndex(nextIndex);
        if (wasFocused) btn.focus();
        return;
      }
    },
    [theTabId]
  );

  // 矢印 / Home / End でのタブ移動。手動構成でも動くよう、同じ tablist 内のタブをDOM順にたどる（setTabs と同じ規約）
  const handleTabKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const tabList = e.currentTarget.closest('[role="tablist"]');
    if (!tabList) return;

    const tabBtns = Array.from(tabList.querySelectorAll<HTMLElement>('[role="tab"]'));
    const currentPos = tabBtns.indexOf(e.currentTarget) + 1; // 1 はじまり
    if (currentPos < 1) return;

    const orientation = toTabOrientation(tabList.getAttribute('aria-orientation'));
    const nextPos = resolveTabNavKey(e.key, currentPos, tabBtns.length, orientation);
    if (null === nextPos) return;

    const nextBtn = tabBtns[nextPos - 1];
    const nextIndex = parsePanelIndex(nextBtn?.getAttribute('aria-controls'), theTabId);
    if (null === nextIndex) return;

    e.preventDefault();
    setSelectedIndex(nextIndex);
    nextBtn.focus();
  };

  return (
    <TabsContext.Provider
      value={{ tabId: theTabId, activeIndex, selectTab: setSelectedIndex, onTabKeyDown: handleTabKeyDown, onTabUnmount: handleTabUnmount }}
    >
      <Grid className={atts(className, buildModifierClass('b--tabs', { variant }))} {...(props as object)}>
        {hasItems ? (
          <>
            <TabList {...listProps}>{btns}</TabList>
            {panels}
          </>
        ) : (
          children
        )}
      </Grid>
    </TabsContext.Provider>
  );
}
