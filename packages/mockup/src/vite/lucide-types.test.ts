/**
 * 公開する型定義が、生成モジュールの export と同じ範囲を宣言しているかを確かめる。
 *
 * ここがずれると「型では通るのに `check` で落ちる（またはその逆）」が起きるため、
 * 名前の一覧そのものを突き合わせている。
 */
import { describe, expect, test } from 'vitest';

import { buildLucideIconIndex, generateLucideModule, loadLucideIconSet, SUPPORTED_LUCIDE_API } from './lucide-icons.js';
import { generateLucideTypes } from './lucide-types.js';

const iconSet = loadLucideIconSet();
const index = buildLucideIconIndex(iconSet);
const types = generateLucideTypes(iconSet);

/** `export { … }` / `export const … :` から export 名を集める。 */
function exportedNames(code: string): Set<string> {
  const fromLists = [...code.matchAll(/export \{([^}]*)\};/g)].flatMap((match) =>
    match[1].split(',').map((specifier) =>
      specifier
        .trim()
        .split(/\s+as\s+/)
        .at(-1)
    )
  );
  const fromConsts = [...code.matchAll(/^\s*export const (\w+)[:\s]/gm)].map((match) => match[1]);
  return new Set([...fromLists, ...fromConsts].filter((name): name is string => Boolean(name)));
}

describe('generateLucideTypes', () => {
  test('先頭に import を持たない（module augmentation ではなく ambient 宣言にする）', () => {
    // トップレベルに import/export があると `declare module` が「既存モジュールへの追記」になり、
    // 本物の lucide-react が無い環境では解決に失敗する。
    const beforeDeclaration = types.slice(0, types.indexOf(`declare module 'lucide-react'`));
    expect(beforeDeclaration).not.toMatch(/^import /m);
    expect(beforeDeclaration).not.toMatch(/^export /m);
    expect(types).toContain(`  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';`);
  });

  test('アイコン名以外の API と型を宣言する', () => {
    for (const name of SUPPORTED_LUCIDE_API) expect(types, name).toMatch(new RegExp(`^  export const ${name}[:\\s]`, 'm'));
    for (const name of ['LucideProps', 'LucideIcon', 'IconNode', 'SVGAttributes']) {
      expect(types, name).toMatch(new RegExp(`^  export (type|interface) ${name}\\b`, 'm'));
    }
  });

  test('生成モジュールと同じ名前・同じ数の export を宣言する', () => {
    const declared = exportedNames(types);
    const generated = exportedNames(generateLucideModule(iconSet));
    expect([...declared].sort()).toEqual([...generated].sort());
    expect(declared.size).toBe(index.keyByExportName.size + SUPPORTED_LUCIDE_API.length);
  });

  test('提供しない `icons` は宣言しない', () => {
    expect(types).not.toMatch(/^\s*export (const|type|interface) icons\b/m);
  });

  test('アイコン名は索引の順序をそのまま使う', () => {
    const first = [...index.keyByExportName.keys()][0];
    expect(types).toContain(`  // Icons\n  export const ${first}: LucideIcon;`);
  });
});
