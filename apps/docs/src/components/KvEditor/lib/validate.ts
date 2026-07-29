// エディター入力の保護。
// - MAX_CODE_LENGTH: 毎キー入力で走るハイライト・変換・ヒーロー描画の負荷上限（クラッシュ防止）
// - findHtmlIssue: スタック式の軽量タグバランスチェック。
//   ブラウザの HTML パーサーは寛容で「不正」を返さないため、閉じ漏れ等の
//   よくあるミスだけを自前で検知してスナックバー表示に使う（描画は止めない）。

/** エディターの最大入力文字数 */
export const MAX_CODE_LENGTH = 2_000;

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'source', 'track', 'wbr']);

/** 引用符内の `>` を無視してタグの終わりを探す */
const findTagEnd = (code: string, from: number): number => {
  let quote = '';
  for (let i = from; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '>') {
      return i;
    }
  }
  return -1;
};

/**
 * HTMLのタグ対応をチェックし、問題があれば表示用メッセージを、なければ null を返す。
 * 検知対象: 書きかけのタグ / 閉じ漏れ / 対応しない閉じタグ / 未終了コメント
 * 戻り値の文言は内部用の短い英語（表示側は一律 'Invalid HTML syntax' を使う）
 */
export function findHtmlIssue(code: string): string | null {
  const stack: string[] = [];
  let i = 0;

  while (i < code.length) {
    const lt = code.indexOf('<', i);
    if (lt === -1) break;

    // コメント
    if (code.startsWith('<!--', lt)) {
      const end = code.indexOf('-->', lt + 4);
      if (end === -1) return 'unterminated comment';
      i = end + 3;
      continue;
    }

    const next = code[lt + 1] ?? '';
    // `a < b` のような地の文の `<` はタグとして扱わない（ブラウザと同じ扱い）
    if (!/[a-zA-Z/!]/.test(next)) {
      i = lt + 1;
      continue;
    }

    const gt = findTagEnd(code, lt + 1);
    if (gt === -1) return 'incomplete tag';

    const raw = code.slice(lt + 1, gt);
    i = gt + 1;

    // doctype 等はスキップ
    if (raw.startsWith('!')) continue;

    const isClose = raw.startsWith('/');
    const nameMatch = (isClose ? raw.slice(1) : raw).match(/^([a-zA-Z][a-zA-Z0-9-]*)/);
    if (!nameMatch) return 'malformed tag';
    const tag = nameMatch[1].toLowerCase();

    if (isClose) {
      if (stack.length > 0 && stack[stack.length - 1] === tag) {
        stack.pop();
      } else if (stack.includes(tag)) {
        return `unclosed <${stack[stack.length - 1]}>`;
      } else {
        return `stray closing </${tag}>`;
      }
    } else if (!raw.endsWith('/') && !VOID_TAGS.has(tag)) {
      stack.push(tag);
    }
  }

  if (stack.length > 0) return `unclosed <${stack[stack.length - 1]}>`;
  return null;
}
