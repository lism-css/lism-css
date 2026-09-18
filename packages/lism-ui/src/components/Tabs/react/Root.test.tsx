import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, StrictMode } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import Tabs from './Root';
import TabItem from './Item';
import TabList from './List';
import Tab, { type TabProps } from './Tab';
import TabPanel from './Panel';

// act() を testing-library なしで使うためのフラグ
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let reactRoot: Root;

// tabId 明示ありの2タブ構成をレンダリングする
const renderTabs = (defaultIndex?: number) => {
  act(() => {
    reactRoot.render(
      <Tabs tabId="sample-tabs" defaultIndex={defaultIndex}>
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

  it('範囲外のインデックスは無視され、defaultIndex の選択が保たれる', () => {
    history.replaceState({}, '', '/?lism-tab=sample-tabs-9');
    renderTabs(2);

    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
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

describe('Tabs (React) Tab のタグ固定', () => {
  it('as は型で受け付けない', () => {
    // @ts-expect-error Tab は button 固定
    void (<Tab as="a">Tab</Tab>);
  });

  it('型を通らず as が渡されても button で出力される', () => {
    const spreadProps = { as: 'a', href: '#' } as object;

    act(() => {
      reactRoot.render(
        <Tabs tabId="sample-tabs">
          <TabItem>
            <Tab {...spreadProps}>Tab 1</Tab>
            <TabPanel>Content 1</TabPanel>
          </TabItem>
        </Tabs>
      );
    });

    expect(container.querySelector('[role="tab"]')?.tagName).toBe('BUTTON');

    // 単体利用（手動構成）でも同様
    act(() => {
      reactRoot.render(<Tab {...spreadProps}>Tab</Tab>);
    });

    expect(container.querySelector('[role="tab"]')?.tagName).toBe('BUTTON');
  });
});

// ---- 手動構成（Tabs.Item を使わず List / Tab / Panel を直接配置） ----

type ManualOptions = {
  tabId?: string; // '' で未指定扱い（自動生成ID）
  defaultIndex?: number;
  indexes?: number[]; // DOM順に並べる index
  listProps?: { 'aria-orientation'?: 'vertical' };
  tabs?: Record<number, TabProps>;
  panels?: Record<number, { tabId?: string }>;
  panelContent?: Record<number, ReactElement>;
};

const manualTabs = ({ tabId = 'sample-tabs', defaultIndex, indexes = [1, 2], listProps, tabs, panels, panelContent }: ManualOptions = {}) => (
  <Tabs tabId={tabId} defaultIndex={defaultIndex}>
    <TabList {...listProps}>
      {indexes.map((i) => (
        <Tab key={i} index={i} {...tabs?.[i]}>
          Tab {i}
        </Tab>
      ))}
    </TabList>
    {indexes.map((i) => (
      <TabPanel key={i} index={i} {...panels?.[i]}>
        {panelContent?.[i] ?? `Content ${i}`}
      </TabPanel>
    ))}
  </Tabs>
);

const render = (element: ReactElement) => act(() => reactRoot.render(element));
const renderManual = (options?: ManualOptions) => render(manualTabs(options));

// アンマウントして新しい root を作り直す（afterEach は新しい root を片付ける）
const remount = () => {
  act(() => reactRoot.unmount());
  reactRoot = createRoot(container);
};

const getTab = (index: number, tabId = 'sample-tabs') => document.getElementById(`${tabId}-${index}-tab`)!;
const click = (el: HTMLElement) => act(() => void el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })));
const pressKey = (el: HTMLElement, key: string) =>
  act(() => void el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })));

// 選択中のタブと表示中のパネルをidで返す（DOM順と index がずれるケース・入れ子のケース用）
const getActiveIds = () => ({
  tabs: [...container.querySelectorAll('[role="tab"][aria-selected="true"]')].map((el) => el.id),
  panels: [...container.querySelectorAll('[role="tabpanel"]:not([hidden])')].map((el) => el.id),
});

// Tab と Panel が DOM 順で対になっている前提で、相互参照が噛み合っていることを確認する
const expectLinkedIds = () => {
  const btns = [...container.querySelectorAll('[role="tab"]')];
  const panelEls = [...container.querySelectorAll('[role="tabpanel"]')];
  expect(btns).toHaveLength(panelEls.length);
  btns.forEach((btn, i) => {
    expect(btn.id).not.toBe('');
    expect(btn.getAttribute('aria-controls')).toBe(panelEls[i].id);
    expect(panelEls[i].getAttribute('aria-labelledby')).toBe(btn.id);
  });
};

