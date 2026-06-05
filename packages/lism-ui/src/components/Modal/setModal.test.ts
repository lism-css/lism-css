import { describe, it, expect, vi, beforeEach } from 'vitest';
import setModal, { setEvent } from './setModal';

vi.mock('../../helper/animation', () => ({
  waitAnimation: vi.fn(() => Promise.resolve('finished' as const)),
}));

import { waitAnimation } from '../../helper/animation';

beforeEach(() => {
  document.body.innerHTML = `
    <dialog id="m1" class="c--modal">
      <button data-modal-close="m1"></button>
    </dialog>
    <button data-modal-open="m1"></button>
  `;
  vi.mocked(waitAnimation).mockResolvedValue('finished');
});

describe('setEvent (dialog 要素)', () => {
  it('open トリガーで showModal が呼ばれ open 属性が付き、次フレームで data-is-open が付く', async () => {
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
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
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });

    document.querySelector<HTMLElement>('[data-modal-close="m1"]')!.click();
    await vi.waitFor(() => {
      expect(modal).not.toHaveAttribute('data-is-open');
      expect(modal).not.toHaveAttribute('open');
      expect(trigger.dataset.targetOpened).toBeUndefined();
    });
  });

  it('余白クリック（e.target === modal）で閉じる', async () => {
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
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
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
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
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
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
    document.body.innerHTML = `
      <div id="m2" class="c--modal">
        <button data-modal-close="m2"></button>
      </div>
      <button data-modal-open="m2"></button>
    `;
    const modal = document.querySelector<HTMLElement>('#m2')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m2"]')!;
    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal).toHaveAttribute('open');
    });

    document.querySelector<HTMLElement>('[data-modal-close="m2"]')!.click();
    await vi.waitFor(() => {
      expect(modal).not.toHaveAttribute('open');
    });
  });
});

describe('setEvent (早期 return ケース)', () => {
  it('id が無い modal は何もしない', () => {
    document.body.innerHTML = `<dialog class="c--modal"></dialog>`;
    const modal = document.querySelector<HTMLDialogElement>('dialog')!;

    setEvent(modal);
    expect(modal).not.toHaveAttribute('open');
  });
});

describe('setModal (default export)', () => {
  it('document 内の .c--modal 全件に登録される', async () => {
    document.body.innerHTML = `
      <dialog id="m1" class="c--modal">
        <button data-modal-close="m1"></button>
      </dialog>
      <dialog id="m2" class="c--modal">
        <button data-modal-close="m2"></button>
      </dialog>
      <button data-modal-open="m1"></button>
      <button data-modal-open="m2"></button>
    `;
    setModal();

    document.querySelector<HTMLElement>('[data-modal-open="m1"]')!.click();
    await vi.waitFor(() => {
      expect(document.querySelector('#m1')).toHaveAttribute('open');
    });

    document.querySelector<HTMLElement>('[data-modal-open="m2"]')!.click();
    await vi.waitFor(() => {
      expect(document.querySelector('#m2')).toHaveAttribute('open');
    });
  });
});
