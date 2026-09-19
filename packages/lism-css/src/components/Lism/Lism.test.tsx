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
      { name: 'preset値: ta', props: { ta: 'center' }, classes: ['-ta:center'] },
      { name: 'token値: p', props: { p: '20' }, classes: ['-p:20'] },
      { name: 'token値: contentSize は CSS 変数のみになる', props: { contentSize: 'xs' }, style: { '--contentSize': 'var(--sz--xs)' } },
      { name: '任意値: ml は変数クラス + CSS 変数になる', props: { ml: 'auto' }, classes: ['-ml'], style: { '--ml': 'auto' } },
      { name: 'true値: bd', props: { bd: true }, classes: ['-bd'] },
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
    // DOM への伝達確認のみ。Trait 名・set / util の正規化は getLismProps.test.ts / mergeSet.test.ts に任せる。
    test('複数の Trait と set を同時に指定できる', () => {
      render(
        <Lism isContainer isLayer hasGutter set="hov bxsh" data-testid="lism">
          test
        </Lism>
      );
      const element = screen.getByTestId('lism');
      expect(element).toHaveClass('is--container');
      expect(element).toHaveClass('is--layer');
      expect(element).toHaveClass('has--gutter');
      expect(element).toHaveClass('set--hov');
      expect(element).toHaveClass('set--bxsh');
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
