import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
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
