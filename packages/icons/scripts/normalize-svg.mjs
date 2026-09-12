import { optimize } from 'svgo';

const presentation = new Set(['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'fill-rule']);
const geometry = {
  path: ['d'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
  polyline: ['points'],
  polygon: ['points'],
};
const defaults = {
  fill: 'black',
  stroke: 'none',
  'stroke-width': '1',
  'stroke-linecap': 'butt',
  'stroke-linejoin': 'miter',
  'stroke-miterlimit': '4',
  'fill-rule': 'nonzero',
};
const number = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

export function normalizeSvg(source, { id } = {}) {
  const fail = (message) => {
    throw new Error(`${id ?? 'SVG'}: ${message}`);
  };
  if (/<!DOCTYPE|<!ENTITY/i.test(source)) fail('DOCTYPEとENTITYは非対応です');
  let attributes;
  let hasFill = false;
  let hasStroke = false;
  const paint = (value) => {
    if (value === 'none') return 'none';
    if (
      ['black', 'currentColor'].includes(value) ||
      /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value) ||
      /^rgb\(\s*[\d.]+(?:%?\s*,\s*[\d.]+){2}%?\s*\)$/i.test(value)
    )
      return 'currentColor';
    return fail(`非対応の色: ${value}`);
  };
  const validate = (node) => {
    const allowed = new Set([...presentation, 'id', 'data-name', ...(geometry[node.name] ?? [])]);
    if (node.name === 'svg') for (const key of ['xmlns', 'viewBox', 'width', 'height']) allowed.add(key);
    for (const [key, value] of Object.entries(node.attributes)) {
      if (!allowed.has(key)) fail(`非対応の属性: ${node.name}.${key}`);
      if (key === 'fill' || key === 'stroke') paint(value);
      if (key === 'stroke-width' && (!number.test(value) || !Number.isFinite(Number(value)) || Number(value) <= 0)) fail('線幅は正の数が必要です');
      if (key === 'stroke-linecap' && !['butt', 'round', 'square'].includes(value)) fail('非対応のstroke-linecap');
      if (key === 'stroke-linejoin' && !['miter', 'round', 'bevel'].includes(value)) fail('非対応のstroke-linejoin');
      if (key === 'stroke-miterlimit' && (!number.test(value) || Number(value) < 1)) fail('不正なstroke-miterlimit');
      if (key === 'fill-rule' && !['nonzero', 'evenodd'].includes(value)) fail('非対応のfill-rule');
      if ((geometry[node.name] ?? []).includes(key)) {
        if (key === 'd' || key === 'points') {
          const pattern = key === 'd' ? /^[MmZzLlHhVvCcSsQqTtAa\deE+.,\s-]+$/ : /^[\deE+.,\s-]+$/;
          if (!pattern.test(value)) fail(`不正な${key}`);
        } else if (!number.test(value)) fail(`非対応の座標: ${key}`);
      }
    }
  };
  const result = optimize(source, {
    plugins: [
      {
        name: 'lism-normalize',
        fn(root) {
          const elements = root.children.filter((node) => node.type === 'element');
          if (elements.length !== 1 || elements[0].name !== 'svg') fail('svgルートが必要です');
          for (const node of root.children) {
            if (!['element', 'comment', 'instruction'].includes(node.type)) fail('非対応のルートノード');
            if (node.type === 'instruction' && node.name !== 'xml') fail('非対応の処理命令');
          }
          const svg = elements[0];
          validate(svg);
          const vb = (svg.attributes.viewBox ?? '')
            .trim()
            .split(/[\s,]+/)
            .map(Number);
          if (vb.length !== 4 || vb.some((value, index) => value !== [0, 0, 24, 24][index])) fail('viewBoxは0 0 24 24が必要です');
          for (const key of ['width', 'height'])
            if (svg.attributes[key] !== undefined && Number(svg.attributes[key]) !== 24) fail(`${key}は24が必要です`);
          if (svg.attributes.xmlns && svg.attributes.xmlns !== 'http://www.w3.org/2000/svg') fail('非対応のxmlns');
          const flatten = (children, inherited) =>
            children.flatMap((node) => {
              if (node.type === 'comment' || (node.type === 'text' && !node.value.trim())) return [];
              if (node.type !== 'element' || (node.name !== 'g' && !geometry[node.name])) fail(`非対応の要素: ${node.name ?? node.type}`);
              validate(node);
              const effective = { ...inherited };
              for (const key of presentation) if (node.attributes[key] !== undefined) effective[key] = node.attributes[key];
              if (node.name === 'g') return flatten(node.children, effective);
              if (node.children.length) fail('図形要素内の子ノードは非対応です');
              const sourceFill = node.name === 'line' ? 'none' : paint(effective.fill);
              const sourceStroke = paint(effective.stroke);
              const a = node.attributes;
              if (
                node.name === 'rect' &&
                Number(a.x ?? 0) === 0 &&
                Number(a.y ?? 0) === 0 &&
                Number(a.width) === 24 &&
                Number(a.height) === 24 &&
                sourceFill === 'none' &&
                sourceStroke === 'none'
              )
                return [];
              if (sourceFill === 'none' && sourceStroke === 'none') fail('背景以外の非表示図形は非対応です');
              hasFill ||= sourceFill !== 'none';
              hasStroke ||= sourceStroke !== 'none';
              const output = Object.fromEntries(Object.entries(a).filter(([key]) => geometry[node.name].includes(key)));
              output.fill = sourceFill;
              output.stroke = sourceStroke;
              if (sourceStroke !== 'none') {
                for (const key of ['stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit']) output[key] = effective[key];
              }
              if (sourceFill !== 'none' && effective['fill-rule'] !== 'nonzero') output['fill-rule'] = effective['fill-rule'];
              return [{ ...node, attributes: output }];
            });
          svg.children = flatten(svg.children, {
            ...defaults,
            ...Object.fromEntries(Object.entries(svg.attributes).filter(([key]) => presentation.has(key))),
          });
          if (!hasFill && !hasStroke) fail('描画する図形がありません');
          const firstStroke = svg.children.find((node) => node.attributes.stroke !== 'none');
          attributes = hasStroke
            ? {
                fill: 'none',
                stroke: 'currentColor',
                'stroke-width': firstStroke.attributes['stroke-width'],
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
              }
            : { fill: 'currentColor', stroke: 'none' };
          for (const node of svg.children) {
            for (const [key, value] of Object.entries(node.attributes)) {
              if (value === (attributes[key] ?? defaults[key])) delete node.attributes[key];
            }
          }
          svg.attributes = { xmlns: 'http://www.w3.org/2000/svg', viewBox: '0 0 24 24', ...attributes };
          root.children = [svg];
        },
      },
    ],
  });
  const svg = result.data;
  const body = svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'));
  return { viewBox: '0 0 24 24', attributes, body, svg, kind: hasStroke ? (hasFill ? 'mixed' : 'stroke') : 'fill' };
}
