# 例: CSS束 → Property Class化

[`checklist.md`](../references/checklist.md) Pass4の実例です。`.c--*`のCSSブロックを、「Property Class/Propsへ移す宣言」と「CSSにしか書けない宣言」に分けます。**空になっても`c--*`クラス名はマークアップに残します**。

---

## 例1: 装飾束を移し、擬似要素はCSSに残す

### Before

```css
.c--tag {
  font-size: var(--fz--xs);
  padding: var(--s10);
  background: var(--base-2);
  border-radius: var(--bdrs--10);
  text-transform: uppercase;
}
.c--tag::before {
  content: '#';
  opacity: 0.6;
}
```

```jsx
<span className="c--tag">{label}</span>
```

### After

```css
.c--tag {}
.c--tag::before {
  content: '#';
  opacity: 0.6;
}
```

```jsx
<span className="c--tag -fz:xs -p:10 -bgc:base-2 -bdrs:10 -tt:uppercase">{label}</span>
```

### 線引き

| 宣言 | 移動先 | 理由 |
|---|---|---|
| `font-size` / `padding` / `background` / `border-radius` / `text-transform` | Property Class | 単一要素向けの装飾束 |
| `::before { content … }` | CSSに残す | 擬似要素はProperty Class/Propsで書けない |

- `.c--tag {}`は空になるが**クラス名は残す**（コンポーネントとしての役割をソースから読めるようにする・[`antipatterns.md#property-class-で書けるのに-css-で書く`](../../lism-css-guide/antipatterns.md#property-class-で書けるのに-css-で書く)）。
- CSS変数の値（`var(--s10)`→`-p:10`など）は同一。見た目・挙動は変わらない。

---

## 例2: hoverはCSSに溜めずhov Propsへ

単純な色・影・transformのhoverは、`.c--*:hover`に書くとProperty Classやhover変数の設計と競合しやすい（[`antipatterns.md#hover-を-component-css-に書いて負ける`](../../lism-css-guide/antipatterns.md#hover-を-component-css-に書いて負ける)）。

### Before

```css
.c--card { padding: var(--s20); background: var(--base); border-radius: var(--bdrs--20); }
.c--card:hover { background: var(--base-2); }
```

```jsx
<div className="c--card">{children}</div>
```

### After

```css
.c--card {}
```

```jsx
<Box className="c--card" p="20" bgc="base" bdrs="20" hov={{ bgc: 'base-2' }}>{children}</Box>
```

### 壊さないための注意

- Beforeに`transition`が無ければ、`hov={{}}`も即時切替のまま（見た目・挙動は変わらない）。**`hasTransition`を足すとアニメーションが付き挙動が変わる**ので、意図がある時だけ別提案として⏸。
- 擬似要素・複雑な子孫セレクタを伴うhoverはCSSに残す。

---

## 例3: @media/@container内の同プロパティを移し忘れない

`.c--*`本体だけProperty Classへ移し、メディアクエリ内の同プロパティをCSSに残すと、レスポンシブ差分が二重管理になり崩れる。

### Before

```css
.c--lead { font-size: var(--fz--l); padding: var(--s20); }
@container (min-width: 600px) {
  .c--lead { font-size: var(--fz--xl); padding: var(--s30); }
}
```

### After（レスポンシブProps化）

```jsx
<Text className="c--lead" fz={['l', 'xl']} p={['20', '30']}>{lead}</Text>
```

`.c--lead`のCSSは空にできる。レスポンシブ値は配列Propsへまとめ、`@container`分を取り残さない。

### 壊さないための注意

- 配列を単一値に潰さない（`p={['20','30']}`→`-p:20`にしない・[`common-mistakes.md`](../references/common-mistakes.md)）。
- レスポンシブProps（コンテナクエリ既定）には祖先`isContainer`が必要（Pass8）。Beforeが`@container`運用なら、その祖先コンテナを引き継ぐ。
- `@media`運用で`isContainer`を持たない設計だった場合は、安易にコンテナクエリへ移さず⏸で確認する。
