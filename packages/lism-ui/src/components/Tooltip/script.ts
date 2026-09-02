/* Memo: この script は defer をつけて読み込む （DOMパース後に読み込まれます） */
import setTooltip from './setTooltip';

document.addEventListener('DOMContentLoaded', function () {
  setTooltip();
});
