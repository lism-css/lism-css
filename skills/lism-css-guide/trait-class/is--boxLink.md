# is--boxLink / `<BoxLink>`

ボックス全体をクリック可能なリンク領域にするクラス。

## 基本情報

- クラス名: `is--boxLink`
- コンポーネント: `<BoxLink>`
- SCSSソース: https://raw.githubusercontent.com/lism-css/lism-css/main/packages/lism-css/src/scss/trait/is/_boxLink.scss
- ドキュメント（人間向け）: https://lism-css.com/docs/trait-class/is--boxLink/

## 専用Props

| Prop | 説明 |
|------|------|
| `href` | リンク先を指定。`href` があれば `<BoxLink>` 自体が `<a>` タグに、なければ `<div>` として出力される（**特殊挙動**） |

通常の `<Lism>` エイリアスコンポーネントと異なり、`<BoxLink>` だけは `href` 指定の有無で出力タグが動的に切り替わります。

## Usage

BoxLink には主に2通りの使い方があります。

### パターン1: `<BoxLink>` 自身を `<a>` にする

`href` を指定すると `<BoxLink>` 自体が `<a>` タグとして出力されます。シンプルなカード全体リンクに最適。

```jsx
<BoxLink href="/article/1" p="30" bgc="base" bd bdrs="30" hov="-o">
  <Group fz="xl" fw="bold">Heading text</Group>
  <Text lh="s" my-s="15">記事の抜粋テキスト...</Text>
  <Group fz="s" c="text-2" ta="right" lh="1" my-s="10">
    MORE →
  </Group>
</BoxLink>
```

```html
<a class="is--boxLink -hov:-o -p:30 -bgc:base -bd -bdrs:30" href="/article/1">
  <p class="-fz:xl -fw:bold">Heading text</p>
  <p class="-c:text-2 -lh:s -my-s:15">記事の抜粋テキスト...</p>
  <p class="-fz:s -c:text-2 -ta:right -lh:1 -my-s:10">MORE →</p>
</a>
```

### パターン2: `<div>` + 内部に `is--coverLink`

`<BoxLink>` は `<div>` にしたまま、内部のアンカー要素に `is--coverLink` クラスを付けてボックス全体をクリック可能にします。**BoxLink 内部にさらに別のリンクを配置したい場合はこちらを選ぶこと**。

```jsx
<BoxLink as="section" p="30" bgc="base" bd bdrs="30" hasTransition hov="-bxsh">
  <Group fz="xl" fw="bold">
    <Link isCoverLink href="/article/1">
      Heading link text
    </Link>
  </Group>
  <Text c="text-2" lh="s" my-s="15">記事の抜粋テキスト...</Text>
  <Group my-s="10">
    <a href="/tag/foo" className="-hov:-o">Inner Link</a>
  </Group>
</BoxLink>
```

```html
<div class="is--boxLink -hov:-bxsh -p:30 -bgc:base -bd -bdrs:30 has--transition">
  <div class="-fz:xl -fw:bold">
    <a class="is--coverLink" href="/article/1">Heading link text</a>
  </div>
  <p class="-c:text-2 -lh:s -my-s:15">記事の抜粋テキスト...</p>
  <div class="-my-s:10">
    <a href="/tag/foo" class="-hov:-o">Inner Link</a>
  </div>
</div>
```

## Opt-in スタイル

### Tabキーフォーカス時のアウトラインをボックス全体に広げる

パターン2 の場合、デフォルトでは Tab フォーカス時のアウトラインがリンクテキスト部分のみに表示されます。ボックス全体に広げたい場合は以下のCSSを追記してください。

```css
@supports selector(:has(*)) {
  .is--boxLink:has(.is--coverLink:focus-visible) {
    outline: auto 1px;
    outline: auto 1px -webkit-focus-ring-color;
  }
  .is--coverLink:focus {
    outline: 0;
  }
}
```

## 関連プリミティブ

- [is--container](./is--container.md) — コンテナクエリの基準要素
- [is--wrapper](./is--wrapper.md) — コンテンツ幅ラッパー
