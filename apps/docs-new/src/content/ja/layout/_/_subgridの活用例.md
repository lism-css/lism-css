# subgridで整った記事リストを表示する

subgridを使うと、親グリッドの行・列トラックをそのまま子要素にも継承でき、カード内のテキストや画像の位置、要素の高さなどを兄弟要素間で自然に揃えられます。gapも継承されるため、複数カードが並ぶレイアウトでも統一感のある余白を簡単に保てるのが大きな特徴です。


## subgridで配置を揃えたカードレイアウト

代表的なsubgridの例を紹介します。タイトル・サムネイル画像・抜粋文・投稿日を表示する記事リストのレイアウトを組んでみます。

作成する記事リストは以下のような特徴を持ちます。

- 各記事を自動段組みで表示するカードレイアウト
- タイトルの長さがバラバラでも、次に来るサムネイル画像の位置が揃う
- 抜粋文の長さがバラバラでも、次に来る投稿日の位置が揃う

前述した記事リストを実装するには、各カードの4つの要素のトラック位置を揃える必要があります。`grid-template-rows`を各カードに継承させて、行トラック位置を共有させて実装しましょう。

まずは全体像を紹介します。

```css
/* 親グリッド：カード全体を並べるコンテナ */
.subgrid-cards {
  display: grid;
  gap: var(--space--6);

  /*  自動段組み  */
  grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
}

/* 子グリッド：各カードがsubgridを使用 */
.subgrid-card {
  display: grid;

  /* 4行分の行領域を確保（画像・タイトル・本文・メタ情報） */
  grid-row: span 4;

  /* 親グリッドの行ラインを継承し、カード間で各行の高さを揃える */
  grid-template-rows: subgrid;

  gap: var(--space--4);
  padding: var(--space--4);
  box-shadow: var(--shadow--sm);
  border-radius: 8px;
  background: #f8f8f8;
  line-height: 1.4;
}
.subgrid-card__media {
  aspect-ratio: 16 / 9;
  border-radius: 4px;
  overflow: hidden;
}
.subgrid-card__media > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.subgrid-card__title {
  font-size: 1em;
  align-self: center;
}
.subgrid-card__text {
  font-size: var(--font-size--sm);
}
.subgrid-card__meta {
  font-size: var(--font-size--xs);
  border-top: solid 1px;
  padding-top: var(--space--4);
  opacity: 0.9;
}
```

```html
<div class="subgrid-cards">
  <div class="subgrid-card">
    <h2 class="subgrid-card__title">
      記事のタイトルがここに入ります。
    </h2>
    <div class="subgrid-card__media">
      <img src="https://book-cdn.pages.dev/img/img-1.jpg" alt="" width="1200" height="800" />
    </div>

    <div class="subgrid-card__text">
      記事の説明文がここに入ります。
    </div>
    <div class="subgrid-card__title"></div>
    <div class="subgrid-card__meta">2025-01-01</div>
  </div>
  <div class="subgrid-card">
    <h2 class="subgrid-card__title">
      記事のタイトルがここに入ります。
    </h2>
    <div class="subgrid-card__media">
      <img src="https://book-cdn.pages.dev/img/img-1.jpg" alt="" width="1200" height="800" />
    </div>

    <div class="subgrid-card__text">
      ロレム・イプサムの座り雨、トマ好き学習だったエリット、しかし時と活力はそのような木々と楽しみ。
    </div>
    <div class="subgrid-card__title"></div>
    <div class="subgrid-card__meta">2025-01-01</div>
  </div>
  <div class="subgrid-card">
    <h2 class="subgrid-card__title">
      少し長めのカードのタイトルをここには入れてみます。長い、長い、長いタイトルをつけてみます。
    </h2>
    <div class="subgrid-card__media">
      <img src="https://book-cdn.pages.dev/img/img-1.jpg" alt="" width="1200" height="800" />
    </div>

    <div class="subgrid-card__text">
      ブラインド行うにはいくつかの重要な事柄が流れます。長年にわたり、私は学区と長寿であれば
      。
    </div>
    <div class="subgrid-card__title"></div>
    <div class="subgrid-card__meta">2025-01-01</div>
  </div>
  <div class="subgrid-card">
    <h2 class="subgrid-card__title">
      短いタイトル
    </h2>
    <div class="subgrid-card__media">
      <img src="https://book-cdn.pages.dev/img/img-1.jpg" alt="" width="1200" height="800" />
    </div>

    <div class="subgrid-card__text">
      Liberroy, Foo の取り組み、我らのうち、Mulla Sunt
      の利点を提案したのなら。 彼らはあなたの悩みに一般的な魂を癒しています。
    </div>
    <div class="subgrid-card__title"></div>
    <div class="subgrid-card__meta">2025-01-01</div>
  </div>
</div>
```