describe('Tabs (React) 手動構成: 初期状態とARIA', () => {
  it('index だけ指定すると1番目が選択され、id と ARIA 属性が {tabId}-{index} 規則で紐付く', () => {
    renderManual();

    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
    expect([...container.querySelectorAll('[role="tab"]')].map((b) => [b.id, b.getAttribute('aria-controls'), b.getAttribute('tabindex')])).toEqual([
      ['sample-tabs-1-tab', 'sample-tabs-1', '0'],
      ['sample-tabs-2-tab', 'sample-tabs-2', '-1'],
    ]);
    expectLinkedIds();
  });

  it('tabId 未指定なら自動生成IDで Tab と Panel が紐付く', () => {
    renderManual({ tabId: '' });

    expectLinkedIds();
    expect(container.querySelector('[role="tab"]')!.id).not.toContain('__LISM_TAB_ID__');
    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
  });

  it('Tab / Panel に個別の tabId を渡しても Root の tabId が使われる', () => {
    renderManual({ tabs: { 1: { tabId: 'other-tabs' } }, panels: { 2: { tabId: 'other-tabs' } } });

    expect([...container.querySelectorAll('[role="tab"], [role="tabpanel"]')].map((el) => el.id)).toEqual([
      'sample-tabs-1-tab',
      'sample-tabs-2-tab',
      'sample-tabs-1',
      'sample-tabs-2',
    ]);
  });

  it('defaultIndex で初期選択を指定できる', () => {
    renderManual({ defaultIndex: 2 });

    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });

  it('defaultIndex 未指定なら isActive 付きの Tab が初期選択され、defaultIndex があればそちらが優先される', () => {
    renderManual({ tabs: { 2: { isActive: true } } });
    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });

    remount();
    renderManual({ defaultIndex: 1, tabs: { 2: { isActive: true } } });
    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
  });

  it('Panel 内の入れ子 Tabs の isActive と選択状態は、外側と互いに影響しない', () => {
    renderManual({ panelContent: { 1: manualTabs({ tabId: 'inner-tabs', tabs: { 2: { isActive: true } } }) } });

    expect(getActiveIds()).toEqual({ tabs: ['sample-tabs-1-tab', 'inner-tabs-2-tab'], panels: ['sample-tabs-1', 'inner-tabs-2'] });

    click(getTab(2));

    expect(getActiveIds()).toEqual({ tabs: ['sample-tabs-2-tab', 'inner-tabs-2-tab'], panels: ['inner-tabs-2', 'sample-tabs-2'] });
  });
});

