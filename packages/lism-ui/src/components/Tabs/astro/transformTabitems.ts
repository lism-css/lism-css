import escapeHtmlAttr from '../../../helper/escapeHtmlAttr.js';

type TransformResult = {
  btns: string[];
  panels: string[];
};

// Tab.astro / Panel.astro が Root から tabId を受け取れなかった時に出力するID（置換の目印）
const DEFAULT_CONTROL_ID = '__LISM_TAB_ID__-0';

// 開始タグ内の hidden 属性だけを取り除く（パネルの中身にある hidden は残す）
function removeHiddenAttr(html: string): string {
  return html.replace(/^(\s*<[a-zA-Z][^>]*?)\shidden(?:="[^"]*")?(?=[\s>])/, '$1');
}

// <lism-placeholder-tabitem> → div.tabitem へ 変換
export default function transformHTML(htmlString: string, tabID: string, defaultIndex: number): TransformResult {
  const btns: string[] = [];
  const panels: string[] = [];

  // 結果は set:html で出力されるため、ユーザー指定の tabID は属性値としてエスケープしてから埋め込む
  const safeTabID = escapeHtmlAttr(tabID);

  const regex = /<lism-placeholder-tabitem(.*?)>(.*?)<\/lism-placeholder-tabitem>/gs;
  const matches = [...htmlString.matchAll(regex)];

  // button（タブ）を持つ tabitem だけを先に抽出する。持たないものを index の割り当てや総数に含めると、
  // 残ったタブの index がずれて defaultIndex と噛み合わなくなるため
  const items = matches
    .map((match) => match[2].match(/<button(.*?)>(.*?)<\/button>(.*)/s))
    .filter((btnMatch): btnMatch is RegExpMatchArray => null !== btnMatch);

  // 範囲外の defaultIndex は 1 にフォールバック
  const activeIndex = defaultIndex >= 1 && defaultIndex <= items.length ? defaultIndex : 1;

  items.forEach((btnMatch, i) => {
    const index = i + 1; // 1スタート
    const controlId = `${safeTabID}-${index}`;
    const isActive = index === activeIndex;

    let btnAtts = btnMatch[1];
    const btnContent = btnMatch[2];
    let panel = btnMatch[3];

    // ID の置換。検索文字列に属性名と閉じ引用符まで含めているため、置換の順序には依存しない
    // （置換値は関数で渡し、tabID 内の `$&` 等が置換パターンとして解釈されないようにする）
    btnAtts = btnAtts.replace(`id="${DEFAULT_CONTROL_ID}-tab"`, () => `id="${controlId}-tab"`);
    btnAtts = btnAtts.replace(`aria-controls="${DEFAULT_CONTROL_ID}"`, () => `aria-controls="${controlId}"`);
    panel = panel.replace(`aria-labelledby="${DEFAULT_CONTROL_ID}-tab"`, () => `aria-labelledby="${controlId}-tab"`);
    panel = panel.replace(`id="${DEFAULT_CONTROL_ID}"`, () => `id="${controlId}"`);

    if (isActive) {
      btnAtts = btnAtts.replace('aria-selected="false"', 'aria-selected="true"');
      btnAtts = btnAtts.replace('tabindex="-1"', 'tabindex="0"');
      panel = removeHiddenAttr(panel);
    }

    btns.push(`<button${btnAtts}>${btnContent}</button>`);
    panels.push(panel);
  });

  return { btns, panels };
}
