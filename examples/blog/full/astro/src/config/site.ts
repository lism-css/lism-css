/**
 * サイト全体で使用する共通設定。
 * タイトル・キャッチコピー・ページネーション等、表示に関わる値はここで管理する。
 */
export const siteConfig = {
  // サイト名
  name: 'lism.blog',

  // キャッチコピー
  tagline: '読む、書く、考える、日々の記録',

  // サイトのデフォルト説明文
  description: 'ブログの説明文をここに入力してください。meta description に使われます。',

  // <html lang="..."> に使う値
  lang: 'ja',

  // カラーテーマのデフォルト（'system' / 'light' / 'dark'）
  theme: { default: 'light' as 'system' | 'light' | 'dark' },

  // ページネーション設定
  pagination: {
    // 1ページあたりの記事数
    postsPerPage: 6,
  },

  // ヘッダー
  header: {
    // PCヘッダー用ナビ
    nav: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about/' },
    ],
    // モバイルモーダル用ナビ
    modalNav: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about/' },
      { label: 'Privacy Policy', href: '/privacy/' },
    ],
  },

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
      { label: 'About', href: '/about/' },
      { label: 'Privacy Policy', href: '/privacy/' },
      { label: 'Contact', href: '#' },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
