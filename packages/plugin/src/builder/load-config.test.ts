import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { objDeepMerge } from 'lism-css/config/helper';
import { computeBuildConfigs, findUserConfigPath, loadBuildConfigs } from './load-config';
import type { BuildConfig } from './serialize';

const objMerge = objDeepMerge as (a: Record<string, unknown>, b: Record<string, unknown>) => Record<string, unknown>;

const defaultConfig: BuildConfig = {
  tokens: { space: ['10', '20'] },
  props: {
    p: { prop: 'padding', bp: 0, token: 'space' },
  },
  breakpoints: { xs: 0, sm: '480px', md: '800px', lg: '1120px', xl: 0 },
};

// full preset は defaults への差分のみ（ここでは p の bp を 1 へ拡張）。
const propsFull = {
  p: { bp: 1 },
};

describe('computeBuildConfigs', () => {
  test('非 isFullMode: mainConfig は defaults→user、fullConfig は defaults→full→user', () => {
    const userConfig = { props: { p: { prop: 'pad-x' } } };
    const { mainConfig, fullConfig, isFullMode } = computeBuildConfigs({ defaultConfig, propsFull, userConfig, objDeepMerge: objMerge });

    expect(isFullMode).toBe(false);
    // mainConfig: user が prop を上書き、full preset は反映されない（bp は defaults の 0 のまま）
    expect(mainConfig.props.p.prop).toBe('pad-x');
    expect(mainConfig.props.p.bp).toBe(0);
    // fullConfig: full preset で bp:1、さらに user の prop 上書きが効く
    expect(fullConfig.props.p.prop).toBe('pad-x');
    expect(fullConfig.props.p.bp).toBe(1);
  });

  test('isFullMode: mainConfig は fullConfig と同一（full preset 適用済み）', () => {
    const userConfig = { isFullMode: true };
    const { mainConfig, fullConfig, isFullMode } = computeBuildConfigs({ defaultConfig, propsFull, userConfig, objDeepMerge: objMerge });

    expect(isFullMode).toBe(true);
    expect(mainConfig).toEqual(fullConfig);
    expect(mainConfig.props.p.bp).toBe(1);
  });

  test('user 設定が full preset より優先される（later wins）', () => {
    // full preset が bp:1 にしても、user が bp:0 に戻せる
    const userConfig = { props: { p: { bp: 0 } } };
    const { fullConfig } = computeBuildConfigs({ defaultConfig, propsFull, userConfig, objDeepMerge: objMerge });
    expect(fullConfig.props.p.bp).toBe(0);
  });

  test('fullConfig は xs を既定有効化し、user 設定があればそちらを優先する', () => {
    const base = computeBuildConfigs({ defaultConfig, propsFull, userConfig: {}, objDeepMerge: objMerge });
    expect(base.mainConfig.breakpoints?.xs).toBe(0);
    expect(base.fullConfig.breakpoints?.xs).toBe('360px');

    const customized = computeBuildConfigs({
      defaultConfig,
      propsFull,
      userConfig: { breakpoints: { xs: '420px' } },
      objDeepMerge: objMerge,
    });
    expect(customized.fullConfig.breakpoints?.xs).toBe('420px');
  });

  test('user 設定が無い場合 mainConfig は defaults と等価', () => {
    const { mainConfig } = computeBuildConfigs({ defaultConfig, propsFull, userConfig: {}, objDeepMerge: objMerge });
    expect(mainConfig.props.p).toEqual(defaultConfig.props.p);
  });
});

describe('findUserConfigPath', () => {
  const dirs: string[] = [];
  function tmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-config-'));
    dirs.push(dir);
    return dir;
  }
  afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

  test('configPath が指定されていれば projectRoot からの相対パスを優先する', () => {
    const root = tmpDir();
    fs.mkdirSync(path.join(root, 'configs'));
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default { name: "root" };\n');
    fs.writeFileSync(path.join(root, 'configs/lism.custom.mjs'), 'export default { name: "custom" };\n');

    expect(findUserConfigPath(root, 'configs/lism.custom.mjs')).toBe(path.join(root, 'configs/lism.custom.mjs'));
  });

  test('存在しない configPath が指定されていれば root 直下の config へフォールバックしない', () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default {};\n');

    expect(findUserConfigPath(root, 'missing.config.js')).toBeNull();
  });

  test('lism.config.ts のみ存在する場合はそれを解決する', () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.ts'), 'export default {};\n');

    expect(findUserConfigPath(root)).toBe(path.join(root, 'lism.config.ts'));
  });

  test('探索優先順は .js → .mjs → .ts（同居時は .js が勝つ）', () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.ts'), 'export default {};\n');
    fs.writeFileSync(path.join(root, 'lism.config.mjs'), 'export default {};\n');
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default {};\n');

    expect(findUserConfigPath(root)).toBe(path.join(root, 'lism.config.js'));
  });

  test('探索優先順は .js → .mjs → .ts（.js が無ければ .mjs が勝つ）', () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.ts'), 'export default {};\n');
    fs.writeFileSync(path.join(root, 'lism.config.mjs'), 'export default {};\n');

    expect(findUserConfigPath(root)).toBe(path.join(root, 'lism.config.mjs'));
  });

  test('明示 configPath に .ts を渡せる', () => {
    const root = tmpDir();
    fs.mkdirSync(path.join(root, 'configs'));
    fs.writeFileSync(path.join(root, 'configs/lism.custom.ts'), 'export default {};\n');

    expect(findUserConfigPath(root, 'configs/lism.custom.ts')).toBe(path.join(root, 'configs/lism.custom.ts'));
  });
});

describe('loadBuildConfigs', () => {
  const dirs: string[] = [];
  function tmpDir(): string {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-config-'));
    dirs.push(dir);
    return dir;
  }
  afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

  test('lism.config.ts を実際に読み込み、user 設定が main/full config にマージされる', async () => {
    const root = tmpDir();
    fs.writeFileSync(
      path.join(root, 'lism.config.ts'),
      'const breakpoints: Record<string, string> = { xs: "360px" };\nexport default { breakpoints };\n'
    );

    const result = await loadBuildConfigs(root);

    expect(result.userConfigPath).toBe(path.join(root, 'lism.config.ts'));
    expect(result.mainConfig.breakpoints?.xs).toBe('360px');
  });

  test('moduleCache: false により、同一 .ts ファイルの変更後の再読込が反映される（dev watch相当）', async () => {
    const root = tmpDir();
    const configPath = path.join(root, 'lism.config.ts');
    fs.writeFileSync(configPath, 'export default { breakpoints: { xs: "360px" } };\n');

    const first = await loadBuildConfigs(root);
    expect(first.mainConfig.breakpoints?.xs).toBe('360px');

    fs.writeFileSync(configPath, 'export default { breakpoints: { xs: "420px" } };\n');
    const second = await loadBuildConfigs(root);
    expect(second.mainConfig.breakpoints?.xs).toBe('420px');
  });
});
