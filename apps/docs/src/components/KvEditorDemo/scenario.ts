// AIパネルで再生するシナリオ定義。
// resultCode は「そのステップ完了時点のエディター全文」（差分ではない）。
// 前のステップの結果を引き継いだ累積コードで書くこと。
// NOTE: initial-code.ts を変更したら、全ステップの resultCode にも同じ変更を波及させること。
//       漏れると再生時の diff が「その変更を取り消す編集」としてタイピングされてしまう。
// NOTE: 文言・変更内容は仮。デザイン確認後に調整する。

export interface ScenarioStep {
  /** ユーザー側の依頼として表示するメッセージ */
  userMessage: string;
  /** AIの応答として表示するメッセージ（HTMLタブ再生時） */
  aiMessage: string;
  /** JSXタブ再生時のAI応答（表記の違いを反映。省略時は aiMessage で代用） */
  aiMessageJsx?: string;
  /** ステップ完了時のエディターHTML全文（JSXタブでは htmlToJsx で変換して再生する） */
  resultCode: string;
}

export const SCENARIO: ScenarioStep[] = [
  {
    userMessage: 'キャッチコピーを目立たせて',
    aiMessage: '見出しにブランドカラーを適用します。-c:brand クラスを追加しますね。',
    aiMessageJsx: '見出しにブランドカラーを適用します。c="brand" props を追加しますね。',
    resultCode: `<h1 class="-fw:bold -fz:5xl -ta:center -c:brand">
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
</div>`,
  },
  {
    userMessage: 'ボタンをピル型にしたい',
    aiMessage: 'Get Started ボタンの角丸を -bdrs:99 に変更し、左右の余白を広げます。',
    aiMessageJsx: 'Get Started ボタンの角丸を bdrs="99" に変更し、左右の余白を広げます。',
    resultCode: `<h1 class="-fw:bold -fz:5xl -ta:center -c:brand">
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
  <a class="l--flex -ai:center -g:10 -px:20 -py:10 -bgc:text -c:base -bdrs:99 -fw:500 -td:none -lh:s -hov:-o" href="/docs/installation/">
    Get Started
  </a>
  <a class="l--flex -ai:center -g:10 -px:15 -py:10 -bgc:base -bdrs:20 -td:none -c:gray -lh:s -hov:-bgc" href="/docs/" data-modal-open="search-modal">
    Search documentation...
    <span class="-px:10 -py:5 -bgc:base-2 -bdrs:10 -fz:s -lh:1 -lts:s -bd">
      ⌘ K
    </span>
  </a>
</div>`,
  },
  {
    userMessage: 'ボタンまわりを縦並びにできる？',
    aiMessage: 'レイアウトを l--flex から l--stack に切り替えて縦並びにします。',
    aiMessageJsx: 'レイアウトを Flex から Stack コンポーネントに切り替えて縦並びにします。',
    resultCode: `<h1 class="-fw:bold -fz:5xl -ta:center -c:brand">
  The CSS Design Framework
  <br />
  for AI and Humans
</h1>
<p class="-fz:m -ta:center -mbs:30">
  軽量でビルド不要。どのサイトにも導入できます。
  <br />
  あなたはもう、CSS設計に悩む必要はありません。
</p>
<div class="l--stack -ai:center -g:10 -mbs:40">
  <a class="l--flex -ai:center -g:10 -px:20 -py:10 -bgc:text -c:base -bdrs:99 -fw:500 -td:none -lh:s -hov:-o" href="/docs/installation/">
    Get Started
  </a>
  <a class="l--flex -ai:center -g:10 -px:15 -py:10 -bgc:base -bdrs:20 -td:none -c:gray -lh:s -hov:-bgc" href="/docs/" data-modal-open="search-modal">
    Search documentation...
    <span class="-px:10 -py:5 -bgc:base-2 -bdrs:10 -fz:s -lh:1 -lts:s -bd">
      ⌘ K
    </span>
  </a>
</div>`,
  },
];
