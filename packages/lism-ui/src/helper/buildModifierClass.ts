type ModifierValue = string | number | undefined | null | false;

/**
 * BEM ルートクラスに対して modifier クラスを展開する純粋関数。
 *
 * buildModifierClass('b--chat', { variant: 'speak' })
 *   → 'b--chat b--chat--speak'
 * buildModifierClass('b--button', { variant: 'outline', size: 'lg' })
 *   → 'b--button b--button--outline b--button--lg'
 *
 * falsy な値（undefined / null / false / '' / 0 / NaN）の modifier はスキップする。
 * className との合成は行わないので、呼び出し側で atts() 等で結合する。
 */
export default function buildModifierClass(baseClass: string, modifiers?: Record<string, ModifierValue>): string {
  if (!baseClass) return '';
  if (!modifiers) return baseClass;

  const classes: string[] = [baseClass];
  for (const key in modifiers) {
    const value = modifiers[key];
    if (!value) continue;
    classes.push(`${baseClass}--${value}`);
  }
  return classes.join(' ');
}
