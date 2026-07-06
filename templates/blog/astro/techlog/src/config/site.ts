/**
 * サイト全体で使用する共通設定。
 * タイトル・キャッチコピー・ページネーション等、表示に関わる値はここで管理する。
 *
 * 画面に出る文言（aria-label・404・検索・目次・アーカイブ説明等）は `uiText` に集約している。
 * 言語別テンプレート（`lism-cli create --lang en`）はこのファイルごと差し替えるため、
 * 各コンポーネント／ページは文言をハードコードせず `siteConfig.uiText.*` を参照する。
 */
export const siteConfig = {
  // サイト名
  name: 'lism.blog',

  // キャッチコピー
  tagline: 'Web開発の学びと記録',

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
    // メニュー（モーダル）用ナビ
    nav: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about/' },
      { label: 'Archive', href: '/archive/' },
    ],
  },

  // OG 画像のデフォルト設定（loos.tools/ogimg-maker の API パラメータ）
  // @see https://loos.tools/ogimg-maker/guide/
  ogImage: {
    type: '3-4',
    h: 238,
    c: 6,
    l: 84,
    // bg: 'fill',
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
      { label: 'Archive', href: '/archive/' },
      { label: 'Privacy Policy', href: '/privacy/' },
      { label: 'Contact', href: '#' },
    ],
  },

  // 画面に出る固定文言（aria-label・404・検索・目次・アーカイブ説明等）。言語別差し替えの起点。
  uiText: {
    nav: { aria: 'メインナビゲーション', openMenu: 'メニューを開く', closeMenu: 'メニューを閉じる' },
    footer: { aria: 'サイト情報' },
    pager: { aria: 'ページネーション', prev: '前のページ', next: '次のページ' },
    articleNav: { aria: '記事ナビゲーション' },
    tagCloud: { aria: 'タグ一覧' },
    sns: { aria: 'SNSリンク' },
    share: { x: 'X でシェア', copy: 'リンクをコピー', copyPrompt: 'この URL をコピーしてください' },
    search: { aria: '記事を検索', title: '検索', devUnavailable: '開発環境では検索機能を利用できません' },
    toc: { label: '目次', open: '目次を開く' },
    themeSwitch: { aria: 'カラーテーマを切り替える' },
    breadcrumb: { aria: 'パンくず' },
    categoryTabs: { aria: 'カテゴリー' },
    notFound: {
      metaDescription: 'お探しのページは見つかりませんでした。',
      title: 'ページが見つかりません',
      description: 'お探しのページは削除されたか、URL が変更された可能性があります。',
    },
    // タグ一覧 / 年月アーカイブの meta description・見出し直下テキスト（{tag} / {year}{month} を埋め込む）
    tagsIndexDescription: 'タグ別の記事一覧',
    archiveIndexDescription: '年月別の記事一覧',
    tagArchiveDescription: (tag: string) => `タグ「${tag}」の記事一覧`,
    monthArchiveDescription: (year: string, month: string) => `${year}年${month}月の記事一覧`,
    // 記事件数の表示
    postCount: (count: number) => `${count} 件の記事`,
    archiveTotalCount: (count: number) => `全 ${count} 件`,
  },
} as const;

export type SiteConfig = typeof siteConfig;
