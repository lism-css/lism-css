let IS_ANIMATING = false;

// オープンした時のトリガー要素を記憶する（focusを戻す）
let THE_TRIGGER: HTMLElement | null = null;

// モーダルのアニメーションが完了するのを待つ.
const waitAnimation = (element: HTMLElement): Promise<Animation[]> => {
	// allSettled でもよさそう
	return Promise.all(element.getAnimations().map((a) => a.finished));
};

async function modalOpen(event: Event, modal: HTMLDialogElement): Promise<void> {
	if (IS_ANIMATING) return;

	modal.showModal();
	IS_ANIMATING = true;
	modal.dataset.isOpen = '1';

	await waitAnimation(modal);
	IS_ANIMATING = false;
}
async function modalClose(event: Event, modal: HTMLDialogElement): Promise<void> {
	if (IS_ANIMATING) return;
	delete modal.dataset.isOpen;

	await waitAnimation(modal);
	modal.close();
	IS_ANIMATING = false;
}

export function setEvent(modal: HTMLDialogElement): void {
	// modalがない、またはidがない場合は処理を終了
	if (!modal || !modal.id) return;

	// モーダルを開くトリガーと閉じるトリガーを取得
	const openTriggers: NodeListOf<HTMLElement> = document.querySelectorAll(
		`[data-modal-open="${modal.id}"]`
	);
	const closeTriggers: NodeListOf<HTMLElement> = modal.querySelectorAll('[data-modal-close]');

	// 自身にクローズイベントを追加
	modal.addEventListener('click', (event) => {
		if (event.target === modal) {
			modalClose(event, modal);
		}
	});

	// close時のイベント
	modal.addEventListener('close', (event) => {
		if (THE_TRIGGER) {
			THE_TRIGGER.focus();
			delete THE_TRIGGER.dataset.modalOpened;
			THE_TRIGGER = null;
		}
		modalClose(event, modal);
	});

	// 開くトリガーにイベントリスナーを追加
	openTriggers.forEach((trigger) => {
		trigger?.addEventListener('click', (event) => {
			THE_TRIGGER = trigger;
			THE_TRIGGER.dataset.modalOpened = '1';

			modalOpen(event, modal);
		});
	});

	// 閉じるトリガーにイベントリスナーを追加
	closeTriggers.forEach((trigger) => {
		trigger?.addEventListener('click', (event) => {
			modalClose(event, modal);
		});
	});
}

const setModal = () => {
	const modals = document.querySelectorAll('.d--modal');

	modals?.forEach((target) => {
		setEvent(target as HTMLDialogElement);
	});
};
export default setModal;
