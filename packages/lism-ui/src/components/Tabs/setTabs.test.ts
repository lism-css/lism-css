import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import setTabs from './setTabs';

beforeEach(() => {
  document.body.innerHTML = `
    <div class="c--tabs">
      <div class="c--tabs_list">
        <div class="c--tabs_item">
          <button role="tab" aria-selected="true" aria-controls="panel1"></button>
        </div>
        <div class="c--tabs_item">
          <button role="tab" aria-selected="false" aria-controls="panel2"></button>
        </div>
      </div>
      <div id="panel1" aria-hidden="false"></div>
      <div id="panel2" aria-hidden="true"></div>
    </div>
  `;
  history.replaceState({}, '', '/');
});

afterEach(() => {
  history.replaceState({}, '', '/');
  vi.useRealTimers();
});

describe('setTabs', () => {
  it('非選択 tab を click すると aria-selected と aria-hidden が切り替わる', () => {
    const tabs = document.querySelector<HTMLElement>('.c--tabs')!;
    const [tab1, tab2] = tabs.querySelectorAll<HTMLElement>('[role="tab"]');
    const panel1 = document.querySelector<HTMLElement>('#panel1')!;
    const panel2 = document.querySelector<HTMLElement>('#panel2')!;
    setTabs(tabs);

    tab2.click();

    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('aria-selected', 'false');
    expect(panel2).toHaveAttribute('aria-hidden', 'false');
    expect(panel1).toHaveAttribute('aria-hidden', 'true');
  });

  it('既選択 tab を click しても状態変化なし', () => {
    const tabs = document.querySelector<HTMLElement>('.c--tabs')!;
    const [tab1] = tabs.querySelectorAll<HTMLElement>('[role="tab"]');
    const panel1 = document.querySelector<HTMLElement>('#panel1')!;
    setTabs(tabs);

    tab1.click();

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(panel1).toHaveAttribute('aria-hidden', 'false');
  });

  it('aria-controls が無い tab を click しても例外で落ちない', () => {
    const tabs = document.querySelector<HTMLElement>('.c--tabs')!;
    setTabs(tabs);

    const extraItem = document.createElement('div');
    const extraBtn = document.createElement('button');
    extraBtn.setAttribute('role', 'tab');
    extraBtn.setAttribute('aria-selected', 'false');
    extraItem.appendChild(extraBtn);
    tabs.querySelector('.c--tabs_list')!.appendChild(extraItem);

    setTabs(tabs);

    expect(() => extraBtn.click()).not.toThrow();
  });

  it('ディープリンク: ?lism-tab=panel2 で panel2 が選択状態になる', () => {
    vi.useFakeTimers();

    const tabs = document.querySelector<HTMLElement>('.c--tabs')!;
    const [tab1, tab2] = tabs.querySelectorAll<HTMLElement>('[role="tab"]');
    const panel1 = document.querySelector<HTMLElement>('#panel1')!;
    const panel2 = document.querySelector<HTMLElement>('#panel2')!;

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
    const tabs = document.querySelector<HTMLElement>('.c--tabs')!;
    setTabs(tabs);

    expect(tabs.dataset.hasTabLink).toBeUndefined();
  });

  it('存在しない id を ?lism-tab= に指定しても何も起きない', () => {
    const tabs = document.querySelector<HTMLElement>('.c--tabs')!;
    const [tab1] = tabs.querySelectorAll<HTMLElement>('[role="tab"]');
    const panel1 = document.querySelector<HTMLElement>('#panel1')!;

    history.replaceState({}, '', '/?lism-tab=no-such-panel');
    setTabs(tabs);

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(panel1).toHaveAttribute('aria-hidden', 'false');
    expect(tabs.dataset.hasTabLink).toBeUndefined();
  });
});
