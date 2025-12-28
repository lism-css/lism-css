/**
 * remark-directive による directive を処理するプラグイン
 *
 * このプラグインは以下の2つの処理を行います：
 *
 * 1. textDirective（:name 記法）を元のテキストに復元
 *    - remark-directive は :name 形式を textDirective として解析するが、
 *      このプロジェクトでは使用しないため、元のテキストに戻す
 *    - これにより「1:2」のような文字列が意図せず解析されることを防ぐ
 *
 * 2. containerDirective（:::type 記法）を Callout コンポーネントに変換
 *
 * :::type の使用例：
 * 入力（MDX）:
 *   :::point
 *   ここに文章
 *   :::
 *
 * 出力（変換後）:
 *   <Callout type="point">ここに文章</Callout>
 *
 * タイトル付きの例：
 * 入力（MDX）:
 *   :::point
 *   ::title[タイトルテキスト]
 *   ここに文章
 *   :::
 *
 * 出力（変換後）:
 *   <Callout type="point">
 *     <div class="c--callout__title">タイトルテキスト</div>
 *     ここに文章
 *   </Callout>
 *
 * 対応するtype: alert, point, warning, check, help, note, info
 */
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Calloutで使用可能なtype一覧
const CALLOUT_TYPES = ['alert', 'point', 'warning', 'check', 'help', 'note', 'info'];

export function remarkDirectiveHandler() {
	return (tree: Root) => {
		visit(tree, (node: any, index: number | undefined, parent: any) => {
			// textDirective（:で始まる記法）を元のテキストに復元
			// このプロジェクトでは textDirective は使用しないため、元の形式に戻す
			if (node.type === 'textDirective') {
				if (index === undefined || !parent) return;

				// textDirective を元のテキスト形式に復元
				// 例: :name → ":name", :name[label] → ":name[label]"
				let restoredText = `:${node.name}`;

				// label（[...]の中身）がある場合は復元
				if (node.children && node.children.length > 0) {
					const labelText = extractText(node.children);
					restoredText += `[${labelText}]`;
				}

				// attributes（{...}の中身）がある場合は復元
				if (node.attributes && Object.keys(node.attributes).length > 0) {
					const attrsStr = Object.entries(node.attributes)
						.map(([key, value]) => (value === '' ? key : `${key}="${value}"`))
						.join(' ');
					restoredText += `{${attrsStr}}`;
				}

				// textDirective ノードを text ノードに置き換え
				parent.children.splice(index, 1, { type: 'text', value: restoredText });
				return;
			}

			// containerDirective（:::で囲まれたブロック）を Callout に変換
			if (node.type === 'containerDirective') {
				const directiveName = node.name;

				// Calloutの対応するtypeかチェック
				if (CALLOUT_TYPES.includes(directiveName)) {
					// 子要素内の ::title ディレクティブを変換
					if (node.children) {
						node.children = node.children.map((child: any) => {
							// leafDirective（::で始まる記法）でnameが'title'の場合
							if (child.type === 'leafDirective' && child.name === 'title') {
								// div要素に変換
								return {
									type: 'mdxJsxFlowElement',
									name: 'div',
									attributes: [
										{
											type: 'mdxJsxAttribute',
											name: 'class',
											value: 'c--callout__title',
										},
									],
									// leafDirectiveの子要素（テキスト）をそのまま引き継ぐ
									children: child.children || [],
								};
							}
							return child;
						});
					}

					// MDXJsxFlowElementに変換
					node.type = 'mdxJsxFlowElement';
					node.name = 'Callout';
					node.attributes = [
						{
							type: 'mdxJsxAttribute',
							name: 'type',
							value: directiveName,
						},
					];
				}
			}
		});
	};
}

/**
 * AST ノードからテキストを抽出するヘルパー関数
 */
function extractText(nodes: any[]): string {
	return nodes
		.map((node: any) => {
			if (node.type === 'text') {
				return node.value;
			}
			if (node.children) {
				return extractText(node.children);
			}
			return '';
		})
		.join('');
}
