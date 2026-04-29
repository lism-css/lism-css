/**
 * サイト全体で使用する共通設定。
 * タイトル・キャッチコピー・ページネーション等、表示に関わる値はここで管理する。
 */
export const siteConfig = {
  // サイト名（タイトル末尾やヘッダーロゴで使用）
  name: 'lism.blog',

  // キャッチコピー（トップページの大見出し）
  tagline: '読む、書く、考える、日々の記録',

  // サイトのデフォルト説明文（meta description のフォールバック）
  description: 'A quiet place to read and think.',

  // <html lang="..."> に使う値
  lang: 'ja',

  // ページネーション設定
  pagination: {
    // 1ページあたりの記事数（一覧ページ共通のデフォルト値）
    postsPerPage: 6,
  },

  // フッター
  footer: {
    copyright: '© 2026 Lism CSS',
    sns: [
      { label: 'GitHub', icon: 'logo-github', href: 'https://github.com/lism-css/lism-css' },
      { label: 'X', icon: 'logo-x', href: 'https://x.com/lismcss' },
    ],
    links: [
      { label: 'About', href: '/about/' },
      { label: 'Privacy Policy', href: '/privacy/' },
      { label: 'Contact', href: '#' },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
