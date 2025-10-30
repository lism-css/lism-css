import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config/index.js';
import getMaybeTokenValue from '../src/lib/getMaybeTokenValue.js';

// ES modules用の__dirname取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { tokens: TOKENS, props: PROPS } = CONFIG;

/**
 * ユーティリティ値を生成
 * @param {Object} propConfig - プロパティ設定
 * @returns {Object} ユーティリティ値のオブジェクト
 */
function generateUtilities(propConfig) {
	const { utils = {}, presets = [], token = '', tokenClass = 0 } = propConfig;
	const utilities = {};

	// tokenをクラス化するのであれば presetsへ追加
	if (token && tokenClass) {
		const tokenValues = TOKENS[token];
		if (tokenValues && Array.isArray(tokenValues)) {
			presets.push(...tokenValues);
		} else if (tokenValues && typeof tokenValues === 'object') {
			presets.push(...(tokenValues.values || []));
		}
	}

	// presetsが定義されている場合
	if (presets.length > 0) {
		presets.forEach((preset) => {
			utilities[preset] = getMaybeTokenValue(token, preset);
		});
	}

	// utilsが定義されている場合
	if (utils) {
		Object.entries(utils).forEach(([key, value]) => {
			utilities[key] = value;
		});
	}

	return utilities;
}

/**
 * プロパティ設定をSCSS形式に変換
 * @param {string} propKey - プロパティに対応する省略型のキー名
 * @param {Object} propConfig - プロパティ設定
 * @returns {string} SCSS形式の文字列
 */
function generatePropScss(propKey, propConfig) {
	const { prop = '', bp, isVar, alwaysVar, overwriteBaseVar, important } = propConfig;

	// styleが定義されている場合はそれを使用、なければpropKeyをそのまま使用
	const utilities = generateUtilities(propConfig);

	// ユーティリティが存在するかどうか
	const hasUtilities = Object.keys(utilities).length > 0;

	// 出力するCSSがない場合
	if (!hasUtilities && !bp) {
		return '';
	}

	let scss = `\t'${propKey}': (\n`;
	if (isVar) {
		scss += `\t\tprop: '--${propKey}',\n`;
	} else {
		// propName を prop-name に変換（キャメルケースをケバブケースに変換）
		scss += `\t\tprop: '${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}',\n`;
	}

	if (hasUtilities) {
		const exs = propConfig.exUtility || null;

		scss += `\t\tutilities: (\n`;
		Object.entries(utilities).forEach(([utilKey, value]) => {
			// キーに特殊文字が含まれる場合はエスケープ(/,%, : の前に \\ をつける(最終的にscss側の処理で \ ひとつになるようにここでは \\ ))
			const escapedKey = utilKey.replace(/\//g, '\\\\/').replace(/%/g, '\\\\%').replace(/:/g, '\\\\:');

			// exUtility としても定義されている場合はスキップ
			if (undefined === exs?.[utilKey]) {
				scss += `\t\t\t'${escapedKey}': '${value}',\n`;
			}
		});
		scss += `\t\t),\n`;

		if (exs) {
			scss += `\t\texUtility: (\n`;

			for (const [exKey, exProps] of Object.entries(exs)) {
				if (typeof exProps === 'object') {
					scss += `\t\t\t'${exKey}': (\n`;
					for (const _prop in exProps) {
						if (exProps[_prop]) {
							scss += `\t\t\t\t'${_prop}': '${exProps[_prop]}',\n`;
						}
					}
					scss += `\t\t\t),\n`;
				}
			}
			scss += `\t\t),\n`;
		}
	}

	if (bp !== undefined) {
		scss += `\t\tbp: ${bp},\n`;
	}
	if (isVar !== undefined) {
		scss += `\t\tisVar: ${isVar},\n`;
	}
	if (alwaysVar !== undefined) {
		scss += `\t\talwaysVar: ${alwaysVar},\n`;
	}
	if (overwriteBaseVar !== undefined) {
		scss += `\t\toverwriteBaseVar: ${overwriteBaseVar},\n`;
	}
	if (important !== undefined) {
		scss += `\t\timportant: ${important},\n`;
	}

	scss += `\t),`;

	return scss;
}

/**
 * メイン処理
 */
async function outputPropConfigSCSS() {
	console.log('_prop-config.scssを生成中...');

	let scssContent = `// 自動生成されたファイル. 生成日時: ${new Date().toISOString()}\n`;

	scssContent += '$props: (\n';
	// 各プロパティをSCSS形式に変換
	Object.entries(PROPS).forEach(([propKey, propConfig], index, array) => {
		const propContent = generatePropScss(propKey, propConfig);
		if (!propContent) return;
		scssContent += propContent;

		// 最後の要素でない場合は改行を追加
		if (index < array.length - 1) {
			scssContent += '\n';
		}
	});

	scssContent += '\n);\n';

	// ファイルに出力
	const outputPath = path.join(__dirname, '../src/scss/_prop-config.scss');
	await fs.promises.writeFile(outputPath, scssContent, 'utf8');

	console.log(`✅ _prop-config.scssを生成しました: ${outputPath}`);
}

// スクリプト実行
outputPropConfigSCSS().catch(console.error);
