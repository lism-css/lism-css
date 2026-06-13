import { describe, expectTypeOf, it } from 'vitest';
import type { Responsive, ResponsiveFor, MakeResponsive } from './ResponsiveProps';

// ============================================================
// Responsive（公開型）: デフォルト広告は base / sm / md / lg のみ。
// xl / xs は LismBreakpointRegistry を declare global で拡張したときだけ解禁される。
// （このファイルでは augmentation を行わないため、常にデフォルト広告で検証している）
// ============================================================

describe('Responsive（デフォルト広告: base/sm/md/lg）', () => {
  it('単一値を受け付ける', () => {
    const value: Responsive<'s' | 'm' | 'l'> = 'm';
    expectTypeOf(value).toExtend<Responsive<'s' | 'm' | 'l'>>();
  });

  it('配列形式を受け付ける', () => {
    const value: Responsive<'s' | 'm' | 'l'> = ['s', 'm', 'l'];
    expectTypeOf(value).toExtend<Responsive<'s' | 'm' | 'l'>>();
  });

  it('ブレイクポイントオブジェクトを受け付ける', () => {
    const value: Responsive<'s' | 'm' | 'l'> = { base: 's', md: 'l' };
    expectTypeOf(value).toExtend<Responsive<'s' | 'm' | 'l'>>();
  });

  it('デフォルトで使えるブレイクポイントキーは base/sm/md/lg', () => {
    const value: Responsive<string> = {
      base: 'base-value',
      sm: 'sm-value',
      md: 'md-value',
      lg: 'lg-value',
    };
    expectTypeOf(value).toExtend<Responsive<string>>();
  });

  it('xl オブジェクトキーはデフォルトでは許可されない（要 LismBreakpointRegistry 拡張）', () => {
    // @ts-expect-error xl はデフォルト広告に含まれない
    const value: Responsive<string> = { base: 'a', xl: 'b' };
    expectTypeOf(value).toExtend<Responsive<string>>();
  });

  it('xs オブジェクトキーはデフォルトでは許可されない（要 LismBreakpointRegistry 拡張）', () => {
    // @ts-expect-error xs はデフォルト広告に含まれない
    const value: Responsive<string> = { base: 'a', xs: 'b' };
    expectTypeOf(value).toExtend<Responsive<string>>();
  });

  it('number 型でも動作する', () => {
    const single: Responsive<number> = 10;
    const array: Responsive<number> = [10, 20, 30];
    const object: Responsive<number> = { base: 10, md: 20 };

    expectTypeOf(single).toExtend<Responsive<number>>();
    expectTypeOf(array).toExtend<Responsive<number>>();
    expectTypeOf(object).toExtend<Responsive<number>>();
  });

  it('boolean 型でも動作する', () => {
    const single: Responsive<boolean> = true;
    const array: Responsive<boolean> = [true, false, true];
    const object: Responsive<boolean> = { base: true, md: false };

    expectTypeOf(single).toExtend<Responsive<boolean>>();
    expectTypeOf(array).toExtend<Responsive<boolean>>();
    expectTypeOf(object).toExtend<Responsive<boolean>>();
  });

  it('配列はデフォルトで最大4要素まで許可される（[base, sm, md, lg]）', () => {
    const one: Responsive<string> = ['a'];
    const two: Responsive<string> = ['a', 'b'];
    const three: Responsive<string> = ['a', 'b', 'c'];
    const four: Responsive<string> = ['a', 'b', 'c', 'd'];

    expectTypeOf(one).toExtend<Responsive<string>>();
    expectTypeOf(two).toExtend<Responsive<string>>();
    expectTypeOf(three).toExtend<Responsive<string>>();
    expectTypeOf(four).toExtend<Responsive<string>>();
  });

  it('5要素目（xl）はデフォルトでは型エラーになる', () => {
    // @ts-expect-error 5要素目(xl)はデフォルト広告に含まれない
    const five: Responsive<string> = ['a', 'b', 'c', 'd', 'e'];
    expectTypeOf(five).toExtend<Responsive<string>>();
  });

  it('配列形式で null を含めてブレークポイントをスキップできる', () => {
    const value: Responsive<string> = ['a', null, 'c'];
    expectTypeOf(value).toExtend<Responsive<string>>();
  });

  it('配列形式で null のみでも受け付ける', () => {
    const value: Responsive<string> = [null, null, 'c'];
    expectTypeOf(value).toExtend<Responsive<string>>();
  });

  it('配列形式で number 型と null を混在できる', () => {
    const value: Responsive<number> = [1, null, 3];
    expectTypeOf(value).toExtend<Responsive<number>>();
  });

  it('単一値として null は受け付けない', () => {
    // @ts-expect-error 単一値での null は許可されない
    const value: Responsive<string> = null;
    expectTypeOf(value).toExtend<Responsive<string>>();
  });

  it('オブジェクト形式で null は受け付けない', () => {
    // @ts-expect-error オブジェクト形式での null は許可されない
    const value: Responsive<string> = { base: 'a', md: null };
    expectTypeOf(value).toExtend<Responsive<string>>();
  });
});

