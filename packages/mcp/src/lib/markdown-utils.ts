/** 見出しの `#` レベルを返す（見出しでなければ 0） */
function headingLevel(line: string): number {
  const m = line.match(/^(#{1,6})\s/);
  return m ? m[1].length : 0;
}

/**
 * Markdown から指定した見出しのセクションを抽出する。
 * 同レベル以上の次の見出しが来るまでの内容を返す。
 * @param md - Markdown 全文
 * @param heading - 見出しテキスト（`#` プレフィックスあり・なし両可）
 */
export function extractSection(md: string, heading: string): string {
  const headingText = heading.replace(/^#+\s*/, '').trim();
  const lines = md.split('\n');

  let startIdx = -1;
  let level = 0;

  for (let i = 0; i < lines.length; i++) {
    const lv = headingLevel(lines[i]);
    if (lv > 0 && lines[i].replace(/^#+\s*/, '').trim() === headingText) {
      startIdx = i;
      level = lv;
      break;
    }
  }

  if (startIdx === -1) return '';

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const lv = headingLevel(lines[i]);
    if (lv > 0 && lv <= level) {
      endIdx = i;
      break;
    }
  }

  return lines.slice(startIdx, endIdx).join('\n').trimEnd();
}

/**
 * Markdown から全ての見出しとその開始行を抽出する。
 */
export function listHeadings(md: string): { level: number; text: string; line: number }[] {
  return md.split('\n').flatMap((line, i) => {
    const lv = headingLevel(line);
    if (lv === 0) return [];
    return [{ level: lv, text: line.replace(/^#+\s*/, '').trim(), line: i }];
  });
}

// ----------------------------------------------------------------
// Property Class テーブルパーサー
// ----------------------------------------------------------------

export interface PropRow {
  /** Lism Prop 名（例: "fz"） */
  prop: string;
  /** CSS プロパティ名（例: "font-size"）。変数形式（"--hl"）も含む */
  cssProperty: string;
  /** 所属する ### セクション名 */
  sectionName: string;
}

/**
 * property-class.md のテーブルを全て解析して PropRow[] を返す。
 * `| Prop | CSS プロパティ | ...` 形式のテーブルのみ対象とする。
 */
export function parsePropRows(md: string): PropRow[] {
  const lines = md.split('\n');
  const rows: PropRow[] = [];

  let currentSection = '';
  let inPropTable = false;

  for (const line of lines) {
    const lv = headingLevel(line);

    // セクション見出しを追跡（### レベル）
    if (lv >= 2) {
      currentSection = line.replace(/^#+\s*/, '').trim();
      inPropTable = false;
      continue;
    }

    // Property Class テーブルのヘッダー行を検出
    if (line.includes('Prop') && line.includes('CSS プロパティ')) {
      inPropTable = true;
      continue;
    }

    // 区切り行はスキップ
    if (inPropTable && /^\|[-\s|:]+\|/.test(line)) {
      continue;
    }

    // テーブルの終了を検出
    if (inPropTable && !line.startsWith('|')) {
      inPropTable = false;
      continue;
    }

    // データ行を解析
    if (inPropTable && line.startsWith('|')) {
      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length >= 2) {
        const prop = cells[0].replace(/`/g, '').trim();
        // CSS プロパティ: バッククォート除去、括弧内の注釈は保持しない
        const cssPropertyRaw = cells[1].replace(/`/g, '').trim();
        // `line-height`（`--hl` 経由） のような括弧注釈を除去
        const cssProperty = cssPropertyRaw
          .replace(/（[^）]*）$/, '')
          .replace(/\([^)]*\)$/, '')
          .trim();
        if (prop && cssProperty) {
          rows.push({ prop, cssProperty, sectionName: currentSection });
        }
      }
    }
  }

  return rows;
}

// ----------------------------------------------------------------
// コンポーネント検索
// ----------------------------------------------------------------

/**
 * Markdown からコンポーネント名に一致するセクションを探して返す。
 *
 * components-ui.md のように各コンポーネントが `## ComponentName` で始まる場合に有効。
 */
export function findComponentByHeading(md: string, name: string): string {
  return extractSection(md, name);
}

/**
 * Markdown 内のテーブルセル（`` `<ComponentName>` ``）からコンポーネントを含む
 * `##` セクション全体を返す。
 * components-core.md のように複数コンポーネントが同一セクションに列挙されている場合に使う。
 */
export function findComponentInTables(md: string, name: string): string {
  const nameLower = name.toLowerCase();
  const lines = md.split('\n');

  // コンポーネント名のパターン: `<Flex>`, `<flex>`, または単純に "flex" がテーブル行に含まれるか
  const pattern = new RegExp(`\`?<${name}>?\`?`, 'i');

  // まず対象行を探す
  let targetLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('|') && (pattern.test(lines[i]) || lines[i].toLowerCase().includes(`\`${nameLower}\``))) {
      targetLineIdx = i;
      break;
    }
  }

  if (targetLineIdx === -1) return '';

  // 対象行を含む ## セクションの開始を遡って探す
  let sectionStart = -1;
  let sectionLevel = 0;
  for (let i = targetLineIdx; i >= 0; i--) {
    const lv = headingLevel(lines[i]);
    if (lv === 2) {
      sectionStart = i;
      sectionLevel = lv;
      break;
    }
  }

  if (sectionStart === -1) return lines.slice(0, targetLineIdx + 20).join('\n');

  // セクションの終端を探す
  let sectionEnd = lines.length;
  for (let i = sectionStart + 1; i < lines.length; i++) {
    const lv = headingLevel(lines[i]);
    if (lv > 0 && lv <= sectionLevel) {
      sectionEnd = i;
      break;
    }
  }

  return lines.slice(sectionStart, sectionEnd).join('\n').trimEnd();
}
