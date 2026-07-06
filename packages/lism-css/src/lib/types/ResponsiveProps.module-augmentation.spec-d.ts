import { describe, expectTypeOf, it } from 'vitest';
import 'lism-css';
import type { CustomPropValue, CustomTraitValue, Responsive } from 'lism-css';
import type { LismPropsBase } from '../getLismProps';
import type { PropValueTypes } from './PropValueTypes';

declare module 'lism-css' {
  interface BreakpointRegistry {
    xl: true;
  }

  interface CustomPropRegistry {
    filter?: CustomPropValue<'blur' | 'grayscale'>;
  }

  interface CustomPropValueRegistry {
    ta: 'justify';
    bg: 'primary';
  }

  interface CustomTraitRegistry {
    isHoge?: CustomTraitValue;
  }

  interface FullModeRegistry {
    enabled: true;
  }
}

describe('BreakpointRegistry module augmentation', () => {
  it('declare module 経由で xl キーと5要素配列が解禁される', () => {
    const object: PropValueTypes = {
      p: { xl: '20' },
    };
    const array: PropValueTypes = {
      p: ['0', '5', '10', '15', '20'],
    };

    expectTypeOf(object).toExtend<PropValueTypes>();
    expectTypeOf(array).toExtend<PropValueTypes>();
  });

  it('CustomPropRegistry 拡張で新規 prop が解禁される', () => {
    const simple: LismPropsBase = {
      filter: 'blur(4px)',
    };
    const responsive: LismPropsBase = {
      filter: { base: 'none', md: 'blur(4px)' },
    };

    expectTypeOf(simple).toExtend<LismPropsBase>();
    expectTypeOf(responsive).toExtend<LismPropsBase>();
  });

  it('CustomPropValue のジェネリクスで新規 prop の値リテラルが補完される（#450）', () => {
    expectTypeOf<LismPropsBase['filter']>().toEqualTypeOf<CustomPropValue<'blur' | 'grayscale'>>();
  });

  it('CustomPropValueRegistry 拡張で既定 prop の値ユニオンに user 追加分が合成される（#450）', () => {
    // FullModeRegistry 有効のため Responsive でラップされる。defaults の presets（center/left/right）に justify が加わる。
    expectTypeOf<PropValueTypes['ta']>().toEqualTypeOf<
      Responsive<'center' | 'left' | 'right' | 'justify' | (string & {}) | number | boolean | null | undefined>
    >();
  });

  it('値なしフォールバックだった既定 prop も、user 追加分があれば値ユニオン型へ切り替わる（#450）', () => {
    expectTypeOf<PropValueTypes['bg']>().toEqualTypeOf<Responsive<'primary' | (string & {}) | number | boolean | null | undefined>>();
  });

  it('CustomTraitRegistry 拡張で新規 trait が解禁される', () => {
    const withTrait: LismPropsBase = {
      isHoge: true,
    };

    expectTypeOf(withTrait).toExtend<LismPropsBase>();
  });

  it('FullModeRegistry 拡張で bp:0 だった props も responsive 指定が解禁される（#425）', () => {
    // defaults では pl/ml/cg は bp:0、bg は bp 未設定（いずれも非レスポンシブ）。
    // full モードを型に反映すると、配列・オブジェクト記法が型エラーにならなくなる。
    const value: PropValueTypes = {
      pl: ['10', '20'], // paddingLeft（space トークン値はそのまま）
      ml: { base: '10', md: '20' }, // marginLeft
      cg: ['10', '20'], // columnGap
      bg: { base: 'red', lg: 'blue' }, // フォールバック型でも responsive 化
    };

    expectTypeOf(value).toExtend<PropValueTypes>();
  });
});
