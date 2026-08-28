// KVヒーローエリアの初期マークアップ（言語別）。
// SSRされるヒーロー・エディターの初期値・シナリオ再生のリセットで共用する唯一の情報源。
// NOTE: convert.ts のプリンタ出力（2スペースインデント・単一テキスト子は80字以内でインライン）と
//       同じ整形ルールで書くこと。ズレると HTML→JSX→HTML の往復でコードが書き換わってしまう。
//       アイコン等は SVG をここに直接書かないこと（path の `d` 属性が Lism の d=display prop と
//       衝突し往復が壊れる）。装飾アイコンは _kv-editor.scss の疑似要素 + mask で当てる。
// NOTE: レスポンシブ表記も convert.ts の正準形で書くこと: BP クラスは base トークンの直後に
//       sm→md→lg の昇順で並べ、style 属性（`--{prop}_{bp}: 値`）は class の直後に置く。
//       値はトークンなら `var(--{token}--{key})`（space は `var(--s{n})`）。ズレると JSX タブで
//       配列 prop（`fz={['4xl', null, '5xl']}`）へ集約されず className 扱いになる。
// NOTE: 言語で変わるのはリード2行と href のプレフィックスのみ。マークアップ構造・クラス属性は
//       言語間で必ず揃えること（scenario.ts の edits がクラス属性への文字列置換で両言語に効く前提）。
import type { LangCode } from '@/config/site';

export type DemoLang = LangCode;

const buildInitialHtml = (
  lead1: string,
  lead2: string,
  urlPrefix: string
): string => `<h1 class="-fw:700 -fz:4xl -fz_md -ta:center" style="--fz_md: var(--fz--5xl)">
  The CSS Design Framework
  <br />
  for AI and Humans
</h1>
<p class="-fz:s -fz_md -ta:center -mbs:30" style="--fz_md: var(--fz--l)">
  ${lead1}
  <br />
  ${lead2}
</p>
<div class="l--flex -jc:center -ai:center -g:15 -mbs:40">
  <a class="l--flex -ai:center -p:10 -c:base -bdrs:20 -fw:500 -td:none -lh:s" href="${urlPrefix}/docs/installation/">
    <span class="-px:10">Get Started</span>
  </a>
  <a class="l--flex -ai:center -p:10 -bgc:base -bdrs:20 -td:none -lh:s" href="${urlPrefix}/docs/" data-modal-open="search-modal">
    <span class="-px:10">Search documentation...</span>
    <span class="-px:10 -py:5 -c:text -bgc:base-2 -bdrs:10 -fz:s -lh:1 -lts:s -d:none -d_md -bd" style="--d_md: inline-block">
      ⌘K
    </span>
  </a>
</div>`;

export const INITIAL_HTML_BY_LANG: Record<DemoLang, string> = {
  ja: buildInitialHtml('軽量でビルド不要。どんなサイトにも導入できます。', 'あなたはもう、CSS設計に悩む必要はありません。', ''),
  en: buildInitialHtml('Lightweight and build-free. Works on any site.', 'You never have to worry about CSS architecture again.', '/en'),
};
