/**
 * English template overlay for `lism create --lang en`.
 * This file fully replaces `src/config/site.ts`, so keep its shape in sync
 * with the base (Japanese) config — components read values from `siteConfig.ui.*`.
 */
export const siteConfig = {
  // Site name
  name: 'lism.blog',

  // Tagline
  tagline: 'Notes and lessons from web development',

  // Default site description
  description: 'Write your blog description here. It is used as the default meta description.',

  // Value for <html lang="...">
  lang: 'en',

  // Default color theme ('system' / 'light' / 'dark')
  theme: { default: 'light' as 'system' | 'light' | 'dark' },

  // Pagination
  pagination: {
    // Posts per page
    postsPerPage: 6,
  },

  // Header
  header: {
    // Navigation for the menu (modal)
    nav: [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about/' },
      { label: 'Archive', href: '/archive/' },
    ],
  },

  // Default OG image settings (loos.tools/ogimg-maker API params)
  // @see https://loos.tools/ogimg-maker/guide/
  ogImage: {
    type: '3-4',
    h: 238,
    c: 6,
    l: 84,
    // bg: 'fill',
  },

  // Social links
  sns: [
    { label: 'GitHub', icon: 'logo-github', href: 'https://github.com/lism-css/lism-css' },
    { label: 'X', icon: 'logo-x', href: 'https://x.com/lismcss' },
  ],

  // Footer
  footer: {
    copyright: '© 2026 Lism CSS',
    nav: [
      { label: 'About', href: '/about/' },
      { label: 'Archive', href: '/archive/' },
      { label: 'Privacy Policy', href: '/privacy/' },
      { label: 'Contact', href: '#' },
    ],
  },

  // Fixed UI strings (aria-labels, 404, search, TOC, archive descriptions, etc.). The base for language swapping.
  ui: {
    nav: { aria: 'Main navigation', openMenu: 'Open menu', closeMenu: 'Close menu' },
    footer: { aria: 'Site information' },
    pager: { aria: 'Pagination', prev: 'Previous page', next: 'Next page' },
    articleNav: { aria: 'Post navigation' },
    tagCloud: { aria: 'Tags' },
    sns: { aria: 'Social links' },
    share: { x: 'Share on X', copy: 'Copy link', copyPrompt: 'Copy this URL' },
    search: { aria: 'Search posts', title: 'Search', devUnavailable: 'Search is unavailable in the dev environment' },
    toc: { label: 'Contents', open: 'Open table of contents' },
    themeSwitch: { aria: 'Toggle color theme' },
    breadcrumb: { aria: 'Breadcrumb' },
    categoryTabs: { aria: 'Categories' },
    notFound: {
      metaDescription: 'The page you were looking for could not be found.',
      title: 'Page not found',
      description: 'The page may have been removed, or its URL may have changed.',
    },
    // Meta descriptions / heading text for tag & monthly archives ({tag} / {year}{month} are interpolated)
    tagsIndexDescription: 'Browse posts by tag',
    archiveIndexDescription: 'Browse posts by month',
    tagArchiveDescription: (tag: string) => `Posts tagged "${tag}"`,
    monthArchiveDescription: (year: string, month: string) => `Posts from ${year}.${month}`,
    // Post counts
    postCount: (count: number) => `${count} post${count === 1 ? '' : 's'}`,
    archiveTotalCount: (count: number) => `${count} post${count === 1 ? '' : 's'} total`,
  },
} as const;

export type SiteConfig = typeof siteConfig;
