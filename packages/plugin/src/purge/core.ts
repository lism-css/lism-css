export type SafelistEntry = string | RegExp | ((className: string) => boolean);

export interface PurgeOptions {
  used: Set<string>;
  safelist?: SafelistEntry[];
  known?: KnownSelectorSet;
}

const NESTING_AT_RULES = new Set(['media', 'container', 'layer', 'supports', 'starting-style']);

type AttrOp = '=' | '*=' | '^=' | '$=' | '~=' | '|=';

export interface KnownSelectorSet {
  classes: Set<string>;
  attrs: Set<string>;
}

interface PurgeContext {
  used: Set<string>;
  safelist: SafelistEntry[];
  known?: KnownSelectorSet;
  attrCache: Map<string, boolean>;
}

// ---- 低レベルユーティリティ -----------------------------------------------

function findStringEnd(css: string, start: number): number {
  const quote = css[start];
  let i = start + 1;
  while (i < css.length) {
    const c = css[i];
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (c === quote) return i;
    i++;
  }
  return css.length - 1;
}

function findCommentEnd(css: string, start: number): number {
  const end = css.indexOf('*/', start + 2);
  return end === -1 ? css.length : end + 1;
}

function findBlockEnd(css: string, openBraceIndex: number): number {
  let depth = 1;
  let i = openBraceIndex + 1;
  while (i < css.length) {
    const c = css[i];
    if (c === '/' && css[i + 1] === '*') {
      i = findCommentEnd(css, i) + 1;
      continue;
    }
    if (c === '"' || c === "'") {
      i = findStringEnd(css, i) + 1;
      continue;
    }
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return css.length;
}

// ---- セレクタ判定 -----------------------------------------------------------

function unescapeIdent(raw: string): string {
  return raw.replace(/\\(.)/g, '$1');
}

interface SelectorConstraints {
  classes: string[];
  attrs: Array<{ op: AttrOp; value: string }>;
  hasUnknownClassConstraint: boolean;
}

const CLASS_RE = /\.((?:\\.|[A-Za-z0-9_-])+)/g;
const ATTR_RE = /\[\s*class\s*([*~^$|]?)=\s*(?:"([^"]*)"|'([^']*)'|([^\]\s]*))\s*\]/g;
// `:is()` / `:where()` は内部セレクタを OR 条件として判定する
const OR_SELECTOR_PSEUDOS = ['is', 'where'] as const;
// `:not()` / `:has()` は内部クラスがターゲット要素のクラスではない（除外条件 / 子孫条件）ため、
// 内部のクラスは purge 判定から除外する（normalized からも消す）
const IGNORED_SELECTOR_PSEUDOS = ['not', 'has'] as const;

function attrKey(op: AttrOp, value: string): string {
  return `${op}|${value}`;
}

function hasLismClassPrefix(className: string): boolean {
  return className.startsWith('-') || /^(?:c|a|l|is|has|set|u)--/.test(className);
}

function isPurgeableClassName(className: string, ctx: PurgeContext): boolean {
  if (ctx.known) return ctx.known.classes.has(className);
  return hasLismClassPrefix(className);
}

function isPurgeableClassAttr(op: AttrOp, value: string, ctx: PurgeContext): boolean {
  if (ctx.known) return ctx.known.attrs.has(attrKey(op, value));
  return hasLismClassPrefix(value.trimStart());
}

function extractConstraints(selector: string, ctx: PurgeContext): SelectorConstraints {
  const classes: string[] = [];
  const attrs: Array<{ op: AttrOp; value: string }> = [];
  let hasUnknownClassConstraint = false;
  for (const m of selector.matchAll(CLASS_RE)) {
    const className = unescapeIdent(m[1]);
    if (isPurgeableClassName(className, ctx)) classes.push(className);
    else hasUnknownClassConstraint = true;
  }
  for (const m of selector.matchAll(ATTR_RE)) {
    const op = (m[1] ? `${m[1]}=` : '=') as AttrOp;
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    if (isPurgeableClassAttr(op, value, ctx)) attrs.push({ op, value });
    else hasUnknownClassConstraint = true;
  }
  return { classes, attrs, hasUnknownClassConstraint };
}

function splitSelectorList(selectors: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < selectors.length; i++) {
    const c = selectors[i];
    if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === ',' && depth === 0) {
      out.push(selectors.slice(start, i));
      start = i + 1;
    }
  }
  out.push(selectors.slice(start));
  return out.map((s) => s.trim()).filter(Boolean);
}

function findAttributeSelectorEnd(selector: string, start: number): number {
  let i = start + 1;
  while (i < selector.length) {
    const c = selector[i];
    if (c === '"' || c === "'") {
      i = findStringEnd(selector, i) + 1;
      continue;
    }
    if (c === ']') return i;
    i++;
  }
  return selector.length - 1;
}

