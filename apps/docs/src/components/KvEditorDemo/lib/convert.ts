// HTML（素のタグ + Lism Property Class）と JSX（Lism React コンポーネント表記）の双方向変換。
// KVエディターデモ専用の軽量実装で、lism-css の実行時ロジックは import しない
// （PROPS は純データのテーブルなのでクライアントバンドルに React を持ち込まない）。
//
// 対応範囲（仕様）:
// - `-prop:val` クラス ⇔ `prop="val"` （prop が PROPS テーブルに存在するもののみ）
// - `-hov:val` クラス ⇔ `hov="val"` （hov は PROPS 外の特別扱い prop。文字列形式のみ・複数はカンマ結合。
//   boolean（値なし -hov）/ オブジェクト形式（inline CSS 変数が絡む）は非対応で className 保持）
// - `l--stack` / `l--flex` / `l--box` ⇔ Stack / Flex / Box（タグが div 以外なら as="tag"）
// - h1〜h6 ⇔ <Heading level="n">、p ⇔ <Text>
// - 上記以外のタグで Lism prop クラスを持つもの ⇔ <Lism as="tag">
// - 変換できないクラスは className として保持
// - JSX の `{}` 式・レスポンシブ（BP）props は非対応。JSX が不正な場合は null を返す
import { PROPS } from 'lism-css/config';

const LAYOUT_CLASS_TO_COMPONENT: Record<string, string> = {
  'l--stack': 'Stack',
  'l--flex': 'Flex',
  'l--box': 'Box',
};
const COMPONENT_TO_LAYOUT_CLASS: Record<string, string> = {
  Stack: 'l--stack',
  Flex: 'l--flex',
  Box: 'l--box',
};

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'source', 'track', 'wbr']);

// 単一テキスト子を1行にまとめる際の行長上限（インデント込み）
const INLINE_MAX_LENGTH = 80;
const INDENT = '  ';

/** `-fz:5xl` のような Property Class トークンを [prop, value] に分解（PROPSに無いキーは null） */
const parsePropToken = (token: string): [string, string] | null => {
  const m = token.match(/^-([a-zA-Z][a-zA-Z-]*):(.+)$/);
  if (!m) return null;
  const [, key, value] = m;
  if (!Object.hasOwn(PROPS, key)) return null;
  return [key, value];
};