// ============================================================
// ResponsiveFor: 広告キーを明示的に受け取るコア型。
// declare global を使わずに「+xl / +xs を解禁した状態」を検証する。
// （位置は恒久固定 [base, sm, md, lg, xl]。xs は配列記法には含めない）
// ============================================================

describe('ResponsiveFor（xl/xs オプトインの検証）', () => {
  it('デフォルト相当（sm/md/lg）では xl オブジェクトキーは不可', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg'>;
    // @ts-expect-error xl は広告キーに含まれない
    const value: R = { base: 'a', xl: 'b' };
    expectTypeOf(value).toExtend<R>();
  });

  it('+xl: オブジェクトで xl を指定でき、配列も5要素まで許可される', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg' | 'xl'>;
    const obj: R = { base: 'a', sm: 'b', md: 'c', lg: 'd', xl: 'e' };
    const arr5: R = ['a', 'b', 'c', 'd', 'e'];
    expectTypeOf(obj).toExtend<R>();
    expectTypeOf(arr5).toExtend<R>();
  });

  it('+xs: オブジェクトで xs を指定できる', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg' | 'xs'>;
    const obj: R = { base: 'a', xs: 'b', sm: 'c' };
    expectTypeOf(obj).toExtend<R>();
  });

  it('+xs: xs は配列記法には含まれないため、配列は依然4要素まで', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg' | 'xs'>;
    const arr4: R = ['a', 'b', 'c', 'd'];
    expectTypeOf(arr4).toExtend<R>();

    // @ts-expect-error xs を解禁しても配列は4要素まで（5要素目=xlは未解禁）
    const arr5: R = ['a', 'b', 'c', 'd', 'e'];
    expectTypeOf(arr5).toExtend<R>();
  });

  it('+xl+xs: xl/xs 両方のオブジェクトキーと5要素配列が許可される', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg' | 'xl' | 'xs'>;
    const obj: R = { base: 'a', xs: 'b', sm: 'c', md: 'd', lg: 'e', xl: 'f' };
    const arr5: R = ['a', 'b', 'c', 'd', 'e'];
    expectTypeOf(obj).toExtend<R>();
    expectTypeOf(arr5).toExtend<R>();
  });
});

describe('MakeResponsive', () => {
  type OriginalProps = {
    fz: 's' | 'm' | 'l';
    color: string;
    spacing: number;
  };

  type ResponsiveProps = MakeResponsive<OriginalProps>;

  it('各プロパティが optional になる', () => {
    const props: ResponsiveProps = {};
    expectTypeOf(props).toExtend<ResponsiveProps>();
  });

  it('各プロパティに単一値を設定できる', () => {
    const props: ResponsiveProps = {
      fz: 'm',
      color: 'red',
      spacing: 10,
    };
    expectTypeOf(props).toExtend<ResponsiveProps>();
  });

  it('各プロパティに配列形式を設定できる', () => {
    const props: ResponsiveProps = {
      fz: ['s', 'm', 'l'],
      color: ['red', 'blue'],
      spacing: [10, 20, 30],
    };
    expectTypeOf(props).toExtend<ResponsiveProps>();
  });

  it('各プロパティにブレイクポイントオブジェクトを設定できる', () => {
    const props: ResponsiveProps = {
      fz: { base: 's', md: 'l' },
      color: { base: 'red', lg: 'blue' },
      spacing: { base: 10, sm: 15, md: 20 },
    };
    expectTypeOf(props).toExtend<ResponsiveProps>();
  });

  it('混在した形式を設定できる', () => {
    const props: ResponsiveProps = {
      fz: 'm', // 単一値
      color: ['red', 'blue'], // 配列
      spacing: { base: 10, md: 20 }, // オブジェクト
    };
    expectTypeOf(props).toExtend<ResponsiveProps>();
  });
});
