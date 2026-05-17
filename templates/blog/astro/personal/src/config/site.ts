/**
 * サイト全体で使用する共通設定。
 * タイトル・キャッチコピー・ページネーション等、表示に関わる値はここで管理する。
 */
export const siteConfig = {
  // サイト名
  name: 'lism.blog',

  // キャッチコピー
  tagline: '日々の記録と思いつき',

  // サイトのデフォルト説明文
  description: '読書、暮らし、考えごと。ゆっくり書き留めるパーソナルブログ。',

  // <html lang="..."> に使う値
  lang: 'ja',

  // ページネーション設定
  pagination: {
    // 1ページあたりの記事数
    postsPerPage: 6,
  },

  // ナビゲーション
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Archive', href: '/archive/' },
  ],

  // OG 画像のデフォルト設定（loos.tools/ogimg-maker の API パラメータ）
  // @see https://loos.tools/ogimg-maker/guide/
  ogImage: {
    type: '1-5',
    frame: '1',
    bg: 'fill',
  },

  // SNS リンク
  sns: [
    { label: 'GitHub', icon: 'logo-github', href: 'https://github.com/lism-css/lism-css' },
    { label: 'X', icon: 'logo-x', href: 'https://x.com/lismcss' },
  ],

  // フッター
  footer: {
    copyright: '© 2026 Lism CSS',
    nav: [
      { label: 'Home', href: '/' },
      { label: 'Archive', href: '/archive/' },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
