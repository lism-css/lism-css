import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, StrictMode } from 'react';
import type { ReactNode } from 'react';
import { createRoot, type Root as ReactRoot } from 'react-dom/client';
import { unsetTooltip } from '../setTooltip';
import Root from './Root';
import Trigger from './Trigger';
import Popup from './Popup';

// act() を testing-library なしで使うためのフラグ
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let reactRoot: ReactRoot;

const mountInto = (target: HTMLElement, node: ReactNode) => {
  const root = createRoot(target);
  act(() => {
    root.render(node);
  });
  return root;
};

const getRoot = () => container.querySelector<HTMLElement>('.b--tooltip')!;
const getTrigger = () => container.querySelector<HTMLElement>('.b--tooltip_trigger')!;
const getPopup = () => container.querySelector<HTMLElement>('.b--tooltip_popup')!;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  reactRoot = createRoot(container);
});

afterEach(() => {
  act(() => reactRoot.unmount());
  container.remove();
  unsetTooltip();
  vi.restoreAllMocks();
});

describe('Tooltip (React) ID配線', () => {
  it('Trigger の aria-describedby と Popup の id が一致する', () => {
    act(() => {
      reactRoot.render(
        <Root>
          <Trigger>保存</Trigger>
          <Popup>ショートカット</Popup>
        </Root>
      );
    });

    const id = getPopup().id;
    expect(id).toBeTruthy();
    expect(getTrigger()).toHaveAttribute('aria-describedby', id);
  });

  it('Root の tooltipId 明示が Trigger / Popup 両方に反映される', () => {
    act(() => {
      reactRoot.render(
        <Root tooltipId="tt-custom">
          <Trigger>保存</Trigger>
          <Popup>ショートカット</Popup>
        </Root>
      );
    });

    expect(getPopup()).toHaveAttribute('id', 'tt-custom');
    expect(getTrigger()).toHaveAttribute('aria-describedby', 'tt-custom');
  });

  it('Root 配下でも子の明示IDが Root の tooltipId より優先される', () => {
    act(() => {
      reactRoot.render(
        <Root tooltipId="tt-root">
          <Trigger>保存</Trigger>
          <Popup id="child-id">ショートカット</Popup>
        </Root>
      );
    });

    expect(getPopup()).toHaveAttribute('id', 'child-id');
    // Root 配下で一部の子にだけIDを渡すと配線が壊れる（契約どおりの挙動）
    expect(getTrigger()).toHaveAttribute('aria-describedby', 'tt-root');
  });

  it('Root 外でも Trigger / Popup に同じIDを渡せば一致する', () => {
    act(() => {
      reactRoot.render(
        <>
          <Trigger tooltipId="x">保存</Trigger>
          <Popup id="x">ショートカット</Popup>
        </>
      );
    });

    expect(getPopup()).toHaveAttribute('id', 'x');
    expect(getTrigger()).toHaveAttribute('aria-describedby', 'x');
  });
});

describe('Tooltip (React) side / align', () => {
  it('省略時は data-side="top" / data-align="center"', () => {
    act(() => {
      reactRoot.render(
        <Root>
          <Trigger>保存</Trigger>
          <Popup>ショートカット</Popup>
        </Root>
      );
    });

    expect(getPopup()).toHaveAttribute('data-side', 'top');
    expect(getPopup()).toHaveAttribute('data-align', 'center');
  });

  it('side="bottom" align="end" が data 属性に出る', () => {
    act(() => {
      reactRoot.render(
        <Root>
          <Trigger>保存</Trigger>
          <Popup side="bottom" align="end">
            ショートカット
          </Popup>
        </Root>
      );
    });

    expect(getPopup()).toHaveAttribute('data-side', 'bottom');
    expect(getPopup()).toHaveAttribute('data-align', 'end');
  });
});

describe('Tooltip (React) Root の属性', () => {
  it('delay / offset が --tooltip-* として Root の style に出力される', () => {
    act(() => {
      reactRoot.render(
        <Root delay="1s" offset="20px">
          <Trigger>保存</Trigger>
          <Popup>ショートカット</Popup>
        </Root>
      );
    });

    expect(getRoot().style.getPropertyValue('--tooltip-delay')).toBe('1s');
    expect(getRoot().style.getPropertyValue('--tooltip-offset')).toBe('20px');
    expect(getPopup().style.getPropertyValue('--tooltip-offset')).toBe('');
  });
});

describe('Tooltip (React) リスナー所有', () => {
  it('Root を2つ mount して片方を unmount しても、残った Root の Esc が効く', () => {
    const otherContainer = document.createElement('div');
    document.body.appendChild(otherContainer);

    act(() => {
      reactRoot.render(
        <Root tooltipId="tt-keep">
          <Trigger>保存</Trigger>
          <Popup>ショートカット</Popup>
        </Root>
      );
    });
    const otherRoot = mountInto(
      otherContainer,
      <Root tooltipId="tt-drop">
        <Trigger>削除</Trigger>
        <Popup>説明</Popup>
      </Root>
    );

    act(() => otherRoot.unmount());
    otherContainer.remove();

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(container.querySelector('.b--tooltip')).toHaveAttribute('data-dismissed');
  });

  it('StrictMode で mount しても document への keydown 登録は1回', () => {
    const spy = vi.spyOn(document, 'addEventListener');

    act(() => {
      reactRoot.render(
        <StrictMode>
          <Root>
            <Trigger>保存</Trigger>
            <Popup>ショートカット</Popup>
          </Root>
        </StrictMode>
      );
    });

    expect(spy.mock.calls.filter(([type]) => type === 'keydown')).toHaveLength(1);
  });
});
