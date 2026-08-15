import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Tabs from './Root';
import TabItem from './Item';
import Tab from './Tab';
import TabPanel from './Panel';

// act() を testing-library なしで使うためのフラグ
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let reactRoot: Root;

// tabId 明示ありの2タブ構成をレンダリングする
const renderTabs = () => {
  act(() => {
    reactRoot.render(
      <Tabs tabId="sample-tabs">
        <TabItem>
          <Tab>Tab 1</Tab>
          <TabPanel>Content 1</TabPanel>
        </TabItem>
        <TabItem>
          <Tab>Tab 2</Tab>
          <TabPanel>Content 2</TabPanel>
        </TabItem>
      </Tabs>
    );
  });
};

const getState = () => {
  const btns = [...container.querySelectorAll<HTMLElement>('[role="tab"]')];
  const panels = [...container.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
  return {
    selected: btns.map((b) => b.getAttribute('aria-selected')),
    hidden: panels.map((p) => p.hidden),
  };
};

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  reactRoot = createRoot(container);
});

afterEach(() => {
  act(() => reactRoot.unmount());
  container.remove();
  history.replaceState({}, '', '/');
});

describe('Tabs (React) ディープリンク', () => {
  it('?lism-tab={tabId}-2 で2番目のタブが初期選択される', () => {
    history.replaceState({}, '', '/?lism-tab=sample-tabs-2');
    renderTabs();

    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });

  it('パラメータが無ければ1番目のタブが選択される', () => {
    renderTabs();

    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
  });

  it('範囲外のインデックスは無視される', () => {
    history.replaceState({}, '', '/?lism-tab=sample-tabs-9');
    renderTabs();

    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
  });

  it('tabId が一致しないパラメータは無視される', () => {
    history.replaceState({}, '', '/?lism-tab=other-tabs-2');
    renderTabs();

    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
  });
});

describe('Tabs (React) 利用者ハンドラとの合成', () => {
  // 利用者の onClick / onKeyDown を1番目の Tab に渡してレンダリングする
  const renderTabsWithHandlers = (
    handlers: { onClick?: (e: ReactMouseEvent<HTMLElement>) => void; onKeyDown?: (e: ReactKeyboardEvent<HTMLElement>) => void },
    defaultIndex = 1
  ) => {
    act(() => {
      reactRoot.render(
        <Tabs tabId="sample-tabs" defaultIndex={defaultIndex}>
          <TabItem>
            <Tab {...handlers}>Tab 1</Tab>
            <TabPanel>Content 1</TabPanel>
          </TabItem>
          <TabItem>
            <Tab>Tab 2</Tab>
            <TabPanel>Content 2</TabPanel>
          </TabItem>
        </Tabs>
      );
    });
  };

  const getFirstTab = () => container.querySelector<HTMLElement>('[role="tab"]')!;

  it('利用者の onKeyDown が呼ばれた上で、内部のタブ移動も行われる', () => {
    const pressedKeys: string[] = [];
    renderTabsWithHandlers({ onKeyDown: (e) => pressedKeys.push(e.key) });

    act(() => {
      getFirstTab().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    });

    expect(pressedKeys).toEqual(['ArrowRight']);
    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });

  it('利用者の onKeyDown で preventDefault すると内部のタブ移動は行われない', () => {
    renderTabsWithHandlers({ onKeyDown: (e) => e.preventDefault() });

    act(() => {
      getFirstTab().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    });

    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
  });

  it('利用者の onClick が呼ばれた上で、内部のタブ選択も行われる', () => {
    let clicked = 0;
    // 2番目を初期選択にしておき、1番目のタブをクリックで選択できることを確認する
    renderTabsWithHandlers({ onClick: () => clicked++ }, 2);

    act(() => {
      getFirstTab().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(clicked).toBe(1);
    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
  });

  it('利用者の onClick で preventDefault すると内部のタブ選択は行われない', () => {
    renderTabsWithHandlers({ onClick: (e) => e.preventDefault() }, 2);

    act(() => {
      getFirstTab().dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });

    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });
});

describe('Tabs (React) Tab を持たない Item の扱い', () => {
  it('Tab を持たない Tabs.Item は index の割り当てから除外される', () => {
    act(() => {
      reactRoot.render(
        <Tabs tabId="sample-tabs">
          <TabItem>
            <div>Tabなし</div>
          </TabItem>
          <TabItem>
            <Tab>Tab 1</Tab>
            <TabPanel>Content 1</TabPanel>
          </TabItem>
          <TabItem>
            <Tab>Tab 2</Tab>
            <TabPanel>Content 2</TabPanel>
          </TabItem>
        </Tabs>
      );
    });

    // 残った2タブが index 1〜2 となり、1番目が初期選択される
    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
  });
});
