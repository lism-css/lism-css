import presets from './presets';
import type { LismProps } from '../../../lib/getLismProps';
import type { ElementType, CSSProperties } from 'react';

export type PresetIconName = keyof typeof presets;

export interface IconObject {
  as: ElementType;
  [key: string]: unknown;
}

type IconProp = PresetIconName | ElementType | IconObject;

export interface IconOwnProps {
  as?: ElementType;
  icon?: IconProp;
  label?: string;
  size?: string;
  exProps?: Record<string, unknown>;
}

export type IconProps = LismProps & IconOwnProps;

interface ParsedSvg {
  svgProps: Record<string, unknown>;
  svgContent: string;
}

/** SVG文字列を描画属性と内部コンテンツへ分ける。 */
function parseSvgString(svgString: string): Partial<ParsedSvg> {
  const svgProps: Record<string, unknown> = {};

  const match = svgString.match(/<svg([^>]*?)>([\s\S]*?)<\/svg>/i);
  if (match) {
    const [, attributesString, svgContent] = match;

    const attributePattern = /([\w-]+)=["']([^"']*)["']/g;
    let attrMatch;
    while ((attrMatch = attributePattern.exec(attributesString)) !== null) {
      const [, attrName, attrValue] = attrMatch;

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
  - icon = それ以外の場合、extends として振る舞う
  - as=svg で指定された場合 → <svg> で出力し、childrenはそのまま返す。（<path> などを渡して使えるようにする）
  - as が指定された場合 → asで渡されるコンポーネントまたは要素を呼び出す
*/
export default function getProps({ as, icon, label, exProps = {}, ..._props }: IconProps) {
  // '_SVG_' は内部センチネル値として使用し、Icon.tsx で SVG コンポーネントに置換される
  let Component: ElementType | '_SVG_' = as || 'span';
  let content = '';

  // restの型が複雑なunionになりTS2590が発生するため、objectへcastしてから分割する。
  const {
    style: _style = {},
    className: _className = '',
    ..._rest
  } = _props as unknown as { style: CSSProperties; className: string; [key: string]: unknown };
  let style = _style;
  let className = _className;

  // 入力形式に合わせて描画要素とSVG属性を決める。
  if (_rest.viewBox) {
    Component = 'svg';
    const _size = _rest.size as string | undefined;
    if (_size) delete _rest.size;
    if (!_rest.width) {
      exProps.width = _size || '1em';
    }
    if (!_rest.height) {
      exProps.height = _size || '1em';
    }
  } else if (_rest.src) {
    Component = 'img';
  } else if (icon) {
    if (typeof icon === 'string') {
      if (icon.startsWith('<svg')) {
        Component = '_SVG_';
        const { svgProps = {}, svgContent = '' } = parseSvgString(icon);

        // class, styleは切り分ける. fill は除去（<SVG> で currentColorセット
        const { class: svgClass, style: svgStyle, ...svgAttrs } = svgProps;
        if (svgClass) {
          className = className ? `${className} ${svgClass as string}` : (svgClass as string);
        }
        style = { ...style, ...(svgStyle as CSSProperties) };

        exProps = { ...exProps, ...svgAttrs, fill: 'currentColor' };
        content = svgContent;
      } else {
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

  // labelの有無に合わせてアクセシビリティ属性を付ける。
  if (label) {
    exProps['aria-label'] = label;
    exProps['role'] = 'img';
  } else {
    exProps['aria-hidden'] = 'true';
  }

  // a--icon は atomic prop 経由で付与する。
  // SVG パース由来の className はユーザー className と合成して Lism に渡す。
  _rest.atomic = 'icon';
  if (className) _rest.className = className;
  _rest.style = { ...style };

  return { Component, lismProps: _rest, exProps, content };
}
