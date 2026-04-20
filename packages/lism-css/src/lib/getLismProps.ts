// import { PROPS } from '../config';
import { PROPS, TRAITS } from '../../config/index';
import getLayoutProps from './getLayoutProps';
import getAtomicProps from './getAtomicProps';
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
import { type AtomicType, type AtomicProps } from './types/AtomicProps';
export { type LayoutType, type AtomicType };

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

// LismPropsData が受け取る型（layout / atomic 処理済み）
export interface LismPropsBase extends TraitProps, PropValueTypes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  forwardedRef?: React.Ref<any>;
  class?: string | null;
  className?: string;
  primitiveClass?: string[];
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

// 出力順のためのクラスバケット（結合順の唯一の定義点）
// - primitiveClass : a--* / l--* （getAtomicProps → getLayoutProps の順で push）
// - setClasses     : set--*
// - traitClasses   : is--* / has--*
// - uClasses       : u--*
// - propClasses    : -hov / -property
export class LismPropsData {
  // 最終出力 className
  className: string = '';
  primitiveClass: string[] = [];
  setClasses: string[] = [];
  traitClasses: string[] = [];
  uClasses: string[] = [];
  propClasses: string[] = [];
  styles: StyleWithCustomProps = {};
  attrs: Record<string, unknown> = {};
  _propConfig?: Record<string, PropConfig>;

