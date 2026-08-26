import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import setTabs from './setTabs';

// Tab.astro / Panel.astro が出力するマークアップを模したフィクスチャ
beforeEach(() => {
  document.body.innerHTML = `
    <div class="b--tabs">
      <div class="b--tabs_list" role="tablist">
        <button class="b--tabs_tab" type="button" role="tab" id="panel1-tab" aria-controls="panel1" aria-selected="true" tabindex="0"></button>
        <button class="b--tabs_tab" type="button" role="tab" id="panel2-tab" aria-controls="panel2" aria-selected="false" tabindex="-1"></button>
        <button class="b--tabs_tab" type="button" role="tab" id="panel3-tab" aria-controls="panel3" aria-selected="false" tabindex="-1"></button>
      </div>
      <div id="panel1" class="b--tabs_panel" role="tabpanel" aria-labelledby="panel1-tab" tabindex="0"></div>
      <div id="panel2" class="b--tabs_panel" role="tabpanel" aria-labelledby="panel2-tab" tabindex="0" hidden></div>
      <div id="panel3" class="b--tabs_panel" role="tabpanel" aria-labelledby="panel3-tab" tabindex="0" hidden></div>
    </div>
  `;
  history.replaceState({}, '', '/');
});

afterEach(() => {
  history.replaceState({}, '', '/');
});

const getEls = () => {
  const tabs = document.querySelector<HTMLElement>('.b--tabs')!;
  const tabBtns = Array.from(tabs.querySelectorAll<HTMLElement>('[role="tab"]'));
  const panels = Array.from(tabs.querySelectorAll<HTMLElement>('[role="tabpanel"]'));
  return { tabs, tabBtns, panels };
};

const pressKey = (el: HTMLElement, key: string) => {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
};

// 指定インデックス（0始まり）だけが選択状態になっていることを検証
const expectSelected = (index: number) => {
  const { tabBtns, panels } = getEls();
  tabBtns.forEach((btn, i) => {
    expect(btn).toHaveAttribute('aria-selected', i === index ? 'true' : 'false');
    expect(btn).toHaveAttribute('tabindex', i === index ? '0' : '-1');
  });
  panels.forEach((panel, i) => {
    if (i === index) {
      expect(panel).not.toHaveAttribute('hidden');
    } else {
      expect(panel).toHaveAttribute('hidden');
    }
  });
};

describe('setTabs / クリック', () => {
  it('非選択 tab を click すると aria-selected / tabindex / hidden が切り替わる', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    tabBtns[1].click();

    expectSelected(1);
  });

  it('既選択 tab を click しても状態は維持される', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    tabBtns[0].click();

    expectSelected(0);
  });

  it('選択中の tab が存在しない状態でも click で選択できる', () => {
    const { tabs, tabBtns, panels } = getEls();
    // 初期状態を「どのタブも未選択」に崩す
    tabBtns.forEach((btn) => {
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('tabindex', '-1');
    });
    panels.forEach((panel) => panel.setAttribute('hidden', ''));
    setTabs(tabs);

    tabBtns[2].click();

    expectSelected(2);
  });

  it('aria-controls が無い tab を click しても例外で落ちない', () => {
    const { tabs } = getEls();

    const extraBtn = document.createElement('button');
    extraBtn.className = 'b--tabs_tab';
    extraBtn.setAttribute('role', 'tab');
    extraBtn.setAttribute('aria-selected', 'false');
    tabs.querySelector('.b--tabs_list')!.appendChild(extraBtn);

    setTabs(tabs);

    expect(() => extraBtn.click()).not.toThrow();
    expect(extraBtn).toHaveAttribute('aria-selected', 'true');
  });
});

