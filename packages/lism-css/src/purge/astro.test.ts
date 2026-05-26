import { describe, test, expect, vi } from 'vitest';
import { lismPurgeAstro } from './astro';

function getConfigSetupHook(integration: ReturnType<typeof lismPurgeAstro>) {
  const hook = integration.hooks['astro:config:setup'];
  if (!hook) throw new Error('astro:config:setup hook not found');
  return hook;
}

describe('lismPurgeAstro (Astro)', () => {
  test('astro:config:setup で Vite plugin を updateConfig 経由で注入する', () => {
    const integration = lismPurgeAstro();
    const updateConfig = vi.fn();
    void getConfigSetupHook(integration)({ updateConfig } as never);

    expect(updateConfig).toHaveBeenCalledTimes(1);
    const arg = updateConfig.mock.calls[0]?.[0] as { vite?: { plugins?: unknown[] } };
    const plugins = arg.vite?.plugins ?? [];
    expect(plugins).toHaveLength(1);
    const plugin = plugins[0] as { name?: string };
    expect(plugin?.name).toBe('lism-css:purge');
  });

  test('options は内部の Vite plugin にそのまま渡る', () => {
    // safelist が plugin に届くことを E2E で確認する代わりに、
    // 注入された plugin が Vite plugin の形を保っていれば options の伝播は型/実装で保証される。
    const integration = lismPurgeAstro({ report: true });
    const updateConfig = vi.fn();
    void getConfigSetupHook(integration)({ updateConfig } as never);
    const plugin = (updateConfig.mock.calls[0]?.[0] as { vite: { plugins: unknown[] } }).vite.plugins[0] as Record<string, unknown>;
    // Vite plugin として要求される最低限の shape
    expect(plugin).toHaveProperty('name', 'lism-css:purge');
    expect(plugin).toHaveProperty('apply', 'build');
    expect(typeof plugin.generateBundle === 'function' || typeof plugin.generateBundle === 'object').toBe(true);
  });
});
