// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import type { Plugin } from 'vite';
import { lismCss, lismCssAstro } from './vite';
import { lismConfigAlias } from './vite-config-alias';

type ConfigReturn = { optimizeDeps: { exclude: string[] }; resolve?: { alias: Record<string, string> } };

function callConfigHook(plugin: Plugin, root: string): ConfigReturn {
  const hook = plugin.config;
  const fn = (typeof hook === 'function' ? hook : hook?.handler) as unknown as (
    c: { root?: string },
    e: { command: string; mode: string }
  ) => ConfigReturn;
  return fn({ root }, { command: 'serve', mode: 'development' });
}

describe('lismCss (umbrella / vite)', () => {
  test('purge なし: config alias + typegen + CSS ビルドの3プラグイン', () => {
    expect(lismCss().map((p) => p.name)).toEqual(['lism-css:config-alias', 'lism-css:typegen', 'lism-css:css']);
  });

  test('purge:true: known 構築 + purge を追加する', () => {
    expect(lismCss({ purge: true }).map((p) => p.name)).toEqual([
      'lism-css:config-alias',
      'lism-css:typegen',
      'lism-css:css',
      'lism-css:known',
      'lism-css:purge',
    ]);
  });

  test('purge で known を明示した場合は known 構築プラグインを足さない', () => {
    const plugins = lismCss({ purge: { known: { classes: new Set(), attrs: new Set() } } });
    expect(plugins.map((p) => p.name)).toEqual(['lism-css:config-alias', 'lism-css:typegen', 'lism-css:css', 'lism-css:purge']);
  });

  test('typegen:false でも typegen プラグイン自体は構成に残る（buildStart で no-op）', () => {
    // プラグインの有無ではなく disabled フラグで制御するため、名前一覧は変わらない。
    expect(lismCss({ typegen: false }).map((p) => p.name)).toEqual(['lism-css:config-alias', 'lism-css:typegen', 'lism-css:css']);
  });
});

describe('lismConfigAlias', () => {
  test('user 設定があれば lism-css/config.js を alias する', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-alias-'));
    fs.writeFileSync(path.join(tmp, 'lism.config.js'), 'export default {};\n');
    try {
      const cfg = callConfigHook(lismConfigAlias(), tmp);
      expect(cfg.optimizeDeps.exclude).toContain('lism-css/config.js');
      expect(cfg.resolve?.alias['lism-css/config.js']).toMatch(/lism\.config\.js$/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('user 設定が無ければ alias せず optimizeDeps.exclude のみ', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-alias-'));
    try {
      const cfg = callConfigHook(lismConfigAlias(), tmp);
      expect(cfg.optimizeDeps.exclude).toContain('lism-css/config.js');
      expect(cfg.resolve).toBeUndefined();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('lismCssAstro (umbrella / astro)', () => {
  test('purge なし: integration 1つ（name: lism-css）', () => {
    const ints = lismCssAstro();
    expect(ints).toHaveLength(1);
    expect(ints[0].name).toBe('lism-css');
  });

  test('purge:true: lism-css + purge integration', () => {
    expect(lismCssAstro({ purge: true }).map((i) => i.name)).toEqual(['lism-css', 'lism-css:purge']);
  });
});
