/**
 * OG画像用サブセットフォントの文字カバレッジ照合
 * satori は未収録の文字をエラーにせず空白で描画してしまうため、
 * ビルド時に未収録文字を検出してビルドを止めるために使う。
 */
import fs from 'node:fs';
import path from 'node:path';

let cachedChars: Set<string> | null = null;

/** サブセットフォントの収録文字一覧（コードポイント順に並んだ1行テキスト）を読み込む */
export function loadOgFontChars(): Set<string> {
  if (cachedChars) return cachedChars;

  // OG画像生成用アセットのディレクトリ（ogImage.tsx の assetsDir と同じ流儀）
  const assetsDir = path.resolve(process.cwd(), 'src/assets/og');
  const raw = fs.readFileSync(path.join(assetsDir, 'og-font-chars.txt'), 'utf-8');

  // サロゲートペアを1文字として扱うためコードポイント単位で分割する
  cachedChars = new Set([...raw].filter((char) => !/\s/.test(char)));
  return cachedChars;
}

/** text のうちフォントに収録されていない文字を、重複なし・出現順で返す（空白類は無視） */
export function findUncoveredChars(text: string, covered: ReadonlySet<string>): string[] {
  const uncovered = new Set<string>();

  for (const char of text) {
    if (/\s/.test(char)) continue;
    if (covered.has(char)) continue;
    uncovered.add(char);
  }

  return [...uncovered];
}
