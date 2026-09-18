import { describe, it, expect } from 'vitest';
import { externalLinks } from './external-links';
import { renderHtml } from './test-render';

const render = (source: string) => renderHtml(source, [externalLinks]);

describe('externalLinks', () => {
  it.each(['https://example.com/path', 'http://example.com', '//example.com/x'])('%s を別タブで開く', async (href) => {
    const html = await render(`[link](${href})\n`);
    expect(html).toBe(`<p><a href="${href}" rel="noopener noreferrer" target="_blank">link</a></p>`);
  });

  it.each(['/docs/', 'docs/', '#anchor', 'mailto:a@example.com', 'ftp://example.com'])('%s は変更しない', async (href) => {
    const html = await render(`[link](${href})\n`);
    expect(html).toBe(`<p><a href="${href}">link</a></p>`);
  });
});
