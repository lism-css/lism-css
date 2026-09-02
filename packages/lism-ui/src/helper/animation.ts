type AnimationStatus = 'none' | 'finished' | 'canceled';

export const waitFrame = (): Promise<number> => new Promise((resolve) => requestAnimationFrame(resolve));

/**
 * 要素で実行中のWeb Animationがすべて完了するまで待つ。
 *
 *   - 'none': アニメーションが実行されていなかった
 *   - 'finished': すべてのアニメーションが正常に完了
 *   - 'canceled': pause() 等でキャンセルされたアニメーションがあった
 */
export const waitAnimation = async (el: HTMLElement): Promise<AnimationStatus> => {
  const animations = el.getAnimations();

  if (animations.length === 0) return 'none';

  // allSettled を使うことで、キャンセル時も例外にならずに結果を取得できる
  const results = await Promise.allSettled(animations.map((a) => a.finished));

  return results.every((r) => r.status === 'fulfilled') ? 'finished' : 'canceled';
};

export const maybePauseAnimation = (el: HTMLElement): void => {
  const animations = el.getAnimations();
  if (animations.length === 0) return;
  animations.forEach((a) => a.pause());
};
