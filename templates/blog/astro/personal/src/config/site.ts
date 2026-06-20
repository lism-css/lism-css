/**
 * サイト全体で使用する共通設定。
 * タイトル・キャッチコピー・ページネーション等、表示に関わる値はここで管理する。
 *
 * 画面に出る文言（aria-label・404・アーカイブ説明等）は `uiText` に集約している。
 * 言語別テンプレート（`lism-cli create --lang en`）はこのファイルごと差し替えるため、
 * 各コンポーネント／ページは文言をハードコードせず `siteConfig.uiText.*` を参照する。
 */
export const siteConfig = {
  // サイト名
  name: 'lism.blog',

  // キャッチコピー
  tagline: '読む、書く、考える、日々の記録',

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
    { label: 'Tags', href: '/tags/' },
    { label: 'About', href: '/about/' },
  ],

  // OG 画像のデフォルト設定（loos.tools/ogimg-maker の API パラメータ）
  // @see https://loos.tools/ogimg-maker/guide/
  ogImage: {
    type: '1-5',
    frame: true,
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
      { label: 'Tags', href: '/tags/' },
      { label: 'About', href: '/about/' },
    ],
  },

  // 画面に出る固定文言（aria-label・404・アーカイブ説明等）。言語別差し替えの起点。
  uiText: {
    nav: { aria: 'メインナビゲーション', openMenu: 'メニューを開く', closeMenu: 'メニューを閉じる' },
    footer: { aria: 'サイト情報' },
    pager: { aria: 'ページネーション', prev: '前のページ', next: '次のページ' },
    articleNav: { aria: '記事ナビゲーション' },
    tagCloud: { aria: 'タグ一覧' },
    sns: { aria: 'SNSリンク' },
    share: { x: 'X でシェア', copy: 'リンクをコピー', copyPrompt: 'この URL をコピーしてください' },
    notFound: {
      metaDescription: 'お探しのページは見つかりませんでした。',
      title: 'ページが見つかりません',
      description: 'お探しのページは削除されたか、URL が変更された可能性があります。',
    },
    // タグ一覧 / 年月アーカイブの meta description（{tag} / {year}{month} を埋め込む）
    tagsIndexDescription: 'タグ別の記事一覧',
    archiveIndexDescription: '年月別の記事一覧',
    tagArchiveDescription: (tag: string) => `タグ「${tag}」の記事一覧`,
    monthArchiveDescription: (year: string, month: string) => `${year}年${month}月の記事一覧`,
    // 記事件数の表示（タグ別一覧）
    postCount: (count: number) => `${count} 件の記事`,
  },
} as const;

export type SiteConfig = typeof siteConfig;
