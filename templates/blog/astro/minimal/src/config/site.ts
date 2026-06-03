/**
 * サイト全体で使用する共通設定。
 * タイトル・キャッチコピー・ページネーション等、表示に関わる値はここで管理する。
 *
 * 画面に出る文言（aria-label・404 等）は `ui` に集約している。
 * 言語別テンプレート（`lism create --lang en`）はこのファイルごと差し替えるため、
 * 各コンポーネントは文言をハードコードせず `siteConfig.ui.*` を参照する。
 */
export const siteConfig = {
  // サイト名
  name: 'lism.blog',

  // キャッチコピー
  tagline: 'ブログのキャッチコピー',

  // サイトのデフォルト説明文
  description: 'ブログの説明文をここに入力してください。meta description に使われます。',

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
    { label: 'About', href: '/about/' },
  ],

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
      { label: 'About', href: '/about/' },
    ],
  },

  // 画面に出る固定文言（aria-label・404 ページ等）。言語別差し替えの起点。
  ui: {
    nav: { aria: 'メインナビゲーション' },
    footer: { aria: 'サイト情報' },
    pager: { aria: 'ページネーション', prev: '前のページ', next: '次のページ' },
    articleNav: { aria: '記事ナビゲーション' },
    tagCloud: { aria: 'タグ一覧' },
    sns: { aria: 'SNSリンク' },
    notFound: {
      metaDescription: 'お探しのページは見つかりませんでした。',
      title: 'ページが見つかりません',
      description: 'お探しのページは削除されたか、URL が変更された可能性があります。',
    },
    // タグ別アーカイブの meta description（{tag} を埋め込む）
    tagArchiveDescription: (tag: string) => `タグ「${tag}」の記事一覧`,
  },
} as const;

export type SiteConfig = typeof siteConfig;