  constructor(allProps: LismPropsBase & Record<string, unknown>) {
    // 受け取るpropsとそうでないpropsを分ける
    const { forwardedRef, class: astroClassName, className: userClassName, primitiveClass, style = {}, _propConfig = {}, ...others } = allProps;

    this.styles = { ...style };
    this._propConfig = { ..._propConfig };
    if (primitiveClass && primitiveClass.length) {
      this.primitiveClass = [...primitiveClass];
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
    this.className = this.buildClassName(userClassName, astroClassName);
  }

  // 最終クラス文字列の組み立て（出力順の唯一の確定地点）
  // 出力順: [className&class] [primitiveClass] [setClasses] [traitClasses] [uClasses] [propClasses]
  // className と class が両方来た場合は両方マージする（atts 内で重複は除去される）。
  buildClassName(userClassName?: string, astroClassName?: string | null): string {
    return atts(userClassName, astroClassName, this.primitiveClass, this.setClasses, this.traitClasses, this.uClasses, this.propClasses);
  }

  analyzeTrait(traitPropData: TraitPropDataObject, propVal: unknown): void {
    // isWrapper などの特別な処理が必要なレイアウトトレイト
    const { className, preset, presetClass, customVar, tokenKey } = traitPropData;
    if (propVal === true) {
      this.traitClasses.push(className);
    } else if (preset && isPresetValue(preset, propVal)) {
      this.traitClasses.push(`${className} ${presetClass}:${String(propVal)}`);
    } else if (propVal) {
      // カスタム値
      this.traitClasses.push(className);
      if (tokenKey && customVar) {
        this.addStyle(customVar, getMaybeCssVar(propVal as string | number, tokenKey));
      }
    }
  }

  // prop解析
  analyzeProps(): void {
    // set / util は attrs ループの前に取り出して各バケットへ振り分ける
    const rawSet = this.extractProp('set');
    const rawUtil = this.extractProp('util');
    mergeSet(undefined, rawSet).forEach((v) => this.addSet(v));
    mergeSet(undefined, rawUtil).forEach((v) => this.addUtil(`u--${v}`));

    Object.keys(this.attrs).forEach((propName) => {
      // trait チェック
      if (Object.hasOwn(TRAITS, propName)) {
        const propVal = this.extractProp(propName);
        const traitPropData = (TRAITS as Record<string, TraitPropData>)[propName];

        if (typeof traitPropData === 'string') {
          // そのままクラス化
          if (propVal) this.traitClasses.push(traitPropData);
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

  addSet(setName: string): void {
    this.setClasses.push(`set--${setName}`);
  }
  addUtil(util: string): void {
    this.uClasses.push(util);
  }
  addUtils(utils: string[]): void {
    this.uClasses.push(...utils);
  }
  addProp(prop: string): void {
    this.propClasses.push(prop);
  }
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

  // propertyクラスを追加するか、styleにセットするかの分岐処理 @base
  // 値が null, undefined, '', false の時はスキップ
  setAttrs(propKey: string, val: unknown, propConfig: PropConfig = {}, bpKey: string = ''): void {
    if (null == val || '' === val || false === val) return;

    let styleName = `--${propKey}`;
    let utilName = `-${String(propConfig.utilKey || propKey)}`;

    if (bpKey) {
      styleName = `--${propKey}_${bpKey}`;
      utilName += `_${bpKey}`;
    }

    // ":"ではじまっている場合、それに続く文字列を取得して property class 化
    if (typeof val === 'string' && val.startsWith(':')) {
      this.addProp(`${utilName}:${val.replace(':', '')}`);
      return;
    }

    // property class 化できるかどうかをチェック
    if (!bpKey) {
      const { presets, tokenClass, utils, shorthands } = propConfig;
      if (presets && isPresetValue(presets, val)) {
        const valStr = typeof val === 'string' || typeof val === 'number' ? String(val) : '';
        if (valStr) this.addProp(`${utilName}:${valStr}`);
        return;
      }
      // tokenもそのままクラス化する場合
      if (tokenClass && propConfig.token && isTokenValue(propConfig.token, val)) {
        const valStr = typeof val === 'string' || typeof val === 'number' ? String(val) : '';
        if (valStr) this.addProp(`${utilName}:${valStr}`);
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
        this.addProp(`${utilName}:${utilKey}`);
        return;
      }
    }

    // .-prop: だけ出力するケース
    if (true === val) {
      this.addProp(utilName);
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
    this.addProp(utilName);
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

    if (hoverData === true) {
      this.addProp(`-hov`);
    } else if (typeof hoverData === 'string') {
      // カンマ区切りで複数指定可能（入力文字列をそのまま -hov:{...} として出力）
      splitWithComma(hoverData).forEach((cls) => {
        this.addProp(`-hov:${cls}`);
      });
    } else if (typeof hoverData === 'object') {
      // hov={{c:'red', shadowUp: true}} のようなオブジェクト指定
      //   値あり（string / number） → `-hov:-{key}` + `--hov-{key}` 変数を出力
      //   true                    → `-hov:{key}`（クラスのみ）
      Object.keys(hoverData).forEach((propName) => {
        const hovVal = hoverData[propName];
        if (null == hovVal || '' === hovVal || false === hovVal) return;

        if (hovVal === true) {
          this.addProp(`-hov:${propName}`);
        } else if (typeof hovVal === 'string' || typeof hovVal === 'number') {
          // トークン値の処理
          const finalHovVal = getMaybeCssVar(hovVal, getTokenKey(propName));

          this.addProp(`-hov:-${propName}`);
          this.addStyle(`--hov-${propName}`, finalHovVal);
        }
      });
    }
  }
}

export interface LismProps extends LismPropsBase, LayoutProps, AtomicProps {}

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

  // atomic → layout の順に処理する。
  // この順序が primitiveClass 内の a-- → l-- 出力順を決定する。
  const { atomic, layout, ...rest } = props;
  const afterAtomic = getAtomicProps(atomic, rest);
  const afterLayout = getLayoutProps(layout, afterAtomic);
  const propObj = new LismPropsData(afterLayout as LismPropsBase & Record<string, unknown>);
  return {
    ...filterEmptyObj({
      className: propObj.className,
      style: filterEmptyObj(propObj.styles as Record<string, unknown>),
    }),
    ...propObj.attrs, // data-* などHTMLの標準属性はそのまま渡す
  } as LismOutputProps;
}
