import { describe, test, expect } from 'vitest';
import { extractKnownLismSelectors, purgeLismCss } from './core';

const used = (...classes: string[]) => new Set(classes);

describe('purgeLismCss', () => {
  test('未使用のクラスルールは削除し、使用中のものは残す', () => {
    const css = `.-p\\:20{padding:var(--s20)}.-m\\:10{margin:var(--s10)}`;
    const out = purgeLismCss(css, { used: used('-p:20') });
    expect(out).toContain('-p\\:20');
    expect(out).not.toContain('-m\\:10');
  });

  test(':root / html / body / 要素セレクタは残す', () => {
    const css = `:root{--c:red}html{font-size:16px}body{margin:0}h1{font-weight:700}`;
    const out = purgeLismCss(css, { used: used() });
    expect(out).toContain(':root');
    expect(out).toContain('html');
    expect(out).toContain('body');
    expect(out).toContain('h1');
  });

  test('@property は中身を保持して残す', () => {
    const css = `@property --p{syntax:"*";inherits:false;initial-value:0}.-p\\:20{padding:var(--p)}`;
    const out = purgeLismCss(css, { used: used() });
    expect(out).toContain('@property --p');
    expect(out).not.toContain('-p\\:20');
  });

  test('@container 内の使用中レスポンシブクラスは保持する', () => {
    const css = `@container (min-width: 480px){.-p_sm{padding:var(--p)}.-m_sm{margin:var(--m)}}`;
    const out = purgeLismCss(css, { used: used('-p_sm') });
    expect(out).toContain('@container');
    expect(out).toContain('-p_sm');
    expect(out).not.toContain('-m_sm');
  });

  test('@container の中身がすべて未使用なら @container ごと削除する', () => {
    const css = `@container (min-width: 480px){.-p_sm{padding:var(--p)}.-m_sm{margin:var(--m)}}`;
    const out = purgeLismCss(css, { used: used() });
    expect(out).not.toContain('@container');
    expect(out).not.toContain('-p_sm');
  });

  test('@media (any-hover:hover) 内の -hov:-c が保持される', () => {
    const css = `@media (any-hover:hover){.-hov\\:-c:hover{color:var(--hov-c)}.-hov\\:-bgc:hover{background-color:var(--hov-bgc)}}`;
    const out = purgeLismCss(css, { used: used('-hov:-c') });
    expect(out).toContain('@media (any-hover:hover)');
    expect(out).toContain('-hov\\:-c');
    expect(out).not.toContain('-hov\\:-bgc');
  });

  test('safelist にマッチするクラスは used に含まれていなくても保持される', () => {
    const css = `.-d_sm{display:var(--d_sm)}.-m\\:10{margin:var(--s10)}`;
    const out = purgeLismCss(css, {
      used: used(),
      safelist: ['-d_sm', /^-m:/],
    });
    expect(out).toContain('-d_sm');
    expect(out).toContain('-m\\:10');
  });

  test('属性セレクタ [class*="-p:"] は -p:xxx が使われていれば保持される', () => {
    const css = `.-p,[class*="-p:"]{padding:var(--p)}`;
    const outWith = purgeLismCss(css, { used: used('-p:20') });
    expect(outWith).toContain('[class*="-p:"]');

    const outWithout = purgeLismCss(css, { used: used() });
    expect(outWithout).not.toContain('[class*="-p:"]');
  });

  test('-p 単独が使われていれば .-p セレクタは保持される', () => {
    const css = `.-p,[class*="-p:"]{padding:var(--p)}`;
    const out = purgeLismCss(css, { used: used('-p') });
    expect(out).toContain('.-p');
  });

  test('セレクタリスト中の一部だけ keep される', () => {
    const css = `.-p\\:20,.-m\\:10{padding:var(--s20)}`;
    const out = purgeLismCss(css, { used: used('-p:20') });
    expect(out).toContain('-p\\:20');
    expect(out).not.toContain('-m\\:10');
  });

  test('@layer 内のルールも再帰処理される', () => {
    const css = `@layer lism-base{.set--plain{display:block}.set--unused{color:red}}`;
    const out = purgeLismCss(css, { used: used('set--plain') });
    expect(out).toContain('@layer lism-base');
    expect(out).toContain('set--plain');
    expect(out).not.toContain('set--unused');
  });

  test('複合セレクタは全クラスが used でなければ削除される', () => {
    const css = `.has--gutter > .-max-sz\\:full{inline-size:auto}`;
    const outBoth = purgeLismCss(css, { used: used('has--gutter', '-max-sz:full') });
    expect(outBoth).toContain('has--gutter');

    const outOne = purgeLismCss(css, { used: used('has--gutter') });
    expect(outOne).not.toContain('has--gutter');
  });

  test(':where() 内のセレクタリストは OR 条件として扱う', () => {
    const css = `:where(.-bd,[class*=" -bd-"],[class^="-bd-"]){--bds:solid;--bdw:1px}`;
    const out = purgeLismCss(css, { used: used('-bd-b') });
    expect(out).toContain(':where');
    expect(out).toContain('--bds:solid');
  });

  test('先頭スペース付きの class 属性セレクタも class token と照合する', () => {
    const css = `.-bd,[class*=" -bd-"],[class^="-bd-"]{--bds:solid;--bdw:1px}`;
    const out = purgeLismCss(css, { used: used('-bd-b') });
    expect(out).toContain('[class*=" -bd-"]');
    expect(out).toContain('[class^="-bd-"]');
    expect(out).toContain('--bds:solid');
  });

  test(':is() 内のセレクタリストは OR 条件として扱う', () => {
    const css = `:is(.set--plain,.set--revert){font:inherit}`;
    const out = purgeLismCss(css, { used: used('set--revert') });
    expect(out).toContain(':is');
    expect(out).toContain('font:inherit');
  });

  test('Lism 以外のカスタムクラスセレクタは保持する', () => {
    const css = `.z--minimal-headerNav_subMenu{visibility:hidden;opacity:0}`;
    const out = purgeLismCss(css, { used: used() });
    expect(out).toContain('z--minimal-headerNav_subMenu');
    expect(out).toContain('visibility:hidden');
  });

  test('カスタムクラスを含む複合セレクタは保持する', () => {
    const css = `.z--minimal-headerNav:has(.z--minimal-headerNav_subMenuButton:hover,.z--minimal-headerNav_subMenu:hover) .z--minimal-headerNav_subMenu{visibility:visible}`;
    const out = purgeLismCss(css, { used: used() });
    expect(out).toContain('z--minimal-headerNav:has');
    expect(out).toContain('visibility:visible');
  });

  test('known に含まれない Lism 風のユーザー定義クラスは保持する', () => {
    const known = extractKnownLismSelectors(`.l--stack{display:flex}[class*=" -bd-"]{--bds:solid}`);
    const css = `.l--stack{display:flex}.l--userLayout{display:grid}[class*=" -bd-"]{--bds:solid}`;
    const out = purgeLismCss(css, { used: used(), known });
    expect(out).not.toContain('.l--stack');
    expect(out).toContain('.l--userLayout');
    expect(out).not.toContain('[class*=" -bd-"]');
  });
});
