/**
 * 多言語化（i18n）ユーティリティ関数
 */
import { siteConfig, type LangCode } from '@/config/site';
import { translations, type UITranslations } from '@/config/translations';

// 型を再エクスポート
export type { LangCode } from '@/config/site';

// 言語設定を取得
const { langs } = siteConfig;

// 全言語コードのリスト
const langCodes = Object.keys(langs) as LangCode[];

/**
 * root言語（URLプレフィックスなし）のコードを取得
 */
export function getRootLang(): LangCode {
	const rootLang = langCodes.find((code) => langs[code].root);
	if (!rootLang) {
		throw new Error('Root language is not defined in siteConfig.langs');
	}
	return rootLang;
}

/**
 * 指定した言語がroot言語かどうかを判定
 */
export function isRootLang(lang: LangCode): boolean {
	return langs[lang]?.root === true;
}

/**
 * 全言語のリストを取得
 */
export function getAllLangs(): { code: LangCode; label: string; isRoot: boolean }[] {
	return langCodes.map((code) => ({
		code,
		label: langs[code].label,
		isRoot: langs[code].root === true,
	}));
}

/**
 * URLから現在の言語を取得
 * - /en/xxx → "en"
 * - /xxx → root言語（"ja"）
 */
export function getLangFromUrl(url: URL | string): LangCode {
	const pathname = typeof url === 'string' ? url : url.pathname;
	// パスの最初のセグメントを取得
	const segments = pathname.split('/').filter(Boolean);
	const firstSegment = segments[0];

	// 最初のセグメントが言語コードかどうかチェック
	if (firstSegment && langCodes.includes(firstSegment as LangCode)) {
		const lang = firstSegment as LangCode;
		// root言語の場合はURLに言語プレフィックスは付かないはずなので、root言語を返す
		if (!isRootLang(lang)) {
			return lang;
		}
	}

	// 言語プレフィックスがない場合はroot言語を返す
	return getRootLang();
}

/**
 * URLから言語プレフィックスを除いたパスを取得
 * - /en/layout/grid → /layout/grid
 * - /layout/grid → /layout/grid
 */
export function getPathWithoutLang(url: URL | string): string {
	const pathname = typeof url === 'string' ? url : url.pathname;
	const segments = pathname.split('/').filter(Boolean);
	const firstSegment = segments[0];

	// 最初のセグメントが非root言語コードなら除去
	if (firstSegment && langCodes.includes(firstSegment as LangCode)) {
		const lang = firstSegment as LangCode;
		if (!isRootLang(lang)) {
			return '/' + segments.slice(1).join('/');
		}
	}

	return pathname;
}

/**
 * 指定した言語用のURLを生成
 * - root言語: /path/to/page
 * - 非root言語: /{lang}/path/to/page
 */
export function getLocalizedUrl(path: string, lang: LangCode): string {
	// パスから既存の言語プレフィックスを除去
	const cleanPath = getPathWithoutLang(path);

	// root言語の場合はそのまま返す
	if (isRootLang(lang)) {
		return cleanPath || '/';
	}

	// 非root言語の場合は言語プレフィックスを付ける
	const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
	return `/${lang}${normalizedPath}`;
}

/**
 * 現在のページの他言語バージョンのURLを取得
 */
export function getAlternateUrls(currentUrl: URL | string): { lang: LangCode; url: string }[] {
	const path = getPathWithoutLang(currentUrl);
	return langCodes.map((lang) => ({
		lang,
		url: getLocalizedUrl(path, lang),
	}));
}

/**
 * 言語コードが有効かどうかをチェック
 */
export function isValidLang(lang: string): lang is LangCode {
	return langCodes.includes(lang as LangCode);
}

/**
 * 言語の表示ラベルを取得
 */
export function getLangLabel(lang: LangCode): string {
	return langs[lang]?.label ?? lang;
}

/**
 * 翻訳テキストを取得
 * @param lang - 言語コード
 * @returns 指定言語の翻訳オブジェクト
 */
export function getTranslations(lang: LangCode): UITranslations {
	return translations[lang] ?? translations[getRootLang()];
}

/**
 * 翻訳テキストを取得
 * @param lang - 言語コード
 * @param category - 翻訳カテゴリ（toc, search など）
 * @returns 指定カテゴリの翻訳オブジェクト
 */
export function t<K extends keyof UITranslations>(lang: LangCode, category: K): UITranslations[K] {
	const trans = getTranslations(lang);
	return trans[category];
}