describe('setTabs / キーボード操作（水平・既定）', () => {
  it('ArrowRight で次のタブへ移動し、フォーカスと選択が連動する', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    const event = pressKey(tabBtns[0], 'ArrowRight');

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(tabBtns[1]);
    expectSelected(1);
  });

  // APG: 水平タブリストは上下キーを拾わず、ブラウザ本来のスクロールに残す
  it('ArrowDown / ArrowUp では何も起きない', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    const down = pressKey(tabBtns[0], 'ArrowDown');
    expect(down.defaultPrevented).toBe(false);
    expectSelected(0);

    const up = pressKey(tabBtns[0], 'ArrowUp');
    expect(up.defaultPrevented).toBe(false);
    expectSelected(0);
  });

  it('末尾で ArrowRight を押すと先頭へラップする', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    pressKey(tabBtns[2], 'ArrowRight');

    expect(document.activeElement).toBe(tabBtns[0]);
    expectSelected(0);
  });

  it('ArrowLeft で前のタブへ移動する', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    pressKey(tabBtns[2], 'ArrowLeft');

    expect(document.activeElement).toBe(tabBtns[1]);
    expectSelected(1);
  });

  it('先頭で ArrowLeft を押すと末尾へラップする', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    pressKey(tabBtns[0], 'ArrowLeft');

    expect(document.activeElement).toBe(tabBtns[2]);
    expectSelected(2);
  });

  it('Home で先頭、End で末尾へ移動する', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    pressKey(tabBtns[0], 'End');
    expect(document.activeElement).toBe(tabBtns[2]);
    expectSelected(2);

    pressKey(tabBtns[2], 'Home');
    expect(document.activeElement).toBe(tabBtns[0]);
    expectSelected(0);
  });

  it('対象外のキーでは何も起きない', () => {
    const { tabs, tabBtns } = getEls();
    setTabs(tabs);

    const event = pressKey(tabBtns[0], 'a');

    expect(event.defaultPrevented).toBe(false);
    expectSelected(0);
  });
});

describe('setTabs / キーボード操作（aria-orientation="vertical"）', () => {
  // tablist に vertical を宣言してから setTabs する
  const setVerticalTabs = () => {
    const els = getEls();
    els.tabs.querySelector('[role="tablist"]')!.setAttribute('aria-orientation', 'vertical');
    setTabs(els.tabs);
    return els;
  };

  it('ArrowDown で次、ArrowUp で前のタブへ移動する', () => {
    const { tabBtns } = setVerticalTabs();

    const down = pressKey(tabBtns[0], 'ArrowDown');
    expect(down.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(tabBtns[1]);
    expectSelected(1);

    pressKey(tabBtns[1], 'ArrowUp');
    expect(document.activeElement).toBe(tabBtns[0]);
    expectSelected(0);
  });

  it('端では反対側へラップする', () => {
    const { tabBtns } = setVerticalTabs();

    pressKey(tabBtns[0], 'ArrowUp');
    expect(document.activeElement).toBe(tabBtns[2]);
    expectSelected(2);

    pressKey(tabBtns[2], 'ArrowDown');
    expect(document.activeElement).toBe(tabBtns[0]);
    expectSelected(0);
  });

  it('ArrowRight / ArrowLeft では何も起きない', () => {
    const { tabBtns } = setVerticalTabs();

    const right = pressKey(tabBtns[0], 'ArrowRight');

    expect(right.defaultPrevented).toBe(false);
    expectSelected(0);
  });

  it('Home / End は向きに関わらず動作する', () => {
    const { tabBtns } = setVerticalTabs();

    pressKey(tabBtns[0], 'End');
    expect(document.activeElement).toBe(tabBtns[2]);
    expectSelected(2);

    pressKey(tabBtns[2], 'Home');
    expect(document.activeElement).toBe(tabBtns[0]);
    expectSelected(0);
  });
});

describe('setTabs / ディープリンク', () => {
  it('?lism-tab=panel2 で panel2 が選択状態になる', () => {
    const { tabs } = getEls();

    history.replaceState({}, '', '/?lism-tab=panel2');
    setTabs(tabs);

    expectSelected(1);
  });

  it('存在しない id を ?lism-tab= に指定しても何も起きない', () => {
    const { tabs } = getEls();

    history.replaceState({}, '', '/?lism-tab=no-such-panel');
    setTabs(tabs);

    expectSelected(0);
  });

  it('?lism-tab= が無い URL では初期状態のまま', () => {
    const { tabs } = getEls();
    setTabs(tabs);

    expectSelected(0);
  });
});
