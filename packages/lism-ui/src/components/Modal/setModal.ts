import { waitAnimation } from '../../helper/animation';

/*
 * dialog を showModal() で開くと背景スクロールがロックされ、ページのスクロールバーが消える。
 * スクロールバーが実幅を持つ環境では、その幅分 viewport が広がってレイアウトが横にがたつく。
 * これを防ぐため、開いている間だけ html に scrollbar-gutter: stable を当ててスクロールバー幅を予約する。
 * Modal は同時に1つだけ開く前提なので、状態は「適用前の値」1つだけ保持する（null = 未適用）。
 */
let savedScrollbarGutter: string | null = null;

/**
 * dialog を showModal() する直前に呼ぶ。
 *   Point: 判定・適用は showModal() の前に行う。showModal() 後はスクロールがロックされて
 *          clientWidth が変わり、スクロールバーの有無を正しく判定できなくなる。
 */
const lockScrollbarGutter = (): void => {
  if (savedScrollbarGutter !== null) return; // すでに適用中
  const root = document.documentElement;
  // window幅 > html の表示幅 → スクロールバーが実幅を持っている場合だけ適用する
  if (window.innerWidth > root.clientWidth) {
    savedScrollbarGutter = root.style.scrollbarGutter; // 元の inline style を保持して後で復元する
    root.style.scrollbarGutter = 'stable';
  }
};

/**
 * dialog を close() した直後に呼ぶ。
 *   Point: 復元は close() の後に行う。close() 前に戻すと、まだスクロールバーが無い状態で
 *          gutter を外すことになり、close() 直後のスクロールバー復活と二重にがたつく。
 */
const unlockScrollbarGutter = (): void => {
  if (savedScrollbarGutter === null) return; // 未適用なら何もしない
  document.documentElement.style.scrollbarGutter = savedScrollbarGutter;
  savedScrollbarGutter = null;
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

  // モーダルを開くトリガーと閉じるトリガーを取得
  const openTriggers = document.querySelectorAll<HTMLElement>(`[data-modal-open="${modal.id}"]`);
  const closeTriggers = modal.querySelectorAll<HTMLElement>(`[data-modal-close="${modal.id}"]`);

  /**
   * ダイアログを開く処理
   *   Point: showModal() してから、CSSアニメーション用の data-is-open属性を付与する
   */
  const openDialog = () => {
    // すでに open が付いていれば何もしない（連打防止）。
    // data-is-open は rAF で1フレーム遅れて付与されるため、条件に含めると
    // その間の連打で showModal() が二重に呼ばれてしまう（dialog では InvalidStateError になる）
    if (modal.hasAttribute('open')) return;

    // dialog 要素なら showModal()、それ以外は open 属性を付与
    if (isDialog) {
      lockScrollbarGutter(); // showModal() でスクロールバーが消える前にスクロールバー幅を予約する
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
      unlockScrollbarGutter(); // close() の後に scrollbar-gutter を復元する
    } else {
      modal.removeAttribute('open');
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
