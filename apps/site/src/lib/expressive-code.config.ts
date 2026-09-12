import type { AstroExpressiveCodeOptions } from 'astro-expressive-code';

export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
  themes: ['github-light', 'github-dark'],
  themeCssSelector: (theme) => `[data-theme='${theme.type}']`,

  useThemedScrollbars: false,
};