const escapeText = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (value: string): string => escapeText(value).replace(/"/g, '&quot;');

/** 属性の文字列表現 `name="value"` */
const attrToString = (name: string, value: string): string => `${name}="${escapeAttr(value)}"`;

// ---------------------------------------------------------------------------
// 共通プリンタ
// ノード列を「要素・テキストごとに1行、2スペースインデント」で整形する。
// 単一テキスト子だけを持つ要素は、行長が収まる場合のみインライン化（例: <span ...>⌘ K</span>）。
// ---------------------------------------------------------------------------

interface PrintableElement {
  /** 出力タグ名（HTMLならタグ、JSXならコンポーネント名 or タグ） */
  name: string;
  /** 出力属性（変換済み、順序保持） */
  attrs: string[];
  children: PrintableNode[];
  /** HTML の void 要素（<br /> など、子を持たない） */
  isVoid: boolean;
}
type PrintableNode = { kind: 'element'; el: PrintableElement } | { kind: 'text'; text: string };

const printNodes = (nodes: PrintableNode[], depth: number, mode: 'jsx' | 'html'): string[] => {
  const lines: string[] = [];
  const indent = INDENT.repeat(depth);

  for (const node of nodes) {
    if (node.kind === 'text') {
      lines.push(indent + escapeText(node.text));
      continue;
    }
    const { name, attrs, children, isVoid } = node.el;
    const openTag = attrs.length ? `<${name} ${attrs.join(' ')}` : `<${name}`;

    if (isVoid) {
      lines.push(`${indent}${openTag} />`);
      continue;
    }
    if (children.length === 0) {
      // JSX は自己終了、HTML では <div /> が不正なため空タグペアで出力する
      lines.push(mode === 'jsx' ? `${indent}${openTag} />` : `${indent}${openTag}></${name}>`);
      continue;
    }
    // 単一テキスト子はインライン化を試みる
    if (children.length === 1 && children[0].kind === 'text') {
      const inline = `${indent}${openTag}>${escapeText(children[0].text)}</${name}>`;
      if (inline.length <= INLINE_MAX_LENGTH) {
        lines.push(inline);
        continue;
      }
    }
    lines.push(`${indent}${openTag}>`);
    lines.push(...printNodes(children, depth + 1, mode));
    lines.push(`${indent}</${name}>`);
  }
  return lines;
};

/** テキストノードの中身を整形用に正規化（空白のみなら null = 出力しない） */
const normalizeText = (raw: string | null): string[] => {
  if (!raw) return [];
  // 改行で区切られた複数行テキストは行ごとに出力する
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
};

// ---------------------------------------------------------------------------
// HTML → JSX
// ---------------------------------------------------------------------------

const htmlElementToJsx = (el: Element): PrintableElement => {
  const tag = el.tagName.toLowerCase();
  const classTokens = (el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);

  // 1. コンポーネント名の決定
  let name = '';
  const headAttrs: string[] = []; // level / as
  const layoutIndex = classTokens.findIndex((t) => Object.hasOwn(LAYOUT_CLASS_TO_COMPONENT, t));
  const headingMatch = tag.match(/^h([1-6])$/);

  if (layoutIndex !== -1) {
    name = LAYOUT_CLASS_TO_COMPONENT[classTokens[layoutIndex]];
    classTokens.splice(layoutIndex, 1);
    if (tag !== 'div') headAttrs.push(attrToString('as', tag));
  } else if (headingMatch) {
    name = 'Heading';
    headAttrs.push(attrToString('level', headingMatch[1]));
  } else if (tag === 'p') {
    name = 'Text';
  }

  // 2. class トークン → props / className
  const propAttrs: string[] = [];
  const restClassTokens: string[] = [];
  // -hov:{val} は hov prop（文字列形式）へ。複数トークンはカンマ結合し、
  // 最初のトークンの位置に hov 属性を出す（連続して書かれていれば往復で順序が保たれる）
  const hovValues: string[] = [];
  let hovAttrIndex = -1;
  for (const token of classTokens) {
    const hovMatch = token.match(/^-hov:(.+)$/);
    if (hovMatch) {
      if (hovValues.length === 0) hovAttrIndex = propAttrs.length;
      hovValues.push(hovMatch[1]);
      continue;
    }
    const parsed = parsePropToken(token);
    if (parsed) {
      propAttrs.push(attrToString(parsed[0], parsed[1]));
    } else {
      restClassTokens.push(token);
    }
  }
  if (hovValues.length > 0) {
    propAttrs.splice(hovAttrIndex, 0, attrToString('hov', hovValues.join(',')));
  }

  // Lism prop クラスを持つがコンポーネントに割り当てられなかったタグは <Lism as="tag">
  if (!name) {
    if (propAttrs.length > 0) {
      name = 'Lism';
      if (tag !== 'div') headAttrs.push(attrToString('as', tag));
    } else {
      name = tag;
    }
  }

  const attrs = [...headAttrs, ...propAttrs];
  if (restClassTokens.length > 0) {
    attrs.push(attrToString('className', restClassTokens.join(' ')));
  }
  // class 以外の属性はそのまま引き継ぐ（順序保持）
  for (const attr of [...el.attributes]) {
    if (attr.name === 'class') continue;
    attrs.push(attrToString(attr.name, attr.value));
  }

  return { name, attrs, children: htmlNodesToPrintable(el.childNodes), isVoid: VOID_TAGS.has(tag) };
};

const htmlNodesToPrintable = (nodes: NodeListOf<ChildNode>): PrintableNode[] => {
  const result: PrintableNode[] = [];
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const line of normalizeText(node.textContent)) {
        result.push({ kind: 'text', text: line });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      result.push({ kind: 'element', el: htmlElementToJsx(node as Element) });
    }
    // コメント等は無視
  }
  return result;
};

