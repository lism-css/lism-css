import { describe, it, expect, vi, beforeEach } from 'vitest';
import setModal, { setEvent } from './setModal';

vi.mock('../../helper/animation', () => ({
  waitAnimation: vi.fn(() => Promise.resolve('finished' as const)),
}));

import { waitAnimation } from '../../helper/animation';

async function flushPromises(times = 3): Promise<void> {
  for (let i = 0; i < times; i++) {
    await new Promise((r) => setTimeout(r, 0));
  }
}

function createDialogModal(id: string): HTMLDialogElement {
  const modal = document.createElement('dialog');
  modal.id = id;
  modal.className = 'c--modal';

  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('data-modal-close', id);
  modal.appendChild(closeBtn);

  return modal;
}

function createDivModal(id: string): HTMLElement {
  const modal = document.createElement('div');
  modal.id = id;
  modal.className = 'c--modal';

  const closeBtn = document.createElement('button');
  closeBtn.setAttribute('data-modal-close', id);
  modal.appendChild(closeBtn);

  return modal;
}

function createOpenTrigger(targetId: string): HTMLElement {
  const btn = document.createElement('button');
  btn.setAttribute('data-modal-open', targetId);
  return btn;
}

beforeEach(() => {
  document.body.innerHTML = '';
  vi.mocked(waitAnimation).mockResolvedValue('finished');
});

describe('setEvent (dialog 要素)', () => {
  it('open トリガーで showModal が呼ばれ open 属性が付き、次フレームで data-is-open が付く', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    const showModalSpy = vi.spyOn(modal, 'showModal');
    setEvent(modal);

    trigger.click();
    await flushPromises();

    expect(showModalSpy).toHaveBeenCalledTimes(1);
    expect(modal).toHaveAttribute('open');
    expect(modal.dataset.isOpen).toBe('1');
    expect(trigger.dataset.targetOpened).toBe('1');
  });

  it('close トリガーで data-is-open が消え、waitAnimation 後に閉じる', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    setEvent(modal);

    // 開く
    trigger.click();
    await flushPromises();

    // 閉じる
    const closeBtn = modal.querySelector<HTMLElement>('[data-modal-close="m1"]')!;
    closeBtn.click();
    await flushPromises();

    expect(modal).not.toHaveAttribute('data-is-open');
    expect(modal).not.toHaveAttribute('open');
    expect(trigger.dataset.targetOpened).toBeUndefined();
  });

  it('余白クリック（e.target === modal）で閉じる', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    setEvent(modal);

    trigger.click();
    await flushPromises();

    modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(modal).not.toHaveAttribute('data-is-open');
    expect(modal).not.toHaveAttribute('open');
  });

  it('cancel イベントで preventDefault され、closeDialog が走る', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    setEvent(modal);

    trigger.click();
    await flushPromises();

    const cancelEvent = new Event('cancel', { cancelable: true });
    modal.dispatchEvent(cancelEvent);
    await flushPromises();

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(modal).not.toHaveAttribute('data-is-open');
  });

  it('連打防止: 既に open 中に再度 open トリガーを click しても showModal は 1 回のみ', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    const showModalSpy = vi.spyOn(modal, 'showModal');
    setEvent(modal);

    trigger.click();
    await flushPromises();
    trigger.click();
    await flushPromises();

    expect(showModalSpy).toHaveBeenCalledTimes(1);
  });
});

describe('setEvent (非 dialog 要素)', () => {
  it('open/close が open 属性ベースで動作する', async () => {
    const modal = createDivModal('m2');
    const trigger = createOpenTrigger('m2');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    setEvent(modal);

    trigger.click();
    await flushPromises();
    expect(modal).toHaveAttribute('open');

    const closeBtn = modal.querySelector<HTMLElement>('[data-modal-close="m2"]')!;
    closeBtn.click();
    await flushPromises();
    expect(modal).not.toHaveAttribute('open');
  });
});

describe('setEvent (早期 return ケース)', () => {
  it('id が無い modal は何もしない', () => {
    const modal = document.createElement('dialog');
    modal.className = 'c--modal';
    document.body.appendChild(modal);

    setEvent(modal);
    // open 属性が付かないことを確認（クリックイベントが登録されていない）
    expect(modal).not.toHaveAttribute('open');
  });
});

describe('setModal (default export)', () => {
  it('document 内の .c--modal 全件に登録される', async () => {
    const m1 = createDialogModal('m1');
    const m2 = createDialogModal('m2');
    const t1 = createOpenTrigger('m1');
    const t2 = createOpenTrigger('m2');
    document.body.appendChild(m1);
    document.body.appendChild(m2);
    document.body.appendChild(t1);
    document.body.appendChild(t2);

    setModal();

    t1.click();
    await flushPromises();
    expect(m1).toHaveAttribute('open');

    t2.click();
    await flushPromises();
    expect(m2).toHaveAttribute('open');
  });
});
