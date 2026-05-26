import type { AstroIntegration } from 'astro';
import { lismPurge } from './vite';
import type { LismPurgeOptions } from './options';

export type { LismPurgeOptions } from './options';

// Astro 統合は内部で Vite plugin を注入する。
// `astro:build:done` で dist 配下を直接書き換えると `_astro/*.{hash}.css` の
// ハッシュと内容がずれ、immutable キャッシュ越しに古い CSS が配信される恐れがあるため、
// Vite のバンドル処理（ハッシュ生成前）に purge を割り込ませる。
export function lismPurgeAstro(options: LismPurgeOptions = {}): AstroIntegration {
  return {
    name: 'lism-css:purge',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [lismPurge(options)],
          },
        });
      },
    },
  };
}
