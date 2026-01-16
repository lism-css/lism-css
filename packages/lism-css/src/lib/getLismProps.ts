// import { PROPS } from '../config';
import { PROPS, STATES } from '../../config/index';
import getLayoutProps, { type LayoutType } from './getLayoutProps';
import isPresetValue from './isPresetValue';
import isTokenValue from './isTokenValue';
import getUtilKey from './getUtilKey';
import getMaybeCssVar from './getMaybeCssVar';
import getBpData from './getBpData';
import atts from './helper/atts';
import isEmptyObj from './helper/isEmptyObj';
import filterEmptyObj from './helper/filterEmptyObj';
import splitWithComma from './helper/splitWithComma';
import { type StyleWithCustomProps } from './types';
import { StateProps } from './types/StateProps';
import { TokenProps } from './types/TokenProps';
import { MakeResponsive } from './types/ResponsiveProps';

// PropConfig interface based on config/defaults/props.ts
interface PropConfig {
	prop?: string;
	token?: string | null | undefined | false;
	tokenClass?: 0 | 1 | 2;
	presets?: Set<string> | string[] | readonly string[];
	presetClass?: string;
	utils?: Record<string, string>;
	shorthands?: Record<string, string>;
	isVar?: number;
	bp?: 0 | 1;
	alwaysVar?: number;
	overwriteBaseVar?: number;
	important?: number;
	exUtility?: Record<string, unknown>;
	customVar?: string;
	setStyles?: (val: unknown) => Record<string, unknown>;
	className?: string;
	utilKey?: string;
	[key: string]: unknown;
}

// StatePropData based on config/defaults/states.ts
type StatePropDataObject = {
	className: string;
	preset?: string[] | readonly string[];
	presetClass?: string;
	customVar?: string;
	tokenKey?: string;
	setStyles?: (propVal: string) => Record<string, unknown>;
};

type StatePropData = string | StatePropDataObject;

// getLismProps の入力となる Props 型
export interface LismProps extends StateProps, MakeResponsive<TokenProps> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	forwardedRef?: React.Ref<any>;
	layout?: LayoutType;
	class?: string;
	className?: string;
	lismClass?: string;
	variant?: string;
	style?: StyleWithCustomProps;
	_propConfig?: Record<string, PropConfig>;
	hov?: boolean | string | Record<string, unknown>;
	css?: Record<string, unknown>;
	[key: string]: unknown; //TODO(#41): Props の型定義が完了したら削除。
}

const getTokenKey = (propName: string): string => {
	const propData = (PROPS as Record<string, PropConfig>)[propName];
	if (!propData) return '';

	return (propData?.token as string) || '';
};

export class LismPropsData {
	// propList = {};
	className: string = '';
	uClasses: string[] = [];
	lismState: string[] = [];
	styles: StyleWithCustomProps = {};
	attrs: Record<string, unknown> = {};
	_propConfig?: Record<string, PropConfig>;

	constructor(allProps: LismProps) {
		// 受け取るpropsとそうでないpropsを分ける
		const { forwardedRef, class: classFromAstro, className, lismClass, variant, style = {}, _propConfig = {}, ...others } = allProps;

		this.styles = { ...style };
		this._propConfig = { ..._propConfig };

		let _lismClass = lismClass || '';
		// variantがあれば追加処理
		if (variant && lismClass) {
			// lismClassをスペースで分割して配列化
			const lismClassArr = lismClass.split(' ');
			const baseClass = lismClassArr[0];

			// {baseClass}--{variant} 形式でクラス名を生成
			const variantClass = `${baseClass}--${variant}`;

			// baseClass の後ろにvariantクラスを追加
			_lismClass = [baseClass, variantClass, ...lismClassArr.slice(1)].join(' ');
		}

		// propsの処理
		if (!isEmptyObj(others)) {
			this.attrs = { ...others };
			this.analyzeProps();
		}

		// ref
		if (forwardedRef) {
			this.attrs.ref = forwardedRef;
		}

		// pass-get
		// if (null != passVars && typeof passVars === 'object') {
		// 	this.setPassProps(passVars);
		// }

		// if (null != pass) {
		// 	// , 区切りでユーティリティクラスを複数出力可能
		// 	splitWithComma(pass).forEach((_propName) => {
		// 		this.addUtil(`-pass:${_propName}`);
		// 	});
		// }
		// if (null != get) {
		// 	// , 区切りでユーティリティクラスを複数出力可能
		// 	splitWithComma(get).forEach((_propName) => {
		// 		this.addUtil(`-get:${_propName}`);
		// 	});
		// }

		// クラスの結合
		this.className = atts(className || classFromAstro, _lismClass, this.lismState, this.uClasses);
	}