<iframe height="300" style="width: 100%;" scrolling="no" title="book 1- grid - subgrid-cards" src="https://codepen.io/ddryo-the-encoder/embed/QwNjEjg/51348e8866bc26ceea9a481cebc2a16b?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true">
  See the Pen <a href="https://codepen.io/ddryo-the-encoder/pen/QwNjEjg/51348e8866bc26ceea9a481cebc2a16b">book 1- grid - subgrid-cards</a> by ddryo (<a href="https://codepen.io/ddryo-the-encoder">@ddryo-the-encoder</a>) on <a href="https://codepen.io">CodePen</a>.
</iframe>


### 親グリッドで「カード一覧」の段組みをつくる

それでは、カードレイアウトのコードについて順に解説していきます。まずは、カードを並べる親コンテナ `.subgrid-cards`で、自動段組みのグリッドを作ります。

ポイントは以下の通りです。

- `display: grid;`でカード一覧をグリッドレイアウト化
- `grid-template-columns`で、カード1枚あたりの最小幅を18remとしつつ、コンテナ幅に応じて1〜複数列に自動で増減

`gap`により、行・列のすき間をまとめて制御できます。ここでは「カードがいくつあっても、きれいに並ぶ土台」となるグリッドを作っています。

```css
.subgrid-cards {
  display: grid;
  gap: var(--space--6);
  /*  自動段組み  */
  grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
}
```


### 各カードを「subgridを使うミニグリッド」にする

次に、個々のカード `.subgrid-card`をグリッドにしつつ、親の行トラックを継承します。

ポイントは以下の通りです。

- `display: grid;`で、カード内もグリッドレイアウトに設定
- `grid-template-rows: subgrid;`で「親 `.subgrid-cards`の行トラック構造をそのまま継承」
- `grid-row: span 4;`により、カード1枚が親グリッド上で4トラック分の高さを占有
- `gap`や`padding`、`box-shadow`などでカードの見た目を整える

このステップで、「すべてのカードが同じ行ルールを共有する」状態が作られます。

```css
.subgrid-card {
  display: grid;

  /* 4行分の行領域を確保（画像・タイトル・本文・メタ情報） */
  grid-row: span 4;

  /* 親グリッドの行ラインを継承し、カード間で各行の高さを揃える */
  grid-template-rows: subgrid;

  gap: var(--space--4);
  padding: var(--space--4);
  box-shadow: var(--shadow--sm);
  border-radius: 8px;
  background: #f8f8f8;
  line-height: 1.4;
}
```


### カード内要素を、共有した行トラック上に乗せる

各カードの中身は、HTML側で以下のような順番で並んでいます。

```html
<div class="subgrid-card">
  <h2 class="subgrid-card__title">…タイトル…</h2>
  <div class="subgrid-card__media">…サムネイル画像…</div>
  <div class="subgrid-card__text">…抜粋文…</div>
  <div class="subgrid-card__title"></div> <!-- 空要素（スペーサー） -->
  <div class="subgrid-card__meta">2025-01-01</div>
</div>
```

CSSでは、要素ごとに最低限の見た目だけ指定しています。

```css
.subgrid-card__media {
  aspect-ratio: 16 / 9;
  border-radius: 4px;
  overflow: hidden;
}
.subgrid-card__media > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.subgrid-card__title {
  font-size: 1em;
  align-self: center;
}
.subgrid-card__text {
  font-size: var(--font-size--sm);
}
.subgrid-card__meta {
  font-size: var(--font-size--xs);
  border-top: solid 1px;
  padding-top: var(--space--4);
  opacity: 0.9;
}
```

配置は、`grid-row` / `grid-column`を個別に書かず、`grid-template-rows: subgrid;`と`grid-row: span 4;`の効果で、「カード1枚を通して共通の行トラック」に、上から順に自動配置される形になっています。

間に挟まっている空の `<div class="subgrid-card__title"></div>` は、「本文とメタ情報の間に1行ぶんの余白（行トラック）を確保して高さをそろえる」 ためのスペーサー的な役割です。

結果として、「タイトルの行数が多くても少なくても、`.subgrid-card__media`の縦位置がカード間で揃う」「抜粋文（`.subgrid-card__text`）の行数がバラバラでも、最下段の `.subgrid-card__meta`（投稿日）の位置がすべてのカードで揃う」、という「高さ揃えカード」が実現できています。


