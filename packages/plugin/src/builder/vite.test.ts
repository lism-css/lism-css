// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, test, vi } from 'vitest';
import type { Plugin } from 'vite';
import { lismCss } from './vite';
import { lismCss as lismCssForAstro } from './astro';
import { lismConfigAlias } from './vite-config-alias';
import { lismTypegen } from './vite-typegen';

type ConfigReturn = { optimizeDeps: { exclude: string[] }; resolve?: { alias: Record<string, string> } };

function callConfigHook(plugin: Plugin, root: string): ConfigReturn {
  const hook = plugin.config;
  const fn = (typeof hook === 'function' ? hook : hook?.handler) as unknown as (
    c: { root?: string },
    e: { command: string; mode: string }
  ) => ConfigReturn;
  return fn({ root }, { command: 'serve', mode: 'development' });
}

function getHook(plugin: Plugin, name: keyof Plugin): (...args: never[]) => unknown {
  const hook = plugin[name];
  const fn = typeof hook === 'function' ? hook : (hook as { handler?: (...args: never[]) => unknown } | undefined)?.handler;
  if (!fn) throw new Error(`${String(name)} hook not found`);
  return fn as (...args: never[]) => unknown;
}

function writeUserConfig(root: string): string {
  const configPath = path.join(root, 'lism.config.js');
  fs.writeFileSync(configPath, 'export default { props: { myz: { prop: "zIndex", utils: { "9": "9" } } } };\n');
  return configPath;
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

  test('astro:config:setup は root を解決し Vite プラグイン 3 つを渡す', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-astro-'));
    writeUserConfig(tmp);
    const updateConfig = vi.fn();
    try {
      const setup = lismCssForAstro()[0];
      await setup.hooks['astro:config:setup']?.({
        config: { root: pathToFileURL(tmp) },
        updateConfig,
      } as never);

      expect(updateConfig).toHaveBeenCalledTimes(1);
      const plugins = (updateConfig.mock.calls[0][0] as { vite: { plugins: Plugin[] } }).vite.plugins;
      expect(plugins.map((p) => p.name)).toEqual(['lism-css:config-alias', 'lism-css:typegen', 'lism-css:css']);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('astro:build:start は known を構築しても例外を投げない', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-astro-'));
    writeUserConfig(tmp);
    try {
      const setup = lismCssForAstro({ purge: true })[0];
      await setup.hooks['astro:config:setup']?.({
        config: { root: pathToFileURL(tmp) },
        updateConfig: vi.fn(),
      } as never);
      await expect(setup.hooks['astro:build:start']?.({} as never)).resolves.toBeUndefined();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }, 15000);
});

describe('lismTypegen hooks', () => {
  test('buildStart は custom prop 設定で lism-env.d.ts を生成する', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-typegen-'));
    writeUserConfig(tmp);
    try {
      const plugin = lismTypegen();
      getHook(plugin, 'configResolved')({ root: tmp } as never);
      await getHook(plugin, 'buildStart')();
      expect(fs.existsSync(path.join(tmp, 'lism-env.d.ts'))).toBe(true);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('disabled のとき buildStart は .d.ts を書かない', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-typegen-'));
    writeUserConfig(tmp);
    try {
      const plugin = lismTypegen({ disabled: true });
      getHook(plugin, 'configResolved')({ root: tmp } as never);
      await getHook(plugin, 'buildStart')();
      expect(fs.existsSync(path.join(tmp, 'lism-env.d.ts'))).toBe(false);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('handleHotUpdate は lism.config 変更で型を再生成する', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-typegen-'));
    const configPath = writeUserConfig(tmp);
    try {
      const plugin = lismTypegen();
      getHook(plugin, 'configResolved')({ root: tmp } as never);
      await getHook(plugin, 'buildStart')();
      const dtsPath = path.join(tmp, 'lism-env.d.ts');
      const before = fs.readFileSync(dtsPath, 'utf8');

      fs.writeFileSync(
        configPath,
        'export default { props: { myz: { prop: "zIndex", utils: { "9": "9" } }, myw: { prop: "width", utils: { x: "10px" } } } };\n'
      );
      await getHook(plugin, 'handleHotUpdate')({ file: configPath } as never);
      expect(fs.readFileSync(dtsPath, 'utf8')).not.toBe(before);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('lismConfigAlias handleHotUpdate', () => {
  test('lism.config 変更時は full-reload を送り空配列を返す', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-alias-'));
    const configPath = writeUserConfig(tmp);
    try {
      const plugin = lismConfigAlias();
      callConfigHook(plugin, tmp);
      const send = vi.fn();
      const result = getHook(plugin, 'handleHotUpdate')({ file: configPath, server: { ws: { send } } } as never);
      expect(send).toHaveBeenCalledWith({ type: 'full-reload' });
      expect(result).toEqual([]);
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });

  test('無関係なファイルでは何もしない', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-alias-'));
    writeUserConfig(tmp);
    try {
      const plugin = lismConfigAlias();
      callConfigHook(plugin, tmp);
      const send = vi.fn();
      const result = getHook(
        plugin,
        'handleHotUpdate'
      )({
        file: path.join(tmp, 'unrelated.ts'),
        server: { ws: { send } },
      } as never);
      expect(send).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('lismCss known / purge hooks', () => {
  test('known プラグインの buildStart は custom prop を known に載せる', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-known-'));
    writeUserConfig(tmp);
    try {
      const plugins = lismCss({ purge: true });
      const knownPlugin = plugins.find((p) => p.name === 'lism-css:known');
      if (!knownPlugin) throw new Error('lism-css:known not found');
      getHook(knownPlugin, 'configResolved')({ root: tmp } as never);
      await expect(getHook(knownPlugin, 'buildStart')()).resolves.toBeUndefined();
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  }, 15000);

  test('knownRef 未設定時はデフォルト known へ落ち、未使用クラスを purge する', async () => {
    const plugins = lismCss({ purge: true });
    const purge = plugins.find((p) => p.name === 'lism-css:purge');
    if (!purge) throw new Error('lism-css:purge not found');

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
    const ctx = { info: vi.fn(), warn: vi.fn() };
    await (getHook(purge, 'generateBundle') as (this: unknown, opts: unknown, bundle: unknown, isWrite: boolean) => unknown).call(
      ctx,
      {},
      bundle,
      false
    );

    const source = (bundle['assets/main.css'] as { source: string }).source;
    expect(source).toContain('-p\\:20');
    expect(source).not.toContain('-m\\:10');
  });
});
