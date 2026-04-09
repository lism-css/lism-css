export interface MetaInfo {
  generatedAt: string;
  sourceCommit: string;
  docsVersion: string;
}

export interface SearchResult {
  sourcePath: string;
  url: string;
  heading: string;
  snippet: string;
  score: number;
}

export interface DocsEntry {
  sourcePath: string;
  title: string;
  description: string;
  category: string;
  headings: string[];
  keywords: string[];
  snippet: string;
}

/** search.ts の buildCssPropertyMap で使用。テスト用にも公開。 */
export interface PropCategory {
  category: string;
  description: string;
  props: PropEntry[];
}

export interface PropEntry {
  prop: string;
  cssProperty: string;
  type: string;
  responsive: boolean;
  description: string;
  values?: string[];
}
