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

  const regex = /<lism-placeholder-tabitem(.*?)>(.*?)<\/lism-placeholder-tabitem>/gs;
  const matches = [...htmlString.matchAll(regex)];

  // 範囲外の defaultIndex は 1 にフォールバック
  const activeIndex = defaultIndex >= 1 && defaultIndex <= matches.length ? defaultIndex : 1;

  let index = 1; // 1スタート
  matches.forEach((match) => {
    const tabItemContent = match[2];

    const controlId = `${tabID}-${index}`;
    const isActive = index === activeIndex;
    index++;

    const btnMatch = tabItemContent.match(/<button(.*?)>(.*?)<\/button>(.*)/s);
    if (!btnMatch) return;
    let btnAtts = btnMatch[1];
    const btnContent = btnMatch[2];
    let panel = btnMatch[3];

    // ID の置換。検索文字列に属性名と閉じ引用符まで含めているため、置換の順序には依存しない
    btnAtts = btnAtts.replace(`id="${DEFAULT_CONTROL_ID}-tab"`, `id="${controlId}-tab"`);
    btnAtts = btnAtts.replace(`aria-controls="${DEFAULT_CONTROL_ID}"`, `aria-controls="${controlId}"`);
    panel = panel.replace(`aria-labelledby="${DEFAULT_CONTROL_ID}-tab"`, `aria-labelledby="${controlId}-tab"`);
    panel = panel.replace(`id="${DEFAULT_CONTROL_ID}"`, `id="${controlId}"`);

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
