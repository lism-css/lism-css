export default function enableSelectTextWithAltKeyAtLinkBox() {
	const boxes = document.querySelectorAll('.is--linkBox');

	boxes.forEach((box) => {
		let isHovering = false;
		let isAltPressed = false;
		let dragging = false;

		// pointermove等のイベントを登録する関数
		function startDragEvents() {
			if (dragging) return;
			dragging = true;
			box.classList.add('-linkoff');
			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', cleanup);
			window.addEventListener('pointercancel', cleanup);
		}

		// pointermove等のイベントを解除する関数
		function cleanup() {
			box.classList.remove('-linkoff');
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', cleanup);
			window.removeEventListener('pointercancel', cleanup);
			dragging = false;
		}

		// pointermove時の処理
		function onPointerMove(e) {
			// Altキーが離れたら即解除
			if (!e.altKey) {
				cleanup();
			}
		}

		// altKey押下時の処理
		function onKeyDown(e) {
			if (e.altKey && !isAltPressed) {
				isAltPressed = true;
				startDragEvents();
			}
		}

		// altKey離した時の処理
		function onKeyUp(e) {
			if (!e.altKey && isAltPressed) {
				isAltPressed = false;
				cleanup();
			}
		}

		// pointerenter: ホバー開始時に他のイベントを登録
		box.addEventListener('pointerenter', (e) => {
			console.log('pointerenter');
			isHovering = true;
			window.addEventListener('keydown', onKeyDown);
			window.addEventListener('keyup', onKeyUp);

			// pointerenter時点ですでにAltが押されている場合にも対応
			if (e && 'altKey' in e && e.altKey && !isAltPressed) {
				isAltPressed = true;
				startDragEvents();
			}
		});

		// pointerleave: ホバー終了
		box.addEventListener('pointerleave', () => {
			console.log('pointerleave');
			isHovering = false;
			window.removeEventListener('keydown', onKeyDown);
			window.removeEventListener('keyup', onKeyUp);
			cleanup();
			isAltPressed = false;
		});
	});
}
