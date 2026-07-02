import { describe, it, expectTypeOf } from 'vitest';
import type { LismConfig, PropConfig, BreakpointKey } from './types';
import defaultConfig from './default-config';
import propsFull from './presets/props-full';

describe('LismConfig / PropConfig の型互換', () => {
  it('default-config が LismConfig に代入可能', () => {
    // defaults（as const）が執筆用の型と矛盾しないことを保証する。
    expectTypeOf(defaultConfig).toExtend<LismConfig>();
  });

  it('props-full preset が Record<string, PropConfig> に代入可能', () => {
    expectTypeOf(propsFull).toExtend<Record<string, PropConfig>>();
  });

  it('BreakpointKey は breakpoints の全キー', () => {
    expectTypeOf<BreakpointKey>().toEqualTypeOf<'xs' | 'sm' | 'md' | 'lg' | 'xl'>();
  });

  it('bp のリスト指定はブレイクポイントキーに限定される', () => {
    expectTypeOf<PropConfig['bp']>().toEqualTypeOf<0 | 1 | readonly BreakpointKey[] | undefined>();
  });
});

describe('satisfies LismConfig による typo・不正値の検出', () => {
  it('正しい config は通る', () => {
    const config = {
      breakpoints: { xs: '360px' },
      props: { filter: { utils: { blur: 'blur(3px)' } } },
      tokens: { lts: { '2xl': '.5em' } },
      traits: { isHoge: 'is--hoge' },
    } satisfies LismConfig;
    // satisfies は式の narrow な型を保持する（追加キーの型フローに使える）。
    expectTypeOf(config.props).toHaveProperty('filter');
  });

  it('存在しないトップレベルキーはエラーになる（正しいキー併存でも）', () => {
    // @ts-expect-error props のタイポ（porps）は satisfies で弾かれる
    const _bad = { porps: {}, props: { x: { prop: 'color' } } } satisfies LismConfig;
    void _bad;
  });

  it('breakpoints に未知のキーは指定できない', () => {
    // @ts-expect-error 'xxl' は BreakpointKey に含まれない
    const _bad = { breakpoints: { xxl: '1600px' } } satisfies LismConfig;
    void _bad;
  });

  it('prop の値の型ミスも検出される', () => {
    // @ts-expect-error bp は 0 | 1 | BreakpointKey[] のみ
    const _bad = { props: { x: { bp: 5 } } } satisfies LismConfig;
    void _bad;
  });
});
