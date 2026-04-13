import { assertType, describe, it } from 'vitest';
import type { StateProps } from './StateProps';
import type { LismPropsBase } from '../getLismProps';
import type { STATES } from '../../../config/index';

describe('StateProps', () => {
  describe('config/index.ts からの型生成が動作する', () => {
    it('STATES が正しく型推論される', () => {
      // STATES の型チェック
      type StatesType = typeof STATES;
      const _test: StatesType = {} as StatesType;
      assertType<StatesType>(_test);
    });

    it('StateProps が STATES から生成されている', () => {
      // StateProps の型は STATES から生成される
      type IsWrapperType = StateProps['isWrapper'];
      // isWrapper は "s" | "l" | undefined であることを確認
      const wrapper1: IsWrapperType = 's';
      const wrapper2: IsWrapperType = 'l';
      const wrapper3: IsWrapperType = undefined;
      assertType<IsWrapperType>(wrapper1);
      assertType<IsWrapperType>(wrapper2);
      assertType<IsWrapperType>(wrapper3);
    });
  });

  describe('文字列形式のステートは boolean を受け入れる', () => {
    it('isContainer', () => {
      assertType<StateProps>({ isContainer: true });
      assertType<StateProps>({ isContainer: false });
    });

    it('その他のステート', () => {
      assertType<StateProps>({ isLayer: true });
      assertType<StateProps>({ isBoxLink: true });
      assertType<StateProps>({ isCoverLink: true });
      assertType<StateProps>({ isSide: true });
      assertType<StateProps>({ isSkipFlow: true });
      assertType<StateProps>({ isVertical: true });
    });
  });

  describe('プリセット値を持つステートは、プリセット値・string・boolean を受け入れる', () => {
    it('isWrapper - プリセット値を受け入れる', () => {
      assertType<StateProps>({ isWrapper: 's' });
      assertType<StateProps>({ isWrapper: 'l' });
    });

    it('isWrapper - string を受け入れる', () => {
      assertType<StateProps>({ isWrapper: 'custom' });
      assertType<StateProps>({ isWrapper: '800px' });
    });

    it('isWrapper - boolean を受け入れる', () => {
      assertType<StateProps>({ isWrapper: true });
    });

    it('isWrapper - number は受け入れない', () => {
      // @ts-expect-error - number は受け入れない
      assertType<StateProps>({ isWrapper: 100 });
    });
  });

  describe('複数のステートを同時に指定できる', () => {
    it('複数のステートを指定', () => {
      assertType<StateProps>({
        isContainer: true,
        isWrapper: 's',
      });
    });
  });

  describe('すべてのプロパティはオプショナル', () => {
    it('空のオブジェクト', () => {
      assertType<StateProps>({});
    });

    it('undefined を明示的に指定できる', () => {
      assertType<StateProps>({ isContainer: undefined });
      assertType<StateProps>({ isWrapper: undefined });
    });
  });
});

describe('LismPropsBase — set / util', () => {
  describe('set prop', () => {
    it('プリセット値を受け付ける', () => {
      assertType<LismPropsBase>({ set: 'gutter' });
      assertType<LismPropsBase>({ set: 'shadow' });
      assertType<LismPropsBase>({ set: 'hov' });
      assertType<LismPropsBase>({ set: 'transition' });
      assertType<LismPropsBase>({ set: 'mask' });
      assertType<LismPropsBase>({ set: 'plain' });
      assertType<LismPropsBase>({ set: 'innerRs' });
      assertType<LismPropsBase>({ set: 'bp' });
    });

    it('スペース・カンマ区切りで複数指定できる', () => {
      assertType<LismPropsBase>({ set: 'hov transition' });
      assertType<LismPropsBase>({ set: 'hov,transition' });
    });

    it('`-` prefix で除外指定できる', () => {
      assertType<LismPropsBase>({ set: 'hov -plain' });
    });

    it('任意の文字列も受け付ける', () => {
      assertType<LismPropsBase>({ set: 'custom-value' });
    });

    it('配列は受け付けない', () => {
      // @ts-expect-error - 配列形式は廃止
      assertType<LismPropsBase>({ set: ['hov', 'transition'] });
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
      assertType<LismPropsBase>({ util: 'snap' });
    });

    it('スペース・カンマ区切りで複数指定できる', () => {
      assertType<LismPropsBase>({ util: 'cbox trim' });
      assertType<LismPropsBase>({ util: 'cbox,trim' });
    });

    it('`-` prefix で除外指定できる', () => {
      assertType<LismPropsBase>({ util: 'cbox -trim' });
    });

    it('任意の文字列も受け付ける', () => {
      assertType<LismPropsBase>({ util: 'custom-util' });
    });

    it('配列は受け付けない', () => {
      // @ts-expect-error - 配列形式は受け付けない
      assertType<LismPropsBase>({ util: ['cbox', 'trim'] });
    });

    it('undefined / 省略可', () => {
      assertType<LismPropsBase>({ util: undefined });
    });
  });

  describe('set + util 同時指定', () => {
    it('両方同時に指定できる', () => {
      assertType<LismPropsBase>({ set: 'hov transition', util: 'cbox trim' });
    });
  });
});
