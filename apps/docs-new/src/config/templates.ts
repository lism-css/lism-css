/**
 * テンプレートデータ設定
 *
 * カテゴリごとにテンプレートのリストを定義
 * MDXファイルを使わず、このデータから動的にページを生成
 */

// テンプレートアイテムの型
export interface TemplateItem {
	id: string; // テンプレートID（例: cta001）
	title: string; // タイトル（例: CTA001）
	description: string; // 説明文
}

// カテゴリ情報の型
export interface TemplateCategory {
	label: string; // カテゴリ表示名
	items: TemplateItem[];
}

// カテゴリID
export type TemplateCategoryId =
	| 'cta'
	| 'feature'
	| 'greeting'
	| 'history'
	| 'information'
	| 'member'
	| 'navigation'
	| 'news'
	| 'pricetable'
	| 'section'
	| 'testimonials'
	| 'works';

// テンプレートデータ
export const templates: Record<TemplateCategoryId, TemplateCategory> = {
	cta: {
		label: 'CTA',
		items: [
			{ id: 'cta001', title: 'CTA001', description: 'CTA用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'cta002', title: 'CTA002', description: 'CTA用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'cta003', title: 'CTA003', description: 'CTA用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'cta004', title: 'CTA004', description: 'CTA用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
		],
	},
	feature: {
		label: 'Feature',
		items: [
			{ id: 'feature001', title: 'Feature001', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'feature002', title: 'Feature002', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下でレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'feature003', title: 'Feature003', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'feature004', title: 'Feature004', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'feature005', title: 'Feature005', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'feature006', title: 'Feature006', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'feature007', title: 'Feature007', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'feature008', title: 'Feature008', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'feature009', title: 'Feature009', description: '特徴・注目コンテンツ用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'feature010', title: 'Feature010', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'feature011', title: 'Feature011', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'feature012', title: 'Feature012', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は2カラム、「sm」以下は1カラムで表示されます。' },
			{ id: 'feature013', title: 'Feature013', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は2カラム、「sm」以下は1カラムで表示されます。' },
			{ id: 'feature014', title: 'Feature014', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'feature015', title: 'Feature015', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'feature016', title: 'Feature016', description: '特徴・注目コンテンツ用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
		],
	},
	greeting: {
		label: 'Greeting',
		items: [
			{ id: 'greeting001', title: 'Greeting001', description: '挨拶用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'greeting002', title: 'Greeting002', description: '挨拶用のテンプレートです。' },
			{ id: 'greeting003', title: 'Greeting003', description: '挨拶用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'greeting004', title: 'Greeting004', description: '挨拶用のテンプレートです。' },
		],
	},
	history: {
		label: 'History',
		items: [
			{ id: 'history001', title: 'History001', description: '沿革コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'history002', title: 'History002', description: '沿革コンテンツ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
		],
	},
	information: {
		label: 'Information',
		items: [
			{ id: 'information001', title: 'Information001', description: '情報用のテンプレートです。内容は全てダミーコンテンツです。' },
			{ id: 'information002', title: 'Information002', description: '情報用のテンプレートです。内容は全てダミーコンテンツです。' },
			{ id: 'information003', title: 'Information003', description: '情報用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。内容は全てダミーコンテンツです。' },
			{ id: 'information004', title: 'Information004', description: '情報用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。内容は全てダミーコンテンツです。' },
		],
	},
	member: {
		label: 'Member',
		items: [
			{ id: 'member001', title: 'Member001', description: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'member002', title: 'Member002', description: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'member003', title: 'Member003', description: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'member004', title: 'Member004', description: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'member005', title: 'Member005', description: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'member006', title: 'Member006', description: 'メンバー一覧用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
		],
	},
	navigation: {
		label: 'Navigation',
		items: [
			{ id: 'navigation001', title: 'Navigation001', description: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'navigation002', title: 'Navigation002', description: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。breakpoint「md」以下は1カラムで表示されます。' },
			{ id: 'navigation003', title: 'Navigation003', description: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'navigation004', title: 'Navigation004', description: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'navigation005', title: 'Navigation005', description: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'navigation006', title: 'Navigation006', description: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'navigation007', title: 'Navigation007', description: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'navigation008', title: 'Navigation008', description: 'ナビゲーション用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
		],
	},
	news: {
		label: 'News',
		items: [
			{ id: 'news001', title: 'News001', description: 'お知らせ用のテンプレートです。breakpoint「sm」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'news002', title: 'News002', description: 'お知らせ用のテンプレートです。breakpoint「sm」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'news003', title: 'News003', description: 'お知らせ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'news004', title: 'News004', description: 'お知らせ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'news005', title: 'News005', description: 'お知らせ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'news006', title: 'News006', description: 'お知らせ用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
		],
	},
	pricetable: {
		label: 'Price Table',
		items: [
			{ id: 'pricetable001', title: 'PriceTable001', description: '価格表用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'pricetable002', title: 'PriceTable002', description: '価格表用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'pricetable003', title: 'PriceTable003', description: '価格表用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'pricetable004', title: 'PriceTable004', description: '価格表用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
		],
	},
	section: {
		label: 'Section',
		items: [
			{ id: 'section001', title: 'Section001', description: 'セクション用のテンプレートです。' },
			{ id: 'section002', title: 'Section002', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section002-2', title: 'Section002-2', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section003', title: 'Section003', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section003-2', title: 'Section003-2', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section004', title: 'Section004', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section005', title: 'Section005', description: 'セクション用のテンプレートです。' },
			{ id: 'section006', title: 'Section006', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section007', title: 'Section007', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section008', title: 'Section008', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section009', title: 'Section009', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'section009-2', title: 'Section009-2', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'section010', title: 'Section010', description: 'セクション用のテンプレートです。' },
			{ id: 'section011', title: 'Section011', description: 'セクション用のテンプレートです。' },
			{ id: 'section012', title: 'Section012', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'section013', title: 'Section013', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section014', title: 'Section014', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section015', title: 'Section015', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'section015-2', title: 'Section015-2', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムになり、アイテムが縦に並びます。' },
			{ id: 'section016', title: 'Section016', description: 'セクション用のテンプレートです。breakpoint「md」以下はレイアウトが変わり、アイテムの並びが変更されます。' },
			{ id: 'section901', title: '調整中：Section901', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'section901-2', title: '調整中：Section901-2', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'section902', title: '調整中：Section902', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
			{ id: 'section902-2', title: '調整中：Section902-2', description: 'セクション用のテンプレートです。breakpoint「md」以下は1カラムで表示され、アイテムが縦に並びます。' },
		],
	},
	testimonials: {
		label: 'Testimonials',
		items: [
			{ id: 'testimonials001', title: 'Testimonials001', description: 'お客様の声用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'testimonials002', title: 'Testimonials002', description: 'お客様の声用のテンプレートです。breakpoint毎にアイテムの幅が変更されます。またアイテムをスナップした際に特定の位置で止まります。' },
		],
	},
	works: {
		label: 'Works',
		items: [
			{ id: 'works001', title: 'Works001', description: '実績用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
			{ id: 'works002', title: 'Works002', description: '実績用のテンプレートです。アイテムの最小幅が設定されており、コンテナ幅に応じてカラム数が変化します。' },
		],
	},
};

// カテゴリIDの配列
export const categoryIds = Object.keys(templates) as TemplateCategoryId[];

/**
 * カテゴリIDとテンプレートIDからテンプレート情報を取得
 */
export function getTemplate(categoryId: string, templateId: string): TemplateItem | undefined {
	const category = templates[categoryId as TemplateCategoryId];
	if (!category) return undefined;
	return category.items.find((item) => item.id === templateId);
}

/**
 * 全テンプレートのパスを生成（getStaticPaths用）
 */
export function getAllTemplatePaths(): Array<{ category: string; id: string }> {
	const paths: Array<{ category: string; id: string }> = [];
	for (const [categoryId, category] of Object.entries(templates)) {
		for (const item of category.items) {
			paths.push({ category: categoryId, id: item.id });
		}
	}
	return paths;
}