function findParenEnd(selector: string, openParenIndex: number): number {
  let depth = 1;
  let i = openParenIndex + 1;
  while (i < selector.length) {
    const c = selector[i];
    if (c === '"' || c === "'") {
      i = findStringEnd(selector, i) + 1;
      continue;
    }
    if (c === '[') {
      i = findAttributeSelectorEnd(selector, i) + 1;
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')') {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return selector.length - 1;
}

function getFunctionalSelectorOpen(selector: string, start: number): { open: number; isOr: boolean } | null {
  if (selector[start] !== ':' || selector[start + 1] === ':') return null;
  for (const name of OR_SELECTOR_PSEUDOS) {
    if (selector.startsWith(`:${name}(`, start)) return { open: start + name.length + 1, isOr: true };
  }
  for (const name of IGNORED_SELECTOR_PSEUDOS) {
    if (selector.startsWith(`:${name}(`, start)) return { open: start + name.length + 1, isOr: false };
  }
  return null;
}

function extractFunctionalSelectorGroups(selector: string): { selector: string; orGroups: string[] } {
  const orGroups: string[] = [];
  let normalized = '';
  let i = 0;
  while (i < selector.length) {
    const c = selector[i];
    if (c === '"' || c === "'") {
      const end = findStringEnd(selector, i);
      normalized += selector.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    if (c === '[') {
      const end = findAttributeSelectorEnd(selector, i);
      normalized += selector.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    const match = getFunctionalSelectorOpen(selector, i);
    if (match) {
      const end = findParenEnd(selector, match.open);
      if (match.isOr) orGroups.push(selector.slice(match.open + 1, end));
      normalized += ' ';
      i = end + 1;
      continue;
    }

    normalized += c;
    i++;
  }
  return { selector: normalized, orGroups };
}

function testRegExpEntry(entry: RegExp, value: string): boolean {
  // /pattern/g や /pattern/y は test() で lastIndex が前進し、次回呼び出しの結果が
  // 入力順に依存して揺らぐ。状態を持つフラグの場合は毎回 0 にリセットしてから判定する。
  if (entry.global || entry.sticky) entry.lastIndex = 0;
  return entry.test(value);
}

function matchesSafelist(className: string, safelist: SafelistEntry[]): boolean {
  for (const entry of safelist) {
    if (typeof entry === 'string') {
      if (entry === className) return true;
    } else if (entry instanceof RegExp) {
      if (testRegExpEntry(entry, className)) return true;
    } else if (typeof entry === 'function') {
      if (entry(className)) return true;
    }
  }
  return false;
}

function attrMatchesClass(cls: string, attr: { op: AttrOp; value: string }, tokenValue: string): boolean {
  switch (attr.op) {
    case '=':
    case '~=':
      return cls === attr.value || cls === tokenValue;
    case '*=':
      return cls.includes(attr.value) || cls.includes(tokenValue);
    case '^=':
      return cls.startsWith(attr.value) || cls.startsWith(tokenValue);
    case '$=':
      return cls.endsWith(attr.value) || cls.endsWith(tokenValue);
    case '|=':
      return cls === attr.value || cls === tokenValue || cls.startsWith(`${attr.value}-`) || cls.startsWith(`${tokenValue}-`);
  }
}

function attrMatchesAnyUsed(attr: { op: AttrOp; value: string }, ctx: PurgeContext): boolean {
  if (!attr.value) return true;
  const key = `${attr.op}|${attr.value}`;
  const cached = ctx.attrCache.get(key);
  if (cached !== undefined) return cached;

  const tokenValue = attr.value.trim();
  let result = false;

  for (const cls of ctx.used) {
    if (attrMatchesClass(cls, attr, tokenValue)) {
      result = true;
      break;
    }
  }

  // safelist の string エントリも used と同様に属性セレクタ照合対象にする。
  // RegExp / function は具体的なクラス名を列挙できないため、属性セレクタを保守的に残す。
  if (!result) {
    for (const entry of ctx.safelist) {
      if (typeof entry === 'string') {
        if (attrMatchesClass(entry, attr, tokenValue)) {
          result = true;
          break;
        }
      } else {
        result = true;
        break;
      }
    }
  }

  ctx.attrCache.set(key, result);
  return result;
}

function constraintsMatch(selector: string, ctx: PurgeContext): boolean {
  const { classes, attrs, hasUnknownClassConstraint } = extractConstraints(selector, ctx);
  if (hasUnknownClassConstraint) return true;
  if (classes.length === 0 && attrs.length === 0) return true;
  for (const cls of classes) {
    if (!ctx.used.has(cls) && !matchesSafelist(cls, ctx.safelist)) return false;
  }
  for (const attr of attrs) {
    if (!attrMatchesAnyUsed(attr, ctx)) return false;
  }
  return true;
}

function shouldKeepSingleSelector(selector: string, ctx: PurgeContext): boolean {
  const { selector: normalized, orGroups } = extractFunctionalSelectorGroups(selector);
  if (!constraintsMatch(normalized, ctx)) return false;
  for (const group of orGroups) {
    if (shouldKeepSelectorList(group, ctx) === null) return false;
  }
  return true;
}

function shouldKeepSelectorList(selectorList: string, ctx: PurgeContext): { kept: string; changed: boolean } | null {
  const list = splitSelectorList(selectorList);
  const kept: string[] = [];
  for (const sel of list) {
    if (shouldKeepSingleSelector(sel, ctx)) kept.push(sel);
  }
  if (kept.length === 0) return null;
  return { kept: kept.join(','), changed: kept.length !== list.length };
}

// ---- パース / 処理 ----------------------------------------------------------

type Segment =
  | { kind: 'rule'; header: string; body: string }
  | { kind: 'at-block'; header: string; name: string; body: string }
  | { kind: 'at-statement'; header: string }
  | { kind: 'comment'; text: string };

function* iterateTopLevel(css: string): Generator<Segment> {
  let i = 0;
  const n = css.length;
  while (i < n) {
    while (i < n) {
      const c = css[i];
      if (c === ' ' || c === '\n' || c === '\t' || c === '\r' || c === '\f') {
        i++;
        continue;
      }
      if (c === '/' && css[i + 1] === '*') {
        const end = findCommentEnd(css, i) + 1;
        yield { kind: 'comment', text: css.slice(i, end) };
        i = end;
        continue;
      }
      break;
    }
    if (i >= n) break;

    const start = i;
    let foundOpenBrace = -1;
    let semi = -1;
    while (i < n) {
      const c = css[i];
      if (c === '/' && css[i + 1] === '*') {
        i = findCommentEnd(css, i) + 1;
        continue;
      }
      if (c === '"' || c === "'") {
        i = findStringEnd(css, i) + 1;
        continue;
      }
      if (c === '{') {
        foundOpenBrace = i;
        break;
      }
      if (c === ';') {
        semi = i;
        break;
      }
      if (c === '}') break;
      i++;
    }

    if (foundOpenBrace !== -1) {
      const header = css.slice(start, foundOpenBrace).trim();
      const blockEnd = findBlockEnd(css, foundOpenBrace);
      const body = css.slice(foundOpenBrace + 1, blockEnd);
      i = blockEnd + 1;
      if (header.startsWith('@')) {
        const name = header
          .slice(1)
          .split(/[\s({;]/, 1)[0]
          .toLowerCase();
        yield { kind: 'at-block', header, name, body };
      } else {
        yield { kind: 'rule', header, body };
      }
    } else if (semi !== -1) {
      yield { kind: 'at-statement', header: css.slice(start, semi + 1).trim() };
      i = semi + 1;
    } else {
      break;
    }
  }
}

function collectKnownSelector(selector: string, known: KnownSelectorSet): void {
  for (const m of selector.matchAll(CLASS_RE)) {
    known.classes.add(unescapeIdent(m[1]));
  }
  for (const m of selector.matchAll(ATTR_RE)) {
    const op = (m[1] ? `${m[1]}=` : '=') as AttrOp;
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    known.attrs.add(attrKey(op, value));
  }
}

function collectKnownSelectors(css: string, known: KnownSelectorSet): void {
  for (const seg of iterateTopLevel(css)) {
    if (seg.kind === 'rule') {
      collectKnownSelector(seg.header, known);
    } else if (seg.kind === 'at-block') {
      collectKnownSelectors(seg.body, known);
    }
  }
}

export function extractKnownLismSelectors(css: string): KnownSelectorSet {
  const known = { classes: new Set<string>(), attrs: new Set<string>() };
  collectKnownSelectors(css, known);
  return known;
}

interface ProcessResult {
  css: string;
  changed: boolean;
}

function processSegments(css: string, ctx: PurgeContext): ProcessResult {
  let out = '';
  let changed = false;
  for (const seg of iterateTopLevel(css)) {
    if (seg.kind === 'comment') {
      out += `${seg.text}\n`;
      continue;
    }
    if (seg.kind === 'at-statement') {
      out += seg.header.endsWith(';') ? `${seg.header}\n` : `${seg.header};\n`;
      continue;
    }
    if (seg.kind === 'at-block') {
      if (NESTING_AT_RULES.has(seg.name)) {
        const inner = processSegments(seg.body, ctx);
        if (inner.changed) changed = true;
        if (inner.css.trim()) {
          out += `${seg.header}{${inner.css}}\n`;
        } else {
          // at-block ごと空になった = 削除扱い
          changed = true;
        }
      } else {
        out += `${seg.header}{${seg.body}}\n`;
      }
      continue;
    }
    const result = shouldKeepSelectorList(seg.header, ctx);
    if (result === null) {
      changed = true;
      continue;
    }
    if (result.changed) changed = true;
    out += `${result.kept}{${seg.body}}\n`;
  }
  return { css: out, changed };
}

export function purgeLismCss(css: string, options: PurgeOptions): string {
  const ctx: PurgeContext = {
    used: options.used,
    safelist: options.safelist ?? [],
    known: options.known,
    attrCache: new Map(),
  };
  const result = processSegments(css, ctx);
  // 何も削除されなければ原文を返す（再シリアライズによる空白差分も避ける）
  return result.changed ? result.css : css;
}
