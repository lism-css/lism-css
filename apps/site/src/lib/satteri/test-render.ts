import { markdownToHtml } from 'satteri';
import type { HastPluginList } from 'satteri';

// HAST プラグインのテスト用: Markdown を描画し、タグ間の改行を除いた HTML を返す
export async function renderHtml(source: string, hastPlugins: HastPluginList): Promise<string> {
  const { html } = await markdownToHtml(source, {
    features: { gfm: true, smartPunctuation: { dashes: false } },
    hastPlugins,
  });
  return html.replace(/\n(?=<)|(?<=>)\n/g, '');
}
