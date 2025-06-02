// open 属性付与からクラスの付与まで、ほんの少しだけ遅らせた方が動作が安定する
const DELAY = 5;

// モーダルのアニメーションが完了するのを待つ.
const waitAnimation = (element) => {
	return Promise.all(element.getAnimations().map((a) => a.finished));
};

// animationTime: [ms]
const clickedEvent = async (details, force = false) => {
	// アニメーション中かどうか
	if (details.dataset.animating && !force) return;
	details.dataset.animating = '1';

	const body = details.querySelector('.d--accordion__body');

	// オープン / クローズ 処理
	if (!details.open) {
		details.open = true;
		// 少しだけ遅らせた方が動作が安定する
		setTimeout(async () => {
			details.classList.add('-opened'); // クラスの追加

			// アニメーション完了後に dataset を除去。
			await waitAnimation(body);
			delete details.dataset.animating;
		}, DELAY);
	} else if (details.open) {
		details.classList.remove('-opened'); // クラスを削除

		// アニメーション完了後に open属性 を除去。
		await waitAnimation(body);

		delete details.dataset.animating;
		details.open = false;
	}
};

const toggleEvent = (e, details) => {
	// e.preventDefault();
	// console.log('toggleEvent', e.target, e.currentTarget);

	const hasOpen = details.open;
	const hasOpenedClass = details.classList.contains('-opened');

	// open はセットされたのに -opened クラスがついてない時
	if (hasOpen && !hasOpenedClass) {
		details.classList.add('-opened');
	}
	// open は削除されたのに -opened クラスがまだついている時
	if (!hasOpen && hasOpenedClass) {
		details.classList.remove('-opened');
	}
};

export const setEvent = (currentRef) => {
	const details = currentRef;
	// トリガーが明示的に指定されていない場合は、<summary> 要素をトリガーとする
	const clickBtn =
		details.querySelector(`[data-role="trigger"]`) || details.querySelector('summary');

	if (!clickBtn) return;

	// 複数展開を許可するかどうかを、親要素の [data-accordion-multiple] でチェック.
	let allowMultiple = false;
	const parent = details.parentNode;
	if (null != parent) {
		const dataMultiple = parent.dataset.accordionMultiple;
		allowMultiple = 'disallow' !== dataMultiple;
	}

	const _clickedEvent = (e) => {
		// すぐに open 属性が切り替わらないようにする
		e.preventDefault();

		// 複数展開が禁止されている場合、（開く処理の直前で）他の開いているアイテムがあれば閉じる
		if (!allowMultiple && !details.open) {
			const openedItem = parent.querySelector(`.-opened`);
			if (null != openedItem) clickedEvent(openedItem, true);
		}

		// 自身のクリック処理
		clickedEvent(details);
	};
	const _toggleEvent = (e) => {
		toggleEvent(e, details);
	};

	// <summary> 'click' イベント
	clickBtn.addEventListener('click', _clickedEvent);

	// <details> の'toggle' イベントで、ページ内検索時にも開閉されるようにする
	details.addEventListener('toggle', _toggleEvent);

	// useEffectでアンマウントされた時にremoveEventListenerしないと2重でイベントが登録してしまう。
	return () => {
		clickBtn.removeEventListener('click', _clickedEvent);
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
