/**
 * 生成した仮想 `lucide-react` モジュールを実際に評価して、本物と同じ DOM を出すか確かめる。
 *
 * 期待値は lucide-react 0.577.0 を `renderToStaticMarkup` に通して採取したもの。
 * 属性の並びや class 名がずれると lism-css の `.a--icon:where(:not([fill]))` 等の分岐に影響するため、
 * 文字列そのままで比較している。
 */
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { generateLucideModule, type LucideIconSet } from './lucide-icons.js';

/** `Icon` / `createLucideIcon` の検証だけが目的なので、アイコンは1件で足りる。 */
const FIXTURE_SET: LucideIconSet = {
  width: 24,
  height: 24,
  icons: {
    bell: { body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 2"/>' },
  },
};

/** テスト用の `iconNode`（本物と同じく attrs に `key` を持つ形）。 */
const ICON_NODE = [
  ['path', { d: 'M1 2', key: 'a' }],
  ['circle', { cx: '3', cy: '4', r: '1', key: 'b' }],
];

/** 本物の出力から採取した、`iconNode` 2件分の子要素。 */
const NODE_MARKUP = '<path d="M1 2"></path><circle cx="3" cy="4" r="1"></circle>';

const packageRoot = fileURLToPath(new URL('../../', import.meta.url));
const generatedDirs: string[] = [];

/**
 * 生成コードをそのまま ESM として読み込む。
 *
 * 書き出し先をパッケージ配下にするのは、モジュールが `import … from 'react'` を持つため
 * （`os.tmpdir()` からでは node_modules を辿れない）。生成物が単体で成立することも同時に確かめられる。
 */
async function importGeneratedModule(iconSet: LucideIconSet): Promise<Record<string, unknown>> {
  const dir = fs.mkdtempSync(path.join(packageRoot, '.lism-test-'));
  generatedDirs.push(dir);
  const file = path.join(dir, 'lucide-react.mjs');
  fs.writeFileSync(file, generateLucideModule(iconSet), 'utf-8');
  return (await import(pathToFileURL(file).href)) as Record<string, unknown>;
}

let lucide: Record<string, unknown>;

beforeAll(async () => {
  lucide = await importGeneratedModule(FIXTURE_SET);
});

afterAll(() => {
  for (const dir of generatedDirs) fs.rmSync(dir, { recursive: true, force: true });
});

/** `props` を渡して描画した HTML を返す。 */
function render(component: unknown, props: Record<string, unknown> = {}, ...children: unknown[]): string {
  return renderToStaticMarkup(createElement(component as never, props as never, ...(children as never[])));
}

/** 全ケース共通の `<svg>` ルート属性（size / stroke 系だけテスト側で差し替える）。 */
function svgAttributes({ size = '24', stroke = 'currentColor', strokeWidth = '2' } = {}): string {
  return (
    `xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ` +
    `fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`
  );
}

describe('Icon', () => {
  test('lucide-react と同じルート属性・class・aria-hidden を出す', () => {
    expect(render(lucide.Icon, { iconNode: ICON_NODE })).toBe(`<svg ${svgAttributes()} class="lucide" aria-hidden="true">${NODE_MARKUP}</svg>`);
  });

  test('size / color / strokeWidth / className と任意の属性を本物と同じ順序で反映する', () => {
    expect(render(lucide.Icon, { iconNode: ICON_NODE, size: 16, color: 'red', strokeWidth: 1, className: 'x', 'data-a': '1' })).toBe(
      `<svg ${svgAttributes({ size: '16', stroke: 'red', strokeWidth: '1' })} class="lucide x" aria-hidden="true" data-a="1">${NODE_MARKUP}</svg>`
    );
  });

  test('absoluteStrokeWidth は size に反比例させる（本物と同じ計算）', () => {
    expect(render(lucide.Icon, { iconNode: ICON_NODE, size: 48, absoluteStrokeWidth: true })).toBe(
      `<svg ${svgAttributes({ size: '48', strokeWidth: '1' })} class="lucide" aria-hidden="true">${NODE_MARKUP}</svg>`
    );
  });

  test('children があるときは aria-hidden を付けず、children を後ろへ置く', () => {
    expect(render(lucide.Icon, { iconNode: ICON_NODE }, createElement('title', { key: 't' }, 'hi'))).toBe(
      `<svg ${svgAttributes()} class="lucide">${NODE_MARKUP}<title>hi</title></svg>`
    );
  });
});

describe('createLucideIcon', () => {
  test('本物と同じ class 名・displayName のコンポーネントを作る', () => {
    const Custom = (lucide.createLucideIcon as (name: string, node: unknown) => { displayName?: string })('my-icon', ICON_NODE);
    expect(render(Custom)).toBe(`<svg ${svgAttributes()} class="lucide lucide-my-icon" aria-hidden="true">${NODE_MARKUP}</svg>`);
    expect(Custom.displayName).toBe('MyIcon');
  });

  test('数字を含む名前は本物と同じ2種類の class を付ける', () => {
    const Custom = (lucide.createLucideIcon as (name: string, node: unknown) => { displayName?: string })('trash-2', ICON_NODE);
    expect(render(Custom, { className: 'y' })).toBe(
      `<svg ${svgAttributes()} class="lucide lucide-trash2 lucide-trash-2 y" aria-hidden="true">${NODE_MARKUP}</svg>`
    );
    expect(Custom.displayName).toBe('Trash2');
  });
});

describe('生成モジュールの export', () => {
  test('アイコンは `Icon` 経由と同じルート属性で描画される', () => {
    expect(render(lucide.Bell)).toBe(`<svg ${svgAttributes()} class="lucide lucide-bell" aria-hidden="true"><path d="M1 2"/></svg>`);
  });

  test('提供しない `icons` は export しない', () => {
    expect('icons' in lucide).toBe(false);
    expect('Icon' in lucide).toBe(true);
    expect('createLucideIcon' in lucide).toBe(true);
  });
});
