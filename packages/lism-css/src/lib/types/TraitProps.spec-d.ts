import { assertType, describe, it } from 'vitest';
import type { TraitProps } from './TraitProps';
import type { LismPropsBase } from '../getLismProps';
import type { TRAITS } from '../../../config/index';

describe('TraitProps', () => {
  describe('config/index.ts からの型生成が動作する', () => {
    it('TRAITS が正しく型推論される', () => {
      // TRAITS の型チェック
      type TraitsType = typeof TRAITS;
      const _test: TraitsType = {} as TraitsType;
      assertType<TraitsType>(_test);
    });

    it('TraitProps が TRAITS から生成されている', () => {
      // TraitProps の型は TRAITS から生成される
      type IsWrapperType = TraitProps['isWrapper'];
      // isWrapper は "s" | "l" | undefined であることを確認
      const wrapper1: IsWrapperType = 's';
      const wrapper2: IsWrapperType = 'l';
      const wrapper3: IsWrapperType = undefined;
      assertType<IsWrapperType>(wrapper1);
      assertType<IsWrapperType>(wrapper2);
      assertType<IsWrapperType>(wrapper3);
    });
  });

  describe('文字列形式のトレイトは boolean を受け入れる', () => {
    it('isContainer', () => {
      assertType<TraitProps>({ isContainer: true });
      assertType<TraitProps>({ isContainer: false });
    });

    it('その他のトレイト', () => {
      assertType<TraitProps>({ isLayer: true });
      assertType<TraitProps>({ isBoxLink: true });
      assertType<TraitProps>({ isCoverLink: true });
      assertType<TraitProps>({ isSide: true });
      assertType<TraitProps>({ isSkipFlow: true });
    });

    it('has-- Trait（hasGutter / hasTransition / hasSnap / hasMask）', () => {
      assertType<TraitProps>({ hasGutter: true });
      assertType<TraitProps>({ hasTransition: true });
      assertType<TraitProps>({ hasSnap: true });
      assertType<TraitProps>({ hasMask: true });
    });
  });

  describe('プリセット値を持つトレイトは、プリセット値・string・boolean を受け入れる', () => {
    it('isWrapper - プリセット値を受け入れる', () => {
      assertType<TraitProps>({ isWrapper: 's' });
      assertType<TraitProps>({ isWrapper: 'l' });
    });

    it('isWrapper - string を受け入れる', () => {
      assertType<TraitProps>({ isWrapper: 'custom' });
      assertType<TraitProps>({ isWrapper: '800px' });
    });

    it('isWrapper - boolean を受け入れる', () => {
      assertType<TraitProps>({ isWrapper: true });
    });

    it('isWrapper - number は受け入れない', () => {
      // @ts-expect-error - number は受け入れない
      assertType<TraitProps>({ isWrapper: 100 });
    });
  });

  describe('複数のトレイトを同時に指定できる', () => {
    it('複数のトレイトを指定', () => {
      assertType<TraitProps>({
        isContainer: true,
        isWrapper: 's',
        hasGutter: true,
      });
    });
  });

  describe('すべてのプロパティはオプショナル', () => {
    it('空のオブジェクト', () => {
      assertType<TraitProps>({});
    });

    it('undefined を明示的に指定できる', () => {
      assertType<TraitProps>({ isContainer: undefined });
      assertType<TraitProps>({ isWrapper: undefined });
    });
  });
});

describe('LismPropsBase — set / util', () => {
  describe('set prop', () => {
    it('プリセット値を受け付ける', () => {
      assertType<LismPropsBase>({ set: 'shadow' });
      assertType<LismPropsBase>({ set: 'hov' });
      assertType<LismPropsBase>({ set: 'plain' });
      assertType<LismPropsBase>({ set: 'innerRs' });
    });

    it('スペース区切りで複数指定できる', () => {
      assertType<LismPropsBase>({ set: 'hov shadow' });
    });

    it('`-` prefix で除外指定できる', () => {
      assertType<LismPropsBase>({ set: 'hov -plain' });
    });

    it('任意の文字列も受け付ける', () => {
      assertType<LismPropsBase>({ set: 'custom-value' });
    });

    it('文字列配列も受け付ける（内部 API 用途）', () => {
      assertType<LismPropsBase>({ set: ['hov', 'shadow'] });
      assertType<LismPropsBase>({ set: ['innerRs', 'custom-value'] });
    });

    it('undefined / 省略可', () => {
      assertType<LismPropsBase>({ set: undefined });
      assertType<LismPropsBase>({});
    });
  });

  describe('util prop', () => {
    it('プリセット値を受け付ける', () => {
      assertType<LismPropsBase>({ util: 'cbox' });
      assertType<LismPropsBase>({ util: 'trim' });
      assertType<LismPropsBase>({ util: 'trimChildren' });
      assertType<LismPropsBase>({ util: 'srOnly' });
      assertType<LismPropsBase>({ util: 'clipText' });
      assertType<LismPropsBase>({ util: 'collapseGrid' });
    });

    it('スペース区切りで複数指定できる', () => {
      assertType<LismPropsBase>({ util: 'cbox trim' });
    });

    it('`-` prefix で除外指定できる', () => {
      assertType<LismPropsBase>({ util: 'cbox -trim' });
    });

    it('任意の文字列も受け付ける', () => {
      assertType<LismPropsBase>({ util: 'custom-util' });
    });

    it('文字列配列も受け付ける（内部 API 用途）', () => {
      assertType<LismPropsBase>({ util: ['cbox', 'trim'] });
    });

    it('undefined / 省略可', () => {
      assertType<LismPropsBase>({ util: undefined });
    });
  });

  describe('set + util 同時指定', () => {
    it('両方同時に指定できる', () => {
      assertType<LismPropsBase>({ set: 'hov shadow', util: 'cbox trim' });
    });
  });
});
