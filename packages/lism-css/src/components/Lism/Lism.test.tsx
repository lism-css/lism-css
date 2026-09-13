import { describe, test, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import Lism from './Lism';
import type { LismComponentProps } from './Lism';

afterEach(() => {
  cleanup();
});

describe('Lism', () => {
  describe('基本動作', () => {
    test('デフォルトでdiv要素としてレンダリングされる', () => {
      render(<Lism data-testid="lism">test</Lism>);
      const element = screen.getByTestId('lism');
      expect(element.tagName).toBe('DIV');
    });

    test('as propで要素を変更できる', () => {
      render(
        <Lism as="span" data-testid="lism">
          test
        </Lism>
      );
      const element = screen.getByTestId('lism');
      expect(element.tagName).toBe('SPAN');
    });

    test('as で渡したカスタムコンポーネントに固有 props と Lism の処理済みクラスが渡される', () => {
      const CustomComponent = ({ foo, children, ...rest }: { foo: 'bar' | 'baz'; children: React.ReactNode }) => (
        <div {...rest} data-foo={foo}>
          {children}
        </div>
      );

      render(
        <Lism as={CustomComponent} foo="bar" p="20" isWrapper="l" data-testid="lism">
          test
        </Lism>
      );
      const element = screen.getByTestId('lism');
      expect(element.tagName).toBe('DIV');
      expect(element).toHaveAttribute('data-foo', 'bar');
      expect(element).toHaveClass('-p:20');
      expect(element).toHaveClass('is--wrapper');
      expect(element).toHaveClass('-contentSize:l');
    });

    test('exProps が getLismProps を経由せず直接渡される', () => {
      render(
        <Lism exProps={{ 'aria-label': 'test label' }} data-testid="lism">
          test
        </Lism>
      );
      const element = screen.getByTestId('lism');
      expect(element).toHaveAttribute('aria-label', 'test label');
    });

    test('children が正しくレンダリングされる', () => {
      render(
        <Lism data-testid="lism">
          <span data-testid="child">child content</span>
        </Lism>
      );
      const element = screen.getByTestId('lism');
      const child = screen.getByTestId('child');
      expect(element).toContainElement(child);
      expect(child.textContent).toBe('child content');
    });
  });

  describe('HTML属性', () => {
    test('as="a"の場合、href属性を受け取れる', () => {
      render(
        <Lism as="a" href="/path" data-testid="lism">
          link
        </Lism>
      );
      const element = screen.getByTestId('lism');
      expect(element).toHaveAttribute('href', '/path');
    });
  });

  describe('Property Class', () => {
    // 値→クラス/変数の変換分岐ごとの代表例。網羅は getLismProps.test.ts に任せる。
    const cases: { name: string; props: LismComponentProps; classes?: string[]; style?: Record<string, string> }[] = [
      { name: 'preset値: fz', props: { fz: 'xl' }, classes: ['-fz:xl'] },
      { name: 'preset値: c', props: { c: 'text' }, classes: ['-c:text'] },
      { name: 'preset値: bgc', props: { bgc: 'base-2' }, classes: ['-bgc:base-2'] },
      { name: 'preset値: ta', props: { ta: 'center' }, classes: ['-ta:center'] },
      { name: 'preset値: d', props: { d: 'inline-flex' }, classes: ['-d:inline-flex'] },
      { name: 'preset値: pos', props: { pos: 'sticky' }, classes: ['-pos:sticky'] },
      { name: 'preset値: ar', props: { ar: '16/9' }, classes: ['-ar:16/9'] },
      { name: 'preset値: gc', props: { gc: '1/-1' }, classes: ['-gc:1/-1'] },
      { name: 'preset値: ov-x', props: { 'ov-x': 'scroll' }, classes: ['-ov-x:scroll'] },
      { name: 'preset値: fxd', props: { fxd: 'row-reverse' }, classes: ['-fxd:row-reverse'] },
      { name: 'preset値: w', props: { w: 'fit' }, classes: ['-w:fit'] },
      { name: 'token値: p', props: { p: '20' }, classes: ['-p:20'] },
      { name: 'token値: bdrs', props: { bdrs: '20' }, classes: ['-bdrs:20'] },
      { name: 'token値: contentSize は CSS 変数になる', props: { contentSize: 'xs' }, style: { '--contentSize': 'var(--sz--xs)' } },
      { name: '任意値: contentSize は CSS 変数になる', props: { contentSize: '800px' }, style: { '--contentSize': '800px' } },
      { name: '任意値: preset を持たない ml は変数クラス + CSS 変数になる', props: { ml: 'auto' }, classes: ['-ml'], style: { '--ml': 'auto' } },
      { name: 'true値: bd', props: { bd: true }, classes: ['-bd'] },
      { name: ': prefix: w', props: { w: ':fit' }, classes: ['-w:fit'] },
      { name: '複数 prop の同時指定', props: { px: '20', py: '10', mt: '10' }, classes: ['-px:20', '-py:10', '-mt:10'] },
    ];

    test.each(cases)('$name', ({ props, classes, style }) => {
      render(
        <Lism {...props} data-testid="lism">
          test
        </Lism>
      );
      const element = screen.getByTestId('lism');
      for (const cls of classes ?? []) {
        expect(element).toHaveClass(cls);
      }
      if (style) {
        expect(element).toHaveStyle(style);
      }
    });

    test('i（inset）に token 値を指定すると inline style として処理される', () => {
      render(
        <Lism i="10" i-x="20" data-testid="lism">
          test
        </Lism>
      );
      const element = screen.getByTestId('lism');
      const style = element.getAttribute('style');
      expect(style).toContain('inset: var(--s10)');
      expect(style).toContain('inset-inline: var(--s20)');
    });
  });

  describe('Trait Class', () => {
    describe('is-- Traits', () => {
      test('isContainer を指定できる', () => {
        render(
          <Lism isContainer data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('is--container');
      });

      test('isLayer を指定できる', () => {
        render(
          <Lism isLayer data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('is--layer');
      });

      test('isBoxLink を指定できる', () => {
        render(
          <Lism isBoxLink data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('is--boxLink');
      });

      test('isSide を指定できる', () => {
        render(
          <Lism isSide data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('is--side');
      });

      test('isSkipFlow を指定できる', () => {
        render(
          <Lism isSkipFlow data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('is--skipFlow');
      });
    });

    describe('set-- Classes', () => {
      test('set="bxsh" で set--bxsh クラスが出力される', () => {
        render(
          <Lism set="bxsh" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('set--bxsh');
      });

      test('set="hov" で set--hov クラスが出力される', () => {
        render(
          <Lism set="hov" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('set--hov');
      });

      test('set="hov bxsh" で複数の set-- クラスが出力される', () => {
        render(
          <Lism set="hov bxsh" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('set--hov');
        expect(element).toHaveClass('set--bxsh');
      });

      test('set="plain" で set--plain クラスが出力される', () => {
        render(
          <Lism set="plain" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('set--plain');
      });

      test('set="revert" で set--revert クラスが出力される', () => {
        render(
          <Lism set="revert" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('set--revert');
      });

      test('set="bdrsInner" で set--bdrsInner クラスが出力される', () => {
        render(
          <Lism set="bdrsInner" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('set--bdrsInner');
      });

      test('set="bleed" で set--bleed クラスが出力される', () => {
        render(
          <Lism set="bleed" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('set--bleed');
      });
    });

    describe('util prop による u-- クラス出力', () => {
      test('util="cbox" で u--cbox クラスが出力される', () => {
        render(
          <Lism util="cbox" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('u--cbox');
      });

      test('util="cbox trim" 空白区切りで複数の u-- クラスが出力される', () => {
        render(
          <Lism util="cbox trim" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('u--cbox');
        expect(element).toHaveClass('u--trim');
      });

      test('util 値内 `-name` で指定した値が除外される', () => {
        render(
          <Lism util="cbox trim -trim" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('u--cbox');
        expect(element).not.toHaveClass('u--trim');
      });

      test('set と util を同時に指定できる', () => {
        render(
          <Lism set="hov" util="cbox" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('set--hov');
        expect(element).toHaveClass('u--cbox');
      });
    });

    describe('has-- Traits', () => {
      test('hasGutter で has--gutter クラスが出力される', () => {
        render(
          <Lism hasGutter data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('has--gutter');
      });

      test('hasSnap で has--snap クラスが出力される', () => {
        render(
          <Lism hasSnap data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('has--snap');
      });

      test('hasMask で has--mask クラスが出力される', () => {
        render(
          <Lism hasMask data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('has--mask');
      });

      test('複数の has-- Trait を同時に指定できる', () => {
        render(
          <Lism hasTransition hasGutter data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('has--transition');
        expect(element).toHaveClass('has--gutter');
      });

      test('is-- と has-- を同時に指定できる', () => {
        render(
          <Lism isContainer hasGutter data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('is--container');
        expect(element).toHaveClass('has--gutter');
      });
    });

    describe('複数のTrait Classを同時に指定', () => {
      test('複数のTrait Classを同時に指定できる', () => {
        render(
          <Lism isContainer isLayer hasGutter set="bxsh" data-testid="lism">
            test
          </Lism>
        );
        const element = screen.getByTestId('lism');
        expect(element).toHaveClass('is--container');
        expect(element).toHaveClass('is--layer');
        expect(element).toHaveClass('has--gutter');
        expect(element).toHaveClass('set--bxsh');
      });
    });
  });

  describe('レスポンシブ対応', () => {
    test('配列形式でレスポンシブ値を指定できる', () => {
      render(
        <Lism fz={['s', 'm', 'l']} data-testid="lism">
          test
        </Lism>
      );
      const element = screen.getByTestId('lism');
      expect(element).toHaveClass('-fz:s');
      expect(element).toHaveClass('-fz_sm');
      expect(element).toHaveClass('-fz_md');
    });

    test('オブジェクト形式でレスポンシブ値を指定できる', () => {
      render(
        <Lism fz={{ base: 's', md: 'l' }} data-testid="lism">
          test
        </Lism>
      );
      const element = screen.getByTestId('lism');
      expect(element).toHaveClass('-fz:s');
      expect(element).toHaveClass('-fz_md');
    });
  });
});
