import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot, type Root as ReactRoot } from 'react-dom/client';
import Root from './Root';
import Trigger from './Trigger';
import Popup from './Popup';
import Close from './Close';

// act() を testing-library なしで使うためのフラグ
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let reactRoot: ReactRoot;

const render = (ui: ReactNode) => {
  act(() => {
    reactRoot.render(ui);
  });
};

const getTrigger = () => container.querySelector<HTMLElement>('.b--popover_trigger')!;
const getPopup = () => container.querySelector<HTMLElement>('.b--popover_popup')!;
const getClose = () => container.querySelector<HTMLElement>('.b--popover_close')!;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  reactRoot = createRoot(container);
});

afterEach(() => {
  act(() => reactRoot.unmount());
  container.remove();
});

describe('Popover (React) ID の紐付け', () => {
  it('popoverId 未指定でも Trigger / Popup / Close のIDが一致する', () => {
    render(
      <Root>
        <Trigger>開く</Trigger>
        <Popup>
          コンテンツ
          <Close />
        </Popup>
      </Root>
    );

    const popupId = getPopup().getAttribute('id');
    expect(popupId).toBeTruthy();
    expect(popupId).not.toBe('__LISM_POPOVER_ID__');
    expect(getTrigger().getAttribute('popovertarget')).toBe(popupId);
    expect(getClose().getAttribute('popovertarget')).toBe(popupId);
  });

  it('Root への popoverId 指定が Trigger / Popup / Close に反映される', () => {
    render(
      <Root popoverId="pop-custom">
        <Trigger>開く</Trigger>
        <Popup>
          コンテンツ
          <Close />
        </Popup>
      </Root>
    );

    expect(getTrigger().getAttribute('popovertarget')).toBe('pop-custom');
    expect(getPopup().getAttribute('id')).toBe('pop-custom');
    expect(getClose().getAttribute('popovertarget')).toBe('pop-custom');
  });

  it('子への明示指定は Root のIDより優先される', () => {
    render(
      <Root popoverId="pop-root">
        <Trigger>開く</Trigger>
        <Popup id="child-id">コンテンツ</Popup>
      </Root>
    );

    expect(getPopup().getAttribute('id')).toBe('child-id');
    expect(getTrigger().getAttribute('popovertarget')).toBe('pop-root');
  });

  it('Root なしでも各パーツへ同じIDを指定すれば紐付く', () => {
    render(
      <>
        <Trigger popoverId="x">開く</Trigger>
        <Popup id="x">
          コンテンツ
          <Close popoverId="x" />
        </Popup>
      </>
    );

    expect(getTrigger().getAttribute('popovertarget')).toBe('x');
    expect(getPopup().getAttribute('id')).toBe('x');
    expect(getClose().getAttribute('popovertarget')).toBe('x');
  });
});

describe('Popover (React) Popup の属性', () => {
  it('popover 属性は既定で auto', () => {
    render(<Popup id="x">コンテンツ</Popup>);

    expect(getPopup().getAttribute('popover')).toBe('auto');
  });

  it('type="manual" で popover="manual" になる', () => {
    render(
      <Popup id="x" type="manual">
        コンテンツ
      </Popup>
    );

    expect(getPopup().getAttribute('popover')).toBe('manual');
  });

  it('side / align の既定値は bottom / center', () => {
    render(<Popup id="x">コンテンツ</Popup>);

    const popup = getPopup();
    expect(popup.getAttribute('data-side')).toBe('bottom');
    expect(popup.getAttribute('data-align')).toBe('center');
  });

  it('side / align の指定が data 属性に出力される', () => {
    render(
      <Popup id="x" side="top" align="end">
        コンテンツ
      </Popup>
    );

    const popup = getPopup();
    expect(popup.getAttribute('data-side')).toBe('top');
    expect(popup.getAttribute('data-align')).toBe('end');
  });

  it('offset が --popover-offset として style に出力される', () => {
    render(
      <Popup id="x" offset="20px">
        コンテンツ
      </Popup>
    );

    expect(getPopup().style.getPropertyValue('--popover-offset')).toBe('20px');
  });
});

describe('Popover (React) Close の属性', () => {
  it('popovertargetaction="hide" が付与される', () => {
    render(<Close popoverId="x" />);

    expect(getClose().getAttribute('popovertargetaction')).toBe('hide');
  });
});
