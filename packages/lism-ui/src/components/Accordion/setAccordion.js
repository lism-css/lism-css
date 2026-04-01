import { waitFrame, waitAnimation, maybePauseAnimation } from '../../helper/animation';

// hidden を付け外しする時の値
let ACCORDION_HIDDEN_VALUE = 'until-found';

// アコーディオン要素から必要な要素を取得
const getAccordionElements = (accordionItem) => {
  const heading = accordionItem.querySelector('.c--accordion_heading');
  const panel = accordionItem.querySelector('.c--accordion_panel');
  return {
    heading,
    button: heading.querySelector('button'),
    panel,
    content: panel.querySelector('.c--accordion_content'),
  };
};

// 親に data-allow-multiple がついていなければ、展開中のアコーディオンを閉じる
//   Memo: 自身の除外処理はしていない( 開く動作の前に呼び出す & もし自分が含まれていても連打可能なため )
const maybeCloseOpenedItems = (accordionItem) => {
  const parent = accordionItem.parentNode;
  if (!parent) return;

  // 親の data-allow-multiple 属性の有無をチェック
  if (parent.hasAttribute('data-allow-multiple')) return;

  // 開いているアコーディオンを取得して閉じる
  parent.querySelectorAll(':scope > [data-opened]').forEach((_a) => closeAccordion(_a));
};

async function openAccordion(accordionItem) {
  const { panel, content, button } = getAccordionElements(accordionItem);

  // アニメーションがあれば一時停止
  maybePauseAnimation(panel);

  // hidden を削除
  panel.removeAttribute('hidden');

  // 1フレーム待機
  await waitFrame();

  // 次フレームで高さセット（ 目標の高さ = content の高さ ）
  accordionItem.style.setProperty('--_panel-h', `${content.offsetHeight}px`);

  // さらに1フレーム待機
  await waitFrame();

  // アニメーション開始
  accordionItem.setAttribute('data-opened', '');
  button.setAttribute('aria-expanded', 'true');

  // アニメーションを待つ
  const status = await waitAnimation(panel);

  // アニメーションが最後まで完了した時、--_panel-h削除（高さセットしたままだとリサイズできない）
  if ('canceled' !== status) {
    accordionItem.style.removeProperty('--_panel-h');
  }
}

async function closeAccordion(accordionItem) {
  const { panel, button } = getAccordionElements(accordionItem);

  // アニメーションがあれば一時停止
  maybePauseAnimation(panel);

  // 現在の高さを一旦セットする
  accordionItem.style.setProperty('--_panel-h', `${panel.offsetHeight}px`);

  // 1フレーム待機
  await waitFrame();

  // 次フレームで属性を削除
  accordionItem.removeAttribute('data-opened');
  button.setAttribute('aria-expanded', 'false');

  // 変数削除して 0px へ向けてアニメーション開始
  accordionItem.style.removeProperty('--_panel-h');

  // アニメーションを待つ
  const status = await waitAnimation(panel);

  // アニメーションが最後まで完了したら、hidden付与
  if ('canceled' !== status) {
    panel.setAttribute('hidden', ACCORDION_HIDDEN_VALUE);
  }
}

// アコーディオンのトグル処理
function toggleAccordion(accordionItem) {
  if (accordionItem.hasAttribute('data-opened')) {
    // 自身を閉じる
    closeAccordion(accordionItem);
  } else {
    // 親に data-allow-multiple がついていなければ、他のアコーディオンを閉じる
    maybeCloseOpenedItems(accordionItem);

    // 自身を開く
    openAccordion(accordionItem);
  }
}

/**
 * 個別のアコーディオンにイベントをセット（React用にクリーンアップ関数を返す）
 */
export const setEvent = (accordionItem) => {
  const { button, panel } = getAccordionElements(accordionItem);

  // until-found のオン・オフが使い分けれるように、最初に初期値を取得
  if (panel.hasAttribute('hidden')) {
    ACCORDION_HIDDEN_VALUE = panel.getAttribute('hidden');
  }

  // clickイベント登録
  const _clickEvent = (e) => {
    e.preventDefault(); // hidden="until-found" の自動付け外しを無効化
    toggleAccordion(accordionItem);
  };

  // beforematchイベント登録 (ページ検索時などはこっちが発火する)
  const _beforematchEvent = (e) => {
    e.preventDefault(); // hidden="until-found" の自動付け外しを無効化
    toggleAccordion(accordionItem);
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
  const accordionAll = document.querySelectorAll('.c--accordion_item');
  accordionAll.forEach((accordionItem) => {
    setEvent(accordionItem);
  });
};
export default setAccordion;
