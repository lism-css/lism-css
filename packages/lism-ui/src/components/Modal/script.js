/* Memo: この script は defer をつけて読み込む （DOMパース後に読み込まれます） */
import setModal from './setModal.ts';

document.addEventListener('DOMContentLoaded', function () {
	setModal();
});
