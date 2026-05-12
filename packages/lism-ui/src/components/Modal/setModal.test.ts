import { describe, it, expect, vi, beforeEach } from 'vitest';
import setModal, { setEvent } from './setModal';

vi.mock('../../helper/animation', () => ({
  waitAnimation: vi.fn(() => Promise.resolve('finished' as const)),
}));

import { waitAnimation } from '../../helper/animation';

function createDialogModal(id: string): HTMLDialogElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <dialog id="${id}" class="c--modal">
      <button data-modal-close="${id}"></button>
    </dialog>
  `;
  return wrapper.firstElementChild as HTMLDialogElement;
}

function createDivModal(id: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="${id}" class="c--modal">
      <button data-modal-close="${id}"></button>
    </div>
  `;
  return wrapper.firstElementChild as HTMLElement;
}

function createOpenTrigger(targetId: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `<button data-modal-open="${targetId}"></button>`;
  return wrapper.firstElementChild as HTMLElement;
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
    await vi.waitFor(() => {
      expect(modal).toHaveAttribute('open');
      expect(modal.dataset.isOpen).toBe('1');
      expect(trigger.dataset.targetOpened).toBe('1');
    });

    expect(showModalSpy).toHaveBeenCalledTimes(1);
  });

  it('close トリガーで data-is-open が消え、waitAnimation 後に閉じる', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });

    const closeBtn = modal.querySelector<HTMLElement>('[data-modal-close="m1"]')!;
    closeBtn.click();
    await vi.waitFor(() => {
      expect(modal).not.toHaveAttribute('data-is-open');
      expect(modal).not.toHaveAttribute('open');
      expect(trigger.dataset.targetOpened).toBeUndefined();
    });
  });

  it('余白クリック（e.target === modal）で閉じる', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });

    modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.waitFor(() => {
      expect(modal).not.toHaveAttribute('data-is-open');
      expect(modal).not.toHaveAttribute('open');
    });
  });

  it('cancel イベントで preventDefault され、closeDialog が走る', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });

    const cancelEvent = new Event('cancel', { cancelable: true });
    modal.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    await vi.waitFor(() => {
      expect(modal).not.toHaveAttribute('data-is-open');
    });
  });

  it('連打防止: 既に open 中に再度 open トリガーを click しても showModal は 1 回のみ', async () => {
    const modal = createDialogModal('m1');
    const trigger = createOpenTrigger('m1');
    document.body.appendChild(modal);
    document.body.appendChild(trigger);

    const showModalSpy = vi.spyOn(modal, 'showModal');
    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });

    trigger.click();
    await Promise.resolve();

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
    await vi.waitFor(() => {
      expect(modal).toHaveAttribute('open');
    });

    const closeBtn = modal.querySelector<HTMLElement>('[data-modal-close="m2"]')!;
    closeBtn.click();
    await vi.waitFor(() => {
      expect(modal).not.toHaveAttribute('open');
    });
  });
});

describe('setEvent (早期 return ケース)', () => {
  it('id が無い modal は何もしない', () => {
    const modal = document.createElement('dialog');
    modal.className = 'c--modal';
    document.body.appendChild(modal);

    setEvent(modal);
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
    await vi.waitFor(() => {
      expect(m1).toHaveAttribute('open');
    });

    t2.click();
    await vi.waitFor(() => {
      expect(m2).toHaveAttribute('open');
    });
  });
});
