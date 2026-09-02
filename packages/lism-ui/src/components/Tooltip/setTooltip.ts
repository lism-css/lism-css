/*
 * Tooltip の表示制御はCSS（:hover / :focus-visible）が担当し、JSは「Escで閉じた」状態だけを扱う。
 * ホバー中はフォーカスが body にあるためルート要素の keydown では拾えず、リスナーは document に置く必要がある。
 * そのため document へ1回だけ登録する委譲リスナー（永続シングルトン）にしている。
 */

const ROOT_SELECTOR = '.b--tooltip';
const DISMISSED_ATTR = 'data-dismissed';

let isRegistered = false;

/** Escで全ルートに「閉じた」印を付ける */
const onKeydown = (e: KeyboardEvent): void => {
  if (e.key !== 'Escape') return;
  document.querySelectorAll(ROOT_SELECTOR).forEach((root) => {
    root.setAttribute(DISMISSED_ATTR, '');
  });
};

/**
 * ポインタが入り直したルートの印を外す。
 *   Point: pointerenter はバブルしないため、capture フェーズで document を通過する時に拾う。
 *          このフェーズでは e.target が実際にポインタの入った要素そのものになる。
 */
const onPointerEnter = (e: Event): void => {
  const target = e.target;
  if (!(target instanceof Element)) return;
  if (!target.matches(ROOT_SELECTOR)) return;
  target.removeAttribute(DISMISSED_ATTR);
};

/** フォーカスが入ったルートの印を外す */
const onFocusIn = (e: Event): void => {
  const target = e.target;
  if (!(target instanceof Element)) return;
  target.closest(ROOT_SELECTOR)?.removeAttribute(DISMISSED_ATTR);
};

/**
 * Tooltip の Esc クローズ用リスナーを document へ登録する。
 * 何度呼んでも登録は1回きり（React の StrictMode や複数 Root の同時マウントを吸収する）。
 * 戻り値を void にしているのは、React の effect cleanup へ誤って渡されても何も起きないようにするため。
 */
export function setTooltip(): void {
  if (isRegistered) return;
  isRegistered = true;

  document.addEventListener('keydown', onKeydown);
  document.addEventListener('pointerenter', onPointerEnter, true);
  document.addEventListener('focusin', onFocusIn);
}

/**
 * 登録済みリスナーを解除する。
 * テストのリセット専用。コンポーネントからは呼ばない（Root を1つ unmount しただけで
 * 残りの Tooltip の Esc が効かなくなるため）。
 */
export function unsetTooltip(): void {
  if (!isRegistered) return;
  isRegistered = false;

  document.removeEventListener('keydown', onKeydown);
  document.removeEventListener('pointerenter', onPointerEnter, true);
  document.removeEventListener('focusin', onFocusIn);
}

export default setTooltip;
