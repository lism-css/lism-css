import { vercelRedirects } from './src/config/redirects';

const config = {
  buildCommand: 'cd ../.. && pnpm turbo run build --filter=./apps/docs',
  redirects: vercelRedirects,
  headers: [
    {
      source: '/:path*/og/:slug*.png',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, s-maxage=31536000, max-age=86400, must-revalidate',
        },
      ],
    },
    {
      source: '/:path*.md',
      headers: [
        {
          key: 'X-Robots-Tag',
          value: 'noindex',
        },
        {
          key: 'Content-Type',
          value: 'text/markdown; charset=utf-8',
        },
      ],
    },
  ],
};

export default config;
