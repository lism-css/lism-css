import { afterEach, assertType, describe, expect, test } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import type { SVGProps } from 'react';
import Icon from './Icon';
import getProps from './getProps';

const svgInput = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M0 0L24 24" /></svg>';

afterEach(cleanup);

describe('SVG文字列の線幅と属性', () => {
  test.each([
    ['light', '1'],
    ['regular', '1.5'],
    ['bold', '2'],
  ] as const)('%sを線幅%sにする', (weight, width) => {
    const { container } = render(<Icon icon={svgInput} weight={weight} />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', width);
    expect(container.querySelector('svg')).not.toHaveAttribute('weight');
  });

  test('利用者属性がweightとSVG文字列より優先される', () => {
    const { container } = render(<Icon icon={svgInput} weight="bold" strokeWidth={0.75} viewBox="0 0 48 48" stroke="red" label="ホーム" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('stroke-width', '0.75');
    expect(svg).toHaveAttribute('viewBox', '0 0 48 48');
    expect(svg).toHaveAttribute('stroke', 'red');
    expect(svg).toHaveAttribute('aria-label', 'ホーム');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg!.children.length).toBeGreaterThan(0);
  });

  test('native表記をReact用へ統一し、exPropsを最優先にする', () => {
    const exProps = { 'stroke-width': 0.5 };
    const { container } = render(<Icon icon={svgInput} weight="bold" strokeWidth={3} stroke-width={4} exProps={exProps} />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '0.5');
    expect(exProps).toEqual({ 'stroke-width': 0.5 });
    const parsed = getProps({ icon: svgInput, 'stroke-width': 4 });
    expect(parsed.exProps.strokeWidth).toBe(4);
    expect(parsed.exProps).not.toHaveProperty('stroke-width');
    expect(getProps({ icon: svgInput, 'stroke-width': 4 }, { svgAttributes: true }).exProps).toMatchObject({
      'stroke-width': 4,
      'stroke-linecap': 'round',
    });
  });
});

describe('外部アイコンとSVG入力', () => {
  function External({ strokeWidth = 7, ...props }: SVGProps<SVGSVGElement>) {
    return (
      <svg strokeWidth={strokeWidth} {...props}>
        <path d="M0 0L24 24" />
      </svg>
    );
  }

  test('weight未指定では外部コンポーネントの線幅を保持する', () => {
    const { container, rerender } = render(<Icon icon={External} />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '7');
    rerender(<Icon icon={External} weight="light" />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '1');
    rerender(<Icon icon={External} weight="bold" stroke-width={0.25} />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '0.25');
  });

  test('オブジェクトの属性より明示指定を優先する', () => {
    const { container } = render(<Icon icon={{ as: External, strokeWidth: 4 }} weight="light" exProps={{ strokeWidth: 3 }} />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke-width', '3');
  });

  test('外部コンポーネント固有のweightはexPropsで渡せる', () => {
    expect(getProps({ icon: External, exProps: { weight: 'duotone' } }).exProps.weight).toBe('duotone');
    expect(getProps({ icon: svgInput, exProps: { weight: 'duotone' } }).exProps).not.toHaveProperty('weight');
  });

  test('raw SVGのfillなし・線属性を保持し、width/heightをsizeより優先する', () => {
    const { container } = render(
      <Icon
        icon={'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 0L24 24" /></svg>'}
        size="2em"
        width="3em"
        height="4em"
      />
    );
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('fill', 'none');
    expect(svg).toHaveAttribute('stroke-width', '2');
    expect(svg).toHaveAttribute('width', '3em');
    expect(svg).toHaveAttribute('height', '4em');
  });

  test('独自SVGのchildrenとimg出力を保持する', () => {
    const { container, rerender } = render(
      <Icon as="svg" viewBox="0 0 10 10" size="2em">
        <circle cx="5" cy="5" r="2" />
      </Icon>
    );
    expect(container.querySelector('svg')).toHaveAttribute('width', '2em');
    expect(container.querySelector('circle')).not.toBeNull();
    rerender(<Icon src="/icon.svg" alt="アイコン" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/icon.svg');
  });
});

test('iconは名前やタグ文字列を受け付けず、描画入力を受け付ける', () => {
  // @ts-expect-error 組み込みアイコン名は廃止。
  assertType<Parameters<typeof Icon>[0]>({ icon: 'check' });
  // @ts-expect-error タグはasで指定する。
  assertType<Parameters<typeof Icon>[0]>({ icon: 'svg' });
  assertType<Parameters<typeof Icon>[0]>({ icon: svgInput });
  assertType<Parameters<typeof Icon>[0]>({ icon: { as: 'svg', viewBox: '0 0 24 24' } });
});
