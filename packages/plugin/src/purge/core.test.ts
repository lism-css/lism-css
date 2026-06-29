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

  test('safelist 文字列で保持された Property Class に対応する属性セレクタも保持される', () => {
    const css = `.-p,[class*="-p:"]{padding:var(--p)}`;
    const out = purgeLismCss(css, { used: used(), safelist: ['-p:20'] });
    expect(out).toContain('[class*="-p:"]');
    expect(out).toContain('padding');
  });

  test('safelist に RegExp/function があれば属性セレクタは保守的に保持される', () => {
    const css = `.-p,[class*="-p:"]{padding:var(--p)}`;
    const outRe = purgeLismCss(css, { used: used(), safelist: [/^-p:/] });
    expect(outRe).toContain('[class*="-p:"]');

    const outFn = purgeLismCss(css, { used: used(), safelist: [(c: string) => c.startsWith('-p:')] });
    expect(outFn).toContain('[class*="-p:"]');
  });

  test(':not(.lism-class) 内のクラスは制約から除外される（実 main.css の .l--withSide>:not(.is--side) 相当）', () => {
    const css = `.l--withSide>:not(.is--side){flex-basis:min(100%,var(--mainW))}`;
    // is--side が used に含まれない場合でも、l--withSide が used にあればルールは保持される
    const out = purgeLismCss(css, { used: used('l--withSide') });
    expect(out).toContain('.l--withSide>:not(.is--side)');
    expect(out).toContain('flex-basis');
  });

  test(':has(.lism-class) 内のクラスは制約から除外される', () => {
    const css = `.l--stack:has(.-hov\\:-c){gap:var(--g)}`;
    const out = purgeLismCss(css, { used: used('l--stack') });
    expect(out).toContain('.l--stack:has');
    expect(out).toContain('gap');
  });

  test('global フラグ付き RegExp safelist でも毎回マッチ判定が安定する', () => {
    const css = `.-d_sm{display:var(--d_sm)}.-m\\:10{margin:var(--s10)}`;
    const safelist = [/-d_sm|-m:10/g];
    // 同じ RegExp インスタンスを 2 回連続で渡しても結果が変わらない（lastIndex の影響を受けない）
    const out1 = purgeLismCss(css, { used: used(), safelist });
    const out2 = purgeLismCss(css, { used: used(), safelist });
    expect(out1).toContain('-d_sm');
    expect(out1).toContain('-m\\:10');
    expect(out2).toBe(out1);
  });

  test('sticky フラグ付き RegExp safelist でも判定が安定する', () => {
    const css = `.-d_sm{display:var(--d_sm)}`;
    const re = /-d_sm/y;
    // 同じ RegExp を再利用しても lastIndex の前進で結果が崩れない
    const out1 = purgeLismCss(css, { used: used(), safelist: [re] });
    const out2 = purgeLismCss(css, { used: used(), safelist: [re] });
    expect(out1).toContain('-d_sm');
    expect(out2).toBe(out1);
  });

  test('トップレベルのコメントは保持される', () => {
    const css = `/*! lism-css banner */\n.-p\\:20{padding:var(--s20)}`;
    const out = purgeLismCss(css, { used: used('-p:20') });
    expect(out).toContain('/*! lism-css banner */');
    expect(out).toContain('-p\\:20');
  });

  test('変更がなければ原文をそのまま返す（writeback skip 可能）', () => {
    const css = `.-p\\:20{padding:var(--s20)}\n.-m\\:10{margin:var(--s10)}`;
    const out = purgeLismCss(css, { used: used('-p:20', '-m:10') });
    expect(out).toBe(css);
  });

  test('@layer 内のみ削除があった場合は changed として再シリアライズされる', () => {
    const css = `@layer lism-base{.set--plain{display:block}.set--unused{color:red}}`;
    const out = purgeLismCss(css, { used: used('set--plain') });
    expect(out).not.toBe(css);
    expect(out).toContain('set--plain');
    expect(out).not.toContain('set--unused');
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
