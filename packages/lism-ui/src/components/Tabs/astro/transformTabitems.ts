type TransformResult = {
  btns: string[];
  panels: string[];
};

// <lism-placeholder-tabitem> → div.tabitem へ 変換
export default function transformHTML(htmlString: string, tabID: string, defaultIndex: number): TransformResult {
  let index = 1; // 1スタート
  const btns: string[] = [];
  const panels: string[] = [];

  const regex = /<lism-placeholder-tabitem(.*?)>(.*?)<\/lism-placeholder-tabitem>/gs;
  const matches = [...htmlString.matchAll(regex)];

  matches.forEach((match) => {
    const tabItemContent = match[2];

    const controlId = `${tabID}-${index}`;
    const isActive = index === defaultIndex;
    index++;

    const btnMatch = tabItemContent.match(/<button(.*?)>(.*?)<\/button>(.*)/s);
    if (!btnMatch) return;
    let btnAtts = btnMatch[1];
    const btnContent = btnMatch[2];
    let panel = btnMatch[3];

    btnAtts = btnAtts.replace(`aria-controls="tab-0"`, `aria-controls="${controlId}"`);
    panel = panel.replace(`id="tab-0"`, `id="${controlId}"`);
    if (isActive) {
      btnAtts = btnAtts.replace(/aria-selected="false"/, 'aria-selected="true"');
      panel = panel.replace(/aria-hidden="true"/, 'aria-hidden="false"');
    }

    btns.push(`<button${btnAtts}>${btnContent}</button>`);
    panels.push(panel);
  });

  return { btns, panels };
}
