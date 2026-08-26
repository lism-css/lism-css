/**
 * タブのキーボード操作 → 移動先インデックスの解決
 *
 * WAI-ARIA APG に合わせ、tablist の向きに対応する矢印キーだけを拾う。
 * 水平（既定）で上下キーを拾わないのは、ブラウザ本来のスクロールを妨げないため。
 *
 * memo: tablist の aria-orientation の既定値は horizontal。
 * 縦並びにする場合は listProps 経由で aria-orientation="vertical" を指定してもらう。
 * （CSSでレスポンシブに縦横が切り替わる場合は属性で表現できないため、既定の水平のまま使う）
 */

export type TabOrientation = 'horizontal' | 'vertical';

/** aria-orientation の値を解決する（未指定・不正値は既定の horizontal） */
export function toTabOrientation(value: string | null | undefined): TabOrientation {
  return 'vertical' === value ? 'vertical' : 'horizontal';
}

/**
 * @param key         KeyboardEvent.key
 * @param current     現在のインデックス（1始まり）
 * @param count       タブの総数
 * @param orientation tablist の向き
 * @returns 移動先のインデックス（1始まり）。対象外のキーなら null
 */
export function resolveTabNavKey(key: string, current: number, count: number, orientation: TabOrientation = 'horizontal'): number | null {
  if (count < 1) return null;

  const [prevKey, nextKey] = 'vertical' === orientation ? ['ArrowUp', 'ArrowDown'] : ['ArrowLeft', 'ArrowRight'];

  if (key === nextKey) return current >= count ? 1 : current + 1;
  if (key === prevKey) return current <= 1 ? count : current - 1;
  if ('Home' === key) return 1;
  if ('End' === key) return count;

  return null;
}
