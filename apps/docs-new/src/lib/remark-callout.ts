/**
 * :::type 記法をCalloutコンポーネントに変換するremarkプラグイン
 *
 * 例：
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
 * 対応するtype: alert, point, warning, check, help, note
 */
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';

// Calloutで使用可能なtype一覧
const CALLOUT_TYPES = ['alert', 'point', 'warning', 'check', 'help', 'note'];

export function remarkCallout() {
	return (tree: Root) => {
		visit(tree, (node: any) => {
			// containerDirective（:::で囲まれたブロック）を処理
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
