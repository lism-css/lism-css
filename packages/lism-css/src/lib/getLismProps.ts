// import { PROPS } from '../config';
import { PROPS, TRAITS } from '../../config/index';
import getLayoutProps from './getLayoutProps';
import isPresetValue from './isPresetValue';
import isTokenValue from './isTokenValue';
import getUtilKey from './getUtilKey';
import getMaybeCssVar from './getMaybeCssVar';
import getBpData from './getBpData';
import atts from './helper/atts';
import isEmptyObj from './helper/isEmptyObj';
import filterEmptyObj from './helper/filterEmptyObj';
import mergeSet from './helper/mergeSet';
import splitWithComma from './helper/splitWithComma';
import { type StyleWithCustomProps } from './types';
import { type TraitProps, type SetPropValue, type UtilPropValue } from './types/TraitProps';
import { type PropValueTypes } from './types/PropValueTypes';
import { type LayoutType, type LayoutProps } from './types/LayoutProps';
export { type LayoutType };

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
  setStyles?: (val: unknown) => Record<string, string | number | undefined>;
  className?: string;
  utilKey?: string;
  [key: string]: unknown;
}

// TraitPropData based on config/defaults/traits.ts
interface TraitPropDataObject {
  className: string;
  preset?: string[] | readonly string[];
  presetClass?: string;
  customVar?: string;
  tokenKey?: string;
}

type TraitPropData = string | TraitPropDataObject;

// LismPropsData が受け取る型（layout 処理済み）
export interface LismPropsBase extends TraitProps, PropValueTypes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwardedRef?: React.Ref<any>;
  class?: string;
  className?: string;
  lismClass?: string;
  variant?: string;
  style?: StyleWithCustomProps;
  _propConfig?: Record<string, PropConfig>;
  set?: SetPropValue;
  util?: UtilPropValue;
  hov?: boolean | string | Record<string, unknown>;
  css?: Record<string, string | number | undefined>;
  [key: `aria-${string}`]: unknown;
  [key: `data-${string}`]: unknown;
}

// getLismProps の入力となる Props 型

const getTokenKey = (propName: string): string => {
  const propData = (PROPS as Record<string, PropConfig>)[propName];
  if (!propData) return '';

  return (propData?.token as string) || '';
};

// lismClass に variant クラスを差し込む
// 例: lismClass='l--box extra', variant='primary' → 'l--box l--box--primary extra'
function buildLismClass(lismClass: string | undefined, variant: string | undefined): string {
  if (!lismClass) return '';
  if (!variant) return lismClass;

  const parts = lismClass.split(' ');
  const baseClass = parts[0];
  return [baseClass, `${baseClass}--${variant}`, ...parts.slice(1)].join(' ');
}

export class LismPropsData {
  // 最終出力 className
  className: string = '';
  // 出力順のためのクラスバケット: [lismClass] [lismTrait] [uClasses]
  // - lismClass : コンポーネント基底クラス + variant + l--{layout}（getLayoutProps 側で付与済み）
  // - lismTrait : is--* 等の trait クラス
  // - uClasses  : set--* → u--* → -property の順で push される utility クラス
  lismClass: string = '';
  lismTrait: string[] = [];
  uClasses: string[] = [];
  styles: StyleWithCustomProps = {};
  attrs: Record<string, unknown> = {};
  _propConfig?: Record<string, PropConfig>;

  constructor(allProps: LismPropsBase & Record<string, unknown>) {
    // 受け取るpropsとそうでないpropsを分ける
    const { forwardedRef, class: astroClassName, className: userClassName, lismClass, variant, style = {}, _propConfig = {}, ...others } = allProps;

    this.styles = { ...style };
    this._propConfig = { ..._propConfig };
    this.lismClass = buildLismClass(lismClass, variant);

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
    this.className = this.buildClassName(userClassName, astroClassName);
  }

  // 最終クラス文字列の組み立て（出力順の唯一の確定地点）
  // 出力順: [user/astro className] [lismClass] [lismTrait] [uClasses]
  buildClassName(userClassName?: string, astroClassName?: string): string {
    return atts(userClassName || astroClassName, this.lismClass, this.lismTrait, this.uClasses);
  }

  analyzeTrait(traitPropData: TraitPropDataObject, propVal: unknown): void {
    // isWrapper などの特別な処理が必要なレイアウトトレイト
    const { className, preset, presetClass, customVar, tokenKey } = traitPropData;
    if (propVal === true) {
      this.lismTrait.push(className);
    } else if (preset && isPresetValue(preset, propVal)) {
      this.lismTrait.push(`${className} ${presetClass}:${String(propVal)}`);
    } else if (propVal) {
      // カスタム値
      this.lismTrait.push(className);
      if (tokenKey && customVar) {
        this.addStyle(customVar, getMaybeCssVar(propVal as string | number, tokenKey));
      }
    }
  }

  // prop解析
  analyzeProps(): void {
    // set / util は property class の前に置きたいので先に取り出して push
    const rawSet = this.extractProp('set');
    const rawUtil = this.extractProp('util');
    mergeSet(undefined, rawSet).forEach((v) => this.addUtil(`set--${v}`));
    mergeSet(undefined, rawUtil).forEach((v) => this.addUtil(`u--${v}`));

    Object.keys(this.attrs).forEach((propName) => {
      // trait チェック
      if (Object.hasOwn(TRAITS, propName)) {
        const propVal = this.extractProp(propName);
        const traitPropData = (TRAITS as Record<string, TraitPropData>)[propName];

        if (typeof traitPropData === 'string') {
          // そのままクラス化
          if (propVal) this.lismTrait.push(traitPropData);
        } else {
          this.analyzeTrait(traitPropData, propVal);
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
        this.addStyles(cssVales as Record<string, string | number | undefined>);
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
  addStyles(styles: Record<string, string | number | undefined>): void {
    this.styles = { ...this.styles, ...styles };
  }
  addAttrs(data: { styles?: Record<string, string | number | undefined>; utils?: string[] }): void {
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

export interface LismProps extends LismPropsBase, LayoutProps {}

export interface LismOutputProps {
  className?: string;
  style?: StyleWithCustomProps;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: React.Ref<any>;
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
  const propObj = new LismPropsData(getLayoutProps(layout, rest) as LismPropsBase & Record<string, unknown>);
  return {
    ...filterEmptyObj({
      className: propObj.className,
      style: filterEmptyObj(propObj.styles as Record<string, unknown>),
    }),
    ...propObj.attrs, // data-* などHTMLの標準属性はそのまま渡す
  } as LismOutputProps;
}
