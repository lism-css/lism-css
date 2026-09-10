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
    {
      label: 'GitHub',
      icon: {
        viewBox: '0 0 32 32',
        path: 'M15.73,2.32C7.93,2.32,2,8.25,2,16.05c0,6.17,3.93,11.55,9.49,13.43c0.67,0.12,0.97-0.3,0.97-0.67s0-2.3,0-3.39c0,0-3.93,0.85-4.72-1.63c0,0-0.6-1.63-1.57-2c0,0-1.27-0.91,0.06-0.91c0,0,1.39,0.12,2.18,1.45c1.21,2.18,3.27,1.51,4.11,1.21c0.12-0.91,0.48-1.51,0.91-1.87c-3.14-0.3-6.35-0.85-6.35-6.17c0-1.51,0.42-2.36,1.33-3.27c-0.12-0.36-0.6-1.87,0.12-3.81c1.21-0.36,3.87,1.51,3.87,1.51c1.15-0.3,2.36-0.48,3.57-0.48s2.42,0.18,3.57,0.48c0,0,2.72-1.87,3.87-1.51c0.79,1.94,0.3,3.39,0.12,3.81c0.91,1.03,1.45,1.75,1.45,3.27c0,5.44-3.27,5.81-6.47,6.17c0.48,0.42,0.97,1.27,0.97,2.6c0,1.87,0,4.23,0,4.66c0,0.36,0.24,0.85,0.97,0.73C26.19,27.78,30,22.4,30,16.17C29.82,8.25,23.47,2.32,15.73,2.32z',
      },
      href: 'https://github.com/lism-css/lism-css',
    },
    {
      label: 'X',
      icon: {
        viewBox: '0 0 32 32',
        path: 'M18.42,13.99L27.88,3h-2.25l-8.21,9.57L10.86,3H3.3l9.93,14.48L3.3,29h2.25l8.69-10.1L21.14,29h7.56 L18.42,13.99L18.42,13.99z M15.35,17.6l-1-1.42L6.31,4.71h3.43l6.44,9.22l1,1.42l8.39,12h-3.43L15.35,17.6L15.35,17.6z',
      },
      href: 'https://x.com/lismcss',
    },
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
