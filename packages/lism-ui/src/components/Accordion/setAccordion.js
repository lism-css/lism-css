// 1フレーム待機
export const waitFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

// パネルのアニメーションが完了するのを待つ（アニメーションステータスを文字列で返す）
export const waitAnimation = async (panel) => {
	const animations = panel.getAnimations();

	// アニメーションがなければ 'finished' を返す
	if (animations.length === 0) return 'finished';

	// allSettled を使うことで、キャンセル時も例外にならずに結果を取得できる
	const results = await Promise.allSettled(animations.map((a) => a.finished));

	// （ pause()で止めた時用 ）rejected があれば 'canceled'
	return results.every((r) => r.status === 'fulfilled') ? 'finished' : 'canceled';
};

// 実行中のアニメーションがあれば一旦停止させる
export const maybePauseAnimation = (panel) => {
	const animations = panel.getAnimations();
	if (animations.length === 0) return;
	animations.forEach((a) => a.pause());
};

// hidden を付け外しする時の値
let ACCORDION_HIDDEN_VALUE = 'until-found';

// アコーディオン要素から必要な要素を取得
const getAccordionElements = (accordion) => {
	const heading = accordion.querySelector('.c--accordion_heading');
	const panel = accordion.querySelector('.c--accordion_panel');
	return {
		heading,
		button: heading.querySelector('button'),
		panel,
		content: panel.querySelector('.c--accordion_content'),
	};
};

// 親に data-allow-multiple がついていなければ、展開中のアコーディオンを閉じる
//   Memo: 自身の除外処理はしていない( 開く動作の前に呼び出す & もし自分が含まれていても連打可能なため )
const maybeCloseOpenedItems = (accordion) => {
	const parent = accordion.parentNode;
	if (!parent) return;

	// 親の data-allow-multiple 属性の有無をチェック
	if (parent.hasAttribute('data-allow-multiple')) return;

	// 開いているアコーディオンを取得して閉じる
	parent.querySelectorAll(':scope > [data-opened]').forEach((_a) => closeAccordion(_a));
};

async function openAccordion(accordion) {
	const { panel, content, button } = getAccordionElements(accordion);

	// アニメーションがあれば一時停止
	maybePauseAnimation(panel);

	// hidden を削除
	panel.removeAttribute('hidden');

	// 1フレーム待機
	await waitFrame();

	// 次フレームで高さセット（ 目標の高さ = content の高さ ）
	panel.style.setProperty('--height--opened', `${content.offsetHeight}px`);

	// さらに1フレーム待機
	await waitFrame();

	// アニメーション開始
	accordion.setAttribute('data-opened', '');
	button.setAttribute('aria-expanded', 'true');

	// アニメーションを待つ
	const status = await waitAnimation(panel);

	// アニメーションが最後まで完了した時、--height--opened削除（高さセットしたままだとリサイズできない）
	if ('finished' === status) {
		panel.style.removeProperty('--height--opened');
	}
}

async function closeAccordion(accordion) {
	const { panel, button } = getAccordionElements(accordion);

	// アニメーションがあれば一時停止
	maybePauseAnimation(panel);

	// 現在の高さをセットする
	panel.style.setProperty('--height--opened', `${panel.offsetHeight}px`);

	// 1フレーム待機
	await waitFrame();

	// 次フレームで属性を削除してアニメーション開始
	accordion.removeAttribute('data-opened');
	button.setAttribute('aria-expanded', 'false');

	// アニメーションを待つ
	const status = await waitAnimation(panel);

	// アニメーションが最後まで完了した時、hidden付与 & --height--opened削除
	if ('finished' === status) {
		panel.setAttribute('hidden', ACCORDION_HIDDEN_VALUE);
		panel.style.removeProperty('--height--opened');
	}
}

// アコーディオンのトグル処理
function toggleAccordion(accordion) {
	if (accordion.hasAttribute('data-opened')) {
		// 自身を閉じる
		closeAccordion(accordion);
	} else {
		// 親に data-allow-multiple がついていなければ、他のアコーディオンを閉じる
		maybeCloseOpenedItems(accordion);

		// 自身を開く
		openAccordion(accordion);
	}
}

/**
 * 個別のアコーディオンにイベントをセット（React用にクリーンアップ関数を返す）
 */
export const setEvent = (accordion) => {
	const { button, panel } = getAccordionElements(accordion);

	// until-found のオン・オフが使い分けれるように、最初に初期値を取得
	if (panel.hasAttribute('hidden')) {
		ACCORDION_HIDDEN_VALUE = panel.getAttribute('hidden');
	}

	// clickイベント登録
	const _clickEvent = (e) => {
		e.preventDefault(); // hidden="until-found" の自動付け外しを無効化
		toggleAccordion(accordion);
	};

	// beforematchイベント登録 (ページ検索時などはこっちが発火する)
	const _beforematchEvent = (e) => {
		e.preventDefault(); // hidden="until-found" の自動付け外しを無効化
		toggleAccordion(accordion);
	};

	button.addEventListener('click', _clickEvent);
	panel.addEventListener('beforematch', _beforematchEvent);

	// react用: useEffect でアンマウントされた時にremoveEventListenerしないと2重でイベントが登録してしまう
	return () => {
		button.removeEventListener('click', _clickEvent);
		panel.removeEventListener('beforematch', _beforematchEvent);
	};
};

/**
 * ページ内の全アコーディオンにイベントをセット（Astro用）
 */
const setAccordion = () => {
	const accordionAll = document.querySelectorAll('.c--accordion');
	accordionAll.forEach((accordion) => {
		setEvent(accordion);
	});
};
export default setAccordion;
