import { describe, it, expect } from 'vitest';
import { wrapTable } from './wrap-table';
import { renderHtml } from './test-render';

const TABLE = '| a | b |\n| --- | --- |\n| 1 | 2 |\n';

describe('wrapTable', () => {
  it('table を横スクロール用の div で包む', async () => {
    const html = await renderHtml(TABLE, [wrapTable]);
    expect(html).toBe(
      '<div class="-ov-x:auto"><table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table></div>'
    );
  });

  it('複数の table をそれぞれ 1 回だけ包む', async () => {
    const html = await renderHtml(`${TABLE}\n段落\n\n${TABLE}`, [wrapTable]);
    expect(html.match(/<div class="-ov-x:auto">/g)).toHaveLength(2);
    expect(html).not.toContain('<div class="-ov-x:auto"><div class="-ov-x:auto">');
  });
});
