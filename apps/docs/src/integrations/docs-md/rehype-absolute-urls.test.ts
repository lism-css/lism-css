import { describe, it, expect } from 'vitest';
import type { Root, Element, Properties } from 'hast';
import { absolutize, rehypeAbsoluteUrls } from './rehype-absolute-urls';

const BASE = 'https://lism-css.com';

function runPlugin(properties: Properties, tagName = 'img'): Element {
  const el: Element = { type: 'element', tagName, properties, children: [] };
  const tree: Root = { type: 'root', children: [el] };
  rehypeAbsoluteUrls({ siteUrl: BASE })(tree);
  return el;
}

describe('absolutize', () => {
  it('ルート相対パスは絶対 URL に展開される', () => {
    expect(absolutize('/docs/overview/', BASE)).toBe('https://lism-css.com/docs/overview/');
  });

  it('絶対 URL はそのまま', () => {
    expect(absolutize('https://example.com/foo', BASE)).toBe('https://example.com/foo');
    expect(absolutize('http://example.com/foo', BASE)).toBe('http://example.com/foo');
  });

  it('プロトコル相対 URL はそのまま', () => {
    expect(absolutize('//example.com/foo', BASE)).toBe('//example.com/foo');
  });

  it('アンカーはそのまま', () => {
    expect(absolutize('#section', BASE)).toBe('#section');
  });

  it('mailto / tel 等のスキーム付きはそのまま', () => {
    expect(absolutize('mailto:a@example.com', BASE)).toBe('mailto:a@example.com');
    expect(absolutize('tel:+8190', BASE)).toBe('tel:+8190');
  });

  it('相対パス（./, ../, file.png）は触らない', () => {
    expect(absolutize('./foo', BASE)).toBe('./foo');
    expect(absolutize('../foo', BASE)).toBe('../foo');
    expect(absolutize('image.png', BASE)).toBe('image.png');
  });

  it('クエリ・フラグメント付きルート相対も展開される', () => {
    expect(absolutize('/docs/?a=1#x', BASE)).toBe('https://lism-css.com/docs/?a=1#x');
  });
});

describe('rehypeAbsoluteUrls (plugin)', () => {
  it('img.src のルート相対パスを絶対 URL 化する', () => {
    const el = runPlugin({ src: '/foo.png' });
    expect(el.properties?.src).toBe('https://lism-css.com/foo.png');
  });

  it('img.srcSet が配列値（hast の commaSeparated）でも各要素を絶対 URL 化する', () => {
    const el = runPlugin({ srcSet: ['/a.png 1x', '/b.png 2x'] });
    expect(el.properties?.srcSet).toEqual(['https://lism-css.com/a.png 1x', 'https://lism-css.com/b.png 2x']);
  });

  it('img.srcSet が文字列値でもカンマ区切りで展開する', () => {
    const el = runPlugin({ srcSet: '/a.png 1x, /b.png 2x' });
    expect(el.properties?.srcSet).toBe('https://lism-css.com/a.png 1x, https://lism-css.com/b.png 2x');
  });

  it('srcSet 内の絶対 URL / 相対パスは触らず、ルート相対のみ展開される', () => {
    const el = runPlugin({
      srcSet: ['https://cdn.example.com/a.png 1x', '/b.png 2x', './c.png 3x'],
    });
    expect(el.properties?.srcSet).toEqual(['https://cdn.example.com/a.png 1x', 'https://lism-css.com/b.png 2x', './c.png 3x']);
  });

  it('a.href のルート相対パスは絶対 URL 化される', () => {
    const el = runPlugin({ href: '/docs/' }, 'a');
    expect(el.properties?.href).toBe('https://lism-css.com/docs/');
  });
});
