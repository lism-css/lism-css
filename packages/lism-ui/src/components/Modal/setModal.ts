import { waitAnimation } from '../../helper/animation';

/*
 * dialog を showModal() で開くと背景スクロールがロックされ、ページのスクロールバーが消える。
 * スクロールバーが実幅を持つ環境では、その分 viewport幅が広がってレイアウトが横にがたつく。
 * これを防ぐため、開いている dialog の数を数え、必要なときだけ html に
 * scrollbar-gutter: stable を一時適用してスクロールバー分のスペースを予約しておく。
 *
 * 複数 dialog の同時表示や連打でも復元処理が破綻しないよう、状態はモジュール単位で共有する。
 */
let scrollbarGutterLockCount = 0;
let isScrollbarGutterApplied = false;
let previousScrollbarGutter = '';

/**
 * dialog を showModal() する直前に呼ぶ。
 *   Point: 判定・適用は showModal() の前に行う。showModal() 後はスクロールがロックされて
 *          clientWidth が変わり、スクロールバーの有無を正しく判定できなくなる。
 */
const lockScrollbarGutter = (): void => {
  // 最初の dialog を開くときだけ、スクロールバーの有無を判定して適用する
  if (scrollbarGutterLockCount === 0) {
    const root = document.documentElement;
    // window幅 > html の表示幅 → スクロールバーが実幅を持っている
    if (window.innerWidth > root.clientWidth) {
      previousScrollbarGutter = root.style.scrollbarGutter; // 既存の inline style を保持して後で復元する
      root.style.scrollbarGutter = 'stable';
      isScrollbarGutterApplied = true;
    }
  }
  scrollbarGutterLockCount += 1;
};

/**
 * dialog を close() した直後に呼ぶ。
 *   Point: 復元は close() の後に行う。close() 前に戻すと、まだスクロールバーが無い状態で
 *          gutter を外すことになり、close() 直後のスクロールバー復活と二重にがたつく。
 */
const unlockScrollbarGutter = (): void => {
  if (scrollbarGutterLockCount === 0) return;
  scrollbarGutterLockCount -= 1;
  // すべての dialog が閉じたら、保持しておいた元の値へ復元する
  if (scrollbarGutterLockCount === 0 && isScrollbarGutterApplied) {
    document.documentElement.style.scrollbarGutter = previousScrollbarGutter;
    isScrollbarGutterApplied = false;
  }
};

/**
 * モーダルの開閉イベントを設定する
 */
export function setEvent(modal: HTMLElement): void {
  // modalがない、またはidがない場合は処理を終了
  if (!modal || !modal.id) return;

  const isDialog = modal instanceof HTMLDialogElement;

  // オープンした時のトリガー要素を記憶する（data属性を戻すため）
  let theTrigger: HTMLElement | null = null;

  // この dialog が scrollbar-gutter のロックに寄与しているか（lock / unlock を必ず対にして連打でもズレないようにする）
  let hasLockedScrollbarGutter = false;

  // モーダルを開くトリガーと閉じるトリガーを取得
  const openTriggers = document.querySelectorAll<HTMLElement>(`[data-modal-open="${modal.id}"]`);
  const closeTriggers = modal.querySelectorAll<HTMLElement>(`[data-modal-close="${modal.id}"]`);

  /**
   * ダイアログを開く処理
   *   Point: showModal() してから、CSSアニメーション用の data-is-open属性を付与する
   */
  const openDialog = () => {
    // すでに open & data-is-open が付いていれば何もしない（連打防止）
    if (modal.hasAttribute('open') && modal.hasAttribute('data-is-open')) return;

    // dialog 要素なら showModal()、それ以外は open 属性を付与
    if (isDialog) {
      // showModal() でスクロールバーが消える前に、必要ならスクロールバー分のスペースを予約しておく
      if (!hasLockedScrollbarGutter) {
        lockScrollbarGutter();
        hasLockedScrollbarGutter = true;
      }
      modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }

    // 次フレームで data-is-open を付与（CSS側でフェードインアニメーション開始）
    requestAnimationFrame(() => {
      modal.dataset.isOpen = '1';
    });
  };

  /**
   * ダイアログを閉じる処理
   *   Point: data-is-open属性を削除してCSSアニメーションが終わってから、close() を実行する
   */
  const closeDialog = async (): Promise<void> => {
    // すでに閉じている場合は何もしない
    if (!modal.hasAttribute('data-is-open')) {
      return;
    }

    // data-is-open 属性を削除（CSS側でフェードアウトアニメーション開始）
    modal.removeAttribute('data-is-open');

    // アニメーション完了を待機
    await waitAnimation(modal);

    // アニメーション終了後、dialog を閉じる（open属性の削除）
    if (isDialog) {
      modal.close();
    } else {
      modal.removeAttribute('open');
    }

    // close() の後に scrollbar-gutter を復元する（hasLockedScrollbarGutter は dialog のときのみ true）
    if (hasLockedScrollbarGutter) {
      unlockScrollbarGutter();
      hasLockedScrollbarGutter = false;
    }
  };

  // openボタンにイベント登録
  openTriggers.forEach((trigger) => {
    trigger?.addEventListener('click', () => {
      // button側にもdata属性付与
      trigger.dataset.targetOpened = '1';
      theTrigger = trigger; // close() 時にdata属性削除するために記憶

      // モーダルを開く
      openDialog();
    });
  });

  // closeボタンにイベント登録
  closeTriggers.forEach((trigger) => {
    trigger?.addEventListener('click', () => {
      void closeDialog();
    });
  });

  // 余白クリックで閉じる
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      void closeDialog();
    }
  });

  if (isDialog) {
    // close() 完了時にトリガーのdata属性をリセット（dialog専用イベント）
    modal.addEventListener('close', () => {
      if (theTrigger) {
        theTrigger.removeAttribute('data-target-opened');
        theTrigger = null;
      }
    });

    // ESCキーで閉じた時もアニメーションを実行する処理（dialog専用イベント）
    modal.addEventListener('cancel', (e) => {
      e.preventDefault(); // デフォルトの即時 close() を防ぐ
      void closeDialog(); // 自分で用意したクローズ処理
    });
  }
}

const setModal = () => {
  const modals = document.querySelectorAll('.c--modal');
  modals?.forEach((target) => {
    setEvent(target as HTMLElement);
  });
};
export default setModal;
