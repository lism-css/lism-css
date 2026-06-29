import { describe, expect, test } from 'vitest';
import { buildWebpackAlias, buildTurbopackAlias } from './webpack-alias';
import type { GeneratedCss } from './generated-css';

const generated: GeneratedCss = {
  entries: ['main', 'base/set'],
  aliasMap: {
    'lism-css/main.css': '/proj/.lism-css/css/main.css',
    'lism-css/base/set.css': '/proj/.lism-css/css/base/set.css',
  },
  outDir: '/proj/.lism-css/css',
  userConfigPath: '/proj/lism.config.js',
};

describe('buildWebpackAlias', () => {
  test('CSS エントリは生成 CSS の絶対パスへ、config は完全一致($)で差し替える', () => {
    const alias = buildWebpackAlias({ generated, userConfigPath: '/proj/lism.config.js' });
    expect(alias['lism-css/main.css']).toBe('/proj/.lism-css/css/main.css');
    expect(alias['lism-css/base/set.css']).toBe('/proj/.lism-css/css/base/set.css');
    // config は他の lism-css/* を巻き込まないよう完全一致キー。
    expect(alias['lism-css/config.js$']).toBe('/proj/lism.config.js');
  });

  test('userConfigPath が null なら config alias は作らない', () => {
    const alias = buildWebpackAlias({ generated, userConfigPath: null });
    expect(alias['lism-css/config.js$']).toBeUndefined();
    expect(alias['lism-css/main.css']).toBe('/proj/.lism-css/css/main.css');
  });
});

describe('buildTurbopackAlias', () => {
  test('絶対パスを projectRoot 起点の ./ 相対パスへ変換する（Turbopack は絶対パスで解決失敗するため）', () => {
    const alias = buildTurbopackAlias({ generated, userConfigPath: '/proj/lism.config.js' }, '/proj');
    expect(alias['lism-css/main.css']).toBe('./.lism-css/css/main.css');
    expect(alias['lism-css/base/set.css']).toBe('./.lism-css/css/base/set.css');
    // Turbopack の resolveAlias は完全一致 specifier なので $ は付けない。
    expect(alias['lism-css/config.js']).toBe('./lism.config.js');
  });

  test('userConfigPath が null なら config alias は作らない', () => {
    const alias = buildTurbopackAlias({ generated, userConfigPath: null }, '/proj');
    expect(alias['lism-css/config.js']).toBeUndefined();
    expect(alias['lism-css/main.css']).toBe('./.lism-css/css/main.css');
  });
});
