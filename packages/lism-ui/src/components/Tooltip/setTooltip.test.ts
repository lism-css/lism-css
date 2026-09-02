import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import setTooltip, { unsetTooltip } from './setTooltip';

const html = `
  <span id="t1" class="b--tooltip">
    <button id="b1" class="b--tooltip_trigger" aria-describedby="tt-1"></button>
    <span class="b--tooltip_popup" role="tooltip" id="tt-1"></span>
  </span>
  <span id="t2" class="b--tooltip">
    <button id="b2" class="b--tooltip_trigger" aria-describedby="tt-2"></button>
    <span class="b--tooltip_popup" role="tooltip" id="tt-2"></span>
  </span>
`;

const roots = () => [...document.querySelectorAll<HTMLElement>('.b--tooltip')];
const pressEscape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

beforeEach(() => {
  document.body.innerHTML = html;
});

afterEach(() => {
  unsetTooltip();
  vi.restoreAllMocks();
});

describe('setTooltip', () => {
  it('Esc で全ルートに data-dismissed が付く', () => {
    setTooltip();

    pressEscape();

    expect(roots().every((root) => root.hasAttribute('data-dismissed'))).toBe(true);
  });

  it('Escape 以外のキーでは何も起きない', () => {
    setTooltip();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(roots().some((root) => root.hasAttribute('data-dismissed'))).toBe(false);
  });

  it('pointerenter を受けたルートだけ data-dismissed が外れる', () => {
    setTooltip();
    pressEscape();

    // pointerenter はバブルしないので、dispatch した要素自身が target になる
    document.querySelector('#t1')!.dispatchEvent(new Event('pointerenter'));

    expect(document.querySelector('#t1')).not.toHaveAttribute('data-dismissed');
    expect(document.querySelector('#t2')).toHaveAttribute('data-dismissed');
  });

  it('ルート外の要素の pointerenter では外れない', () => {
    setTooltip();
    pressEscape();

    // ルートの子要素（.b--tooltip にマッチしない）へポインタが入っただけでは復帰しない
    document.querySelector('#b1')!.dispatchEvent(new Event('pointerenter'));

    expect(document.querySelector('#t1')).toHaveAttribute('data-dismissed');
  });

  it('focusin で祖先ルートの data-dismissed が外れる', () => {
    setTooltip();
    pressEscape();

    document.querySelector('#b1')!.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

    expect(document.querySelector('#t1')).not.toHaveAttribute('data-dismissed');
    expect(document.querySelector('#t2')).toHaveAttribute('data-dismissed');
  });

  it('二重に呼んでもリスナーは増えない', () => {
    const spy = vi.spyOn(document, 'addEventListener');

    setTooltip();
    setTooltip();

    expect(spy.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
  });

  it('unsetTooltip() で解除され、再度 setTooltip() で登録できる', () => {
    setTooltip();
    unsetTooltip();

    pressEscape();
    expect(roots().some((root) => root.hasAttribute('data-dismissed'))).toBe(false);

    setTooltip();
    pressEscape();
    expect(roots().every((root) => root.hasAttribute('data-dismissed'))).toBe(true);
  });
});
