'use client';
import { useState, useId, Children, isValidElement } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import buildModifierClass from '../../../helper/buildModifierClass';
import Tab from './Tab';
import TabItem from './TabItem';
import TabList from './TabList';
import TabPanel from './TabPanel';

import '../_style.css';

type TabsProps = LismComponentProps<'div'> & {
  tabId?: string;
  defaultIndex?: number;
  listProps?: LismComponentProps;
  variant?: string;
};

export default function Tabs({ tabId = '', defaultIndex = 1, listProps = {}, variant, className, children, ...props }: TabsProps) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const generatedId = useId();
  const theTabId = tabId || generatedId;
  const btns: React.ReactElement[] = [];
  const panels: React.ReactElement[] = [];

  // Tabs.Item の処理
  Children.forEach(children, (child, index) => {
    const tabIndex = index + 1; // 1 はじまり

    if (isValidElement(child) && child.type === TabItem) {
      const childProps = child.props as { children?: React.ReactNode };
      Children.forEach(childProps.children, (nestedChild) => {
        if (isValidElement(nestedChild)) {
          if (nestedChild.type === Tab) {
            const tabProps = nestedChild.props as Record<string, unknown>;
            btns.push(
              <Tab
                {...(tabProps as LismComponentProps)}
                tabId={theTabId}
                index={tabIndex}
                key={tabIndex}
                isActive={tabIndex === activeIndex}
                onClick={() => setActiveIndex(tabIndex)}
              />
            );
          } else if (nestedChild.type === TabPanel) {
            const panelProps = nestedChild.props as Record<string, unknown>;
            panels.push(
              <TabPanel
                {...(panelProps as LismComponentProps)}
                tabId={theTabId}
                index={tabIndex}
                key={tabIndex}
                isActive={tabIndex === activeIndex}
              />
            );
          }
        }
      });
    }
  });

  return (
    <Lism className={atts(className, buildModifierClass('c--tabs', { variant }))} {...props}>
      {btns.length === 0 ? (
        // TabItemを使わず直接TabListなどを子要素に配置する場合
        children
      ) : (
        <>
          <TabList {...listProps}>{btns}</TabList>
          {panels}
        </>
      )}
    </Lism>
  );
}
