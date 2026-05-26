import { describe, test, expect, vi } from 'vitest';
import { lismPurge } from './vite';

type AnyPluginCtx = Record<string, unknown>;

function getGenerateBundle(plugin: ReturnType<typeof lismPurge>) {
  const hook = plugin.generateBundle;
  if (typeof hook === 'function') return hook;
  if (hook && typeof hook === 'object' && 'handler' in hook) return hook.handler;
  throw new Error('generateBundle hook not found');
}

describe('lismPurge (Vite)', () => {
  test('lism signature を含まない CSS asset は書き換えられない', async () => {
    const plugin = lismPurge();
    const original = '.button--primary{color:red}.card{padding:8px}';
    const bundle: Record<string, unknown> = {
      'assets/styles.css': {
        type: 'asset',
        fileName: 'assets/styles.css',
        source: original,
      },
    };
    const ctx: AnyPluginCtx = { info: vi.fn(), warn: vi.fn() };
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);
    expect((bundle['assets/styles.css'] as { source: string }).source).toBe(original);
  });

  test('lism signature を含む CSS は used に基づいて purge される', async () => {
    const plugin = lismPurge();
    const bundle: Record<string, unknown> = {
      'assets/main.css': {
        type: 'asset',
        fileName: 'assets/main.css',
        source: '.-p\\:20{padding:var(--s20)}.-m\\:10{margin:var(--s10)}',
      },
      'assets/app.js': {
        type: 'chunk',
        fileName: 'assets/app.js',
        code: 'const cls = "-p:20";',
      },
    };
    const ctx: AnyPluginCtx = { info: vi.fn(), warn: vi.fn() };
    await getGenerateBundle(plugin).call(ctx as never, {} as never, bundle as never, false);
    const source = (bundle['assets/main.css'] as { source: string }).source;
    expect(source).toContain('-p\\:20');
    expect(source).not.toContain('-m\\:10');
  });
});
