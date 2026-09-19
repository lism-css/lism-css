import { describe, it, expect } from 'vitest';
import { evaluate } from 'satteri';
import { directiveCallout, CALLOUT_TYPES } from './directive-callout';

// MDX を文字列 HTML へ描画する最小の JSX ランタイム。Callout は c--docsNote の div で代用する
type Html = { __html: string };
type Props = { children?: unknown; [key: string]: unknown };
const Fragment = Symbol('Fragment');

function escapeText(value: unknown): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(value: unknown): string {
  return escapeText(value).replace(/"/g, '&quot;');
}

function render(children: unknown): string {
  if (children == null) return '';
  if (Array.isArray(children)) return children.map(render).join('');
  if (typeof children === 'object' && '__html' in children) return (children as Html).__html;
  return escapeText(children);
}

function jsx(type: unknown, rawProps: unknown): Html {
  const props = (rawProps ?? {}) as Props;
  if (typeof type === 'function') return type(props);
  const { children, ...attrs } = props;
  if (type === Fragment) return { __html: render(children) };
  const attrText = Object.entries(attrs)
    .map(([key, value]) => ` ${key}="${escapeAttr(value)}"`)
    .join('');
  return { __html: `<${String(type)}${attrText}>${render(children)}</${String(type)}>` };
}

const Callout = ({ type, children }: Props): Html => ({ __html: `<div class="c--docsNote" data-type="${String(type)}">${render(children)}</div>` });

async function renderMdx(source: string): Promise<string> {
  const mod = await evaluate(source, {
    features: { directive: true, headingAttributes: true, gfm: true, smartPunctuation: { dashes: false } },
    mdastPlugins: [directiveCallout],
    fileURL: new URL('file:///content/test.mdx'),
    Fragment,
    jsx,
    jsxs: jsx,
  });
  const MDXContent = mod.default as (props: Props) => Html;
  return render(MDXContent({ components: { Callout } }));
}

describe('directiveCallout', () => {
  it(':::type を <Callout type> に変換する', async () => {
    const html = await renderMdx(':::tip\n本文\n:::\n');
    expect(html).toBe('<div class="c--docsNote" data-type="tip"><p>本文</p></div>');
  });

  it('対応する type の一覧を固定する', () => {
    expect([...CALLOUT_TYPES].sort()).toEqual(['alert', 'check', 'help', 'info', 'note', 'point', 'tip', 'warning']);
  });

  it('::title[...] を段落で包まずに c--docsNote_title にする', async () => {
    const html = await renderMdx(':::warning\n::title[タイトル `hoge`]\n本文\n:::\n');
    expect(html).toBe(
      '<div class="c--docsNote" data-type="warning"><div class="c--docsNote_title">タイトル <code>hoge</code></div><p>本文</p></div>'
    );
  });

  it('Callout 内の Markdown（リストや強調）を保持する', async () => {
    const html = await renderMdx(':::info\n先頭 **強調**\n\n- 項目1\n- 項目2\n:::\n');
    expect(html).toBe('<div class="c--docsNote" data-type="info"><p>先頭 <strong>強調</strong></p><ul>\n<li>項目1</li>\n<li>項目2</li>\n</ul></div>');
  });

  it('未対応の :::type はエラーにする', async () => {
    await expect(renderMdx(':::caution\n本文\n:::\n')).rejects.toThrow(/Unknown callout type ":::caution" in \/content\/test\.mdx/);
  });

  it('::title 以外の leaf directive はエラーにする', async () => {
    await expect(renderMdx(':::note\n::summary[x]\n本文\n:::\n')).rejects.toThrow(/Unknown leaf directive "::summary"/);
  });

  it('未使用の :name（textDirective）を元のテキストへ戻す', async () => {
    const html = await renderMdx('比率は 1:2 で、hover:bg と 2:3列 も同様です。\n');
    expect(html).toBe('<p>比率は 1:2 で、hover:bg と 2:3列 も同様です。</p>');
  });

  it('label と属性付きの textDirective も元の表記へ戻す', async () => {
    const html = await renderMdx('前 :name[ラベル]{a=1 b} 後\n');
    expect(html).toBe('<p>前 :name[ラベル]{a="1" b} 後</p>');
  });
});
