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
  nextTool: string | null;
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
