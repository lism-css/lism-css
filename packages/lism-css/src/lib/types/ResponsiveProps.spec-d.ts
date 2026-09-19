import { describe, it } from 'vitest';
import type { Responsive, ResponsiveFor, MakeResponsive } from './ResponsiveProps';

// ============================================================
// Responsive（公開型）: デフォルト広告は base / sm / md / lg のみ。
// xl / xs は BreakpointRegistry を declare module 'lism-css' で拡張したときだけ解禁される。
// （このファイルでは augmentation を行わないため、常にデフォルト広告で検証している）
// ============================================================

describe('Responsive（デフォルト広告: base/sm/md/lg）', () => {
  it('単一値を受け付ける', () => {
    const _value: Responsive<'s' | 'm' | 'l'> = 'm';
  });

  it('配列形式を受け付ける', () => {
    const _value: Responsive<'s' | 'm' | 'l'> = ['s', 'm', 'l'];
  });

  it('ブレイクポイントオブジェクトを受け付ける', () => {
    const _value: Responsive<'s' | 'm' | 'l'> = { base: 's', md: 'l' };
  });

  it('デフォルトで使えるブレイクポイントキーは base/sm/md/lg', () => {
    const _value: Responsive<string> = {
      base: 'base-value',
      sm: 'sm-value',
      md: 'md-value',
      lg: 'lg-value',
    };
  });

  it('xl オブジェクトキーはデフォルトでは許可されない（要 BreakpointRegistry 拡張）', () => {
    // @ts-expect-error xl はデフォルト広告に含まれない
    const _value: Responsive<string> = { base: 'a', xl: 'b' };
  });

  it('xs オブジェクトキーはデフォルトでは許可されない（要 BreakpointRegistry 拡張）', () => {
    // @ts-expect-error xs はデフォルト広告に含まれない
    const _value: Responsive<string> = { base: 'a', xs: 'b' };
  });

  it('number 型でも動作する', () => {
    const _single: Responsive<number> = 10;
    const _array: Responsive<number> = [10, 20, 30];
    const _object: Responsive<number> = { base: 10, md: 20 };
  });

  it('boolean 型でも動作する', () => {
    const _single: Responsive<boolean> = true;
    const _array: Responsive<boolean> = [true, false, true];
    const _object: Responsive<boolean> = { base: true, md: false };
  });

  it('配列はデフォルトで最大4要素まで許可される（[base, sm, md, lg]）', () => {
    const _one: Responsive<string> = ['a'];
    const _two: Responsive<string> = ['a', 'b'];
    const _three: Responsive<string> = ['a', 'b', 'c'];
    const _four: Responsive<string> = ['a', 'b', 'c', 'd'];
  });

  it('5要素目（xl）はデフォルトでは型エラーになる', () => {
    // @ts-expect-error 5要素目(xl)はデフォルト広告に含まれない
    const _five: Responsive<string> = ['a', 'b', 'c', 'd', 'e'];
  });

  it('配列形式で null を含めてブレークポイントをスキップできる', () => {
    const _value: Responsive<string> = ['a', null, 'c'];
  });

  it('配列形式で null のみでも受け付ける', () => {
    const _value: Responsive<string> = [null, null, 'c'];
  });

  it('配列形式で number 型と null を混在できる', () => {
    const _value: Responsive<number> = [1, null, 3];
  });

  it('単一値として null は受け付けない', () => {
    // @ts-expect-error 単一値での null は許可されない
    const _value: Responsive<string> = null;
  });

  it('オブジェクト形式で null は受け付けない', () => {
    // @ts-expect-error オブジェクト形式での null は許可されない
    const _value: Responsive<string> = { base: 'a', md: null };
  });
});

// ============================================================
// ResponsiveFor: 広告キーを明示的に受け取るコア型。
// module augmentation を使わずに「+xl / +xs を解禁した状態」を検証する。
// （位置は固定 [base, sm, md, lg, xl]。xs は配列記法には含めない）
// ============================================================

describe('ResponsiveFor（xl/xs オプトインの検証）', () => {
  it('デフォルト相当（sm/md/lg）では xl オブジェクトキーは不可', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg'>;
    // @ts-expect-error xl は広告キーに含まれない
    const _value: R = { base: 'a', xl: 'b' };
  });

  it('+xl: オブジェクトで xl を指定でき、配列も5要素まで許可される', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg' | 'xl'>;
    const _obj: R = { base: 'a', sm: 'b', md: 'c', lg: 'd', xl: 'e' };
    const _arr5: R = ['a', 'b', 'c', 'd', 'e'];
  });

  it('+xs: オブジェクトで xs を指定できる', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg' | 'xs'>;
    const _obj: R = { base: 'a', xs: 'b', sm: 'c' };
  });

  it('+xs: xs は配列記法には含まれないため、配列は依然4要素まで', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg' | 'xs'>;
    const _arr4: R = ['a', 'b', 'c', 'd'];

    // @ts-expect-error xs を解禁しても配列は4要素まで（5要素目=xlは未解禁）
    const _arr5: R = ['a', 'b', 'c', 'd', 'e'];
  });

  it('+xl+xs: xl/xs 両方のオブジェクトキーと5要素配列が許可される', () => {
    type R = ResponsiveFor<string, 'sm' | 'md' | 'lg' | 'xl' | 'xs'>;
    const _obj: R = { base: 'a', xs: 'b', sm: 'c', md: 'd', lg: 'e', xl: 'f' };
    const _arr5: R = ['a', 'b', 'c', 'd', 'e'];
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
    const _props: ResponsiveProps = {};
  });

  it('各プロパティに単一値を設定できる', () => {
    const _props: ResponsiveProps = {
      fz: 'm',
      color: 'red',
      spacing: 10,
    };
  });

  it('各プロパティに配列形式を設定できる', () => {
    const _props: ResponsiveProps = {
      fz: ['s', 'm', 'l'],
      color: ['red', 'blue'],
      spacing: [10, 20, 30],
    };
  });

  it('各プロパティにブレイクポイントオブジェクトを設定できる', () => {
    const _props: ResponsiveProps = {
      fz: { base: 's', md: 'l' },
      color: { base: 'red', lg: 'blue' },
      spacing: { base: 10, sm: 15, md: 20 },
    };
  });

  it('混在した形式を設定できる', () => {
    const _props: ResponsiveProps = {
      fz: 'm', // 単一値
      color: ['red', 'blue'], // 配列
      spacing: { base: 10, md: 20 }, // オブジェクト
    };
  });
});
