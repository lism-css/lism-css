// アニメーションが完了するのを待つ
const waitAnimation = (details) => {
	// アニメーション対象の要素を直接取得.（getAnimations({subtree: true}) は iOS Safari で動作しない場合があるので __body を直接監視）
	const body = details.querySelector('.d--accordion_body');
	const animations = body ? body.getAnimations() : [];

	// allSettled を使うことで、キャンセル時も reject せずに完了する
	return Promise.allSettled(animations.map((a) => a.finished));
};

// animationTime: [ms]
const open = async (details) => {
	// すでに開いている場合は何もしない
	if (details.open && details.hasAttribute('data-opened')) return;

	// open属性をセット
	details.open = true;

	// 次フレームで data-opened 属性を付与（CSS側でフェードインアニメーション開始）
	requestAnimationFrame(() => {
		details.setAttribute('data-opened', ''); // 属性の追加
	});
};

const close = async (details) => {
	// すでに閉じている場合は何もしない
	if (!details.open && !details.hasAttribute('data-opened')) return;

	details.removeAttribute('data-opened'); // 属性を削除

	// アニメーションを待つ
	await waitAnimation(details);

	// アニメーション完了後にopen属性 を除去。
	details.open = false;
};

// 複数展開を許可するかどうかを、親要素の [data-multiple] でチェック.
const getAllowMultiple = (details) => {
	let allowMultiple = false;
	const parent = details.parentNode;
	if (null != parent) {
		const dataMultiple = parent.dataset.multiple;
		allowMultiple = 'disallow' !== dataMultiple;
	}
	return allowMultiple;
};

const onClick = (details, allowMultiple) => {
	if (!details.open) {
		if (!allowMultiple) {
			// （複数展開が禁止されている場合）他の開いているアイテムがあるかどうかを先に探して閉じる
			const parent = details.parentNode;
			const openedItem = parent.querySelector(`[data-opened]`);
			requestAnimationFrame(() => {
				// 1フレーム待機（safariでは requestAnimationFrame() がないと動かなかった）
				if (null != openedItem) close(openedItem);
			});
		}

		// 開く処理
		open(details);
	} else if (details.open) {
		// 閉じる処理
		close(details);
	}
};

const onToggle = (details) => {
	const hasOpen = details.open;
	const hasDataOpen = details.hasAttribute('data-opened');

	// open はセットされたのに data-opened 属性がついてない時
	if (hasOpen && !hasDataOpen) {
		details.setAttribute('data-opened', '');
	}
	// open は削除されたのに data-opened 属性がまだついている時
	if (!hasOpen && hasDataOpen) {
		details.removeAttribute('data-opened');
	}
};

export const setEvent = (details) => {
	// 複数展開を制限するかどうか
	const allowMultiple = getAllowMultiple(details);

	// <summary> 要素をトリガーとする
	const summary = details.querySelector('summary');
	if (!summary) return;

	const _clickEvent = (e) => {
		// すぐに open 属性が切り替わらないようにする
		e.preventDefault();
		onClick(details, allowMultiple);
	};
	const _toggleEvent = () => {
		onToggle(details);
	};

	// <summary> 'click' イベント
	summary.addEventListener('click', _clickEvent);

	// <details> の'toggle' イベントで、ページ内検索時にも開閉されるようにする
	details.addEventListener('toggle', _toggleEvent);

	// react用
	return () => {
		// useEffect でアンマウントされた時にremoveEventListenerしないと2重でイベントが登録してしまう。
		summary.removeEventListener('click', _clickEvent);
		details.removeEventListener('toggle', _toggleEvent);
	};
};

const setAccordion = () => {
	const detailsAll = document.querySelectorAll('.d--accordion');
	detailsAll.forEach((details) => {
		setEvent(details);
	});
};
export default setAccordion;
