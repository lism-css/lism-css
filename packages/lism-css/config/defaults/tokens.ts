/**
 * デザイントークン（キー: 値）。
 *
 * - キーの順序がそのままカタログ順になる（Object.keys）。
 * ユーティリティ生成・prop 受理・型導出はすべてこのキー集合から導出される。
 * - 値はビルド時に生成 SCSS（`base/tokens/_tokens.gen.scss`）へ出力される。
 * - 値 `'-'` は「カタログに登録するがcssの出力はしない」もの。実値はscssで手書き。
 */
export default {
  // セマンティックカラー: 実値は手書き SCSS（カタログ専用）。
  color: {
    base: '-',
    'base-2': '-',
    text: '-',
    'text-2': '-',
    divider: '-',
    link: '-',
    brand: '-',
    accent: '-',
    neutral: '-',
  },

  // パレットカラー: 多くは --L/--C からの計算色のため手書き SCSS。white/black のみリテラル値。
  palette: {
    red: '-',
    blue: '-',
    green: '-',
    yellow: '-',
    purple: '-',
    orange: '-',
    pink: '-',
    gray: '-',
    white: '#fff',
    black: '#000',
    keycolor: '-',
  },

  // font-size: 倍音列でのスケーリング（--fz-mol は手書き SCSS の構造変数）。基準は --fz--base。
  fz: {
    base: '1rem',
    '5xl': 'calc(1em * var(--fz-mol) / (var(--fz-mol) - 6))',
    '4xl': 'calc(1em * var(--fz-mol) / (var(--fz-mol) - 5))',
    '3xl': 'calc(1em * var(--fz-mol) / (var(--fz-mol) - 4))',
    '2xl': 'calc(1em * var(--fz-mol) / (var(--fz-mol) - 3))',
    xl: 'calc(1em * var(--fz-mol) / (var(--fz-mol) - 2))',
    l: 'calc(1em * var(--fz-mol) / (var(--fz-mol) - 1))',
    m: '1em',
    s: 'calc(1em * var(--fz-mol) / (var(--fz-mol) + 1))',
    xs: 'calc(1em * var(--fz-mol) / (var(--fz-mol) + 2))',
    '2xs': 'calc(1em * var(--fz-mol) / (var(--fz-mol) + 3))',
  },

  // line-height: CSS 変数を持たないカタログ専用（prop 側で解釈）。
  lh: { base: '-', xs: '-', s: '-', l: '-' },

  // half-leading: --hl-unit は手書き SCSS の構造変数。
  hl: {
    base: 'calc(var(--hl-unit) * 3)',
    xs: 'var(--hl-unit)',
    s: 'calc(var(--hl-unit) * 2)',
    l: 'calc(var(--hl-unit) * 4)',
  },

  // letter-spacing
  lts: { base: 'normal', s: '-0.025em', l: '0.05em', xl: '0.1em' },

  // font-family
  ff: {
    /* Base:
     *   -apple-system/BlinkMacSystemFont → Macで英数字をSan Franciscoに。（前者がSafari/Firefox、後者がChrome用）
     *   'Hiragino Sans' → Macでの和文フォントの指定。ここを省くと、Chromeで sans-serifが Hiragino Kaku Gothic ProN になってしまう
     *   sans-serif: Mac=Hiragino系 / Win=Noto|Meiryo
     *
     *   Note: system-ui は和文に游ゴシックが当たるため使わない。
     */
    base: "-apple-system, 'BlinkMacSystemFont', 'Hiragino Sans', sans-serif",
    // Accent: 装飾用セリフ。初期状態はあくまで一例で実際はカスタマイズしてもらう想定。
    accent: 'Georgia, serif',
    // Mono: ui-monospace=各OSのUI等幅 / SFMono・Menlo→Mac・Consolas→Win のフォールバック
    mono: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
  },

  // font-weight
  fw: { light: '300', normal: '400', bold: '600' },

  // opacity（音楽の強弱記号 piano 系列に由来）
  o: { mp: '0.9', p: '0.75', pp: '0.5', ppp: '0.25' },

  // border-radius: inner は .set 系の計算値（手書き SCSS）でカタログ専用。
  bdrs: { '10': '0.25rem', '20': '0.5rem', '30': '1rem', '40': '1.5rem', '99': '99rem', inner: '-' },

  // box-shadow: 構造変数 --shsz--* / --shc（手書き SCSS）を合成。.set--bxsh で再宣言され影色 --shc を上書きできる。
  bxsh: {
    '10': 'var(--shsz--10) var(--shc)',
    '20': 'var(--shsz--20) var(--shc)',
    '30': 'var(--shsz--30) var(--shc)',
    '40': 'var(--shsz--40) var(--shc)',
    '50': 'var(--shsz--50) var(--shc)',
  },

  // space: 構造変数 --s-unit（手書き SCSS）の倍数。フィボナッチ数列ベース。.set--s で --s-unit を em 化すると再ベースされる。
  space: {
    '5': 'calc(var(--s-unit) * 0.5)', // ≒ 4px
    '10': 'var(--s-unit)', // ≒ 8px
    '15': 'calc(var(--s-unit) * 1.5)', // ≒ 12px
    '20': 'calc(var(--s-unit) * 2)', // ≒ 16px
    '25': 'calc(var(--s-unit) * 2.5)', // ≒ 20px
    '30': 'calc(var(--s-unit) * 3)', // ≒ 24px
    '35': 'calc(var(--s-unit) * 4)', // ≒ 32px
    '40': 'calc(var(--s-unit) * 5)', // ≒ 40px
    '50': 'calc(var(--s-unit) * 8)', // ≒ 64px
    '60': 'calc(var(--s-unit) * 13)', // ≒ 104px
    '70': 'calc(var(--s-unit) * 21)', // ≒ 168px
    '80': 'calc(var(--s-unit) * 34)', // ≒ 272px
  },

  // flow: lang スコープ上書きありのため手書き SCSS。
  flow: { s: '-', l: '-' },

  // content-size
  sz: { xs: '400px', s: '640px', m: '880px', l: '1200px', xl: '1600px' },

  // aspect-ratio
  ar: { og: '1.91/1' },
} as const;
