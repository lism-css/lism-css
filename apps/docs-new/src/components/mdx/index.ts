/**
 * MDXでグローバルに使用するコンポーネントをまとめてエクスポート
 * [...slug].astro の <Content components={mdxComponents} /> で使用
 */

export { default as Callout } from './Callout.astro';
export { default as Demo } from './Demo/Demo.astro';
export { default as DemoCode } from './Demo/DemoCode.astro';
export { default as LinkCard } from './LinkCard.astro';
export { default as YouTubeEmbed } from './YouTubeEmbed.astro';
export { default as InnerLink } from './InnerLink.astro';
export { default as CanUse } from './CanUse.astro';

// Preview系コンポーネント（docsから移植）
export { Preview, PreviewTitle, PreviewArea, PreviewCode, PreviewFrame } from '../Preview';

// DocComponents（docsから移植）
export { HelpText, IconBadge, Reference, MemoBadge, PropBadge } from '../DocComponents.jsx';

export { default as EmbedCode } from './EmbedCode.astro';
export { default as ImportPackage } from './ImportPackage.astro';
export { default as SrcCode } from './SrcCode.astro';

// code-template系コンポーネント（docsから移植）
export { default as ImportSource } from './ImportSource.astro';

// NOTE: 他のグローバルコンポーネントを追加する場合はここに追記
// export { default as Badge } from './Badge.astro';
// export { default as Alert } from './Alert.astro';
