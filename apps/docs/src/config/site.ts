export type LangConfig = {
  label: string;
  root?: boolean; // メイン言語かどうか（URLにプレフィックスが付かない）
};

export const siteConfig = {
  publish: true,
  name: 'Lism CSS',
  description: 'Lism CSS の公式ドキュメントサイトです。',

  // root: true の言語はURLにプレフィックスが付かない（例: /introduction）
  // root: false/未指定の言語はURLにプレフィックスが付く（例: /en/introduction）
  langs: {
    ja: {
      label: '日本語',
      root: true,
    },
    en: {
      label: 'English',
    },
  } as const satisfies Record<string, LangConfig>,

  author: {
    name: 'ddryo',
    github: 'https://github.com/lism-css/lism-css',
    twitter: 'https://x.com/lismcss',
    discord: 'https://discord.gg/6PMcFHvc4h',
  },

  pagination: {
    postsPerPage: 12,
  },

  theme: {
    default: 'light' as 'system' | 'light' | 'dark',
  },
} as const;

export type SiteConfig = typeof siteConfig;

export type LangCode = keyof typeof siteConfig.langs;
