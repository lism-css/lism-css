import type { LangCode } from '@/config/site';
import { BookOpenTextIcon, ShapesIcon, SquaresFourIcon, LayoutIcon, BrowsersIcon } from '@phosphor-icons/react';
import { patterns, categoryIds, type PatternCategoryId, type PatternItem } from './patterns';
import { visibleTemplates, categories as templateCategories } from './templates';
import { pageLayouts, categoryIds as pageLayoutCategoryIds, type PageLayoutCategoryId, type PageLayoutItem } from './page-layouts';

type TranslateLabels = Partial<Record<Exclude<LangCode, 'ja'>, string>>;

export type SeparatorItem = {
  type: 'separator';
};

export type LinkItem = {
  label: string;
  translate?: TranslateLabels;
  link: string;
};

// 文字列の場合はURLとして扱い、対応するMDXのフロントマターからラベルを取得
export type SidebarNavItem = LinkItem | SeparatorItem | string;

export type TopLevelLinkItem = {
  type: 'toplink';
  label: string;
  translate?: TranslateLabels;
  link: string;
  icon?: React.ElementType;
};

export function isSeparator(item: SidebarNavItem): item is SeparatorItem {
  if (typeof item === 'string') return false;
  return 'type' in item && item.type === 'separator';
}

export function isTopLevelLink(item: SidebarSection | TopLevelLinkItem): item is TopLevelLinkItem {
  return 'type' in item && item.type === 'toplink';
}

// dirは記事の自動取得、itemsは表示順の明示指定に使う
export type SidebarSection =
  | {
      label: string;
      translate?: TranslateLabels;
      dir: string;
    }
  | {
      label: string;
      translate?: TranslateLabels;
      rootPath?: string; // ネスト深度判定用のルートパス（例: '/docs/'）
      items: Array<SidebarNavItem>;
    };

export function getTranslatedLabel(label: string, translate: TranslateLabels | undefined, lang: LangCode): string {
  if (lang === 'ja' || !translate || !translate[lang as Exclude<LangCode, 'ja'>]) {
    return label;
  }
  return translate[lang as Exclude<LangCode, 'ja'>] || label;
}

export type SiteSection = 'docs' | 'ui' | 'patterns' | 'templates' | 'page-layouts';

export interface SidebarConfig {
  topLevelLinks: TopLevelLinkItem[];
  sections: Record<SiteSection, SidebarSection[]>;
}

const topLevelLinks: TopLevelLinkItem[] = [
  {
    type: 'toplink',
    label: 'CSS Docs',
    link: '/docs/',
    icon: BookOpenTextIcon,
  },
  {
    type: 'toplink',
    label: 'Lism UI',
    link: '/ui/',
    icon: ShapesIcon,
  },
  {
    type: 'toplink',
    label: 'Patterns',
    link: '/patterns/',
    icon: SquaresFourIcon,
  },
  {
    type: 'toplink',
    label: 'Page Layouts',
    link: '/page-layouts/',
    icon: LayoutIcon,
  },
  {
    type: 'toplink',
    label: 'Templates',
    link: '/templates/',
    icon: BrowsersIcon,
  },
];

const docsSidebar: SidebarSection[] = [
  {
    label: 'はじめに',
    translate: { en: 'Getting Started' },
    items: [
      { label: 'Lism CSSとは', translate: { en: 'What is Lism CSS?' }, link: '/docs/overview/' },
      '/docs/installation/',
      '/docs/css-files/',
      '/docs/skills/',
      '/docs/mcp/',
      '/docs/features/',
      '/docs/changelog/',
    ],
  },

  {
    label: '基本概念',
    translate: { en: 'Core Concepts' },
    rootPath: '/docs/',
    items: [
      '/docs/css-methodology/',
      '/docs/naming/',
      '/docs/tokens/',
      '/docs/tokens/colors/',
      '/docs/tokens/typography/',
      { type: 'separator' },
      // '/docs/reset-css/',
      '/docs/half-leading/',
      '/docs/base-styles/',
      '/docs/set-class/',
      '/docs/primitives/',
      '/docs/trait-class/',
      '/docs/utility-class/',
      '/docs/property-class/',
      '/docs/property-class/bd',
      '/docs/property-class/hov',
      '/docs/property-class/max-sz',
      '/docs/responsive/',
    ],
  },

  {
    label: 'Trait Class',
    items: ['/docs/trait-class/is--container/', '/docs/trait-class/is--wrapper/', '/docs/trait-class/is--layer/', '/docs/trait-class/is--boxLink/'],
  },
  {
    label: 'Layout Primitives',
    items: [
      '/docs/primitives/l--box/',
      '/docs/primitives/l--center/',
      '/docs/primitives/l--frame/',
      '/docs/primitives/l--flow/',

      { type: 'separator' },
      '/docs/primitives/l--flex/',
      '/docs/primitives/l--cluster/',
      '/docs/primitives/l--stack/',

      { type: 'separator' },
      '/docs/primitives/l--grid/',
      '/docs/primitives/l--tileGrid/',

      { type: 'separator' },
      '/docs/primitives/l--columns/',
      '/docs/primitives/l--autoColumns/',
      '/docs/primitives/l--withSide/',
      '/docs/primitives/l--switchColumns/',

      { type: 'separator' },
    ],
  },
  {
    label: 'Atomic Primitives',
    items: ['/docs/primitives/a--decorator/', '/docs/primitives/a--divider/', '/docs/primitives/a--icon/', '/docs/primitives/a--spacer/'],
  },
  {
    label: 'コアコンポーネント',
    translate: { en: 'Core Components' },
    dir: 'core-components',
  },
  {
    label: 'カスタマイズ',
    translate: { en: 'Customize' },
    items: [
      { label: 'カスタマイズの基本', translate: { en: 'Customization Basics' }, link: '/docs/customize/' },
      { label: 'lism.config.js', link: '/docs/customize/config/' },
      { label: 'SCSS', link: '/docs/customize/scss/' },
      { label: 'CSS Purge', link: '/docs/customize/purge/' },
    ],
  },
];

