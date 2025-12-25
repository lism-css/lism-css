/**
 * MDXでグローバルに使用するコンポーネントをまとめてエクスポート
 * [...slug].astro の <Content components={mdxComponents} /> で使用
 */

export { default as Callout } from './Callout.astro';
export { default as LinkCard } from './LinkCard.astro';

// export { default as Demo } from './Demo/Demo.astro';
// export { default as DemoCode } from './Demo/DemoCode.astro';

// Preview系コンポーネント（docsから移植）
export { Preview, PreviewTitle, PreviewArea, PreviewCode, PreviewFrame } from '../Preview';

// DocComponents（docsから移植）
export { default as Reference } from './Reference.astro';
export { default as HelpText } from './HelpText.astro';
export { default as PropBadge } from './PropBadge.astro';

export { default as EmbedCode } from './EmbedCode.astro';
export { default as ImportPackage } from './ImportPackage.astro';
export { default as SrcCode } from './SrcCode.astro';
export { default as ImportSource } from './ImportSource.astro';
