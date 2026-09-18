import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { getAllLangs } from './i18n';

const CONTENT_DIR = fileURLToPath(new URL('../content', import.meta.url));

// ロケールに依存しないパス（言語プレフィックスを付けない）
const LANG_NEUTRAL_PREFIXES = ['/demo/'];

const LINK_PATTERN = /(?:\]\(|href=")(\/[^)"\s#]*)/g;
// 画像は言語プレフィックスを持たない共有アセット
const IMAGE_PATTERN = /!\[[^\]]*\]\([^)]*\)/g;

function findUnlocalizedLinks(lang: string): string[] {
  const langDir = join(CONTENT_DIR, lang);
  const files = readdirSync(langDir, { recursive: true, encoding: 'utf8' }).filter((file) => file.endsWith('.mdx'));
  const prefix = `/${lang}/`;
  const violations: string[] = [];

  for (const file of files) {
    const filePath = join(langDir, file);
    let inCodeFence = false;

    readFileSync(filePath, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (/^\s*```/.test(line)) {
          inCodeFence = !inCodeFence;
          return;
        }
        // コードフェンス内はサンプルコードなので対象外
        if (inCodeFence) return;

        // 画像だけを取り除き、画像を包むリンクは検査対象に残す
        for (const [, href] of line.replace(IMAGE_PATTERN, '').matchAll(LINK_PATTERN)) {
          if (href.startsWith(prefix) || href === `/${lang}`) continue;
          if (LANG_NEUTRAL_PREFIXES.some((neutral) => href.startsWith(neutral))) continue;
          violations.push(`${relative(CONTENT_DIR, filePath)}:${index + 1} ${href}`);
        }
      });
  }

  return violations;
}

describe('翻訳版MDXの内部リンク', () => {
  const translatedLangs = getAllLangs().filter((lang) => !lang.isRoot);

  it.each(translatedLangs)('$code: 内部リンクに言語プレフィックスが付いている', ({ code }) => {
    expect(findUnlocalizedLinks(code)).toEqual([]);
  });
});
