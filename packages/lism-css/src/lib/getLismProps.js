// import { PROPS } from '../config';
import { PROPS, STATES } from 'lism-css/config';
import isPresetValue from './isPresetValue';
import isTokenValue from './isTokenValue';
import getUtilKey from './getUtilKey';
import getMaybeCssVar from './getMaybeCssVar';
import getMaybeTokenValue from './getMaybeTokenValue';
import getBpData from './getBpData';
import atts from './helper/atts';
import isEmptyObj from './helper/isEmptyObj';
import filterEmptyObj from './helper/filterEmptyObj';
import splitWithComma from './helper/splitWithComma';
// import svg2ImgUrl from './helper/svg2ImgUrl';

const getTokenKey = (propName) => {
	const propData = PROPS[propName];
	if (!propData) return '';

	return propData?.token || '';
};

class LismPropsData {
	// propList = {};
	className = '';
	uClasses = []; // props解析処理で追加される
	styles = {};
	attrs = {};

	constructor(allProps) {
		// 受け取るpropsとそうでないpropsを分ける
		const {
			forwardedRef,
			class: classFromAstro,
			className,
			lismClass,
			lismState = [],
			setClass = '',
			layout,
			variant,
			style = {},
			_propConfig = {},
			...others
		} = allProps;

		this.lismState = [...lismState];
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

		if (typeof layout === 'string' && layout) {
			_lismClass = atts(_lismClass, `l--${layout}`);
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
		this.className = atts(classFromAstro, className, _lismClass, this.lismState, setClass, this.uClasses);
	}

	// prop解析
	analyzeProps() {
		Object.keys(this.attrs).forEach((propName) => {
			// state チェック
			if (Object.hasOwn(STATES, propName)) {
				const propVal = this.extractProp(propName);
				const statePropData = STATES[propName];

				if (typeof statePropData === 'string' && propVal) {
					// そのままクラス化
					this.lismState.push(statePropData);
				} else {
					// isContainerなどの特別な処理が必要なレイアウトステート
					const { className, preset, presetClass, customVar, tokenKey } = statePropData;
					if (propVal === true) {
						this.lismState.push(className);
					} else if (isPresetValue(preset, propVal)) {
						this.lismState.push(`${className} ${presetClass}:${propVal}`);
					} else if (propVal) {
						// カスタム値
						this.lismState.push(className);
						this.addStyle(customVar, getMaybeTokenValue(tokenKey, propVal));
					}
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
				this.setHoverProps(propVal);
			} else if (propName === 'css') {
				// cssオブジェクトに入ってきたものはstyleへ流す
				const cssVales = this.extractProp('css');
				this.addStyles(cssVales);
			}
		});
	}

	// Lism Prop 解析
	analyzeLismProp(propName, propVal) {
		if (null == propVal) return;

		// propデータ取得
		let propConfig = PROPS[propName] || null;
		if (null === propConfig) return; // 一応 nullチェックここでも

		// config上書き設定があるかどうか
		if (this._propConfig[propName]) {
			propConfig = Object.assign({}, propConfig, this._propConfig[propName]);
		}

		// ブレイクポイント指定用のオブジェクト{base,sm,md,lg,xl}かどうかをチェック
		const { base: baseValue, ...bpValues } = getBpData(propVal);

		// base値の処理
		this.setAttrs(propName, baseValue, propConfig);

		// 各BP成分の処理
		Object.keys(bpValues).forEach((bp) => {
			this.setAttrs(propName, bpValues[bp], propConfig, bp);
		});
	}

	addUtil(util) {
		this.uClasses.push(util);
	}
	addUtils(utils) {
		this.uClasses.push(...utils);
	}
	// addState(state) {
	// 	this.stateClasses.push(state);
	// }
	addStyle(name, val) {
		this.styles[name] = val;
	}
	addStyles(styles) {
		this.styles = { ...this.styles, ...styles };
	}
	addAttrs(data) {
		this.addStyles(data.styles || {});
		this.addUtils(data.utils || []);
	}
	extractProp(propName) {
		let data = this.attrs[propName];
		if (undefined === this.attrs[propName]) {
			return null;
		}

		delete this.attrs[propName];
		return data;
	}
	extractProps(propNames) {
		const data = {};
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
	setAttrs(propKey, val, propConfig = {}, bpKey = '') {
		if (null == val || '' === val || false === val) return;

		let styleName = `--${propKey}`;
		let utilName = `-${propConfig.utilKey || propKey}`;

		if (bpKey) {
			styleName = `--${propKey}_${bpKey}`;
			utilName += `_${bpKey}`;
		}

		// "u:"ではじまっている場合、それに続く文字列を取得してユーティリティ化
		if (typeof val === 'string' && val.startsWith('u:')) {
			this.addUtil(`${utilName}:${val.replace('u:', '')}`);
			return;
		}

		// ユーティリティクラス化できるかどうかをチェック
		if (!bpKey) {
			const { presets, tokenClass, utils, shorthands } = propConfig;
			if (presets && isPresetValue(presets, val)) {
				this.addUtil(`${utilName}:${val}`);
				return;
			}
			// tokenもそのままクラス化する場合
			if (tokenClass && isTokenValue(propConfig.token, val)) {
				this.addUtil(`${utilName}:${val}`);
				return;
			}

			let utilKey = '';
			if (utils) {
				utilKey = getUtilKey(utils, val);
			}
			if (!utilKey && shorthands) {
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
		let { prop, isVar, alwaysVar, token, bp } = propConfig;

		//token を持つ場合の処理
		if (token) {
			val = getMaybeCssVar(val, token);
		}

		// baseスタイルの追加処理
		if (!bpKey) {
			if (isVar) {
				this.addStyle(`--${propKey}`, val);
				return;
			} else if (!bp && !alwaysVar) {
				// インラインでスタイル出力するだけ
				this.addStyle(prop, val);
				return;
			}
		}

		// .-prop & --prop / .-prop_bp & --prop_bpで 出力
		this.addUtil(utilName);
		this.addStyle(styleName, val);
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

	setHoverProps(hoverData) {
		if (!hoverData) return;

		// 配列のときは中身を再帰処理
		// if (Array.isArray(hoverData)) {
		// 	hoverData.forEach((_hov) => {
		// 		this.setHoverProps(_hov);
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
				let hovVal = hoverData[propName];
				if (null == hovVal || '' === hovVal || false === hovVal) return;

				// '-' の時は クラスのみ出力
				if (hovVal === '-' || hovVal === true) {
					this.addUtil(`-hov:${propName}`);
				} else if (propName === 'class') {
					// propNameが'class'の場合は文字列として-hov:{class}クラスを追加.(カンマ区切りで複数指定可能)
					splitWithComma(hovVal).forEach((cls) => {
						this.addUtil(`-hov:${cls}`);
					});
				} else {
					// トークン値の処理
					hovVal = getMaybeCssVar(hovVal, getTokenKey(propName));

					this.addUtil(`-hov:${propName}`);
					this.addStyle(`--hov-${propName}`, hovVal);
				}
			});
		}
	}
}

/**
 * props から styleに変換する要素 と その他 に分離する
 *
 * @param {Object} props
 * @return {Object} styles & attrs
 */
export default function getLismProps(props) {
	if (props.length === 0) {
		return {};
	}

	const propObj = new LismPropsData(props);

	return filterEmptyObj({
		className: propObj.className,
		style: filterEmptyObj(propObj.styles), //filterEmptyObj(styles), // filterEmptyObj は最後にかける
		...propObj.attrs, // 処理されずに残っているprops
	});
}
