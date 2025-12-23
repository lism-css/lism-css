/**
 * blockquote内の `-- ` で始まる部分を出典情報として抽出し、
 * <figure> + <blockquote> + <figcaption> 構造に変換するrehypeプラグイン
 *
 * 例1（URLあり）:
 * 入力（Markdown）:
 *   > これは引用文です。
 *   >
 *   > -- [出典元の名前](https://example.com)
 *
 * 出力（HTML）:
 *   <figure class="c--blockquote">
 *     <blockquote cite="https://example.com">
 *       <p>これは引用文です。</p>
 *     </blockquote>
 *     <figcaption>
 *       <a href="https://example.com">出典元の名前</a>
 *     </figcaption>
 *   </figure>
 *
 * 例2（URLなし）:
 * 入力（Markdown）:
 *   > これは引用文です。
 *   >
 *   > -- 出典元の名前
 *
 * 出力（HTML）:
 *   <figure class="c--blockquote">
 *     <blockquote>
 *       <p>これは引用文です。</p>
 *     </blockquote>
 *     <figcaption>出典元の名前</figcaption>
 *   </figure>
 *
 * 対応パターン: `-- ` または `— `（emダッシュ）で始まる行
 */
import { visit } from 'unist-util-visit';
import type { Root, Element, Text, ElementContent } from 'hast';

// citeとして認識するパターン（ダブルハイフンまたはemダッシュ）
const CITE_PATTERN = /^(?:--|—)\s*/;

// 出典情報の型
interface CiteInfo {
	text: string;
	url?: string;
}

/**
 * 出典情報を抽出する
 * リンク形式 [text](url) またはプレーンテキストに対応
 */
function extractCiteInfo(pElement: Element): CiteInfo | null {
	const pChildren = pElement.children;
	if (pChildren.length === 0) return null;

	const firstChild = pChildren[0];

	// パターン1: テキストで始まり、その後にリンクがある場合
	// 例: "-- " + <a href="url">text</a>
	if (firstChild.type === 'text') {
		const textContent = (firstChild as Text).value;

		// `-- ` または `— ` で始まるかチェック
		if (!CITE_PATTERN.test(textContent)) return null;

		// パターンを除去
		const remainingText = textContent.replace(CITE_PATTERN, '');

		// 残りのテキストがあればそれが出典名（URLなし）
		if (remainingText.trim()) {
			return { text: remainingText.trim() };
		}

		// テキストが空で、次の要素がリンクの場合
		if (pChildren.length > 1) {
			const secondChild = pChildren[1];
			if (secondChild.type === 'element' && secondChild.tagName === 'a') {
				const linkElement = secondChild as Element;
				const href = linkElement.properties?.href as string | undefined;
				const linkText = extractTextContent(linkElement);
				return { text: linkText, url: href };
			}
		}
	}

	return null;
}

/**
 * 要素内のテキストコンテンツを再帰的に抽出
 */
function extractTextContent(element: Element): string {
	let text = '';
	for (const child of element.children) {
		if (child.type === 'text') {
			text += (child as Text).value;
		} else if (child.type === 'element') {
			text += extractTextContent(child as Element);
		}
	}
	return text;
}

export function rehypeBlockquoteCite() {
	return (tree: Root) => {
		visit(tree, 'element', (node: Element, index: number | undefined, parent: any) => {
			// blockquote要素のみ処理
			if (node.tagName !== 'blockquote') return;
			if (index === undefined || !parent) return;

			const children = node.children;
			if (children.length === 0) return;

			// 最後の要素を取得（空白テキストノードをスキップ）
			let lastElementIndex = children.length - 1;
			while (lastElementIndex >= 0) {
				const child = children[lastElementIndex];
				if (child.type === 'text' && /^\s*$/.test((child as Text).value)) {
					lastElementIndex--;
					continue;
				}
				break;
			}

			if (lastElementIndex < 0) return;

			const lastElement = children[lastElementIndex];

			// 最後の要素が <p> タグの場合のみ処理
			if (lastElement.type !== 'element' || lastElement.tagName !== 'p') return;

			// 出典情報を抽出
			const citeInfo = extractCiteInfo(lastElement as Element);
			if (!citeInfo) return;

			// 出典の<p>を除去したblockquoteの子要素を作成
			const blockquoteChildren: ElementContent[] = children.slice(0, lastElementIndex);
			// 末尾の空白テキストノードも除去
			while (blockquoteChildren.length > 0) {
				const last = blockquoteChildren[blockquoteChildren.length - 1];
				if (last.type === 'text' && /^\s*$/.test((last as Text).value)) {
					blockquoteChildren.pop();
				} else {
					break;
				}
			}

			// <figcaption>の子要素を作成
			const figcaptionChildren: ElementContent[] = citeInfo.url
				? [
						{
							type: 'element',
							tagName: 'a',
							properties: { href: citeInfo.url },
							children: [{ type: 'text', value: citeInfo.text }],
						} as Element,
					]
				: [{ type: 'text', value: citeInfo.text }];

			// <figure>構造を作成
			const figureElement: Element = {
				type: 'element',
				tagName: 'figure',
				properties: { className: ['c--blockquote'] },
				children: [
					{
						type: 'element',
						tagName: 'blockquote',
						properties: citeInfo.url ? { cite: citeInfo.url } : {},
						children: blockquoteChildren,
					} as Element,
					{ type: 'text', value: '\n' },
					{
						type: 'element',
						tagName: 'figcaption',
						properties: {},
						children: figcaptionChildren,
					} as Element,
				],
			};

			// 親要素内でblockquoteをfigureに置き換え
			parent.children[index] = figureElement;
		});
	};
}
