// ユーザー指定のID等を、文字列置換で組み立てて set:html で出力するHTMLの属性値へ安全に埋め込むためのエスケープ
export default function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
