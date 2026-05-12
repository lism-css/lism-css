import { describe, it, expect, vi, beforeEach } from 'vitest';
import setAccordion, { setEvent } from './setAccordion';

vi.mock('../../helper/animation', () => ({
  waitFrame: vi.fn(() => Promise.resolve(0)),
  waitAnimation: vi.fn(() => Promise.resolve('finished' as const)),
  maybePauseAnimation: vi.fn(),
}));

import { waitAnimation } from '../../helper/animation';

function createAccordionItem(opts: { opened?: boolean; hiddenValue?: string } = {}): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="c--accordion_item"${opts.opened ? ' data-opened' : ''}>
      <div class="c--accordion_heading">
        <button class="c--accordion_button" aria-expanded="${opts.opened ? 'true' : 'false'}"></button>
      </div>
      <div class="c--accordion_panel"${!opts.opened ? ` hidden="${opts.hiddenValue ?? 'until-found'}"` : ''}>
        <div class="c--accordion_content"></div>
      </div>
    </div>
  `;
  return wrapper.firstElementChild as HTMLElement;
}

function createParent(items: HTMLElement[], opts: { allowMultiple?: boolean } = {}): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<div${opts.allowMultiple ? ' data-allow-multiple' : ''}></div>`;
  const parent = wrapper.firstElementChild as HTMLElement;
  items.forEach((item) => parent.appendChild(item));
  return parent;
}

beforeEach(() => {
  document.body.innerHTML = '';
  vi.mocked(waitAnimation).mockResolvedValue('finished');
});

describe('setEvent', () => {
  it('クリックで item が開く（aria-expanded, data-opened, hidden 解除）', async () => {
    const item = createAccordionItem();
    createParent([item]);

    const cleanup = setEvent(item);
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;

    button.click();
    await vi.waitFor(() => {
      expect(item).toHaveAttribute('data-opened');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(panel).not.toHaveAttribute('hidden');
    });

    cleanup();
  });

  it('開いた状態で再クリックすると閉じる', async () => {
    const item = createAccordionItem({ opened: true });
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    panel.removeAttribute('hidden');
    createParent([item]);

    const cleanup = setEvent(item);
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;

    button.click();
    await vi.waitFor(() => {
      expect(item).not.toHaveAttribute('data-opened');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(panel).toHaveAttribute('hidden');
    });

    cleanup();
  });

  it('beforematch イベントでもトグルする', async () => {
    const item = createAccordionItem();
    createParent([item]);

    const cleanup = setEvent(item);
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;

    panel.dispatchEvent(new Event('beforematch'));
    await vi.waitFor(() => {
      expect(item).toHaveAttribute('data-opened');
    });

    cleanup();
  });

  it('hidden 属性値を保存・復元する（until-found）', async () => {
    const item = createAccordionItem({ hiddenValue: 'until-found' });
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    createParent([item]);

    const cleanup = setEvent(item);
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;

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
    const item = createAccordionItem();
    createParent([item]);

    const cleanup = setEvent(item);
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;

    cleanup();
    button.click();

    // 変化しないことの確認なので waitFor は使わず、Promise を一度だけ消化して確認
    await Promise.resolve();
    expect(item).not.toHaveAttribute('data-opened');
  });

  it('waitAnimation が canceled を返した時、closed 後も hidden が付与されない', async () => {
    vi.mocked(waitAnimation).mockResolvedValueOnce('finished');
    vi.mocked(waitAnimation).mockResolvedValueOnce('canceled');

    const item = createAccordionItem();
    createParent([item]);
    const cleanup = setEvent(item);
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;

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
    const item1 = createAccordionItem({ opened: true });
    item1.querySelector('.c--accordion_panel')!.removeAttribute('hidden');
    const item2 = createAccordionItem();
    createParent([item1, item2]);

    setEvent(item1);
    setEvent(item2);

    const btn2 = item2.querySelector<HTMLElement>('.c--accordion_button')!;
    btn2.click();
    await vi.waitFor(() => {
      expect(item2).toHaveAttribute('data-opened');
      expect(item1).not.toHaveAttribute('data-opened');
    });
  });

  it('data-allow-multiple がある時、両方開いたまま保てる', async () => {
    const item1 = createAccordionItem({ opened: true });
    item1.querySelector('.c--accordion_panel')!.removeAttribute('hidden');
    const item2 = createAccordionItem();
    createParent([item1, item2], { allowMultiple: true });

    setEvent(item1);
    setEvent(item2);

    const btn2 = item2.querySelector<HTMLElement>('.c--accordion_button')!;
    btn2.click();
    await vi.waitFor(() => {
      expect(item1).toHaveAttribute('data-opened');
      expect(item2).toHaveAttribute('data-opened');
    });
  });
});

describe('setAccordion (default export)', () => {
  it('document 内の全 .c--accordion_item に登録される', async () => {
    const item1 = createAccordionItem();
    const item2 = createAccordionItem();
    const parent = createParent([item1, item2], { allowMultiple: true });
    document.body.appendChild(parent);

    setAccordion();

    const btn1 = item1.querySelector<HTMLElement>('.c--accordion_button')!;
    btn1.click();
    await vi.waitFor(() => {
      expect(item1).toHaveAttribute('data-opened');
    });

    const btn2 = item2.querySelector<HTMLElement>('.c--accordion_button')!;
    btn2.click();
    await vi.waitFor(() => {
      expect(item2).toHaveAttribute('data-opened');
    });
  });
});
