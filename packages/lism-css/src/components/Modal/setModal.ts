// オープンした時のトリガー要素を記憶する（focusを戻す）
let THE_TRIGGER: HTMLElement | null = null;

// モーダルのアニメーションが完了するのを待つ.
const waitAnimation = async (element: HTMLElement): Promise<void> => {
	// （子要素も取得する場合は { subtree: true } を指定）
	const animations = element.getAnimations();

	if (animations.length > 0) {
		// allSettled を使うことで、キャンセルされた場合もrejectせずに完了扱いになる
		await Promise.allSettled(animations.map((a) => a.finished));
	}
};

async function modalOpen(modal: HTMLDialogElement): Promise<void> {
	// すでに open & data-is-open が付いていれば何もしない（連打防止）
	if (modal.open && modal.dataset.isOpen) return;

	// showModal() でモーダルを開く（ open 属性の付与）
	modal.showModal();

	// 次フレームで data-is-open を付与（CSS側でフェードインアニメーション開始）
	requestAnimationFrame(() => {
		modal.dataset.isOpen = '1';
	});
}
async function modalClose(modal: HTMLDialogElement): Promise<void> {
	// すでに閉じている場合は何もしない
	if (undefined === modal.dataset.isOpen) {
		return;
	}

	// data-open 属性を削除（CSS側でフェードアウトアニメーション開始）
	delete modal.dataset.isOpen;

	// アニメーション完了を待機
	await waitAnimation(modal);

	// アニメーション終了後、dialog を閉じる（open属性の削除）
	modal.close();
}

export function setEvent(modal: HTMLDialogElement): void {
	// modalがない、またはidがない場合は処理を終了
	if (!modal || !modal.id) return;

	// モーダルを開くトリガーと閉じるトリガーを取得
	const openTriggers: NodeListOf<HTMLElement> = document.querySelectorAll(`[data-modal-open="${modal.id}"]`);
	const closeTriggers: NodeListOf<HTMLElement> = modal.querySelectorAll(`[data-modal-close="${modal.id}"]`);

	// 自身にクローズイベントを追加(余白部分をクリックしても閉じるように)
	modal.addEventListener('click', (e) => {
		if (e.target === modal) {
			modalClose(modal);
		}
	});

	// closeボタンにイベント登録
	modal.addEventListener('close', (e) => {
		if (THE_TRIGGER) {
			// THE_TRIGGER.focus(); // showModal()ではフォーカス戻す必要なし

			// オープンボタンのdata属性削除
			delete THE_TRIGGER.dataset.targetOpened;
			THE_TRIGGER = null;
		}

		// モーダルを閉じる
		modalClose(modal);
	});

	// openボタンにイベント登録追加
	openTriggers.forEach((trigger) => {
		trigger?.addEventListener('click', (e) => {
			// button側にもdata属性付与
			trigger.dataset.targetOpened = '1';
			THE_TRIGGER = trigger; // close() 時にdata属性削除するために記憶

			// モーダルを開く
			modalOpen(modal);
		});
	});

	// 閉じるトリガーにイベントリスナーを追加
	closeTriggers.forEach((trigger) => {
		trigger?.addEventListener('click', (e) => {
			modalClose(modal);
		});
	});

	/**
	 * ESCキーで閉じた時もアニメーションを実行する処理
	 */
	modal.addEventListener('cancel', (e) => {
		e.preventDefault(); // デフォルトの即時 close() を防ぐ
		modalClose(modal); // 自分で用意したクローズ処理
	});
}

const setModal = () => {
	const modals = document.querySelectorAll('.d--modal');

	modals?.forEach((target) => {
		setEvent(target as HTMLDialogElement);
	});
};
export default setModal;
