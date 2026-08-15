import { describe, it, expect } from 'vitest';
import transformTabitems from './transformTabitems';

// Tab.astro / Panel.astro の初期値（tabId='__LISM_TAB_ID__', index=0）での出力を模したフィクスチャ
const PLACEHOLDER_ID = '__LISM_TAB_ID__-0';

const tabitem = (label: string, panelInner = '') =>
  [
    '<lism-placeholder-tabitem>',
    `<button class="b--tabs_tab set--plain" type="button" id="${PLACEHOLDER_ID}-tab" role="tab" aria-controls="${PLACEHOLDER_ID}" aria-selected="false" tabindex="-1">${label}</button>`,
    `<div class="b--tabs_panel" id="${PLACEHOLDER_ID}" role="tabpanel" aria-labelledby="${PLACEHOLDER_ID}-tab" tabindex="0" hidden>${label}の内容${panelInner}</div>`,
    '</lism-placeholder-tabitem>',
  ].join('\n');

const html = (...items: string[]) => items.join('\n');

describe('transformTabitems', () => {
  it('タブとパネルのIDが index 付きに置換される', () => {
    const { btns, panels } = transformTabitems(html(tabitem('タブ1'), tabitem('タブ2')), 'my-tab', 1);

    expect(btns).toHaveLength(2);
    expect(panels).toHaveLength(2);

    expect(btns[0]).toContain('id="my-tab-1-tab"');
    expect(btns[0]).toContain('aria-controls="my-tab-1"');
    expect(panels[0]).toContain('id="my-tab-1"');
    expect(panels[0]).toContain('aria-labelledby="my-tab-1-tab"');

    expect(btns[1]).toContain('id="my-tab-2-tab"');
    expect(btns[1]).toContain('aria-controls="my-tab-2"');
    expect(panels[1]).toContain('id="my-tab-2"');
    expect(panels[1]).toContain('aria-labelledby="my-tab-2-tab"');

    // 置換元のIDが残っていない
    expect(btns.join('')).not.toContain(PLACEHOLDER_ID);
    expect(panels.join('')).not.toContain(PLACEHOLDER_ID);
  });

  it('defaultIndex のタブだけが選択状態になる', () => {
    const { btns } = transformTabitems(html(tabitem('タブ1'), tabitem('タブ2'), tabitem('タブ3')), 'tabs', 2);

    expect(btns[0]).toContain('aria-selected="false"');
    expect(btns[0]).toContain('tabindex="-1"');
    expect(btns[1]).toContain('aria-selected="true"');
    expect(btns[1]).toContain('tabindex="0"');
    expect(btns[2]).toContain('aria-selected="false"');
    expect(btns[2]).toContain('tabindex="-1"');
  });

  it('選択中のパネルからだけ hidden が外れる', () => {
    const { panels } = transformTabitems(html(tabitem('タブ1'), tabitem('タブ2')), 'tabs', 2);

    expect(panels[0]).toContain(' hidden>');
    expect(panels[1]).not.toContain(' hidden>');
    expect(panels[1]).toContain('role="tabpanel"');
  });

  it('パネルの中身にある hidden は残る', () => {
    const { panels } = transformTabitems(html(tabitem('タブ1', '<span hidden>補足</span>')), 'tabs', 1);

    expect(panels[0]).toContain('<span hidden>補足</span>');
    expect(panels[0]).not.toContain('tabindex="0" hidden>');
  });

  it('範囲外の defaultIndex は 1 にフォールバックする', () => {
    const items = html(tabitem('タブ1'), tabitem('タブ2'));

    for (const defaultIndex of [0, -1, 3, 99]) {
      const { btns, panels } = transformTabitems(items, 'tabs', defaultIndex);
      expect(btns[0]).toContain('aria-selected="true"');
      expect(btns[1]).toContain('aria-selected="false"');
      expect(panels[0]).not.toContain(' hidden>');
      expect(panels[1]).toContain(' hidden>');
    }
  });

  it('button を含まない tabitem は無視される', () => {
    const { btns, panels } = transformTabitems(
      html('<lism-placeholder-tabitem><div>ボタン無し</div></lism-placeholder-tabitem>', tabitem('タブ2')),
      'tabs',
      1
    );

    expect(btns).toHaveLength(1);
    expect(panels).toHaveLength(1);
  });

  it('tabitem が無ければ空配列を返す', () => {
    const { btns, panels } = transformTabitems('<p>ただのテキスト</p>', 'tabs', 1);

    expect(btns).toEqual([]);
    expect(panels).toEqual([]);
  });

  // Astro が実際に出力する形（改行なし / placeholder に属性が付く）
  it('placeholder に属性が付いていても変換できる', () => {
    const source =
      '<lism-placeholder-tabitem data-astro-source-file="Item.astro"> ' +
      `<button class="b--tabs_tab set--plain" type="button" id="${PLACEHOLDER_ID}-tab" role="tab" aria-controls="${PLACEHOLDER_ID}" aria-selected="false" tabindex="-1">タブ1</button>` +
      `<div class="b--tabs_panel" id="${PLACEHOLDER_ID}" role="tabpanel" aria-labelledby="${PLACEHOLDER_ID}-tab" tabindex="0" hidden>タブ1の内容</div> ` +
      '</lism-placeholder-tabitem>';

    const { btns, panels } = transformTabitems(source, 'tabs', 1);

    expect(btns[0]).toBe(
      '<button class="b--tabs_tab set--plain" type="button" id="tabs-1-tab" role="tab" aria-controls="tabs-1" aria-selected="true" tabindex="0">タブ1</button>'
    );
    expect(panels[0]).toBe('<div class="b--tabs_panel" id="tabs-1" role="tabpanel" aria-labelledby="tabs-1-tab" tabindex="0">タブ1の内容</div> ');
  });
});
