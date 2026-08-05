import { describe, expect, test } from 'vitest';

import { MockupContractError } from '../core/types.js';
import {
  buildLucideIconIndex,
  describeMissingLucideExport,
  generateLucideModule,
  loadLucideIconSet,
  lucideClassName,
  type LucideIconSet,
  lucideIconsPlugin,
  LUCIDE_PACKAGE_NAME,
  RESOLVED_VIRTUAL_LUCIDE_ID,
  stripInheritedAttributes,
  SUPPORTED_LUCIDE_API,
  toPascalCase,
} from './lucide-icons.js';

const iconSet = loadLucideIconSet();
const index = buildLucideIconIndex(iconSet);

/** 生成コードの `export { … };` から export 名を集める。 */
function exportedNames(code: string): Set<string> {
  return new Set(
    [...code.matchAll(/export \{([^}]*)\};/g)].flatMap((match) =>
      match[1].split(',').map(
        (specifier) =>
          specifier
            .trim()
            .split(/\s+as\s+/)
            .at(-1) as string
      )
    )
  );
}

/** テスト用の最小アイコンセット。 */
const FIXTURE_SET: LucideIconSet = {
  width: 24,
  height: 24,
  icons: {
    bell: { body: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 2"/>' },
    'panel-left': { body: '<path fill="none" stroke="currentColor" stroke-width="2" d="M3 4"/>' },
    'search-large': { body: '<path d="M5 6"/>', width: 32, height: 32 },
  },
  aliases: {
    sidebar: { parent: 'panel-left' },
    'no-such-parent': { parent: 'does-not-exist' },
  },
};

describe('toPascalCase', () => {
  test('lucide-react と同じ規則で kebab を PascalCase にする（数字は連結される）', () => {
    expect(toPascalCase('bell')).toBe('Bell');
    expect(toPascalCase('trending-up')).toBe('TrendingUp');
    expect(toPascalCase('trash-2')).toBe('Trash2');
    // 素朴な変換だと `ArrowUp0-1` などになる、lucide-react 固有の並び。
    expect(toPascalCase('arrow-up-0-1')).toBe('ArrowUp01');
  });
});

describe('lucideClassName', () => {
  test('lucide-react と同じ class を作る（重複は落とす）', () => {
    expect(lucideClassName('bell')).toBe('lucide lucide-bell');
    expect(lucideClassName('trending-up')).toBe('lucide lucide-trending-up');
    // `toKebabCase(toPascalCase())` の結果とキーが食い違う場合は両方付く。
    expect(lucideClassName('trash-2')).toBe('lucide lucide-trash2 lucide-trash-2');
    expect(lucideClassName('arrow-up-0-1')).toBe('lucide lucide-arrow-up01 lucide-arrow-up-0-1');
  });
});

describe('stripInheritedAttributes', () => {
  test('ルートと同じ既定値は取り除く（props がアイコン全体に効くようにする）', () => {
    const body = '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 2"/>';
    expect(stripInheritedAttributes(body)).toBe('<path d="M1 2"/>');
  });

  test('値が混在する属性は残す（palette のような一部塗りつぶしを壊さない）', () => {
    const body = '<g fill="none" stroke="currentColor"><path d="M1 2"/><circle fill="currentColor" r=".5"/></g>';
    // fill は none と currentColor が混在するので丸ごと残し、stroke だけ落とす。
    expect(stripInheritedAttributes(body)).toBe('<g fill="none"><path d="M1 2"/><circle fill="currentColor" r=".5"/></g>');
  });

  test('既定値と違う値は取り除かない', () => {
    expect(stripInheritedAttributes('<path stroke-width="1.5" d="M1 2"/>')).toBe('<path stroke-width="1.5" d="M1 2"/>');
  });
});

describe('buildLucideIconIndex', () => {
  test('lucide-react の export 名を icons.json のキーへ対応付ける', () => {
    expect(index.keyByExportName.get('Bell')).toBe('bell');
    expect(index.keyByExportName.get('TrendingUp')).toBe('trending-up');
    expect(index.keyByExportName.get('Trash2')).toBe('trash-2');
    expect(index.keyByExportName.get('ArrowUp01')).toBe('arrow-up-0-1');
  });

  test('`Icon` サフィックス付きの別名も引ける', () => {
    for (const [suffixed, plain] of [
      ['BellIcon', 'Bell'],
      ['TrendingUpIcon', 'TrendingUp'],
      ['Trash2Icon', 'Trash2'],
      ['PanelLeftIcon', 'PanelLeft'],
    ]) {
      expect(index.keyByExportName.get(suffixed), suffixed).toBe(index.keyByExportName.get(plain));
    }
  });

  test('aliases は本体のキーへ解決する', () => {
    // lucide-react の `Sidebar` は panel-left の別名。
    expect(index.keyByExportName.get('Sidebar')).toBe('panel-left');
    expect(index.keyByExportName.get('SidebarIcon')).toBe('panel-left');
  });

  test('PascalCase が衝突するときは実体のあるアイコンを優先する', () => {
    // `arrow-up-01`（alias）と `arrow-up-0-1`（本体）はどちらも ArrowUp01 になる。
    const key = index.iconKeyFor('ArrowUp01');
    expect(key).toBe('arrow-up-0-1');
    // class 名も本体側のキーから作られる（lucide-react と同じ）。
    expect(index.entries.find((entry) => entry.key === key)?.className).toBe('lucide lucide-arrow-up01 lucide-arrow-up-0-1');
  });

  test('本体が存在しない alias は登録しない', () => {
    const fixture = buildLucideIconIndex(FIXTURE_SET);
    expect(fixture.keyByExportName.get('Sidebar')).toBe('panel-left');
    expect(fixture.keyByExportName.has('NoSuchParent')).toBe(false);
  });

  test('アイコン固有の viewBox を反映する', () => {
    const fixture = buildLucideIconIndex(FIXTURE_SET);
    expect(fixture.entries.find((entry) => entry.key === 'bell')?.viewBox).toBe('0 0 24 24');
    expect(fixture.entries.find((entry) => entry.key === 'search-large')?.viewBox).toBe('0 0 32 32');
  });

  test('存在しないアイコン名は候補付きの契約エラーになる', () => {
    expect(() => index.iconKeyFor('NoSuchIcon')).toThrow(MockupContractError);
    expect(() => index.iconKeyFor('NoSuchIcon')).toThrow(/"NoSuchIcon" is not an icon of lucide-react/);
    // 大文字小文字違い・前方一致は候補として案内する。
    expect(() => index.iconKeyFor('bell')).toThrow(/Did you mean "Bell"\?/);
    expect(() => index.iconKeyFor('Trend')).toThrow(/Did you mean "Trending/);
  });
});

describe('generateLucideModule', () => {
  const code = generateLucideModule(iconSet);

  test('lucide-react と同じルート属性を出力する', () => {
    // lucide-react 0.577.0 の defaultAttributes + Icon の初期値。
    // lism-css の `.a--icon:where(:not([fill]))` / `:where(:not([width]))` が
    // 属性の有無で分岐するため、ここがずれると既存モックアップの見た目が変わる。
    for (const attribute of [
      `xmlns: 'http://www.w3.org/2000/svg'`,
      'width: size',
      'height: size',
      'viewBox,',
      `fill: 'none'`,
      'stroke: color',
      'strokeWidth: absoluteStrokeWidth ? (Number(strokeWidth) * 24) / Number(size) : strokeWidth',
      `strokeLinecap: 'round'`,
      `strokeLinejoin: 'round'`,
    ]) {
      expect(code, attribute).toContain(attribute);
    }
    // Iconify の既定は width="1em" だが、lucide-react に合わせて 24 を既定にする。
    expect(code).toContain('size = 24');
    expect(code).toContain(`color = 'currentColor'`);
    expect(code).toContain('strokeWidth = 2');
    expect(code).toContain(`const DEFAULT_VIEW_BOX = '0 0 24 24';`);
  });

  test('lucide-react と同じ class 名を出力する', () => {
    expect(code).toContain('const Bell = /*#__PURE__*/ icon("Bell", "lucide lucide-bell",');
    expect(code).toContain('const Trash2 = /*#__PURE__*/ icon("Trash2", "lucide lucide-trash2 lucide-trash-2",');
    // ユーザーの className は自前の class の後ろへ足す。
    expect(code).toContain(`className: className ? iconClassName + ' ' + className : iconClassName,`);
  });

  test('body は React 要素へ展開せず dangerouslySetInnerHTML でそのまま埋める', () => {
    expect(code).toContain('dangerouslySetInnerHTML: { __html: body }');
  });

  test('未使用アイコンが build で落ちるよう PURE アノテーションを付ける', () => {
    expect(code.match(/\/\*#__PURE__\*\/ icon\(/g)).toHaveLength(index.entries.length);
  });

  test('lucide-react と同じ名前で export する（`Icon` サフィックスと alias を含む）', () => {
    const exported = exportedNames(code);

    for (const name of ['Bell', 'BellIcon', 'TrendingUp', 'TrendingUpIcon', 'Trash2', 'Trash2Icon', 'PanelLeft', 'PanelLeftIcon', 'Sidebar']) {
      expect(exported.has(name), name).toBe(true);
    }
    // alias は本体の const を別名で export する。
    expect(code).toContain('PanelLeft as Sidebar');
  });

  test('全アイコンを1モジュールにまとめる（dev で 1,800 件の個別リクエストにしない）', () => {
    expect(index.entries.length).toBeGreaterThan(1500);
    // 生成物のサイズはアイコン本体のデータ量とほぼ同じ（要素ツリーへ展開していない証跡）。
    expect(code.length).toBeLessThan(1_500_000);
  });

  test('fixture でも構文として成立する', () => {
    const fixture = generateLucideModule(FIXTURE_SET);
    expect(fixture).toContain('const Bell = /*#__PURE__*/ icon("Bell", "lucide lucide-bell", "<path d=\\"M1 2\\"/>");');
    // 既定と違う viewBox のアイコンだけ第4引数が付く。
    expect(fixture).toContain('icon("SearchLarge", "lucide lucide-search-large", "<path d=\\"M5 6\\"/>", "0 0 32 32");');
  });

  test('アイコン名以外は `Icon` と `createLucideIcon` だけを export する', () => {
    expect(SUPPORTED_LUCIDE_API).toEqual(['Icon', 'createLucideIcon']);
    // 生成コード側の識別子は小文字始まりにして、PascalCase のアイコン名と衝突しないようにしている。
    expect(code).toContain('export { lucideIcon as Icon, createLucideIcon };');
    // アイコンを使うだけのページでバンドルへ残らないよう、副作用が無いことを明示する。
    expect(code).toContain('const lucideIcon = /*#__PURE__*/ forwardRef(');

    const exported = exportedNames(code);
    expect(exported.has('Icon')).toBe(true);
    expect(exported.has('createLucideIcon')).toBe(true);
    // 全アイコンのレコードは提供しない（参照した時点で全アイコンがバンドルへ入るため）。
    expect(exported.has('icons')).toBe(false);
    expect(exported.size).toBe(index.keyByExportName.size + SUPPORTED_LUCIDE_API.length);
  });
});

describe('describeMissingLucideExport', () => {
  /** rollup が投げる MISSING_EXPORT エラーの形。 */
  function missingExport(binding: string, exporter: string = RESOLVED_VIRTUAL_LUCIDE_ID): unknown {
    return { code: 'MISSING_EXPORT', binding, exporter, message: `"${binding}" is not exported by "${exporter}"` };
  }

  test('`icons` は理由と代替を説明する', () => {
    const message = describeMissingLucideExport(missingExport('icons'));
    expect(message).toContain('Cannot import "icons" from lucide-react');
    expect(message).toContain('pulls every lucide icon into the bundle');
    expect(message).toContain("import { Bell } from 'lucide-react'");
  });

  test('アイコン名の間違いは索引と同じ候補付きの案内にする', () => {
    expect(describeMissingLucideExport(missingExport('bell'))).toContain('"bell" is not an icon of lucide-react. Did you mean "Bell"?');
    expect(describeMissingLucideExport(missingExport('Belll'))).toContain(
      '"Belll" is not an icon of lucide-react. See https://lucide.dev/icons/ for the available icons.'
    );
  });

  test('どの場合も対応範囲を添える', () => {
    for (const binding of ['icons', 'Belll']) {
      expect(describeMissingLucideExport(missingExport(binding)), binding).toContain('the icon components plus "Icon" and "createLucideIcon"');
    }
  });

  test('仮想モジュール以外のエラーには関与しない', () => {
    expect(describeMissingLucideExport(missingExport('foo', '/somewhere/other.js'))).toBeNull();
    expect(describeMissingLucideExport({ code: 'PARSE_ERROR', message: 'boom' })).toBeNull();
    expect(describeMissingLucideExport(new Error('boom'))).toBeNull();
    expect(describeMissingLucideExport(undefined)).toBeNull();
  });

  test('実在するアイコン名なら差し替えない（元のエラーを残す）', () => {
    expect(describeMissingLucideExport(missingExport('Bell'))).toBeNull();
  });
});

describe('lucideIconsPlugin', () => {
  const plugin = lucideIconsPlugin();
  const resolveId = plugin.resolveId as (source: string) => string | null;
  const load = plugin.load as (id: string) => string | null;

  test('`lucide-react` を仮想 id へ解決する', () => {
    expect(resolveId(LUCIDE_PACKAGE_NAME)).toBe(RESOLVED_VIRTUAL_LUCIDE_ID);
    expect(resolveId('lucide-react/icons/bell')).toBeNull();
    expect(resolveId('react')).toBeNull();
  });

  test('仮想 id のときだけモジュールを供給する', () => {
    expect(load('\0virtual:lism-mockup/pages')).toBeNull();
    expect(load(RESOLVED_VIRTUAL_LUCIDE_ID)).toContain('const Bell = /*#__PURE__*/ icon(');
  });

  test('境界チェックより先に解決できるよう pre で動く', () => {
    expect(plugin.enforce).toBe('pre');
  });
});
