/**
 * MDXでグローバルに使用するコンポーネントをまとめてエクスポート
 * [...slug].astro の <Content components={mdxComponents} /> で使用
 */

export { default as Callout } from './Callout.astro';
export { default as Preview } from './Preview/Preview.astro';
export { default as PreviewCode } from './Preview/PreviewCode.astro';
export { default as LinkCard } from './LinkCard.astro';
export { default as YouTubeEmbed } from './YouTubeEmbed.astro';
export { default as InnerLink } from './InnerLink.astro';
export { default as CanUse } from './CanUse.astro';

// NOTE: 他のグローバルコンポーネントを追加する場合はここに追記
// export { default as Badge } from './Badge.astro';
// export { default as Alert } from './Alert.astro';
