/**
 * URLだけの段落を自動的にLinkCardコンポーネントに変換するremarkプラグイン
 *
 * 例：
 * 入力（MDX）:
 *   https://example.com
 *
 * 出力（変換後）:
 *   <LinkCard href="https://example.com" />
 */
import { visit } from 'unist-util-visit';
import type { Root, Paragraph, Text, Link } from 'mdast';

// URLパターン（http/https で始まる文字列）
const URL_PATTERN = /^https?:\/\/[^\s]+$/;

export function remarkLinkCard() {
	return (tree: Root) => {
		visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
			if (!parent || index === undefined) return;

			// パラグラフの子要素が1つだけかチェック
			if (node.children.length !== 1) return;

			const child = node.children[0];
			let url: string | null = null;

			// ケース1: テキストノードでURLのみ
			if (child.type === 'text') {
				const text = (child as Text).value.trim();
				if (URL_PATTERN.test(text)) {
					url = text;
				}
			}

			// ケース2: リンクノードでURLと同じテキスト（autolink形式）
			if (child.type === 'link') {
				const link = child as Link;
				// リンクの子要素がテキスト1つで、URLと同じ場合
				if (link.children.length === 1 && link.children[0].type === 'text' && (link.children[0] as Text).value === link.url) {
					url = link.url;
				}
			}

			// URLが見つかった場合、MDXJsxFlowElementに変換
			if (url) {
				// MDXのJSX要素として変換
				parent.children[index] = {
					type: 'mdxJsxFlowElement',
					name: 'LinkCard',
					attributes: [
						{
							type: 'mdxJsxAttribute',
							name: 'href',
							value: url,
						},
					],
					children: [],
				} as any;
			}
		});
	};
}
