import { describe, expect, test } from 'vitest';
import { objDeepMerge } from '../../config/helper';
import { computeBuildConfigs } from './load-config';
import type { BuildConfig } from './serialize';

const objMerge = objDeepMerge as (a: Record<string, unknown>, b: Record<string, unknown>) => Record<string, unknown>;

const defaultConfig: BuildConfig = {
  tokens: { space: ['10', '20'] },
  props: {
    p: { prop: 'padding', bp: 0, token: 'space' },
  },
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

  test('user 設定が無い場合 mainConfig は defaults と等価', () => {
    const { mainConfig } = computeBuildConfigs({ defaultConfig, propsFull, userConfig: {}, objDeepMerge: objMerge });
    expect(mainConfig.props.p).toEqual(defaultConfig.props.p);
  });
});