	analyzeState(statePropData: StatePropDataObject, propVal: unknown): void {
		// isWrapper などの特別な処理が必要なレイアウトステート
		const { className, preset, presetClass, customVar, tokenKey, setStyles } = statePropData;
		if (propVal === true) {
			this.lismState.push(className);
		} else if (preset && isPresetValue(preset, propVal)) {
			this.lismState.push(`${className} ${presetClass}:${String(propVal)}`);
		} else if (propVal) {
			// カスタム値
			this.lismState.push(className);
			if (tokenKey && customVar) {
				this.addStyle(customVar, getMaybeCssVar(propVal as string | number, tokenKey));
			} else if (setStyles && typeof propVal === 'string') {
				this.addStyles(setStyles(propVal));
			}
		}
	}

	// prop解析
	analyzeProps(): void {
		Object.keys(this.attrs).forEach((propName) => {
			// state チェック
			if (Object.hasOwn(STATES, propName)) {
				const propVal = this.extractProp(propName);
				const statePropData = (STATES as Record<string, StatePropData>)[propName];

				if (typeof statePropData === 'string') {
					// そのままクラス化
					if (propVal) this.lismState.push(statePropData);
				} else {
					this.analyzeState(statePropData, propVal);
				}
			} else if (Object.hasOwn(PROPS, propName)) {
				// Lism系のプロパティかどうか
				// value取得して attrsリストから削除しておく
				const propVal = this.attrs[propName];
				delete this.attrs[propName];

				// 解析処理
				this.analyzeLismProp(propName, propVal);
			} else if (propName === 'hov') {
				const propVal = this.extractProp(propName);
				this.setHovProps(propVal as boolean | string | Record<string, unknown> | null);
			} else if (propName === 'css') {
				// cssオブジェクトに入ってきたものはstyleへ流す
				const cssVales = this.extractProp('css');
				this.addStyles(cssVales as Record<string, unknown>);
			}
		});
	}

	// Lism Prop 解析
	analyzeLismProp(propName: string, propVal: unknown): void {
		if (null == propVal) return;

		// propデータ取得
		let propConfig: PropConfig | null = (PROPS as Record<string, PropConfig>)[propName] || null;
		if (null === propConfig) return; // 一応 nullチェックここでも

		// config上書き設定があるかどうか
		if (this._propConfig?.[propName]) {
			propConfig = Object.assign({}, propConfig, this._propConfig[propName]);
		}

		// ブレイクポイント指定用のオブジェクト{base,sm,md,lg,xl}かどうかをチェック
		const { base: baseValue, ...bpValues } = getBpData(propVal);

		// base値の処理
		this.setAttrs(propName, baseValue, propConfig);

		// 各BP成分の処理
		Object.keys(bpValues).forEach((bp) => {
			if (propConfig) {
				this.setAttrs(propName, bpValues[bp as keyof typeof bpValues], propConfig, bp);
			}
		});
	}

	addUtil(util: string): void {
		this.uClasses.push(util);
	}
	addUtils(utils: string[]): void {
		this.uClasses.push(...utils);
	}
	// addState(state) {
	// 	this.stateClasses.push(state);
	// }
	addStyle(name: string, val: string | number): void {
		// CSS custom properties can accept string or number
		(this.styles as Record<string, string | number>)[name] = val;
	}
	addStyles(styles: Record<string, unknown>): void {
		this.styles = { ...this.styles, ...styles };
	}
	addAttrs(data: { styles?: Record<string, unknown>; utils?: string[] }): void {
		this.addStyles(data.styles || {});
		this.addUtils(data.utils || []);
	}
	extractProp(propName: string): unknown {
		const data = this.attrs[propName];
		if (undefined === this.attrs[propName]) {
			return null;
		}

		delete this.attrs[propName];
		return data;
	}
	extractProps(propNames: string[]): Record<string, unknown> {
		const data: Record<string, unknown> = {};
		propNames.forEach((propName) => {
			if (undefined !== this.attrs[propName]) {
				data[propName] = this.attrs[propName];
				delete this.attrs[propName];
			}
		});
		return data;
	}

