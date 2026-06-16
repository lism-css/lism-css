// @vitest-environment node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { withLism } from './next';

// withLism は受け取った config 型 `T` をそのまま返すため、`{}` を渡すと turbopack/webpack が型に現れない。
// テストでは「マージ後に必ず生える」これらのキーを参照したいので、緩い構造へ寄せて assert する。
type ResolvedConfig = {
  turbopack: { resolveAlias: Record<string, string> };
  webpack: (config: any, options?: any) => { resolve: { alias: Record<string, string> }; [key: string]: any };
};

const dirs: string[] = [];
function tmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lism-next-'));
  dirs.push(dir);
  return dir;
}
afterAll(() => dirs.forEach((d) => fs.rmSync(d, { recursive: true, force: true })));

describe('withLism', () => {
  test('Turbopack には relative、webpack には絶対パスの alias を注入する', async () => {
    const root = tmpDir();
    const result = (await withLism({}, { projectRoot: root })('phase-production-build')) as ResolvedConfig;

    // Turbopack の resolveAlias は project-relative（`./` 始まり）。
    const turboMain = result.turbopack.resolveAlias['lism-css/main.css'];
    expect(turboMain.startsWith('./')).toBe(true);

    // webpack は関数で、戻り値の resolve.alias は outDir 内の絶対パス。
    expect(typeof result.webpack).toBe('function');
    const wpConfig = result.webpack({});
    const wpMain = wpConfig.resolve.alias['lism-css/main.css'];
    expect(path.isAbsolute(wpMain)).toBe(true);
    expect(wpMain).toBe(path.join(root, '.lism-css/css', 'main.css'));
  });

  test('既存 webpack カスタマイズ関数を compose し、alias もマージする', async () => {
    const root = tmpDir();
    const baseConfig = {
      webpack: (c: any) => {
        c.__touched = true;
        return c;
      },
    };
    const result = (await withLism(baseConfig, { projectRoot: root })('phase-production-build')) as ResolvedConfig;

    const wpConfig = result.webpack({});
    // user 関数が呼ばれている。
    expect(wpConfig.__touched).toBe(true);
    // かつ lism の alias もマージされている。
    expect(wpConfig.resolve.alias['lism-css/main.css']).toBe(path.join(root, '.lism-css/css', 'main.css'));
  });

  test('既存 turbopack.resolveAlias を保持したままマージする', async () => {
    const root = tmpDir();
    const baseConfig = {
      turbopack: { resolveAlias: { '@/foo': './src/foo' } },
    };
    const result = (await withLism(baseConfig, { projectRoot: root })('phase-production-build')) as unknown as ResolvedConfig;

    // 既存 alias は保持される。
    expect(result.turbopack.resolveAlias['@/foo']).toBe('./src/foo');
    // lism の alias も追加される。
    expect(result.turbopack.resolveAlias['lism-css/main.css'].startsWith('./')).toBe(true);
  });

  test('custom prop を持つ lism.config があれば config alias を注入し lism-env.d.ts を生成する', async () => {
    const root = tmpDir();
    // custom prop（既定に無い myz）を追加 → gen-types が CustomPropRegistry 拡張を出すため lism-env.d.ts が生成される。
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default { props: { myz: { prop: "zIndex", utils: { "9": "9" } } } };\n');
    const result = (await withLism({}, { projectRoot: root })('phase-production-build')) as ResolvedConfig;

    // user config が config alias として注入される（Turbopack は relative、webpack は絶対）。
    expect(result.turbopack.resolveAlias['lism-css/config.js']).toBeDefined();
    const wpConfig = result.webpack({});
    // webpack 側は完全一致 alias（`$` 付き）で注入される。
    expect(wpConfig.resolve.alias['lism-css/config.js$']).toBe(path.join(root, 'lism.config.js'));

    // custom prop があるため projectRoot 直下に lism-env.d.ts が生成される。
    expect(fs.existsSync(path.join(root, 'lism-env.d.ts'))).toBe(true);
  });

  test('typegen: false で lism-env.d.ts を生成しない', async () => {
    const root = tmpDir();
    fs.writeFileSync(path.join(root, 'lism.config.js'), 'export default { props: { myz: { prop: "zIndex", utils: { "9": "9" } } } };\n');
    await withLism({}, { projectRoot: root, typegen: false })('phase-production-build');

    expect(fs.existsSync(path.join(root, 'lism-env.d.ts'))).toBe(false);
  });
});
