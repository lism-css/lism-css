import { describe, expect, test } from 'vitest';

import type { MockupData } from '../core/types.js';
import { generateCheckEntryModule, generatePagesModule } from './virtual-modules.js';

function createData(pages: MockupData['pages'], title?: string): MockupData {
  return { dataDir: '/data', config: { schemaVersion: 1, ...(title === undefined ? {} : { title }) }, pages, tokens: {} };
}

describe('generatePagesModule', () => {
  test('ページを絶対パスの動的 import として並べる', () => {
    const code = generatePagesModule(
      createData(
        [
          { id: 'home', file: '/data/pages/home.jsx', label: 'Home', category: 'Main', order: 1 },
          { id: 'admin/users', file: '/data/pages/admin/users.tsx', label: 'admin/users' },
        ],
        'Sample'
      )
    );

    expect(code).toContain('export const title = "Sample" ?? undefined;');
    expect(code).toContain('id: "home"');
    expect(code).toContain('label: "Home"');
    expect(code).toContain('category: "Main"');
    expect(code).toContain('load: () => import("/data/pages/home.jsx")');
    expect(code).toContain('load: () => import("/data/pages/admin/users.tsx")');
    // category 未指定のページにはキーを出さない（ViewerPage.category は optional）。
    expect(code.match(/category:/g)).toHaveLength(1);
  });

  test('title 未指定なら undefined を返す', () => {
    const code = generatePagesModule(createData([{ id: 'home', file: '/data/pages/home.jsx', label: 'home' }]));
    expect(code).toContain('export const title = null ?? undefined;');
  });

  test('ページが0件でも構文として成立する', () => {
    expect(generatePagesModule(createData([]))).toContain('export const pages = [\n];');
  });
});

describe('generateCheckEntryModule', () => {
  test('全ページを静的 import し、tree-shaking されない形で参照する', () => {
    const code = generateCheckEntryModule(
      createData([
        { id: 'home', file: '/data/pages/home.jsx', label: 'home' },
        { id: 'admin/users', file: '/data/pages/admin/users.tsx', label: 'admin/users' },
      ])
    );

    expect(code).toContain('import * as page_0 from "/data/pages/home.jsx";');
    expect(code).toContain('import * as page_1 from "/data/pages/admin/users.tsx";');
    // globalThis への代入は副作用があるため、entry の export が保持されなくても消えない。
    expect(code).toContain('globalThis.__LISM_MOCK_CHECK__ = [page_0, page_1];');
    expect(code).toContain('import "virtual:lism-mockup/tokens.css";');
  });
});
