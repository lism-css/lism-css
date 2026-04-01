// アニメーション完了時のステータス
type AnimationStatus = 'none' | 'finished' | 'canceled';

/**
 * 1フレーム待機する（requestAnimationFrame のPromiseラッパー）
 */
export const waitFrame = (): Promise<number> => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * 要素のアニメーションが完了するのを待つ
 * @returns アニメーションの結果ステータス
 *   - 'none': アニメーションが実行されていなかった
 *   - 'finished': すべてのアニメーションが正常に完了
 *   - 'canceled': pause() 等でキャンセルされたアニメーションがあった
 */
export const waitAnimation = async (el: HTMLElement): Promise<AnimationStatus> => {
  const animations = el.getAnimations();

  // アニメーションがなければ 'none' を返す
  if (animations.length === 0) return 'none';

  // allSettled を使うことで、キャンセル時も例外にならずに結果を取得できる
  const results = await Promise.allSettled(animations.map((a) => a.finished));

  // （ pause()で止めた時用 ）rejected があれば 'canceled'
  return results.every((r) => r.status === 'fulfilled') ? 'finished' : 'canceled';
};

/**
 * 実行中のアニメーションがあれば一旦停止させる
 */
export const maybePauseAnimation = (el: HTMLElement): void => {
  const animations = el.getAnimations();
  if (animations.length === 0) return;
  animations.forEach((a) => a.pause());
};
