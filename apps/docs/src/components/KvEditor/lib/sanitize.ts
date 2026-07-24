// エディターの入力をヒーローへ innerHTML で流し込む前の無害化。
// 脅威モデルは self-XSS のみ（入力者 = 閲覧者）なので、
// スクリプト実行経路になる要素・属性だけを除去する方式で十分とする。

const BANNED_TAGS = new Set(['script', 'style', 'link', 'meta', 'base', 'iframe', 'object', 'embed', 'form']);
const URL_ATTRS = new Set(['href', 'src', 'srcset', 'xlink:href']);

/** URL値が javascript: 等の危険スキームかどうか（制御文字・空白での偽装も除去して判定） */
const isDangerousUrl = (value: string): boolean => {
  // eslint-disable-next-line no-control-regex
  const normalized = value.replace(/[\u0000-\u0020]/g, '').toLowerCase();
  return normalized.startsWith('javascript:') || normalized.startsWith('data:text/html');
};

/** HTML文字列から実行可能な要素・属性を取り除いて返す */
export function sanitize(html: string): string {
  const template = document.createElement('template');
  template.innerHTML = html;

  for (const el of [...template.content.querySelectorAll('*')]) {
    if (BANNED_TAGS.has(el.tagName.toLowerCase())) {
      el.remove();
      continue;
    }
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (name.startsWith('on')) {
        el.removeAttribute(attr.name);
      } else if (URL_ATTRS.has(name) && isDangerousUrl(attr.value)) {
        el.removeAttribute(attr.name);
      }
    }
  }

  return template.innerHTML;
}
