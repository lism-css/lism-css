/**
 * タブ
 */
function tabControl(e) {
	e.preventDefault();

	// クリックされたボタン要素
	const clickedButton = e.currentTarget;

	// クリックイベントがキー（Enter / space）によって呼び出されたかどうか
	// const iskeyClick = 0 === e.clientX;

	// マウスクリック時はフォーカスを外す
	// if (!iskeyClick) {
	// 	clickedButton.blur();
	// }

	// 属性の切り替え
	toggleAriaData(clickedButton);
}

const toggleAriaData = (clickedButton) => {
	// すでにオープンされているタブの場合はなにもしない
	const isOpend = 'true' === clickedButton.getAttribute('aria-selected');
	if (isOpend) return;

	// 新しく表示するBodyを取得
	const targetID = clickedButton.getAttribute('aria-controls');
	const targetBody = document.getElementById(targetID);
	if (null === targetBody) return;

	// 親のタブリスト(ul)を取得
	const parentTabList = clickedButton.parentNode.parentNode;

	// 現在選択中のタブボタンを取得
	const selectedButton = parentTabList.querySelector('[aria-selected="true"]');

	// 展開中のBodyを取得
	const displayedID = selectedButton.getAttribute('aria-controls');
	const displayedBody = document.getElementById(displayedID);

	// ariaの処理
	clickedButton.setAttribute('aria-selected', 'true');
	selectedButton.setAttribute('aria-selected', 'false');
	displayedBody.setAttribute('aria-hidden', 'true');
	targetBody.setAttribute('aria-hidden', 'false');
};

function setEvent(tabs) {
	const tabBtns = tabs.querySelectorAll('button[role="tab"]');
	tabBtns.forEach((tabBtn) => {
		tabBtn.addEventListener('click', function (e) {
			tabControl(e);
		});
	});

	// タブへのリンクがあるかどうか
	const nowUrl = window?.location?.href;
	if (!nowUrl) return;

	const hasTabLink = -1 !== nowUrl.indexOf('?lism-tab=');
	if (!hasTabLink) return;

	// URLでタブを切り替える機能がONかどうか

	// URLSearchParamsオブジェクトを取得
	const url = new URL(nowUrl);
	const params = url.searchParams;

	// getメソッド
	const targetTabId = params.get('lism-tab');
	const target = tabs.querySelector(`[aria-controls="${targetTabId}"]`);
	if (target) {
		// transitionをオフにするための属性
		tabs.dataset.hasTabLink = '1';

		// タブ切り替え
		toggleAriaData(target);

		// 少し後で属性削除
		setTimeout(() => {
			delete tabs.dataset.hasTabLink;
		}, 10);
	}
}

export default setEvent;
