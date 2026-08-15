import { describe, expect, it } from 'vitest';
import { groupPostsBySidebarDirs, flattenPostsBySidebarOrder, getPostUrl } from './sidebarPosts';
import sidebarConfig, { type SidebarSection } from '@/config/sidebar';

// テスト用の記事エントリを作成するヘルパー
function post(id: string, order?: number) {
  return { id, data: { order } };
}

// ui セクションと同じ3分類構成（Blocks / Block Examples / Components）
const uiSections: SidebarSection[] = [
  { label: 'Blocks', dir: 'ui' },
  { label: 'Block Examples', dir: 'ui/block-examples' },
  { label: 'Components', dir: 'ui/components' },
];

describe('groupPostsBySidebarDirs', () => {
  it('ネストしたdirは最長一致で分類される（ui直下とui/配下サブディレクトリを混同しない）', () => {
    const posts = [post('ui/Button', 1), post('ui/block-examples/Timeline', 1), post('ui/components/Card', 1), post('ui/components/Hero', 2)];
    const grouped = groupPostsBySidebarDirs(posts, uiSections);

    expect(grouped['ui'].map((p) => p.id)).toEqual(['ui/Button']);
    expect(grouped['ui/block-examples'].map((p) => p.id)).toEqual(['ui/block-examples/Timeline']);
    expect(grouped['ui/components'].map((p) => p.id)).toEqual(['ui/components/Card', 'ui/components/Hero']);
  });

  it('カテゴリ内はorder順にソートされる（未指定は999扱い・同順位は入力順を維持）', () => {
    const posts = [post('ui/C'), post('ui/B', 2), post('ui/A', 1), post('ui/D')];
    const grouped = groupPostsBySidebarDirs(posts, uiSections);
    expect(grouped['ui'].map((p) => p.id)).toEqual(['ui/A', 'ui/B', 'ui/C', 'ui/D']);
  });

  it('itemsで直接参照されている記事はdirカテゴリから除外される', () => {
    const sections: SidebarSection[] = [
      { label: 'はじめに', items: ['/docs/core-components/overview/'] },
      { label: 'コアコンポーネント', dir: 'core-components' },
    ];
    const posts = [post('core-components/overview', 1), post('core-components/box', 2)];
    const grouped = groupPostsBySidebarDirs(posts, sections);
    expect(grouped['core-components'].map((p) => p.id)).toEqual(['core-components/box']);
  });
});

describe('flattenPostsBySidebarOrder', () => {
  it('セクションの定義順にグループ境界が並ぶ（Blocks → Block Examples → Components）', () => {
    const posts = [
      // 入力順はシャッフルしておく
      post('ui/components/Card', 1),
      post('ui/Button', 2),
      post('ui/block-examples/Timeline', 1),
      post('ui/Accordion', 1),
      post('ui/block-examples/Chat', 2),
    ];
    const ordered = flattenPostsBySidebarOrder(posts, uiSections).map((p) => p.id);
    expect(ordered).toEqual(['ui/Accordion', 'ui/Button', 'ui/block-examples/Timeline', 'ui/block-examples/Chat', 'ui/components/Card']);
  });

  it('Blocks最後の記事の次はBlock Examples先頭になり、Blocks内の前後関係に他グループの記事が混ざらない', () => {
    const posts = [post('ui/Button', 1), post('ui/Tabs', 2), post('ui/block-examples/Timeline', 1)];
    const ordered = flattenPostsBySidebarOrder(posts, uiSections).map((p) => p.id);

    // Button の次は同グループの Tabs（Timeline ではない）
    expect(ordered[ordered.indexOf('ui/Button') + 1]).toBe('ui/Tabs');
    // グループ境界: Blocks 最後（Tabs）の次に Block Examples 先頭（Timeline）
    expect(ordered[ordered.indexOf('ui/Tabs') + 1]).toBe('ui/block-examples/Timeline');
  });

  it('items指定セクションは記載順で並び、dirセクションと重複しない', () => {
    const sections: SidebarSection[] = [
      { label: 'はじめに', items: ['/docs/b/', '/docs/a/'] },
      { label: 'コアコンポーネント', dir: 'core-components' },
    ];
    const posts = [post('a'), post('b'), post('core-components/box', 1)];
    const ordered = flattenPostsBySidebarOrder(posts, sections).map((p) => p.id);
    expect(ordered).toEqual(['b', 'a', 'core-components/box']);
  });

  it('実際のuiサイドバー設定でも3分類の境界順で並ぶ（回帰テスト）', () => {
    const posts = [post('ui/components/Card', 1), post('ui/block-examples/Timeline', 1), post('ui/Button', 1)];
    const ordered = flattenPostsBySidebarOrder(posts, sidebarConfig.sections.ui).map((p) => p.id);
    expect(ordered).toEqual(['ui/Button', 'ui/block-examples/Timeline', 'ui/components/Card']);
  });
});

describe('getPostUrl', () => {
  it('ui/配下はサイト直下、それ以外は/docs/配下のURLになる', () => {
    expect(getPostUrl('ui/components/card')).toBe('/ui/components/card/');
    expect(getPostUrl('core-components/box')).toBe('/docs/core-components/box/');
  });
});