## subgridをネストして利用する

subgridの中でsubgridを二重に使うことで孫要素にもトラック構造を継承することが可能です。たとえば、投稿日・カテゴリー・記事のタイトルを表示するニュースリストを組む時に活用できます。

作成するニュースリストは以下のような特徴を持ちます。

- 画面サイズが小さい時は 投稿日・カテゴリーが横並びで、その下に記事タイトル
- 画面サイズが大きい時は、3つの要素が横並びで、各要素の配置位置が揃っている

具体的な例を紹介します。

```css
.news-list {
  display: grid;
  gap: var(--space--6) var(--space--2);
  grid-template-columns: auto;
}

.news-list__item {
  display: grid;
  row-gap: var(--space--2);
}
.news-list__meta {
  display: flex;
  align-items: center;
  gap: var(--space--2);
}

.news-list__time {
  font-size: var(--font-size--xs);
}
.news-list__category {
  line-height: 1.2;
  font-size: var(--font-size--xs);
  padding: var(--space--1) var(--space--2);
  border-radius: 2px;
  text-align: center;
  color: #fff;
  background-color: #000;
}

/* 広いサイズ */
@media (min-width: 768px) {
  .news-list {
    grid-template-columns: auto auto 1fr;
  }

  .news-list__item {
    grid-column: 1 / -1; /* 親の横幅いっぱいまで広げる */
    grid-template-columns: subgrid; /* 親のグリッドラインを継承した3カラムレイアウト */
  }
  .news-list__meta {
    /*   flexからgridへ切り替え   */
    display: grid;
    grid-template-columns: subgrid; /* さらにグリッドラインを継承 */
    grid-column: 1 / span 2;
  }
}
```

```html
<div class='news-list'>
  <div class='news-list__item'>
    <div class='news-list__meta'>
      <div class='news-list__time'>2025年1月1日</div>
      <div class='news-list__category'>お知らせ</div>
    </div>
    <div class='news-list__title'>1つめのニュースのタイトル。</div>
  </div>
  <div class='news-list__item'>
    <div class='news-list__meta'>
      <div class='news-list__time'>2025年5月15日</div>
      <div class='news-list__category'>コラム</div>
    </div>
    <div class='news-list__title'>2つめのコラム記事のタイトルがここに入ります。</div>
  </div>
  <div class='news-list__item'>
    <div class='news-list__meta'>
      <div class='news-list__time'>2025年12月10日</div>
      <div class='news-list__category'>IR</div>
    </div>
    <div class='news-list__title'>3つめのIR記事のタイトルがここに入ります。</div>
  </div>
</div>
```

このレイアウトを組むには、画面サイズが小さい時のために投稿日とカテゴリーを同じグループ要素としてラップしておく必要があります。ポイントは以下の3つです。

- `.news-list`で「日付・カテゴリー・タイトル」の3カラムレイアウトを定義する
- `.news-list__item`に`grid-template-columns: subgrid;`を指定し、親の3カラム構造をそのまま継承する
- `.news-list__meta` も `grid-template-columns: subgrid;` で孫要素まで同じカラム位置を共有し、「日付＋カテゴリー」と「タイトル」の位置をきれいに揃える

細かなプロパティごとの挙動はやや込み入るため、ここでは説明を割愛しています。実際にコードを動かしながら、「どの階層でsubgridを指定しているか」を追ってみると理解しやすくなります。

<iframe height="300" style="width: 100%;" scrolling="no" title="book 1- grid - subgrid" src="https://codepen.io/ddryo-the-encoder/embed/raeOerY/4f25c926a9e93ccc06e767172394d643?default-tab=html%2Cresult" frameborder="no" loading="lazy" allowtransparency="true">
  See the Pen <a href="https://codepen.io/ddryo-the-encoder/pen/raeOerY/4f25c926a9e93ccc06e767172394d643">book 1- grid - subgrid</a> by ddryo (<a href="https://codepen.io/ddryo-the-encoder">@ddryo-the-encoder</a>) on <a href="https://codepen.io">CodePen</a>.
</iframe>


## まとめ

- **subgridでカードの高さと情報位置を揃えられる**: タイトルや抜粋文の長さが違っても画像や日付の位置が揃う。
- **親グリッドの行列を継承してレイアウトを統一できる**: 親の行トラックをsubgridで共有し、カード間の配置ルールを揃えられる。
- **gap継承で余白とリズムを全カードで統一できる**: gapを共有することで行間やカード間のリズムが整い、一覧全体が見やすくなる。
