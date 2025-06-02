import { PROPS, CONTEXT_PROPS } from '../config';
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

const getConverter = (propName) => {
    const propData = PROPS[propName];
    if (!propData) return null;

    const { converter } = propData;
    return converter || null;
};

const PROPS_KEYS = Object.keys(PROPS);
const CONTEXT_PROPS_KEYS = Object.keys(CONTEXT_PROPS);

// const PROP_FULL_NAMES = {
// 	padding: 'p',
// 	margin: 'm',
// };

class LismPropsData {
    // propList = {};
    // styles = {};
    // className = '';
    // uClasses = []; // props解析処理で追加される
    // attrs = {};

    constructor(allProps) {
        // 初期化
        // this.propList = {};
        this.styles = {};
        this.className = '';
        this.uClasses = []; // props解析処理で追加される
        this.attrs = {};
        this.lismClass = '';
        this.lismState = [];

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
            // hasMask,
            style = {},

            // hasBd,
            ...otherProps
        } = allProps;

        this.lismClass = lismClass;
        this.lismState = lismState;
        this.styles = style;

        let others = this.getStateProps(otherProps);

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

            // {baseClass}--{variant} 形式でクラス名を生成
            const variantClasses = variantArr.map((v) => `${baseClass}--${v}`);
            // lismClassの後ろにvariantクラスを追加
            this.lismClass = lismClassArr.concat(variantClasses).join(' ');
        }

        // クラスの結合
        this.className = atts(this.lismClass, this.lismState, classFromAstro, className);

        // propsの処理
        if (!isEmptyObj(others)) {
            this.attrs = others;

            // props処理
            this.analyzeProps(others);
        }

        // ref
        if (forwardedRef) {
            this.attrs.ref = forwardedRef;
        }

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
    }

    // 特定の条件下で受け取るpropの処理
    setContextProps(name, values) {
        // if (typeof values !== 'object') return;

        const contextProps = CONTEXT_PROPS[name];
        if (!contextProps) return;

        Object.keys(values).forEach((propName) => {
            const propData = contextProps[propName];
            if (propData) {
                const propValue = values[propName];

                // console.log(propName, propValue, propData);
                this.analyzeProp(propName, propValue, propData);
            } else if (name === 'css') {
                // cssオブジェクトに入ってきたが、Lism側で一致するデータがないものはそのままstyleへ流す
                this.addStyle(propName, values[propName]);
            }
        });
    }

    // prop解析
    analyzeProps(attrs) {
        const attrKeys = Object.keys(attrs);

        attrKeys.forEach((propName) => {
            // 特殊系
            if (propName === 'hov') {
                const propVal = this.extractProp(propName);
                this.setHoverProps(propVal);
                return;
            }
            if (propName === 'bd') {
                const propVal = this.extractProp(propName);
                this.setBdProps(propVal);
                return;
            }

            // if (PROP_FULL_NAMES[propName]) propName = PROP_FULL_NAMES[propName];

            // Lism系のプロパティかどうか
            const isLismProp = PROPS_KEYS.includes(propName);
            const isContextProp = CONTEXT_PROPS_KEYS.includes(propName);

            // それ以外はここでスキップ
            if (!isLismProp && !isContextProp) return;

            // value取得して attrsリストから削除しておく
            const propVal = this.attrs[propName];
            delete this.attrs[propName];

            if (isContextProp) {
                this.setContextProps(propName, propVal);
            } else {
                this.analyzeProp(propName, propVal);
            }
        });
    }

    // prop解析
    analyzeProp(propName, propVal, propData) {
        if (null == propVal) return;

        // propデータ取得
        propData = propData || PROPS[propName] || null;
        if (null === propData) return; // 一応 nullチェックここでも

        const { name, objProcessor, ...options } = propData;

        // ブレイクポイント指定用のオブジェクト{base,sm,md,lg,xl}かどうかをチェック
        const { base: baseValue, ...bpValues } = getBpData(propVal);
        propVal = baseValue;
        // let bpValues = null;

        // if (typeof propVal === 'object') {
        // }
        // if (BP) {
        // 	// 事前にBP指定用の { sm, md, ...} 形式で取り出す
        // 	const { base: baseValue, ...bpData } = getBpData(propVal);
        // 	propVal = baseValue;
        // 	bpValues = bpData;
        // }

        // BP指定意外で成分プロパティが指定されている場合
        if (null != propVal && typeof propVal === 'object') {
            // 各成分の解析
            if (objProcessor) {
                // this.analyzeSideObj(propVal, objProcessor);
                Object.keys(propVal).forEach((dataKey) => {
                    // 指定された成分に対応する prop名 を取得
                    const propName = objProcessor(dataKey);

                    this.analyzeProp(propName, propVal[dataKey]);
                });
            }
        } else {
            // オブジェクト以外の普通の処理
            this.setAttrs(name || propName, propVal, options);
        }

        // if (null !== bpValues) {
        // 各BP成分の処理
        Object.keys(bpValues).forEach((bp) => {
            this.setAttrs(name || propName, bpValues[bp], options, bp);
        });
        // }
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
    setAttrs(name, val, options = {}, bp) {
        if (null == val) return;

        let styleName = `--${name}`;
        let utilName = `-${options.utilKey || name}`;

        if (bp) {
            styleName = `--${bp}-${name}`;
            utilName += `@${bp}`;
        } else {
            utilName += ':';
        }

        // "u:"ではじまっている場合、それに続く文字列を取得してユーティリティ化
        if (typeof val === 'string' && val.startsWith('u:')) {
            this.addUtil(`${utilName}${val.replace('u:', '')}`);
            return;
        }

        // ユーティリティクラス化できるかどうかをチェック
        if (!bp) {
            let { presets, utils } = options;
            if (presets) {
                if (1 === presets) presets = name; // 1 は prop名をそのままキーとして取得
                if (isPresetValue(presets, val)) {
                    this.addUtil(`${utilName}${val}`);
                    return;
                }
            }
            if (utils) {
                if (1 === utils) utils = name; // 1 は prop名をそのままキーとして取得
                const utilVal = getMaybeUtilValue(utils, val);
                if (utilVal) {
                    this.addUtil(`${utilName}${utilVal}`);
                    return;
                }
            }
        }

        // 以下、ユーティリティクラス化できない場合の処理
        let { style, converter } = options;

        // .-prop: だけ出力するケース
        // if ((!style && true === val) || '-' === val) {
        if (true === val || '-' === val) {
            this.addUtil(utilName);
            return;
        }

        //converter color の時の特殊処理
        if ((name === 'bgc' || name === 'c' || name === 'bdc') && typeof val === 'string') {
            // if (val.startsWith('mix:'))

            // bgc='col1:(colo2:)mix%'
            // color が ":数値%" で終わるかどうか
            if (val.endsWith('%')) {
                this.setMixColor(name, val);
                return;
            }
        }

        // converter(getMaybe...)があればそれを通す
        if (converter) {
            // memo: nameチェックでの変数化が必要なケースは、この時点でユーティリティクラス化されているのでnameの受け渡しをスキップしてもいいかも
            val = getMaybeCssVar(val, converter, name);
        }

        // style のみ出力
        if (!bp && style) {
            if (1 === style) style = name; // 1 は prop名をそのままstyleとして使う
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
            this.addStyle(`--${name}1`, getMaybeCssVar(color1, 'color', name));
            this.addStyle(`--${name}2`, getMaybeCssVar(color2, 'color', name));
            this.addStyle(`--${name}-pct`, mixper);
        } else if (mixdata.length === 2) {
            const [color1, mixper] = mixdata;
            this.addStyle(`--${name}1`, getMaybeCssVar(color1, 'color', name));
            this.addStyle(`--${name}-pct`, mixper);
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

            // コンバーター通して取得
            const converterName = getConverter(propName);
            if (converterName) {
                value = getMaybeCssVar(value, converterName, propName);
            }

            this.addStyle(`--pass-${propName}`, value);
        });
    }

    setHoverProps(hoverData) {
        if (!hoverData) return;

        // 配列のときは中身を再帰処理
        if (Array.isArray(hoverData)) {
            hoverData.forEach((_hov) => {
                this.setHoverProps(_hov);
            });
            return;
        }

        if (hoverData === '-' || hoverData === true) {
            this.addUtil(`-hov:`);
        } else if (typeof hoverData === 'string') {
            // , 区切りでユーティリティクラスを複数出力可能
            splitWithComma(hoverData).forEach((_val) => {
                this.addUtil(`-hov:${_val}`);
            });
        } else if (typeof hoverData === 'object') {
            // hover={{c:'red', 'bgc': 'blue'}} みたいな指定の時

            // bxsh: '2', → shSize'2', shSize:'3'に分割?
            // if(hoverData.bxsh) {
            // 	...
            // }

            Object.keys(hoverData).forEach((propName) => {
                let value = hoverData[propName];

                // データ取得
                const converter = getConverter(propName);
                if (converter) value = getMaybeCssVar(value, converter, propName);

                this.addUtil(`-hov:${propName}:`);
                this.addStyle(`--hov-${propName}`, value);
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
                    if (utilVal === 'all') {
                        if (utilVal) this.addUtil(`-bd:`);
                    } else if (utilVal) {
                        this.addUtil(`-bd:${utilVal}`);
                    }
                });
                return;
            }
        }

        this.analyzeProp('bd', value);
    }

    getStateProps({
        skipState,
        isOverwide,
        isFullwide,
        isWide,
        isFlow,
        isContainer,
        hasGutter,

        isLayer,
        isLinkBox,
        hasDivider,
        // hasMask,
        ...props
    }) {
        if (!skipState) {
            if (isContainer) {
                this.setContainerData(isContainer);
            }
            if (isFlow) {
                this.setFlowData(isFlow);
            }

            isOverwide && this.lismState.push('is--overwide');
            isFullwide && this.lismState.push('is--fullwide');
            isWide && this.lismState.push('is--wide');
            hasGutter && this.lismState.push('has--gutter');
        }

        // skipStateに関係なくチェック
        if (isLayer) {
            this.lismState.push('is--layer');
        }
        if (isLinkBox) {
            this.lismState.push('is--linkBox');
        }
        if (hasDivider) {
            this.lismState.push('has--divider');
        }

        return props;
    }

    setContainerData(value) {
        if (value === true) {
            this.lismState.push('is--container');
        } else if (value) {
            if (isTokenValue('contentSize', value)) {
                this.lismState.push(`is--container -container:${value}`);
            } else {
                this.lismState.push(`is--container`);
                this.addStyle(`--item-size`, getMaybeCssVar(value, 'size'));
            }
        }
    }

    setFlowData(value) {
        if (value === true) {
            this.lismState.push('is--flow');
        } else if (value) {
            if (isTokenValue('flow', value)) {
                this.lismState.push(`is--flow -flow:${value}`);
            } else {
                this.lismState.push(`is--flow -flow:`);
                this.addStyle(`--flowGap`, getMaybeCssVar(value, 'space'));
            }
        }
    }
}

/**
 * props から styleに変換する要素 と その他 に分離する
 *
 * @param {Object} props
 * @param {Object} options
 * @return {Object} styles & attrs
 */

// styleを生成するための共通処理
// options:初期値などが渡ってくる
export default function getLismProps(props, options = {}) {
    props = Object.assign(options, props);
    if (props.length === 0) {
        return {};
    }

    // const beforeMethod = performance.now();
    const propObj = new LismPropsData(props);
    // const afterMethod = performance.now();
    // const theTime = afterMethod - beforeMethod;
    // if (theTime > 0) console.log('TIME ' + theTime + ' ms');

    return filterEmptyObj({
        className: atts(propObj.className, propObj.uClasses),
        style: filterEmptyObj(propObj.styles), //filterEmptyObj(styles), // filterEmptyObj は最後にかける
        ...propObj.attrs, // 処理されずに残っているprops
    });
}
