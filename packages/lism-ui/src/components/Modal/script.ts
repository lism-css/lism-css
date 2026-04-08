/* Memo: この script は defer をつけて読み込む （DOMパース後に読み込まれます） */
import setModal from './setModal';

document.addEventListener('DOMContentLoaded', function () {
  setModal();
});