describe('Tabs (React) 手動構成: 操作', () => {
  it('クリックで選択が切り替わる', () => {
    renderManual();

    click(getTab(2));

    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
    expect([getTab(1).getAttribute('tabindex'), getTab(2).getAttribute('tabindex')]).toEqual(['-1', '0']);
  });

  it('矢印 / Home / End で選択とフォーカスが移り、端では循環する', () => {
    renderManual({ indexes: [1, 2, 3] });

    // [押すタブ, キー, 移動先]
    const steps: [number, string, number][] = [
      [1, 'ArrowRight', 2],
      [2, 'End', 3],
      [3, 'ArrowRight', 1],
      [1, 'ArrowLeft', 3],
      [3, 'Home', 1],
    ];
    for (const [from, key, to] of steps) {
      pressKey(getTab(from), key);

      expect(getActiveIds()).toEqual({ tabs: [`sample-tabs-${to}-tab`], panels: [`sample-tabs-${to}`] });
      expect(document.activeElement).toBe(getTab(to));
    }
  });

  it('List が aria-orientation="vertical" なら上下キーで移動し、左右キーでは動かない', () => {
    renderManual({ listProps: { 'aria-orientation': 'vertical' } });

    pressKey(getTab(1), 'ArrowRight');
    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });

    pressKey(getTab(1), 'ArrowDown');
    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
    expect(document.activeElement).toBe(getTab(2));
  });

  it('Tab を li やラッパーコンポーネントで包み、List と Panel の間に別要素を挟んでも操作できる', () => {
    const MyTab = (props: TabProps) => <Tab {...props} />;
    render(
      <Tabs tabId="sample-tabs">
        <TabList as="ul">
          <li>
            <MyTab index={1}>Tab 1</MyTab>
          </li>
          <li>
            <MyTab index={2}>Tab 2</MyTab>
          </li>
        </TabList>
        <p>間の要素</p>
        <div>
          <TabPanel index={1}>Content 1</TabPanel>
          <TabPanel index={2}>Content 2</TabPanel>
        </div>
      </Tabs>
    );
    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });

    click(getTab(2));
    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });

    pressKey(getTab(2), 'ArrowLeft');
    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });
    expect(document.activeElement).toBe(getTab(1));
  });

  it('index の並びがDOM順と違っても、キー移動はDOM順に進み、移動先 Tab の index の Panel が選択される', () => {
    renderManual({ indexes: [3, 1, 2] });
    expect(getActiveIds()).toEqual({ tabs: ['sample-tabs-1-tab'], panels: ['sample-tabs-1'] });

    pressKey(getTab(1), 'ArrowRight');
    expect(getActiveIds()).toEqual({ tabs: ['sample-tabs-2-tab'], panels: ['sample-tabs-2'] });

    // DOM末尾（index 2）からは先頭（index 3）へ循環する
    pressKey(getTab(2), 'ArrowRight');
    expect(getActiveIds()).toEqual({ tabs: ['sample-tabs-3-tab'], panels: ['sample-tabs-3'] });
    expect(document.activeElement).toBe(getTab(3));
  });

  it('利用者の onClick が先に呼ばれ、preventDefault されなければ選択される', () => {
    let clicked = 0;
    renderManual({
      tabs: {
        2: { onClick: () => clicked++ },
        3: { onClick: (e) => e.preventDefault() },
      },
      indexes: [1, 2, 3],
    });

    click(getTab(2));
    expect(clicked).toBe(1);
    expect(getActiveIds().tabs).toEqual(['sample-tabs-2-tab']);

    click(getTab(3));
    expect(getActiveIds().tabs).toEqual(['sample-tabs-2-tab']);
  });

  it('利用者の onKeyDown が先に呼ばれ、preventDefault されなければタブ移動する', () => {
    const pressedKeys: string[] = [];
    renderManual({
      tabs: {
        1: { onKeyDown: (e) => pressedKeys.push(e.key) },
        2: { onKeyDown: (e) => e.preventDefault() },
      },
    });

    pressKey(getTab(1), 'ArrowRight');
    expect(pressedKeys).toEqual(['ArrowRight']);
    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });

    pressKey(getTab(2), 'ArrowRight');
    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });
});

describe('Tabs (React) 手動構成: ディープリンク', () => {
  it('?lism-tab={tabId}-2 で2番目のタブが選択される', () => {
    history.replaceState({}, '', '/?lism-tab=sample-tabs-2');
    renderManual();

    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });

  it('存在しない番号は無視され、defaultIndex の選択が保たれる', () => {
    history.replaceState({}, '', '/?lism-tab=sample-tabs-9');
    renderManual({ defaultIndex: 2 });

    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });
});

describe('Tabs (React) 手動構成: ライフサイクル', () => {
  it('StrictMode でも1回のクリックで onClick は1回だけ呼ばれ、選択が切り替わる', () => {
    let clicked = 0;
    render(<StrictMode>{manualTabs({ tabs: { 2: { onClick: () => clicked++ } } })}</StrictMode>);

    click(getTab(2));

    expect(clicked).toBe(1);
    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });

  it('再描画で Tab / Panel を足しても選択は維持され、追加したタブも選択できる', () => {
    renderManual();
    click(getTab(2));

    renderManual({ indexes: [1, 2, 3] });
    expect(getState()).toEqual({ selected: ['false', 'true', 'false'], hidden: [true, false, true] });

    click(getTab(3));
    expect(getState()).toEqual({ selected: ['false', 'false', 'true'], hidden: [true, true, false] });
  });

  it('再マウントすると選択状態は defaultIndex へ戻る', () => {
    renderManual({ defaultIndex: 2 });
    click(getTab(1));
    expect(getState()).toEqual({ selected: ['true', 'false'], hidden: [false, true] });

    remount();
    renderManual({ defaultIndex: 2 });
    expect(getState()).toEqual({ selected: ['false', 'true'], hidden: [true, false] });
  });

  // 手動構成は範囲外フォールバックをしない
  it('選択中の Tab / Panel が取り除かれるとどのタブも非選択になり、残りのタブをクリックすれば選択できる', () => {
    renderManual({ defaultIndex: 2 });

    renderManual({ defaultIndex: 2, indexes: [1] });
    expect(getState()).toEqual({ selected: ['false'], hidden: [true] });

    click(getTab(1));
    expect(getState()).toEqual({ selected: ['true'], hidden: [false] });
  });
});
