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

export interface ComponentInfo {
  name: string;
  package: 'lism-css' | '@lism-css/ui';
  category: string;
  description: string;
  aliases?: string[];
  props: ComponentProp[];
  usage: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  default?: string;
  description: string;
}

export interface TokenCategory {
  category: string;
  description: string;
  tokens: TokenEntry[];
}

export interface TokenEntry {
  name: string;
  value: string;
  description?: string;
}

export interface PropEntry {
  prop: string;
  cssProperty: string;
  type: string;
  responsive: boolean;
  description: string;
  values?: string[];
}

export interface ClassNaming {
  propClass: string;
  propClassWithVariable: string;
  responsive: string;
  note: string;
  examples: string[];
}

export interface PropsSystemData {
  description: string;
  classNaming?: ClassNaming;
  categories: PropCategory[];
}

export interface PropCategory {
  category: string;
  description: string;
  props: PropEntry[];
}

export interface OverviewData {
  description: string;
  architecture: string;
  packages: PackageInfo[];
  breakpoints: Record<string, string>;
  installation: string;
  cssLayers: string;
}

export interface PackageInfo {
  name: string;
  npmName: string;
  description: string;
  version: string;
}