const uiSidebar: SidebarSection[] = [
  {
    label: 'Blocks',
    dir: 'ui', // content/ja/ui/ 直下のMDXを自動取得（パッケージ提供のUI）
  },
  {
    label: 'Block Examples',
    dir: 'ui/block-examples', // CSSをコピーして導入するb--部品の作例（#557）
  },
  {
    label: 'Components',
    dir: 'ui/components', // 独自CSSなしで組み立てる実装例（#557）
  },
];

const isProd = import.meta.env.PROD;

const patternsSidebar: SidebarSection[] = categoryIds.map((categoryId: PatternCategoryId) => {
  const category = patterns[categoryId];
  const items = isProd ? (category.items as PatternItem[]).filter((item) => !item.draft) : category.items;
  return {
    label: category.label,
    items: items.map((item) => ({
      label: item.title,
      link: `/patterns/${categoryId}/${item.id}`,
    })),
  };
});

// 集約カテゴリはカテゴリリンク、通常カテゴリは各テンプレートへのリンクにする
const aggregateCategoryLinks: LinkItem[] = templateCategories
  .filter((category) => category.aggregateView)
  .map((category) => ({
    label: category.label,
    link: `/templates/${category.id}/`,
  }));

const templatesSidebar: SidebarSection[] = [
  {
    label: 'Templates',
    items: [
      {
        label: 'すべてのテンプレート',
        translate: { en: 'All templates' },
        link: '/templates/',
      },
      ...aggregateCategoryLinks,
    ],
  },
  ...templateCategories
    .filter((category) => !category.aggregateView)
    .map((category) => ({
      category,
      items: visibleTemplates.filter((tpl) => tpl.category === category.id),
    }))
    .filter(({ items }) => items.length > 0)
    .map<SidebarSection>(({ category, items }) => ({
      label: category.label,
      items: items.map((tpl) => ({
        label: tpl.title.ja,
        translate: { en: tpl.title.en },
        link: `/templates/${category.id}/${tpl.slug}/`,
      })),
    })),
];

const pageLayoutsSidebar: SidebarSection[] = pageLayoutCategoryIds
  .map((categoryId: PageLayoutCategoryId) => {
    const category = pageLayouts[categoryId];
    const items = isProd ? (category.items as PageLayoutItem[]).filter((item) => !item.draft) : category.items;
    return { categoryId, category, items };
  })
  .filter(({ items }) => items.length > 0)
  .map<SidebarSection>(({ categoryId, category, items }) => ({
    label: category.label,
    items: items.map((item) => ({
      label: item.title,
      link: `/page-layouts/${categoryId}/${item.id}/`,
    })),
  }));

const sidebarConfig: SidebarConfig = {
  topLevelLinks,
  sections: {
    docs: docsSidebar,
    ui: uiSidebar,
    patterns: patternsSidebar,
    templates: templatesSidebar,
    'page-layouts': pageLayoutsSidebar,
  },
};

export default sidebarConfig;

export function getSiteSection(pathname: string): SiteSection {
  const pathWithoutLang = pathname.replace(/^\/(en|ja)\//, '/');
  if (pathWithoutLang.startsWith('/ui/') || pathWithoutLang === '/ui') {
    return 'ui';
  }
  if (pathWithoutLang.startsWith('/templates/') || pathWithoutLang === '/templates') {
    return 'templates';
  }
  // page-layouts は patterns より先に判定（startsWith の取り違いを防ぐため）
  if (pathWithoutLang.startsWith('/page-layouts/') || pathWithoutLang === '/page-layouts') {
    return 'page-layouts';
  }
  if (pathWithoutLang.startsWith('/patterns/') || pathWithoutLang === '/patterns') {
    return 'patterns';
  }
  return 'docs';
}

export function extractSlugFromUrl(url: string): string {
  // ルートごとのコンテンツ配置に合わせてslugを正規化する
  if (url.startsWith('/docs/')) {
    return url.replace(/^\/docs\//, '').replace(/^\/|\/$/g, '');
  }
  if (url.startsWith('/ui/')) {
    return 'ui/' + url.replace(/^\/ui\//, '').replace(/^\/|\/$/g, '');
  }
  if (url.startsWith('/templates/')) {
    return 'templates/' + url.replace(/^\/templates\//, '').replace(/^\/|\/$/g, '');
  }
  if (url.startsWith('/page-layouts/')) {
    return 'page-layouts/' + url.replace(/^\/page-layouts\//, '').replace(/^\/|\/$/g, '');
  }
  if (url.startsWith('/patterns/')) {
    return 'patterns/' + url.replace(/^\/patterns\//, '').replace(/^\/|\/$/g, '');
  }
  return url.replace(/^\/|\/$/g, '');
}
