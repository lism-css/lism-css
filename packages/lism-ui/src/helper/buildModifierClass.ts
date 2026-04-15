type ModifierValue = string | number | undefined | null | false;

/**
 * BEM ルートクラスに対して modifier クラスを展開する純粋関数。
 *
 * buildModifierClass('c--chat', { variant: 'speak' })
 *   → 'c--chat c--chat--speak'
 * buildModifierClass('c--button', { variant: 'outline', size: 'lg' })
 *   → 'c--button c--button--outline c--button--lg'
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