	// utilクラスを追加するか、styleにセットするかの分岐処理 @base
	// 値が null, undefined, '', false の時はスキップ
	setAttrs(propKey: string, val: unknown, propConfig: PropConfig = {}, bpKey: string = ''): void {
		if (null == val || '' === val || false === val) return;

		let styleName = `--${propKey}`;
		let utilName = `-${String(propConfig.utilKey || propKey)}`;

		if (bpKey) {
			styleName = `--${propKey}_${bpKey}`;
			utilName += `_${bpKey}`;
		}

		// ":"ではじまっている場合、それに続く文字列を取得してユーティリティ化
		if (typeof val === 'string' && val.startsWith(':')) {
			this.addUtil(`${utilName}:${val.replace(':', '')}`);
			return;
		}

		// ユーティリティクラス化できるかどうかをチェック
		if (!bpKey) {
			const { presets, tokenClass, utils, shorthands } = propConfig;
			if (presets && isPresetValue(presets, val)) {
				const valStr = typeof val === 'string' || typeof val === 'number' ? String(val) : '';
				if (valStr) this.addUtil(`${utilName}:${valStr}`);
				return;
			}
			// tokenもそのままクラス化する場合
			if (tokenClass && propConfig.token && isTokenValue(propConfig.token, val)) {
				const valStr = typeof val === 'string' || typeof val === 'number' ? String(val) : '';
				if (valStr) this.addUtil(`${utilName}:${valStr}`);
				return;
			}

			let utilKey = '';
			if (utils && typeof val === 'string') {
				utilKey = getUtilKey(utils, val);
			}
			if (!utilKey && shorthands && typeof val === 'string') {
				utilKey = getUtilKey(shorthands, val, true);
			}
			if (utilKey) {
				this.addUtil(`${utilName}:${utilKey}`);
				return;
			}
		}

		// .-prop: だけ出力するケース
		if (true === val || '-' === val) {
			this.addUtil(utilName);
			return;
		}

		// 以下、ユーティリティクラス化できない場合の処理
		const { prop, isVar, alwaysVar, token, bp } = propConfig;

		//token を持つ場合の処理
		let finalVal: string | number;
		if (token && (typeof val === 'string' || typeof val === 'number')) {
			finalVal = getMaybeCssVar(val, token);
		} else if (typeof val === 'string' || typeof val === 'number') {
			finalVal = val;
		} else {
			// オブジェクトや他の型の場合は文字列化 (通常は到達しないはず)
			finalVal = JSON.stringify(val);
		}

		// baseスタイルの追加処理
		if (!bpKey) {
			if (isVar) {
				this.addStyle(`--${propKey}`, finalVal);
				return;
			} else if (!bp && !alwaysVar) {
				// インラインでスタイル出力するだけ
				this.addStyle(prop as string, finalVal);
				return;
			}
		}

		// .-prop & --prop / .-prop_bp & --prop_bpで 出力
		this.addUtil(utilName);
		this.addStyle(styleName, finalVal);
	}

	// setPassProps(passVars) {
	// 	let dataList = [];
	// 	Object.keys(passVars).forEach((propName) => {
	// 		// プロバイダーリストに追加
	// 		dataList.push(propName);

	// 		// 渡す値
	// 		let value = passVars[propName];
	// 		if (null === value) return;

	// 		// トークン値であれば変換
	// 		value = getMaybeCssVar(value, getTokenKey(propName));
	// 		this.addStyle(`--pass_${propName}`, value);
	// 	});
	// }

	setHovProps(hoverData: boolean | string | Record<string, unknown> | null): void {
		if (!hoverData) return;

		// 配列のときは中身を再帰処理
		// if (Array.isArray(hoverData)) {
		// 	hoverData.forEach((_hov) => {
		// 		this.setHovProps(_hov);
		// 	});
		// 	return;
		// }

		if (hoverData === '-' || hoverData === true) {
			this.addUtil(`-hov`);
		} else if (typeof hoverData === 'string') {
			// カンマ区切りで複数指定可能能
			splitWithComma(hoverData).forEach((cls) => {
				this.addUtil(`-hov:${cls}`);
			});
		} else if (typeof hoverData === 'object') {
			// hover={{c:'red', 'bgc': 'blue'}} みたいな指定の時

			Object.keys(hoverData).forEach((propName) => {
				const hovVal = hoverData[propName];
				if (null == hovVal || '' === hovVal || false === hovVal) return;

				// '-' の時は クラスのみ出力
				if (hovVal === '-' || hovVal === true) {
					this.addUtil(`-hov:${propName}`);
				} else if (propName === 'class') {
					// propNameが'class'の場合は文字列として-hov:{class}クラスを追加.(カンマ区切りで複数指定可能)
					splitWithComma(hovVal as string).forEach((cls) => {
						this.addUtil(`-hov:${cls}`);
					});
				} else if (typeof hovVal === 'string' || typeof hovVal === 'number') {
					// トークン値の処理
					const finalHovVal = getMaybeCssVar(hovVal, getTokenKey(propName));

					this.addUtil(`-hov:${propName}`);
					this.addStyle(`--hov-${propName}`, finalHovVal);
				}
			});
		}
	}
}

export interface LismOutputProps extends React.HTMLAttributes<HTMLElement> {
	style?: StyleWithCustomProps;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ref?: React.Ref<any>;
	// data-*, aria-* などの任意の属性を受け入れる
	[key: string]: unknown;
}

/**
 * props から styleに変換する要素 と その他 に分離する
 *
 * @param {Object} props
 */
export default function getLismProps(props: LismProps): LismOutputProps {
	// Fix: オブジェクトに .length は存在しないため、適切な空チェックに修正
	if (Object.keys(props).length === 0) {
		return {};
	}

	const { layout, ...rest } = props;
	const propObj = new LismPropsData(getLayoutProps(layout, rest));

	return filterEmptyObj({
		className: propObj.className,
		style: filterEmptyObj(propObj.styles as Record<string, unknown>), //filterEmptyObj(styles), // filterEmptyObj は最後にかける
		...propObj.attrs, // 処理されずに残っているprops
	}) as LismOutputProps;
}
