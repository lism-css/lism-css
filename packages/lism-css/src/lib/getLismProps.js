import { PROPS } from '../config';
import isPresetValue from './isPresetValue';
import isTokenValue from './isTokenValue';
import getMaybeUtilValue from './getMaybeUtilValue';
import getMaybeCssVar from './getMaybeCssVar';
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

const STATE_CLASSES = {
	isContainer: (value) => {
		if (value === true) {
			return { className: 'is--container' };
		} else if (value) {
			if (isTokenValue('size', value)) {
				return { className: `is--container -container:${value}` };
			} else {
				return { className: 'is--container', styleKey: '--contentSize', styleValue: getMaybeCssVar(value, 'size') };
			}
		}
		return {};
	},
	isFlow: (value) => {
		if (value === true) {
			return { className: 'is--flow' };
		} else if (value) {
			if (isTokenValue('flow', value)) {
				return { className: `is--flow -flow:${value}` };
			} else {
				return { className: 'is--flow', styleKey: '--flowM', styleValue: getMaybeCssVar(value, 'space') };
			}
		}
		return {};
	},
	isVertical: 'is--vertical',
	isSkipFlow: 'is--skipFlow',
	isLayer: 'is--layer',
	isIsolate: 'is--isolate',
	isLinkBox: 'is--linkBox',
	isOverlayLink: 'is--overlayLink',
	isWide: 'is--wide',
	isFullwide: 'is--fullwide',
	isOverwide: 'is--overwide',
	hasGutter: 'has--gutter',
};

