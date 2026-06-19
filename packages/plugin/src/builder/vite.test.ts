// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import type { Plugin } from 'vite';
import { lismCss } from './vite';
import { lismCss as lismCssForAstro } from './astro';
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

  test('configPath が指定されていれば明示ファイルを alias する', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-alias-'));
    fs.mkdirSync(path.join(tmp, 'configs'));
    fs.writeFileSync(path.join(tmp, 'lism.config.js'), 'export default { name: "root" };\n');
    fs.writeFileSync(path.join(tmp, 'configs/lism.custom.mjs'), 'export default { name: "custom" };\n');
    try {
      const cfg = callConfigHook(lismConfigAlias({ configPath: 'configs/lism.custom.mjs' }), tmp);
      expect(cfg.resolve?.alias['lism-css/config.js']).toMatch(/configs\/lism\.custom\.mjs$/);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('存在しない configPath 指定時は root 直下の config へフォールバックしない', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-alias-'));
    fs.writeFileSync(path.join(tmp, 'lism.config.js'), 'export default {};\n');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const cfg = callConfigHook(lismConfigAlias({ configPath: 'missing.config.js' }), tmp);
      expect(cfg.resolve).toBeUndefined();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('missing.config.js'));
    } finally {
      errorSpy.mockRestore();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('lismCss (integrated / astro)', () => {
  test('purge なし: integration 1つ（name: lism-css）', () => {
    const ints = lismCssForAstro();
    expect(ints).toHaveLength(1);
    expect(ints[0].name).toBe('lism-css');
  });

  test('purge:true: lism-css + purge integration', () => {
    expect(lismCssForAstro({ purge: true }).map((i) => i.name)).toEqual(['lism-css', 'lism-css:purge']);
  });
});
