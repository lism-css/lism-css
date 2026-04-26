import type { Element } from 'hast';

/**
 * hast Element の className に指定クラスが含まれるかを判定する。
 * properties.className は string[] / string / undefined のいずれかを取りうる。
 */
export function hasClass(node: Element, cls: string): boolean {
  const c = node.properties?.className;
  if (Array.isArray(c)) return c.includes(cls);
  if (typeof c === 'string') return c.split(/\s+/).includes(cls);
  return false;
}
