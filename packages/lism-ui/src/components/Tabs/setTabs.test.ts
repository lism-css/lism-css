import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import setTabs from './setTabs';

function createTabsDOM(): { tabs: HTMLElement; tab1: HTMLElement; tab2: HTMLElement; panel1: HTMLElement; panel2: HTMLElement } {
  const tabs = document.createElement('div');
  tabs.className = 'c--tabs';

  const list = document.createElement('div');
  list.className = 'c--tabs_list';
  tabs.appendChild(list);

  const item1 = document.createElement('div');
  item1.className = 'c--tabs_item';
  const tab1 = document.createElement('button');
  tab1.setAttribute('role', 'tab');
  tab1.setAttribute('aria-selected', 'true');
  tab1.setAttribute('aria-controls', 'panel1');
  item1.appendChild(tab1);
  list.appendChild(item1);

  const item2 = document.createElement('div');
  item2.className = 'c--tabs_item';
  const tab2 = document.createElement('button');
  tab2.setAttribute('role', 'tab');
  tab2.setAttribute('aria-selected', 'false');
  tab2.setAttribute('aria-controls', 'panel2');
  item2.appendChild(tab2);
  list.appendChild(item2);

  const panel1 = document.createElement('div');
  panel1.id = 'panel1';
  panel1.setAttribute('aria-hidden', 'false');

  const panel2 = document.createElement('div');
  panel2.id = 'panel2';
  panel2.setAttribute('aria-hidden', 'true');

  tabs.appendChild(panel1);
  tabs.appendChild(panel2);

  return { tabs, tab1, tab2, panel1, panel2 };
}

beforeEach(() => {
  document.body.innerHTML = '';
  history.replaceState({}, '', '/');
});

afterEach(() => {
  history.replaceState({}, '', '/');
  vi.useRealTimers();
});

describe('setTabs', () => {
  it('非選択 tab を click すると aria-selected と aria-hidden が切り替わる', () => {
    const { tabs, tab1, tab2, panel1, panel2 } = createTabsDOM();
    document.body.appendChild(tabs);

    setTabs(tabs);

    tab2.click();

    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('aria-selected', 'false');
    expect(panel2).toHaveAttribute('aria-hidden', 'false');
    expect(panel1).toHaveAttribute('aria-hidden', 'true');
  });

  it('既選択 tab を click しても状態変化なし', () => {
    const { tabs, tab1, panel1 } = createTabsDOM();
    document.body.appendChild(tabs);

    setTabs(tabs);

    tab1.click();

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(panel1).toHaveAttribute('aria-hidden', 'false');
  });

  it('aria-controls が無い tab を click しても例外で落ちない', () => {
    const { tabs } = createTabsDOM();
    document.body.appendChild(tabs);

    const extraItem = document.createElement('div');
    const extraBtn = document.createElement('button');
    extraBtn.setAttribute('role', 'tab');
    extraBtn.setAttribute('aria-selected', 'false');
    // aria-controls は意図的に付与しない
    extraItem.appendChild(extraBtn);
    tabs.querySelector('.c--tabs_list')!.appendChild(extraItem);

    setTabs(tabs);

    expect(() => extraBtn.click()).not.toThrow();
  });

  it('ディープリンク: ?lism-tab=panel2 で panel2 が選択状態になる', () => {
    vi.useFakeTimers();

    const { tabs, tab1, tab2, panel1, panel2 } = createTabsDOM();
    document.body.appendChild(tabs);

    history.replaceState({}, '', '/?lism-tab=panel2');
    setTabs(tabs);

    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('aria-selected', 'false');
    expect(panel2).toHaveAttribute('aria-hidden', 'false');
    expect(panel1).toHaveAttribute('aria-hidden', 'true');
    expect(tabs.dataset.hasTabLink).toBe('1');

    vi.advanceTimersByTime(10);
    expect(tabs.dataset.hasTabLink).toBeUndefined();
  });

  it('?lism-tab= が無い URL では dataset.hasTabLink が触られない', () => {
    const { tabs } = createTabsDOM();
    document.body.appendChild(tabs);

    setTabs(tabs);

    expect(tabs.dataset.hasTabLink).toBeUndefined();
  });

  it('存在しない id を ?lism-tab= に指定しても何も起きない', () => {
    const { tabs, tab1, panel1 } = createTabsDOM();
    document.body.appendChild(tabs);

    history.replaceState({}, '', '/?lism-tab=no-such-panel');
    setTabs(tabs);

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(panel1).toHaveAttribute('aria-hidden', 'false');
    expect(tabs.dataset.hasTabLink).toBeUndefined();
  });
});
