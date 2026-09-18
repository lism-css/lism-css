import { describe, it, expect } from 'vitest';
import { blockquoteCite } from './blockquote-cite';
import { renderHtml } from './test-render';

const render = (source: string) => renderHtml(source, [blockquoteCite]);

describe('blockquoteCite', () => {
  it('URL 付きの出典を figure + figcaption のリンクにし、blockquote に cite を付ける', async () => {
    const html = await render('> これは引用文です。\n>\n> -- [出典元の名前](https://example.com)\n');
    expect(html).toBe(
      '<figure class="b--blockquote"><blockquote cite="https://example.com"><p>これは引用文です。</p></blockquote><figcaption><a href="https://example.com">出典元の名前</a></figcaption></figure>'
    );
  });

  it('URL 無しの出典を figcaption のテキストにする', async () => {
    const html = await render('> これは引用文です。\n>\n> -- 出典元の名前\n');
    expect(html).toBe(
      '<figure class="b--blockquote"><blockquote><p>これは引用文です。</p></blockquote><figcaption>出典元の名前</figcaption></figure>'
    );
  });

  it.each(['—', '–'])('%s で始まる出典も認識する', async (dash) => {
    const html = await render(`> 引用\n>\n> ${dash} 出典\n`);
    expect(html).toContain('<figcaption>出典</figcaption>');
  });

  it('複数段落の引用本文を保持する', async () => {
    const html = await render('> 段落1\n>\n> 段落2\n>\n> -- 出典\n');
    expect(html).toBe('<figure class="b--blockquote"><blockquote><p>段落1</p><p>段落2</p></blockquote><figcaption>出典</figcaption></figure>');
  });

  it('出典行が無い blockquote は変換しない', async () => {
    const html = await render('> これは引用文です。\n');
    expect(html).toBe('<blockquote><p>これは引用文です。</p></blockquote>');
  });

  it('出典行が最後の段落でなければ変換しない', async () => {
    const html = await render('> -- 出典\n>\n> 本文\n');
    expect(html).toBe('<blockquote><p>-- 出典</p><p>本文</p></blockquote>');
  });
});
