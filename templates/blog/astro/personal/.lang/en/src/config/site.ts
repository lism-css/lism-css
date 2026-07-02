/**
 * English template overlay for `lism-cli create --lang en`.
 * This file fully replaces `src/config/site.ts`, so keep its shape in sync
 * with the base (Japanese) config — components read values from `siteConfig.uiText.*`.
 */
export const siteConfig = {
  // Site name
  name: 'lism.blog',

  // Tagline
  tagline: 'Read, write, think — notes on everyday life',

  // Default site description
  description: 'Books, daily life, and stray thoughts. A personal blog written at an unhurried pace.',

  // Value for <html lang="...">
  lang: 'en',

  // Pagination
  pagination: {
    // Posts per page
    postsPerPage: 6,
  },

  // Navigation
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Archive', href: '/archive/' },
    { label: 'Tags', href: '/tags/' },
    { label: 'About', href: '/about/' },
  ],

  // Default OG image settings (loos.tools/ogimg-maker API params)
  // @see https://loos.tools/ogimg-maker/guide/
  ogImage: {
    type: '1-5',
    frame: true,
    bg: 'fill',
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
      { label: 'Home', href: '/' },
      { label: 'Archive', href: '/archive/' },
      { label: 'Tags', href: '/tags/' },
      { label: 'About', href: '/about/' },
    ],
  },

  // Fixed UI strings (aria-labels, 404, archive descriptions, etc.). The base for language swapping.
  uiText: {
    nav: { aria: 'Main navigation', openMenu: 'Open menu', closeMenu: 'Close menu' },
    footer: { aria: 'Site information' },
    pager: { aria: 'Pagination', prev: 'Previous page', next: 'Next page' },
    articleNav: { aria: 'Post navigation' },
    tagCloud: { aria: 'Tags' },
    sns: { aria: 'Social links' },
    share: { x: 'Share on X', copy: 'Copy link', copyPrompt: 'Copy this URL' },
    notFound: {
      metaDescription: 'The page you were looking for could not be found.',
      title: 'Page not found',
      description: 'The page may have been removed, or its URL may have changed.',
    },
    // Meta descriptions for tag / monthly archives ({tag} / {year}{month} are interpolated)
    tagsIndexDescription: 'Browse posts by tag',
    archiveIndexDescription: 'Browse posts by month',
    tagArchiveDescription: (tag: string) => `Posts tagged "${tag}"`,
    monthArchiveDescription: (year: string, month: string) => `Posts from ${year}.${month}`,
    // Post count (tag archive)
    postCount: (count: number) => `${count} post${count === 1 ? '' : 's'}`,
  },
} as const;

export type SiteConfig = typeof siteConfig;
