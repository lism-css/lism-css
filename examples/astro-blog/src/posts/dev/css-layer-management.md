---
title: '@layer で CSS の優先度を整える'
excerpt: 詳細度の戦争から降りる選択肢として、ネイティブ @layer を使う。Lism CSS が採用しているレイヤ構造を真似して、自分のブログにも秩序を持ち込んだ話。
date: 2026.04.02
tags: [css, layer, lism-css]
readtime: 6 min
---

## !important を書かないために

CSS を書いていて一番疲れるのは、詳細度の調整だと思う。「リセット CSS の指定が効いてしまう」「ライブラリのスタイルを上書きできない」「やむなく `!important`」、この流れに何度入り込んだことだろう。

`@layer` は、この戦争から降りるための仕組みだ。レイヤを宣言した順番が、そのまま優先度の順番になる。詳細度をいじらなくていい。

```css
@layer reset, base, component, utility;
```

## Lism CSS のレイヤ構造を借りる

Lism CSS は `lism-base` → `lism-component` → `lism-utility` のような順でレイヤを宣言している。自分のブログ用 CSS を書くときも、この秩序に乗ってしまうのが手っ取り早い。

```css
/* base のトークンを上書き */
@layer lism-base {
  :root {
    --keycolor: #c8553d;
    --ff--base: 'Noto Serif JP', serif;
  }
}

/* ブログ固有のコンポーネント */
@layer lism-component {
  .c--eyebrow {
    font-family: var(--ff--accent);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
}
```

### どこに書けばいいか迷ったら

- HTML 要素のベース調整・トークン上書き → `lism-base`
- `c--` プレフィックスの自作コンポーネント → `lism-component`
- 単一プロパティの装飾を細かく当てる → `lism-utility`（基本は Property Class で済む）

迷ったら `lism-component` に置いておくと、Lism のプリミティブには負けず、ユーティリティには負ける、という穏やかな位置取りになる。

## 詳細度ではなく、レイヤ順で勝ち負けを決める

```css
@layer lism-component {
  .c--postList > li {
    border-block-end: 1px solid var(--divider);
  }
}
```

これと、Lism のユーティリティクラス `-bd-b:none` がぶつかったとき、ユーティリティが勝つ。詳細度は同じでも、後ろのレイヤが勝つからだ。`!important` を書かなくても、意図通りに上書きできる。

> ルールを決めるのは詳細度ではなく、レイヤの宣言順。

## おわりに

`@layer` を使い始めてから、CSS を書くストレスが目に見えて減った。「どう書くか」より先に「どこに書くか」を考える習慣がつくだけで、ファイルが散らかりにくくなる。

ブラウザサポートも今では十分に広がっている。詳細度の戦争に疲れたら、降りるための非常口として、覚えておいて損はない。
