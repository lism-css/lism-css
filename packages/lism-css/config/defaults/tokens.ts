/**
 * デザイントークンの単一情報源（キー: 値）。
 *
 * - キーの順序がそのままカタログ順になる（Object.keys）。ユーティリティ生成・prop 受理・型導出は
 *   すべてこのキー集合から導出される。
 * - 値はビルド時に生成 SCSS（`base/tokens/_tokens.gen.scss` の `:root {}`）へ出力される。
 * - 値 `'-'` は「カタログには登録するが生成 SCSS には :root 宣言を出力しない」センチネル。
 *   実値は手書き SCSS 側（`base/tokens/*.scss`）に置く。用途は以下の通り:
 *     - 色（color / palette）: カラーピッカーで編集したいので手書き SCSS に寄せる。
 *     - スコープ上書きを伴う構造物（space=.set--s / bxsh=.set--bxsh）: 値が .set--* 側でも
 *       再宣言される必要があるため手書き SCSS に残す。
 *     - CSS 変数を持たないカタログ専用キー（lh / writing / flow / fz.root / bdrs.inner 等）。
 * - CSS 変数名のプレフィックス規則は [[token-var-prefix]]（TOKEN_VAR_PREFIX）に集約。
 *   既定は `--{token}--{key}`、space は `--s{key}`、color / palette は `--{key}`。
 */
export default {
  // font-size: 倍音列でのスケーリング（--fz-mol は手書き SCSS の構造変数）。root は var(--fz--root) 参照のみで実体なし。
  fz: {
    root: '-',
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
    base: "-apple-system, 'BlinkMacSystemFont', 'Hiragino Sans', sans-serif, 'Segoe UI Emoji'",
    accent: "'Garamond', 'Baskerville', 'Times New Roman', serif",
    mono: "ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace",
  },
  // font-weight
  fw: { light: '300', normal: '400', bold: '600' },
  // opacity（音楽の強弱記号 piano 系列に由来）
  o: { mp: '0.9', p: '0.75', pp: '0.5', ppp: '0.25' },
  // border-radius: inner は .set 系の計算値（手書き SCSS）でカタログ専用。
  bdrs: { '10': '0.25rem', '20': '0.5rem', '30': '1rem', '40': '1.5rem', '99': '99rem', inner: '-' },
  // box-shadow: .set--bxsh で再宣言される構造物のため手書き SCSS に残す（カタログ専用）。
  bxsh: { '10': '-', '20': '-', '30': '-', '40': '-', '50': '-' },
  // content-size
  sz: { xs: '400px', s: '640px', m: '880px', l: '1200px', xl: '1600px' },
  // aspect-ratio
  ar: { og: '1.91/1' },
  // space: .set--s で再宣言される構造物のため手書き SCSS に残す（カタログ専用）。
  space: {
    '5': '-',
    '10': '-',
    '15': '-',
    '20': '-',
    '25': '-',
    '30': '-',
    '35': '-',
    '40': '-',
    '50': '-',
    '60': '-',
    '70': '-',
    '80': '-',
  },
  // 意味的カラー: カラーピッカー編集のため手書き SCSS に寄せる（カタログ専用）。
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
  // 生カラー（パレット）: 多くは --L/--C からの計算色のため手書き SCSS。white/black のみリテラル値。
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
  // writing-mode 系: CSS 変数を持たないカタログ専用。
  writing: { vertical: '-' },
  // flow: --flow--* は構造物（lang スコープ上書きあり）のため手書き SCSS。
  flow: { s: '-', l: '-' },
} as const;
