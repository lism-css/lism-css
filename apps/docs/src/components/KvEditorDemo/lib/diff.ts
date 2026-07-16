// シナリオ再生のコード書き換えアニメで使う diff 計算。
// - diffLineHunks: 行単位のLCSで「変更された行のまとまり（ハンク）」を列挙する。
//   開始タグと閉じタグのように離れた場所が変わっても、間の無変更行を巻き込まない
//   （例: JSXタブの <Flex>→<Stack> で子要素を再タイプさせないため）
// - diffCode: 文字単位で共通の先頭・末尾を除いた差分（ハンク内のタイピング範囲を絞る）

export interface CodeDiff {
  head: string;
  removed: string;
  inserted: string;
  tail: string;
}

/** 共通のprefix/suffixを保持したまま差分部分だけを書き換えるためのdiff計算 */
export const diffCode = (from: string, to: string): CodeDiff => {
  let prefix = 0;
  const maxPrefix = Math.min(from.length, to.length);
  while (prefix < maxPrefix && from[prefix] === to[prefix]) prefix++;

  let suffix = 0;
  const maxSuffix = Math.min(from.length, to.length) - prefix;
  while (suffix < maxSuffix && from[from.length - 1 - suffix] === to[to.length - 1 - suffix]) suffix++;

  return {
    head: from.slice(0, prefix),
    removed: from.slice(prefix, from.length - suffix),
    inserted: to.slice(prefix, to.length - suffix),
    tail: from.slice(from.length - suffix),
  };
};

/** 変更行のまとまり。fromLines[fromStart, fromEnd) を toLines[toStart, toEnd) に置き換える */
export interface LineHunk {
  fromStart: number;
  fromEnd: number;
  toStart: number;
  toEnd: number;
}

/** 行単位のLCSで変更ハンクを列挙する（対象は高々数十行なので O(m*n) で十分） */
export const diffLineHunks = (fromLines: string[], toLines: string[]): LineHunk[] => {
  const m = fromLines.length;
  const n = toLines.length;

  // dp[i][j] = fromLines[i:] と toLines[j:] のLCS長
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = fromLines[i] === toLines[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  // LCSパスをたどり、一致行以外の連続区間を1ハンクにまとめる
  const hunks: LineHunk[] = [];
  let i = 0;
  let j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && fromLines[i] === toLines[j]) {
      i++;
      j++;
      continue;
    }
    const fromStart = i;
    const toStart = j;
    while (i < m || j < n) {
      if (i < m && j < n && fromLines[i] === toLines[j]) break;
      if (j >= n || (i < m && dp[i + 1][j] >= dp[i][j + 1])) i++;
      else j++;
    }
    hunks.push({ fromStart, fromEnd: i, toStart, toEnd: j });
  }
  return hunks;
};