// const PROP_FULL_NAMES = {
// 	padding: 'p',
// 	margin: 'm',
// };

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
			variant,
			passVars,
			// lismVar,
			style = {},
			_propConfig = {},

			// hasBd,
			...others
		} = allProps;

		this.lismClass = lismClass || '';
		this.lismState = [...lismState];
		this.styles = { ...style };
		this._propConfig = { ..._propConfig };

		// ここで variant 処理
		if (variant && lismClass) {
			// lismClassをスペースで分割して配列化
			const lismClassArr = lismClass.split(' ');
			const baseClass = lismClassArr[0];

			// variantを","で分割して配列化
			const variantArr = variant
				.split(',')
				.map((v) => v.trim())
				.filter(Boolean);

			// {baseClass}-{variant} 形式でクラス名を生成
			const variantClasses = variantArr.map((v) => `${baseClass}-${v}`);
			// baseClass の後ろにvariantクラスを追加
			this.lismClass = [baseClass, ...variantClasses, ...lismClassArr.slice(1)].join(' ');
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
		if (null != passVars && typeof passVars === 'object') {
			this.setPassProps(passVars);
		}

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
		this.className = atts(this.lismClass, this.lismState, classFromAstro, className, this.uClasses);
	}

	// prop解析
	analyzeProps() {
		Object.keys(this.attrs).forEach((propName) => {
			// state チェック
			if (Object.hasOwn(STATE_CLASSES, propName)) {
				const propVal = this.extractProp(propName);
				const statePropData = STATE_CLASSES[propName];
				if (typeof statePropData === 'string') {
					this.lismState.push(STATE_CLASSES[propName]);
				} else {
					const { className, styleKey, styleValue } = statePropData(propVal);
					if (className) {
						this.lismState.push(className);
					}
					if (styleKey) {
						this.addStyle(styleKey, styleValue);
					}
				}
			} else if (Object.hasOwn(PROPS, propName)) {
				// Lism系のプロパティかどうか
				// value取得して attrsリストから削除しておく
				const propVal = this.attrs[propName];
				delete this.attrs[propName];

				// 解析処理
				this.analyzeLismProp(propName, propVal);
			} else {
				// 特殊系
				if (propName === 'hov') {
					const propVal = this.extractProp(propName);
					this.setHoverProps(propVal);
				} else if (propName === 'bd') {
					const propVal = this.extractProp(propName);
					this.setBdProps(propVal);
				} else if (propName === 'css') {
					// cssオブジェクトに入ってきたものはstyleへ流す
					const cssVales = this.extractProp('css');
					this.addStyles(cssVales);
				}
			}
		});
	}

	// Lism Prop 解析
	analyzeLismProp(propName, propVal, propData) {
		if (null == propVal) return;

		// propデータ取得
		propData = propData || PROPS[propName] || null;
		if (null === propData) return; // 一応 nullチェックここでも

		// config上書き設定があるかどうか
		if (this._propConfig[propName]) {
			propData = Object.assign({}, propData, this._propConfig[propName]);
		}

		// ブレイクポイント指定用のオブジェクト{base,sm,md,lg,xl}かどうかをチェック
		const { base: baseValue, ...bpValues } = getBpData(propVal);

		// base値の処理
		this.setAttrs(propName, baseValue, propData);

		// 各BP成分の処理
		Object.keys(bpValues).forEach((bp) => {
			this.setAttrs(propName, bpValues[bp], propData, bp);
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
	setAttrs(propName, val, propData = {}, bp = '') {
		if (null == val || '' === val || false === val) return;

		const name = propName;

		let styleName = `--${name}`;
		let utilName = `-${propData.utilKey || name}`;

		if (bp) {
			// styleName = `--${bp}-${name}`;
			// utilName += `@${bp}`;
			styleName = `--${name}_${bp}`;
			utilName += `_${bp}`;
		}

		// "u:"ではじまっている場合、それに続く文字列を取得してユーティリティ化
		if (typeof val === 'string' && val.startsWith('u:')) {
			this.addUtil(`${utilName}:${val.replace('u:', '')}`);
			return;
		}

		// ユーティリティクラス化できるかどうかをチェック
		if (!bp) {
			if (propData.presets) {
				if (isPresetValue(propData.presets, val)) {
					this.addUtil(`${utilName}:${val}`);
					return;
				}
			}
			if (propData.utils) {
				const utilVal = getMaybeUtilValue(propData.utils, val);
				if (utilVal) {
					this.addUtil(`${utilName}:${utilVal}`);
					return;
				}
			}
		}

		// 以下、ユーティリティクラス化できない場合の処理
		let { style, isVar, token } = propData;

		// .-prop: だけ出力するケース
		// if ((!style && true === val) || '-' === val) {
		if (true === val || '-' === val) {
			this.addUtil(utilName);
			return;
		}

		//token: color の時の特殊処理
		if (token === 'color' && name !== 'keycolor') {
			// bgc='col1:(colo2:)mix%'

			// color が ":数値%" で終わるかどうか
			if (typeof val === 'string' && val.endsWith('%')) {
				this.setMixColor(name, val);
				return;
			}
		}

		//token を持つ場合の処理
		if (token) {
			val = getMaybeCssVar(val, token);
		}

		// style のみ出力するケース
		if (isVar) style = `--${name}`;
		if (!bp && style) {
			// if (1 === style) style = name; // 1 は prop名をそのままstyleとして使う
			this.addStyle(style, val);
			return;
		}

		// .-prop: & --prop で 出力
		this.addUtil(utilName);
		this.addStyle(styleName, val);
	}

	setMixColor(name, val) {
		const mixdata = val.split(':');
		if (mixdata.length === 3) {
			const [color1, color2, mixper] = mixdata;
			this.addStyle(`--_${name}1`, getMaybeCssVar(color1, 'color'));
			this.addStyle(`--_${name}2`, getMaybeCssVar(color2, 'color'));
			this.addStyle(`--_mix-${name}`, mixper);
		} else if (mixdata.length === 2) {
			const [color1, mixper] = mixdata;
			this.addStyle(`--_${name}1`, getMaybeCssVar(color1, 'color'));
			this.addStyle(`--_mix-${name}`, mixper);
		}
		// [color1, mixper]
		this.addUtil(`-${name}:mix`);
	}

	setPassProps(passVars) {
		let dataList = [];
		Object.keys(passVars).forEach((propName) => {
			// プロバイダーリストに追加
			dataList.push(propName);

			// 渡す値
			let value = passVars[propName];
			if (null === value) return;

			// トークン値であれば変換
			value = getMaybeCssVar(value, getTokenKey(propName));
			this.addStyle(`--pass_${propName}`, value);
		});
	}

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

	setBdProps(value) {
		if (!value) return;

		if (typeof value === 'string') {
			// , 区切りでユーティリティを複数指定できる（var() や rgba() などがないかチェック）
			if (value.includes(',') && !value.includes('(')) {
				splitWithComma(value).forEach((_val) => {
					const utilVal = getMaybeUtilValue('bd', _val) || _val;
					if (utilVal) {
						this.addUtil(`-bd:${utilVal}`);
					}
				});
				return;
			}
		}

		this.analyzeLismProp('bd', value);
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
