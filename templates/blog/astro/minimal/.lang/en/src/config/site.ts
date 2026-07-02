/**
 * English template overlay for `lism-cli create --lang en`.
 * This file fully replaces `src/config/site.ts`, so keep its shape in sync
 * with the base (Japanese) config — components read values from `siteConfig.uiText.*`.
 */
export const siteConfig = {
  // Site name
  name: 'lism.blog',

  // Tagline
  tagline: 'Your blog tagline',

  // Default site description
  description: 'Write your blog description here. It is used as the default meta description.',

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
    { label: 'About', href: '/about/' },
  ],

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
      { label: 'About', href: '/about/' },
    ],
  },

  // Fixed UI strings (aria-labels, 404 page, etc.). The base for language swapping.
  uiText: {
    nav: { aria: 'Main navigation' },
    footer: { aria: 'Site information' },
    pager: { aria: 'Pagination', prev: 'Previous page', next: 'Next page' },
    articleNav: { aria: 'Post navigation' },
    tagCloud: { aria: 'Tags' },
    sns: { aria: 'Social links' },
    notFound: {
      metaDescription: 'The page you were looking for could not be found.',
      title: 'Page not found',
      description: 'The page may have been removed, or its URL may have changed.',
    },
    // Meta description for tag archives ({tag} is interpolated)
    tagArchiveDescription: (tag: string) => `Posts tagged "${tag}"`,
  },
} as const;

export type SiteConfig = typeof siteConfig;
