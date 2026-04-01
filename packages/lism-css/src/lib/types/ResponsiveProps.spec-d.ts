import { describe, expectTypeOf, it } from 'vitest';
import type { Responsive, MakeResponsive } from './ResponsiveProps';

describe('Responsive', () => {
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

  it('全てのブレイクポイントキーを使用できる', () => {
    const value: Responsive<string> = {
      base: 'base-value',
      sm: 'sm-value',
      md: 'md-value',
      lg: 'lg-value',
      xl: 'xl-value',
    };
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

  it('配列は最大5要素まで許可される', () => {
    const one: Responsive<string> = ['a'];
    const two: Responsive<string> = ['a', 'b'];
    const three: Responsive<string> = ['a', 'b', 'c'];
    const four: Responsive<string> = ['a', 'b', 'c', 'd'];
    const five: Responsive<string> = ['a', 'b', 'c', 'd', 'e'];

    expectTypeOf(one).toExtend<Responsive<string>>();
    expectTypeOf(two).toExtend<Responsive<string>>();
    expectTypeOf(three).toExtend<Responsive<string>>();
    expectTypeOf(four).toExtend<Responsive<string>>();
    expectTypeOf(five).toExtend<Responsive<string>>();
  });

  it('6要素以上の配列は型エラーになる', () => {
    // @ts-expect-error 6要素以上は許可されない
    const six: Responsive<string> = ['a', 'b', 'c', 'd', 'e', 'f'];
    expectTypeOf(six).toExtend<Responsive<string>>();
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
