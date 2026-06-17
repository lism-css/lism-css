import { describe, test, expect } from 'vitest';
import { extractLismClasses } from './extract';

describe('extractLismClasses', () => {
  test('プレフィックス系クラスを抽出する', () => {
    const set = extractLismClasses('<div class="l--stack c--card is--container has--gutter set--plain u--trim a--icon">');
    expect(set.has('l--stack')).toBe(true);
    expect(set.has('c--card')).toBe(true);
    expect(set.has('is--container')).toBe(true);
    expect(set.has('has--gutter')).toBe(true);
    expect(set.has('set--plain')).toBe(true);
    expect(set.has('u--trim')).toBe(true);
    expect(set.has('a--icon')).toBe(true);
  });

  test('Property Class を抽出する（基本形）', () => {
    const set = extractLismClasses('<div class="-p:20 -fz:l -bgc:base-2 -d:none">');
    expect(set.has('-p:20')).toBe(true);
    expect(set.has('-fz:l')).toBe(true);
    expect(set.has('-bgc:base-2')).toBe(true);
    expect(set.has('-d:none')).toBe(true);
  });

  test('Property Class（プロパティのみ）と breakpoint suffix を抽出する', () => {
    const set = extractLismClasses('<div class="-p -p_sm -g_md">');
    expect(set.has('-p')).toBe(true);
    expect(set.has('-p_sm')).toBe(true);
    expect(set.has('-g_md')).toBe(true);
  });

  test('modifier + Property Class 合成（-hov:-c など）を抽出する', () => {
    const set = extractLismClasses('<div class="-hov:-c -hov:-bgc">');
    expect(set.has('-hov:-c')).toBe(true);
    expect(set.has('-hov:-bgc')).toBe(true);
  });

  test('スラッシュ / パーセント / ドットなど特殊文字を含む値を抽出する', () => {
    const set = extractLismClasses('<div class="-ar:21/9 -t:50% -bdrs:0">');
    expect(set.has('-ar:21/9')).toBe(true);
    expect(set.has('-t:50%')).toBe(true);
    expect(set.has('-bdrs:0')).toBe(true);
  });

  test('JS テキスト中のクラス連結も抽出できる', () => {
    const src = `const cls = ['-p:20', '-fz:l', active ? '-d:none' : 'l--stack'].join(' ');`;
    const set = extractLismClasses(src);
    expect(set.has('-p:20')).toBe(true);
    expect(set.has('-fz:l')).toBe(true);
    expect(set.has('-d:none')).toBe(true);
    expect(set.has('l--stack')).toBe(true);
  });

  test('単語の途中のハイフンは Lism クラスとして誤検出しない', () => {
    const set = extractLismClasses('<a href="foo-bar/baz" data-test="hello-world">');
    expect(set.has('-bar')).toBe(false);
    expect(set.has('-world')).toBe(false);
  });

  test('空文字列に対しては空 Set を返す', () => {
    expect(extractLismClasses('').size).toBe(0);
  });
});
