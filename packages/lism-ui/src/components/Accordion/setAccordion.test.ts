import { describe, it, expect, vi, beforeEach } from 'vitest';
import setAccordion, { setEvent } from './setAccordion';

vi.mock('../../helper/animation', () => ({
  waitFrame: vi.fn(() => Promise.resolve(0)),
  waitAnimation: vi.fn(() => Promise.resolve('finished' as const)),
  maybePauseAnimation: vi.fn(),
}));

import { waitAnimation } from '../../helper/animation';

function createAccordionItem(opts: { opened?: boolean; hiddenValue?: string } = {}): HTMLElement {
  const item = document.createElement('div');
  item.className = 'c--accordion_item';
  if (opts.opened) item.setAttribute('data-opened', '');

  const heading = document.createElement('div');
  heading.className = 'c--accordion_heading';

  const button = document.createElement('button');
  button.className = 'c--accordion_button';
  button.setAttribute('aria-expanded', opts.opened ? 'true' : 'false');
  heading.appendChild(button);

  const panel = document.createElement('div');
  panel.className = 'c--accordion_panel';
  if (!opts.opened) {
    panel.setAttribute('hidden', opts.hiddenValue ?? 'until-found');
  }

  const content = document.createElement('div');
  content.className = 'c--accordion_content';
  panel.appendChild(content);

  item.appendChild(heading);
  item.appendChild(panel);
  return item;
}

function createParent(items: HTMLElement[], opts: { allowMultiple?: boolean } = {}): HTMLElement {
  const parent = document.createElement('div');
  if (opts.allowMultiple) parent.setAttribute('data-allow-multiple', '');
  items.forEach((item) => parent.appendChild(item));
  return parent;
}

async function flushPromises(times = 3): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((r) => setTimeout(r, 0));
  }
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
    await flushPromises();

    expect(item).toHaveAttribute('data-opened');
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(panel).not.toHaveAttribute('hidden');

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
    await flushPromises();

    expect(item).not.toHaveAttribute('data-opened');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden');

    cleanup();
  });

  it('beforematch イベントでもトグルする', async () => {
    const item = createAccordionItem();
    createParent([item]);

    const cleanup = setEvent(item);
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;

    panel.dispatchEvent(new Event('beforematch'));
    await flushPromises();

    expect(item).toHaveAttribute('data-opened');

    cleanup();
  });

  it('hidden 属性値を保存・復元する（until-found）', async () => {
    const item = createAccordionItem({ hiddenValue: 'until-found' });
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
    createParent([item]);

    const cleanup = setEvent(item);
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;

    // 開く
    button.click();
    await flushPromises();
    expect(panel).not.toHaveAttribute('hidden');

    // 閉じる
    button.click();
    await flushPromises();
    expect(panel.getAttribute('hidden')).toBe('until-found');

    cleanup();
  });

  it('クリーンアップ後はクリックしてもトグルされない', async () => {
    const item = createAccordionItem();
    createParent([item]);

    const cleanup = setEvent(item);
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;

    cleanup();
    button.click();
    await flushPromises();

    expect(item).not.toHaveAttribute('data-opened');
  });

  it('waitAnimation が canceled を返した時、closed 後も --_panel-h が残る', async () => {
    vi.mocked(waitAnimation).mockResolvedValueOnce('finished'); // open 時は通常
    vi.mocked(waitAnimation).mockResolvedValueOnce('canceled'); // close 時に canceled

    const item = createAccordionItem();
    createParent([item]);
    const cleanup = setEvent(item);
    const button = item.querySelector<HTMLElement>('.c--accordion_button')!;

    // 開く
    button.click();
    await flushPromises();

    // 閉じる（canceled）
    button.click();
    await flushPromises();

    // canceled の場合 hidden は付与されない
    const panel = item.querySelector<HTMLElement>('.c--accordion_panel')!;
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
    await flushPromises();

    expect(item2).toHaveAttribute('data-opened');
    expect(item1).not.toHaveAttribute('data-opened');
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
    await flushPromises();

    expect(item1).toHaveAttribute('data-opened');
    expect(item2).toHaveAttribute('data-opened');
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
    await flushPromises();

    expect(item1).toHaveAttribute('data-opened');

    const btn2 = item2.querySelector<HTMLElement>('.c--accordion_button')!;
    btn2.click();
    await flushPromises();

    expect(item2).toHaveAttribute('data-opened');
  });
});
