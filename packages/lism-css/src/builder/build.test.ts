import * as sass from 'sass';
import { describe, expect, test } from 'vitest';
import { serializePropConfig, serializeBreakpoints, serializeConfigScss, serializeTokens, type BuildConfig } from './serialize';

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
    // （space は TOKEN_VAR_PREFIX 登録トークンなので --s 命名）
    expect(scss).toContain("'10': 'var(--s10)'");
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

describe('tokens フラットマップのユーティリティ生成', () => {
  test('tokenClass:1 のトークンキーが token 解決された var() の utilities へ展開される', () => {
    const scss = serializePropConfig({
      tokens: { lts: { base: 'normal', '2xl': '.5em' } },
      props: { lts: { prop: 'letterSpacing', token: 'lts', tokenClass: 1, bp: 0 } },
    });
    expect(scss).toContain("'base': 'var(--lts--base)'");
    expect(scss).toContain("'2xl': 'var(--lts--2xl)'");
  });

  test('space は TOKEN_VAR_PREFIX により --s 命名で展開される', () => {
    const scss = serializePropConfig({
      tokens: { space: { '10': '-', '20': '-', '90': '6rem' } },
      props: { p: { prop: 'padding', token: 'space', tokenClass: 1, bp: 1 } },
    });
    expect(scss).toContain("'90': 'var(--s90)'");
  });

  test("'-' センチネルのキーも utilities に含まれる（var 解決される）", () => {
    const scss = serializePropConfig({
      tokens: { bdrs: { '10': '0.25rem', inner: '-' } },
      props: { bdrs: { prop: 'borderRadius', token: 'bdrs', tokenClass: 1 } },
    });
    expect(scss).toContain("'inner': 'var(--bdrs--inner)'");
  });
});

describe('serializeTokens', () => {
  test('インライン値を :root 宣言として出力する', () => {
    const scss = serializeTokens({
      tokens: { lts: { base: 'normal', '2xl': '.5em' } },
      props: {},
    });
    expect(scss.startsWith(':root {')).toBe(true);
    expect(scss).toContain('--lts--base: normal;');
    expect(scss).toContain('--lts--2xl: .5em;');
  });

  test("'-' センチネルのキーは :root 宣言を出力しない", () => {
    const scss = serializeTokens({
      tokens: { color: { brand: '-', accent: '-' }, lts: { '2xl': '.5em' } },
      props: {},
    });
    expect(scss).not.toContain('--brand');
    expect(scss).toContain('--lts--2xl: .5em;');
  });

  test('TOKEN_VAR_PREFIX を尊重した変数名で出力する（space → --s, palette → --）', () => {
    const scss = serializeTokens({
      tokens: { space: { '90': '6rem' }, palette: { white: '#fff' } },
      props: {},
    });
    expect(scss).toContain('--s90: 6rem;');
    expect(scss).toContain('--white: #fff;');
  });

  test('TOKEN_SCOPE 登録トークン（space / bxsh）は :root, .set--* ブロックへ出力する', () => {
    const scss = serializeTokens({
      tokens: {
        lts: { base: 'normal' },
        space: { '10': 'var(--s-unit)' },
        bxsh: { '10': 'var(--shsz--10) var(--shc)' },
      },
      props: {},
    });
    // 非スコープトークンは :root のまま。
    expect(scss).toContain(':root {\n  --lts--base: normal;\n}\n');
    // スコープトークンは再宣言セレクタ付きブロックへ。
    expect(scss).toContain(':root,\n.set--s {\n  --s10: var(--s-unit);\n}\n');
    expect(scss).toContain(':root,\n.set--bxsh {\n  --bxsh--10: var(--shsz--10) var(--shc);\n}\n');
  });

  test('既定値の上書き（同名キー）も宣言として出力する', () => {
    const scss = serializeTokens({
      tokens: { lts: { base: '0.01em' } },
      props: {},
    });
    expect(scss).toContain('--lts--base: 0.01em;');
  });

  test('出力する宣言が無くても :root {} を返す', () => {
    expect(serializeTokens({ tokens: { color: { brand: '-' } }, props: {} })).toBe(':root {\n}\n');
    expect(serializeTokens({ tokens: {}, props: {} })).toBe(':root {\n}\n');
  });

  test('生成した :root 宣言が有効な SCSS として読める', () => {
    const scss = serializeTokens({
      tokens: { lts: { '2xl': '.5em' } },
      props: {},
    });
    const css = sass.compileString(scss).css;
    expect(css).toContain('--lts--2xl: .5em');
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
