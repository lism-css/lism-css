import presets from './presets';
import atts from '../../../lib/helper/atts';
import setMaybeTransformStyles from '../../setMaybeTransformStyles';
import type { LismComponentProps } from '../../Lism/Lism';
import type { TransformStyleProps } from '../../setMaybeTransformStyles';
import type { ElementType, CSSProperties, SVGAttributes, ImgHTMLAttributes } from 'react';

export type PresetIconName = keyof typeof presets;

type IconObject = {
	as: ElementType;
	[key: string]: unknown;
};

type IconProp = PresetIconName | ElementType | IconObject;

type IconOwnProps = {
	icon?: IconProp;
	label?: string;
	size?: string;
};

type IconElementProps = SVGAttributes<SVGSVGElement> & ImgHTMLAttributes<HTMLImageElement>;

export type IconProps = LismComponentProps<ElementType> & TransformStyleProps & IconOwnProps & IconElementProps;

type ParsedSvg = {
	svgProps: Record<string, unknown>;
	svgContent: string;
};

// SVG文字列をパースしてexPropsとコンテンツを生成する関数
function parseSvgString(svgString: string): Partial<ParsedSvg> {
	const svgProps: Record<string, unknown> = {};

	// SVGの属性とコンテンツを一回のmatchで取得
	const match = svgString.match(/<svg([^>]*?)>([\s\S]*?)<\/svg>/i);
	if (match) {
		const [, attributesString, svgContent] = match;

		// 属性値をスペースで分解してオブジェクト化
		const attributePattern = /([\w-]+)=["']([^"']*)["']/g;
		let attrMatch;
		while ((attrMatch = attributePattern.exec(attributesString)) !== null) {
			const [, attrName, attrValue] = attrMatch;

			// style属性の場合はオブジェクトに分割
			if (attrName === 'style') {
				const styleObj: Record<string, string> = {};
				attrValue.split(';').forEach((rule) => {
					const [property, value] = rule.split(':').map((str) => str.trim());
					if (property && value) {
						styleObj[property] = value;
					}
				});

				svgProps[attrName] = styleObj;
			} else {
				svgProps[attrName] = attrValue;
			}
		}

		return { svgProps, svgContent };
	}

	return {};
}

/*
Icon の出力パターン
  - icon = 文字列の場合→preset で登録されたsvgアイコンを呼び出す
( 廃止 ) - icon = 1に該当しない、かつ文字列の場合→ data-lism-icon 属性にアイコン名が出力される。（CSSでアイコンを描画できるようになっている）
  - icon = それ以外の場合、extends として振る舞う
  - as=svg で指定された場合 → <svg> で出力し、childrenはそのまま返す。（<path> などを渡して使えるようにする）
  - as が指定された場合 → asで渡されるコンポーネントまたは要素を呼び出す
*/
export default function getProps({ lismClass, as, icon, label, exProps = {}, ..._props }: IconProps) {
	// '_SVG_' は内部センチネル値として使用し、Icon.tsx で SVG コンポーネントに置換される
	let Component: ElementType | '_SVG_' = as || 'span';
	let content = '';

	// rest の型が複雑な union になり TS2590 が発生するため、object にキャストしてから渡す
	const {
		style: _style = {},
		className: _className = '',
		..._rest
	} = setMaybeTransformStyles(_props as object) as unknown as { style: CSSProperties; className: string; [key: string]: unknown };
	let style = _style;
	let className = _className;

	// viewBoxがあれば、svg描画として扱う
	if (_rest.viewBox) {
		Component = 'svg';
		if (!_rest.width) {
			exProps.width = '1em';
		}
		if (!_rest.height) {
			exProps.height = '1em';
		}
	} else if (_rest.src) {
		Component = 'img';
	} else if (icon) {
		// icon が 文字列の場合
		if (typeof icon === 'string') {
			if (icon.startsWith('<svg')) {
				// svg直接指定の場合
				Component = '_SVG_';
				const { svgProps = {}, svgContent = '' } = parseSvgString(icon);

				// class, styleは切り分ける. fill は除去（<SVG> で currentColorセット
				const { class: svgClass, style: svgStyle, ...svgAttrs } = svgProps;
				className = atts(className, svgClass as string | undefined);
				style = { ...style, ...(svgStyle as CSSProperties) };

				// 属性とコンテンツ
				exProps = { ...exProps, ...svgAttrs, fill: 'currentColor' };
				content = svgContent;
			} else {
				// プリセットアイコンを呼び出す
				const presetIconData = presets[icon as keyof typeof presets] || null;
				if (null != presetIconData) {
					Component = '_SVG_';
					exProps = { ...exProps, ...presetIconData };
				}
			}
		} else if (typeof icon === 'object' && icon.as) {
			const { as: _as, ..._exProps } = icon;
			Component = _as;
			exProps = { ...exProps, ..._exProps };
		} else {
			Component = icon as ElementType;
		}
	}

	// label の有無でaria属性を変える
	if (label) {
		exProps['aria-label'] = label;
		exProps['role'] = 'img';
	} else {
		exProps['aria-hidden'] = 'true';
	}

	_rest.lismClass = atts(lismClass, 'a--icon', className);
	_rest.style = { ...style };

	return { Component, lismProps: _rest, exProps, content };
}

// 子要素に Icon を持つコンポーネントが icon, iconProps で Icon 用の props を生成する処理
// export function getChildIconProps({ icon, iconProps }) {}
