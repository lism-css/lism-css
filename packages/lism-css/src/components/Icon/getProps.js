import presets from './presets';
import atts from '../../lib/helper/atts';

// SVG文字列をパースしてexPropsとコンテンツを生成する関数
function parseSvgString(svgString) {
	const svgProps = {};

	// SVGの属性とコンテンツを一回のmatchで取得
	const match = svgString.match(/<svg([^>]*?)>([\s\S]*?)<\/svg>/i);
	if (match) {
		const [, attributesString, svgContent] = match;

		// 属性値をスペースで分解してオブジェクト化
		const attributePattern = /(\w+)=["']([^"']*)["']/g;
		let attrMatch;
		while ((attrMatch = attributePattern.exec(attributesString)) !== null) {
			const [, attrName, attrValue] = attrMatch;
			svgProps[attrName] = attrValue;
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
  - tag=svg で指定された場合 → <svg> で出力し、childrenはそのまま返す。（<path> などを渡して使えるようにする）
  - as が指定された場合 → asで渡される外部コンポーネントを呼び出す
*/
export default function getProps({
	lismClass,
	className = '',
	style = {},
	// variant,
	as,
	tag,
	scale,
	offset,
	icon,
	label,

	exProps = {},
	...props
}) {
	// props.skipState = true;
	let Component = tag || 'span';
	let content = '';

	// viewBoxがあれば、svg描画として扱う
	if (props.viewBox) {
		Component = 'svg';
	} else if (icon) {
		// icon が 文字列の場合
		if (typeof icon === 'string') {
			if (icon.startsWith('<svg')) {
				// svg直接指定の場合
				Component = '_SVG_';
				const { svgProps = {}, svgContent = '' } = parseSvgString(icon);

				// class, styleは切り分ける
				const { class: svgClass, style: svgStyle, ...svgAttrs } = svgProps;
				className = atts(className, svgClass);
				style = { ...svgStyle };

				// 属性とコンテンツ
				exProps = { ...exProps, ...svgAttrs };
				content = svgContent;
			} else {
				// プリセットアイコンを呼び出す
				const presetIconData = presets[icon] || null;
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
			Component = icon;
		}
	} else if (as) {
		Component = as;
	}

	// label の有無でaria属性を変える
	if (label) {
		exProps['aria-label'] = label;
		exProps['role'] = 'img';
	} else {
		exProps['aria-hidden'] = 'true';
	}

	// 専用変数
	if (scale) style['--scale'] = scale;
	if (offset) style['--offset'] = offset;

	// classNameをスペースで分割して重複を防いでマージ

	props.lismClass = atts(lismClass, 'l--icon', className);
	props.style = { ...style };

	return { Component, lismProps: props, exProps, content };
}

// 子要素に Icon を持つコンポーネントが icon, iconProps で Icon 用の props を生成する処理
// export function getChildIconProps({ icon, iconProps }) {}
