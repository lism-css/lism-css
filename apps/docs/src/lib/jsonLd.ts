/**
 * Schema.org JSON-LD 構造化データ生成
 * - 検索エンジン・LLM がページの種類と内容を正確に理解するために使用
 */

import { siteConfig } from '@/config/site';

export type SchemaType = 'SoftwareSourceCode' | 'TechArticle';

/** 共通の Organization 情報 */
const organization = {
  '@type': 'Organization',
  name: 'Lism CSS',
  url: 'https://github.com/lism-css',
} as const;

/** トップページ用: ソフトウェアプロジェクトとしての説明 */
export function generateSoftwareSourceCodeSchema(params: { url: string; lang: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: siteConfig.name,
    description: 'A lightweight, layout-first CSS framework with React and Astro components.',
    url: params.url,
    codeRepository: siteConfig.author.github,
    programmingLanguage: 'CSS',
    author: organization,
    inLanguage: params.lang,
  };
}

/** ドキュメントページ用: 技術記事としての説明 */
export function generateTechArticleSchema(params: { url: string; title: string; description?: string; lang: string; datePublished?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: params.title,
    ...(params.description && { description: params.description }),
    url: params.url,
    author: organization,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: 'https://lism-css.com',
    },
    ...(params.datePublished && { datePublished: params.datePublished }),
    inLanguage: params.lang,
  };
}

/** schemaType に応じた JSON-LD オブジェクトを生成 */
export function generateJsonLd(
  schemaType: SchemaType,
  params: {
    url: string;
    title: string;
    description?: string;
    lang: string;
    datePublished?: string;
  }
) {
  switch (schemaType) {
    case 'SoftwareSourceCode':
      return generateSoftwareSourceCodeSchema(params);
    case 'TechArticle':
      return generateTechArticleSchema(params);
  }
}
