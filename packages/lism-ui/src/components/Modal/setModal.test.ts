import { describe, it, expect, vi, beforeEach } from 'vitest';
import setModal, { setEvent } from './setModal';

vi.mock('../../helper/animation', () => ({
  waitAnimation: vi.fn(() => Promise.resolve('finished' as const)),
}));

import { waitAnimation } from '../../helper/animation';

beforeEach(() => {
  document.body.innerHTML = `
    <dialog id="m1" class="b--modal">
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

  it('余白クリック（pointerdown / click ともにターゲットが modal）で閉じる', async () => {
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });

    modal.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await vi.waitFor(() => {
      expect(modal).not.toHaveAttribute('data-is-open');
      expect(modal).not.toHaveAttribute('open');
    });
  });

  it('モーダル内で pointerdown した後の余白 click では閉じない（ドラッグ誤爆防止）', async () => {
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
    const innerBtn = document.querySelector<HTMLElement>('[data-modal-close="m1"]')!;
    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });

    // モーダル内でドラッグ（テキスト選択等）を開始し、余白で離して click のターゲットが modal になったケース
    innerBtn.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();

    expect(modal.dataset.isOpen).toBe('1');
    expect(modal).toHaveAttribute('open');
  });

  it('closeDialog を経由せず閉じられた場合（form method="dialog" 等）も後始末される', async () => {
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
    setEvent(modal);

    trigger.click();
    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });

    // closeDialog() を経由しないネイティブの close()（form method="dialog" の送信相当）
    modal.close();

    await vi.waitFor(() => {
      expect(modal).not.toHaveAttribute('data-is-open');
      expect(modal).not.toHaveAttribute('open');
      expect(trigger.dataset.targetOpened).toBeUndefined();
    });
  });

  it('開いた直後（data-is-open 付与前）に閉じられた場合、次フレーム以降も data-is-open は付かない', async () => {
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
    setEvent(modal);

    // open の rAF が実行される前に、closeDialog() を経由しない close() が走るケース
    trigger.click();
    modal.close();

    // rAF を2フレーム分待って、保留中の rAF が属性を戻していないことを確認する
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    expect(modal).not.toHaveAttribute('data-is-open');
    expect(modal).not.toHaveAttribute('open');
    expect(trigger.dataset.targetOpened).toBeUndefined();
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

  it('連打防止: 同一フレーム内（data-is-open 付与前）の連続 click でも showModal は 1 回のみ', async () => {
    const modal = document.querySelector<HTMLDialogElement>('#m1')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m1"]')!;
    const showModalSpy = vi.spyOn(modal, 'showModal');
    setEvent(modal);

    trigger.click();
    trigger.click();

    expect(showModalSpy).toHaveBeenCalledTimes(1);

    await vi.waitFor(() => {
      expect(modal.dataset.isOpen).toBe('1');
    });
  });
});

describe('setEvent (早期 return ケース)', () => {
  it('id が無い modal は何もしない', () => {
    document.body.innerHTML = `<dialog class="b--modal"></dialog>`;
    const modal = document.querySelector<HTMLDialogElement>('dialog')!;

    setEvent(modal);
    expect(modal).not.toHaveAttribute('open');
  });

  it('dialog 以外の要素はサポートせず、イベントを登録しない', async () => {
    document.body.innerHTML = `
      <div id="m2" class="b--modal">
        <button data-modal-close="m2"></button>
      </div>
      <button data-modal-open="m2"></button>
    `;
    const modal = document.querySelector<HTMLElement>('#m2')!;
    const trigger = document.querySelector<HTMLElement>('[data-modal-open="m2"]')!;
    setEvent(modal);

    trigger.click();
    await Promise.resolve();

    expect(modal).not.toHaveAttribute('open');
    expect(modal.dataset.isOpen).toBeUndefined();
  });
});

describe('setModal (default export)', () => {
  it('document 内の .b--modal 全件に登録される', async () => {
    document.body.innerHTML = `
      <dialog id="m1" class="b--modal">
        <button data-modal-close="m1"></button>
      </dialog>
      <dialog id="m2" class="b--modal">
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
