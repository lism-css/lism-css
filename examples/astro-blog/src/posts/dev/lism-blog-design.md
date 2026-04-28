---
title: Lism CSS で個人ブログを組み直す
excerpt: 自分のブログを書き直すなら、できるだけ書き捨てない CSS にしたい。Lism CSS のレイアウトプリミティブとデザイントークンで、ブログの骨格を組んでみた話。
date: 2026.04.22
tags: [lism-css, astro, design]
readtime: 8 min
---

## 書き捨てない CSS という願い

ブログの CSS は不思議なもので、デザインを刷新するたびに「前回書いたあれは何だったのか」と過去の自分に問いかけたくなる。クラス名は揺らぎ、余白は気分で変わり、メディアクエリの分岐は記事ごとに少しずつ違っている。

そろそろ、書き捨てないで済む CSS にしておきたい。設計のルールを誰かに任せて、自分はコンテンツに集中したい。そう思って、Lism CSS でブログのテンプレートを組み直してみた。

## レイアウトはプリミティブで組む

Lism CSS には `Stack`、`Flex`、`Grid`、`Cluster`、`Wrapper` といったレイアウトプリミティブが揃っている。記事一覧の「日付・カテゴリ・タイトル・概要」が縦に並ぶブロックは、`Stack` ひとつで済む。

```astro
<Stack g="10">
  <Flex g="20" ai="baseline">
    <Inline class="c--date">{post.data.date}</Inline>
  </Flex>
  <Heading level="2" fz="l" fw="normal">{post.data.title}</Heading>
  <Text fz="s" c="text-2">{post.data.excerpt}</Text>
</Stack>
```

`g="10"` のような余白指定はトークンに紐づいているので、別の場所で `g="10"` と書いたときも同じ余白になる。これだけで「気分で変わる余白」が一気に減った。

### サイドバー付きレイアウト

記事ページの「本文 + 目次」は、md 以上で 2 カラム、md 未満で 1 カラムに切り替わる。ここは `Grid` の `gtc` と `gta` をブレイクポイント配列で渡すだけで実現できた。

```astro
<Grid
  g={['40', null, '40 50']}
  gtc={['minmax(0, 1fr)', null, 'minmax(0, 1fr) var(--sz--toc)']}
  gta={[`'header' 'toc' 'body' 'footer'`, null, `'header header' 'body toc' 'footer footer'`]}
>
```

レスポンシブの値切り替えは、Lism CSS のコンテナクエリベースの仕組みに乗るので、先祖に `is--container` が必要になる。レイアウト全体を `<Container>` で包んでおけば、あとはどこでもブレイクポイント切り替えが効く。

## デザイントークンに乗る

色・余白・フォントサイズ・行間といった意匠は、できるだけ Lism のトークン (`--base`、`--text`、`--keycolor`、`--s10` ...) で指定する。テーマの調整は `:root` で数行を上書きするだけで済むようにしておくと、後から「ちょっと色を落ち着かせたい」というときにファイルを跨ぎ歩かなくていい。

```css
@layer lism-base {
  :root {
    --base: #fbfaf7;
    --text: #1a1a1a;
    --keycolor: #c8553d;
    --ff--base: 'Noto Serif JP', serif;
  }
}
```

> 設計の良さは、変えやすさで測るのがいい。

## カスタムは `c--` でレイヤに乗せる

ブログ固有の小さなコンポーネント（日付ラベル・タグ pill・記事一覧の li 区切り）は `c--` プレフィックスのクラスにして `@layer lism-component` の中に書く。これで、Lism のプリミティブとぶつかったときも詳細度ではなくレイヤ順で勝ち負けが決まる。

## おわりに

Lism CSS を使ってよかったのは、CSS を「設計する」時間が減って、「書く」時間に集中できるようになったこと。レイアウトもタイポもトークンも、考えるべきことを誰かが先に整理してくれている、その心地よさだと思う。

明日もまた、何か書きます。
