import { describe, expectTypeOf, it } from 'vitest';
import 'lism-css';
import type { PropValueTypes } from './PropValueTypes';

declare module 'lism-css' {
  interface BreakpointRegistry {
    xl: true;
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
});