/** HTML文字列を Lism コンポーネント表記の JSX に変換する */
export function htmlToJsx(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;
  return printNodes(htmlNodesToPrintable(template.content.childNodes), 0, 'jsx').join('\n');
}

// ---------------------------------------------------------------------------
// JSX → HTML
// ---------------------------------------------------------------------------

/** 変換不能な構文を表す内部例外 */
class JsxConvertError extends Error {}

const jsxElementToHtml = (el: Element): PrintableElement => {
  const name = el.tagName; // XMLパースなので大文字小文字が保持される
  const isComponent = /^[A-Z]/.test(name);

  // 属性を順序付きで取り出す
  const attrs = [...el.attributes].map((a) => ({ name: a.name, value: a.value }));
  const takeAttr = (attrName: string): string | null => {
    const i = attrs.findIndex((a) => a.name === attrName);
    if (i === -1) return null;
    return attrs.splice(i, 1)[0].value;
  };

  // 1. タグ名の決定
  let tag = '';
  let layoutClass = '';
  if (isComponent) {
    if (Object.hasOwn(COMPONENT_TO_LAYOUT_CLASS, name)) {
      layoutClass = COMPONENT_TO_LAYOUT_CLASS[name];
      tag = takeAttr('as') ?? 'div';
    } else if (name === 'Heading') {
      const level = takeAttr('level') ?? '2';
      if (!/^[1-6]$/.test(level)) throw new JsxConvertError(`invalid heading level: ${level}`);
      tag = `h${level}`;
    } else if (name === 'Text') {
      tag = takeAttr('as') ?? 'p';
    } else if (name === 'Lism') {
      tag = takeAttr('as') ?? 'div';
    } else {
      throw new JsxConvertError(`unknown component: ${name}`);
    }
  } else {
    tag = name;
  }

  // 2. props → class トークン
  const classTokens: string[] = layoutClass ? [layoutClass] : [];
  const restAttrs: string[] = [];
  let classNameTokens: string[] = [];
  for (const attr of attrs) {
    if (attr.name === 'className' || attr.name === 'class') {
      classNameTokens = classNameTokens.concat(attr.value.split(/\s+/).filter(Boolean));
    } else if (Object.hasOwn(PROPS, attr.name)) {
      classTokens.push(`-${attr.name}:${attr.value}`);
    } else if (attr.name === 'hov') {
      // 文字列形式の hov（カンマ区切りで複数可）を -hov:{val} クラスへ展開（本物の setHovProps と同じ規則）
      for (const value of attr.value.split(',')) {
        const trimmed = value.trim();
        if (trimmed) classTokens.push(`-hov:${trimmed}`);
      }
    } else {
      restAttrs.push(attrToString(attr.name, attr.value));
    }
  }
  classTokens.push(...classNameTokens);

  const outAttrs: string[] = [];
  if (classTokens.length > 0) outAttrs.push(attrToString('class', classTokens.join(' ')));
  outAttrs.push(...restAttrs);

  return { name: tag, attrs: outAttrs, children: jsxNodesToPrintable(el.childNodes), isVoid: VOID_TAGS.has(tag) };
};

const jsxNodesToPrintable = (nodes: NodeListOf<ChildNode>): PrintableNode[] => {
  const result: PrintableNode[] = [];
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      for (const line of normalizeText(node.textContent)) {
        result.push({ kind: 'text', text: line });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      result.push({ kind: 'element', el: jsxElementToHtml(node as Element) });
    }
  }
  return result;
};

/**
 * JSX文字列を HTML に変換する。
 * パース不能・未知のコンポーネント等、変換できない場合は null（呼び出し側は last-good を維持）。
 */
export function jsxToHtml(jsx: string): string | null {
  // XMLとして厳密にパースする（不正なJSXはここで弾かれる）。複数ルート対応のためラップする
  const doc = new DOMParser().parseFromString(`<jsx-root>${jsx}</jsx-root>`, 'text/xml');
  if (doc.querySelector('parsererror')) return null;

  try {
    return printNodes(jsxNodesToPrintable(doc.documentElement.childNodes), 0, 'html').join('\n');
  } catch (e) {
    if (e instanceof JsxConvertError) return null;
    throw e;
  }
}
