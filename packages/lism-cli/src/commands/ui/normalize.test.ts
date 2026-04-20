import { describe, it, expect } from 'vitest';
import { normalizeComponentName } from './normalize';

describe('normalizeComponentName', () => {
  it('kebab-case / snake_case / camelCase / PascalCase / lowercase をすべて同じ正規形に揃える', () => {
    const expected = 'navmenu';
    expect(normalizeComponentName('nav-menu')).toBe(expected);
    expect(normalizeComponentName('nav_menu')).toBe(expected);
    expect(normalizeComponentName('navMenu')).toBe(expected);
    expect(normalizeComponentName('NavMenu')).toBe(expected);
    expect(normalizeComponentName('navmenu')).toBe(expected);
  });
});
