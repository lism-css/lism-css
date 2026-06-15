import * as sass from 'sass';
import { describe, expect, test } from 'vitest';
import { serializePropConfig, serializeBreakpoints, serializeConfigScss, type BuildConfig } from './serialize';

const baseConfig: BuildConfig = {
  tokens: { space: ['10', '20', '30'] },
  props: {
    p: { prop: 'padding', bp: 1, token: 'space', tokenClass: 1 },
    mt: { prop: 'marginTop', utils: { auto: 'auto' } },
  },
};

describe('serializePropConfig', () => {
  test('props を $props マップへ直列化する', () => {
    const scss = serializePropConfig(baseConfig);
    expect(scss.startsWith('$props: (')).toBe(true);
    expect(scss).toContain("'p': (");
    expect(scss).toContain("prop: 'padding'");
    // tokenClass:1 の token 値が utilities へ展開され、token 解決された var() になる
    expect(scss).toContain("'10': 'var(--space--10)'");
    // bp: 1 はそのまま数値で直列化
    expect(scss).toContain('bp: 1');
    // キャメルケースの prop はケバブケースへ
    expect(scss).toContain("prop: 'margin-top'");
  });

  test('bp のリスト形式を SCSS リストへ直列化する', () => {
    const scss = serializePropConfig({
      tokens: {},
      props: { g: { prop: 'gap', bp: ['sm', 'md'] } },
    });
    expect(scss).toContain("bp: ('sm', 'md')");
  });

  test('bp 1要素のリストは末尾カンマ付きで出力する', () => {
    const scss = serializePropConfig({
      tokens: {},
      props: { g: { prop: 'gap', bp: ['sm'] } },
    });
    expect(scss).toContain("bp: ('sm',)");
  });
});

describe('serializeBreakpoints', () => {
  test('サイズ文字列はクォート、0（無効）は数値で直列化する', () => {
    const scss = serializeBreakpoints({
      tokens: {},
      props: {},
      breakpoints: { xs: 0, sm: '480px', xl: '1400px' },
    });
    expect(scss).toContain("'xs': 0,");
    expect(scss).toContain("'sm': '480px',");
    expect(scss).toContain("'xl': '1400px',");
    expect(scss.startsWith('$breakpoints: (')).toBe(true);
  });

  test('breakpoints 未定義でも $breakpoints: (); を出力する（props.$breakpoints 参照の保証）', () => {
    expect(serializeBreakpoints({ tokens: {}, props: {} })).toBe('$breakpoints: ();\n');
  });
});

describe('serializeConfigScss', () => {
  test('$props と $breakpoints を両方含む', () => {
    const scss = serializeConfigScss({
      tokens: {},
      props: { g: { prop: 'gap', bp: 1 } },
      breakpoints: { xs: '360px' },
    });
    expect(scss).toContain('$props: (');
    expect(scss).toContain("$breakpoints: (\n  'xs': '360px',");
  });
});

describe('直列化結果が有効な SCSS であること', () => {
  // serialize した $props を読み込んで、prop ごとにクラスを出力できることを確認する。
  function emitProps(propConfigScss: string): string {
    return sass.compileString(
      `
@use 'sass:map';
${propConfigScss}
@each $key, $data in $props {
  .#{$key} { prop: map.get($data, prop); }
}
`
    ).css;
  }

  test('serialize 出力から各 prop のクラスを生成できる', () => {
    const css = emitProps(serializePropConfig(baseConfig));
    expect(css).toContain('.p');
    expect(css).toContain('padding');
    expect(css).toContain('.mt');
  });

  test('config を差し替えると出力が追従する（config 反映の保証）', () => {
    const a = emitProps(serializePropConfig(baseConfig));
    const b = emitProps(
      serializePropConfig({
        tokens: {},
        props: { p: { prop: 'padding' }, z: { prop: 'zIndex', utils: { '1': '1' } } },
      })
    );
    expect(a).not.toContain('.z');
    expect(b).toContain('.z');
  });
});
