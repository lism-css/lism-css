import { describe, it, expect } from 'vitest';
import { absolutize } from './rehype-absolute-urls';

const BASE = 'https://lism-css.com';

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
