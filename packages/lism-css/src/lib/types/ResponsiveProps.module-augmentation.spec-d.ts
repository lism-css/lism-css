import { describe, expectTypeOf, it } from 'vitest';
import 'lism-css';
import type { CustomPropValue } from 'lism-css';
import type { LismPropsBase } from '../getLismProps';
import type { PropValueTypes } from './PropValueTypes';

declare module 'lism-css' {
  interface BreakpointRegistry {
    xl: true;
  }

  interface CustomPropRegistry {
    filter?: CustomPropValue;
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
});
