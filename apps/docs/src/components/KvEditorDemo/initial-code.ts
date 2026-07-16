// KVヒーローエリアの初期マークアップ。
// SSRされるヒーロー・エディターの初期値・シナリオ再生のリセットで共用する唯一の情報源。
// NOTE: convert.ts のプリンタ出力（2スペースインデント・単一テキスト子は80字以内でインライン）と
//       同じ整形ルールで書くこと。ズレると HTML→JSX→HTML の往復でコードが書き換わってしまう。
export const INITIAL_HTML = `<h1 class="-fw:bold -fz:5xl -ta:center">
  The CSS Design Framework
  <br />
  for AI and Humans
</h1>
<p class="-fz:m -ta:center -mbs:30">
  軽量でビルド不要。どのサイトにも導入できます。
  <br />
  あなたはもう、CSS設計に悩む必要はありません。
</p>
<div class="l--flex -jc:center -ai:center -g:15 -mbs:40">
  <a class="l--flex -ai:center -g:10 -px:15 -py:10 -bgc:text -c:base -bdrs:20 -fw:500 -td:none -lh:s -hov:-o" href="/docs/installation/">
    Get Started
  </a>
  <a class="l--flex -ai:center -g:10 -px:15 -py:10 -bgc:base -bdrs:20 -td:none -c:gray -lh:s -hov:-bgc" href="/docs/" data-modal-open="search-modal">
    Search documentation...
    <span class="-px:10 -py:5 -bgc:base-2 -bdrs:10 -fz:s -lh:1 -lts:s -bd">
      ⌘ K
    </span>
  </a>
</div>`;
