import { waitAnimation } from '../../helper/animation';

/**
 * モーダルの開閉イベントを設定する
 */
export function setEvent(modal: HTMLDialogElement): void {
	// modalがない、またはidがない場合は処理を終了
	if (!modal || !modal.id) return;

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
		// すでに open & data-is-open が付いていれば何もしない（連打防止）
		if (modal.open && modal.hasAttribute('data-is-open')) return;

		// showModal() でモーダルを開く（ open 属性の付与）
		modal.showModal();

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
		modal.close();
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

	// close() 完了時にトリガーのdata属性をリセット
	modal.addEventListener('close', () => {
		if (theTrigger) {
			theTrigger.removeAttribute('data-target-opened');
			theTrigger = null;
		}
	});

	/**
	 * ESCキーで閉じた時もアニメーションを実行する処理
	 */
	modal.addEventListener('cancel', (e) => {
		e.preventDefault(); // デフォルトの即時 close() を防ぐ
		void closeDialog(); // 自分で用意したクローズ処理
	});
}

const setModal = () => {
	const modals = document.querySelectorAll('.c--modal');
	modals?.forEach((target) => {
		setEvent(target as HTMLDialogElement);
	});
};
export default setModal;
