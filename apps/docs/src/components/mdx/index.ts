/**
 * MDXでグローバルに使用するコンポーネントをまとめてエクスポート
 * [...slug].astro の <Content components={mdxComponents} /> で使用
 */

export { default as Callout } from './Callout.astro';
export { default as DocsLink } from './DocsLink.astro';

// lism-css primitives（MDX内でどこでも利用可）
export { Spacer } from 'lism-css/astro';

// Preview系コンポーネント（docsから移植）
export { Preview, PreviewTitle, PreviewArea, PreviewCode, PreviewFrame } from '../Preview';

// DocComponents（docsから移植）
export { default as HelpText } from './HelpText.astro';
export { default as PropBadge } from './PropBadge.astro';

export { default as ImportPackage } from './ImportPackage.astro';
export { default as SrcCode } from './SrcCode.astro';
export { default as ModLink } from './ModLink.astro';
