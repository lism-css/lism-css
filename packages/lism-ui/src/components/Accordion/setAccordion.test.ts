import { describe, it, expect, vi, beforeEach } from 'vitest';
import setAccordion, { setEvent } from './setAccordion';

vi.mock('../../helper/animation', () => ({
  waitFrame: vi.fn(() => Promise.resolve(0)),
  waitAnimation: vi.fn(() => Promise.resolve('finished' as const)),
  maybePauseAnimation: vi.fn(),
}));

import { waitAnimation } from '../../helper/animation';

beforeEach(() => {
  document.body.innerHTML = `
    <div>
      <div class="c--accordion_item">
        <div class="c--accordion_heading">
          <button class="c--accordion_button" aria-expanded="false"></button>
        </div>
        <div class="c--accordion_panel" hidden="until-found">
          <div class="c--accordion_content"></div>
        </div>
      </div>
    </div>
  `;
  vi.mocked(waitAnimation).mockResolvedValue('finished');
});

describe('setEvent', () => {
  it('クリックで item が開く（aria-expanded, data-opened, hidden 解除）', async () => {
    const item = document.querySelector<HTMLElement>('.c--accordion_item')!;
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    const cleanup = setEvent(item);

    button.click();
    await vi.waitFor(() => {
      expect(item).toHaveAttribute('data-opened');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(panel).not.toHaveAttribute('hidden');
    });

    cleanup();
  });

  it('開いた状態で再クリックすると閉じる', async () => {
    document.body.innerHTML = `
      <div>
        <div class="c--accordion_item" data-opened>
          <div class="c--accordion_heading">
            <button class="c--accordion_button" aria-expanded="true"></button>
          </div>
          <div class="c--accordion_panel">
            <div class="c--accordion_content"></div>
          </div>
        </div>
      </div>
    `;
    const item = document.querySelector<HTMLElement>('.c--accordion_item')!;
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    const cleanup = setEvent(item);

    button.click();
    await vi.waitFor(() => {
      expect(item).not.toHaveAttribute('data-opened');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(panel).toHaveAttribute('hidden');
    });

    cleanup();
  });

  it('beforematch イベントでもトグルする', async () => {
    const item = document.querySelector<HTMLElement>('.c--accordion_item')!;
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    const cleanup = setEvent(item);

    panel.dispatchEvent(new Event('beforematch'));
    await vi.waitFor(() => {
      expect(item).toHaveAttribute('data-opened');
    });

    cleanup();
  });

  it('hidden 属性値を保存・復元する（until-found）', async () => {
    const item = document.querySelector<HTMLElement>('.c--accordion_item')!;
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    const cleanup = setEvent(item);

    button.click();
    await vi.waitFor(() => {
      expect(item).toHaveAttribute('data-opened');
      expect(panel).not.toHaveAttribute('hidden');
    });

    button.click();
    await vi.waitFor(() => {
      expect(panel.getAttribute('hidden')).toBe('until-found');
    });

    cleanup();
  });

  it('クリーンアップ後はクリックしてもトグルされない', async () => {
    const item = document.querySelector<HTMLElement>('.c--accordion_item')!;
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    const cleanup = setEvent(item);

    cleanup();
    button.click();

    // リスナーが残っていれば hidden は同期的に外れるため、まず同期状態を検証する
    expect(panel).toHaveAttribute('hidden', 'until-found');

    // data-opened の付与はマイクロタスク数周後のため、setTimeout で全消化してから検証する
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(item).not.toHaveAttribute('data-opened');
  });

  it('waitAnimation が canceled を返した時、closed 後も hidden が付与されない', async () => {
    vi.mocked(waitAnimation).mockResolvedValueOnce('finished');
    vi.mocked(waitAnimation).mockResolvedValueOnce('canceled');

    const item = document.querySelector<HTMLElement>('.c--accordion_item')!;
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    const cleanup = setEvent(item);

    button.click();
    await vi.waitFor(() => {
      expect(item).toHaveAttribute('data-opened');
    });

    button.click();
    await vi.waitFor(() => {
      expect(item).not.toHaveAttribute('data-opened');
    });

    expect(panel).not.toHaveAttribute('hidden');

    cleanup();
  });
});

describe('排他制御', () => {
  it('data-allow-multiple がない時、別 item を開くと前の item が閉じる', async () => {
    document.body.innerHTML = `
      <div>
        <div class="c--accordion_item" data-opened>
          <div class="c--accordion_heading">
            <button class="c--accordion_button" aria-expanded="true"></button>
          </div>
          <div class="c--accordion_panel">
            <div class="c--accordion_content"></div>
          </div>
        </div>
        <div class="c--accordion_item">
          <div class="c--accordion_heading">
            <button class="c--accordion_button" aria-expanded="false"></button>
          </div>
          <div class="c--accordion_panel" hidden="until-found">
            <div class="c--accordion_content"></div>
          </div>
        </div>
      </div>
    `;
    const [item1, item2] = document.querySelectorAll<HTMLElement>('.c--accordion_item');
    setEvent(item1);
    setEvent(item2);

    item2.querySelector<HTMLElement>('.c--accordion_button')!.click();
    await vi.waitFor(() => {
      expect(item2).toHaveAttribute('data-opened');
      expect(item1).not.toHaveAttribute('data-opened');
    });
  });

  it('data-allow-multiple がある時、両方開いたまま保てる', async () => {
    document.body.innerHTML = `
      <div data-allow-multiple>
        <div class="c--accordion_item" data-opened>
          <div class="c--accordion_heading">
            <button class="c--accordion_button" aria-expanded="true"></button>
          </div>
          <div class="c--accordion_panel">
            <div class="c--accordion_content"></div>
          </div>
        </div>
        <div class="c--accordion_item">
          <div class="c--accordion_heading">
            <button class="c--accordion_button" aria-expanded="false"></button>
          </div>
          <div class="c--accordion_panel" hidden="until-found">
            <div class="c--accordion_content"></div>
          </div>
        </div>
      </div>
    `;
    const [item1, item2] = document.querySelectorAll<HTMLElement>('.c--accordion_item');
    setEvent(item1);
    setEvent(item2);

    item2.querySelector<HTMLElement>('.c--accordion_button')!.click();
    await vi.waitFor(() => {
      expect(item1).toHaveAttribute('data-opened');
      expect(item2).toHaveAttribute('data-opened');
    });
  });
});

describe('setAccordion (default export)', () => {
  it('document 内の全 .c--accordion_item に登録される', async () => {
    document.body.innerHTML = `
      <div data-allow-multiple>
        <div class="c--accordion_item">
          <div class="c--accordion_heading">
            <button class="c--accordion_button" aria-expanded="false"></button>
          </div>
          <div class="c--accordion_panel" hidden="until-found">
            <div class="c--accordion_content"></div>
          </div>
        </div>
        <div class="c--accordion_item">
          <div class="c--accordion_heading">
            <button class="c--accordion_button" aria-expanded="false"></button>
          </div>
          <div class="c--accordion_panel" hidden="until-found">
            <div class="c--accordion_content"></div>
          </div>
        </div>
      </div>
    `;
    setAccordion();

    const [item1, item2] = document.querySelectorAll<HTMLElement>('.c--accordion_item');

    item1.querySelector<HTMLElement>('.c--accordion_button')!.click();
    await vi.waitFor(() => {
      expect(item1).toHaveAttribute('data-opened');
    });

    item2.querySelector<HTMLElement>('.c--accordion_button')!.click();
    await vi.waitFor(() => {
      expect(item2).toHaveAttribute('data-opened');
    });
  });
});
