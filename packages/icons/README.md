# Lism Icons

ReactとAstroで使えるSVGアイコン集です。Lism CSSへの依存はありません。


## 使い方

```sh
pnpm add @lism-css/icons
```

Reactでは`/react`から読み込みます。

```tsx
import { Home, StarHalf } from '@lism-css/icons/react';

<Home aria-label="ホーム" size={24} />
<StarHalf strokeWidth={2} aria-label="半分の星" />
```

Astroでは`/astro`から読み込みます。

```astro
---
import { Home, StarHalf } from '@lism-css/icons/astro';
---

<Home aria-label="ホーム" size={24} />
<StarHalf stroke-width={2} aria-label="半分の星" />
```

`@lism-css/icons/react/Home`や`@lism-css/icons/astro/Home`からdefault importすることもできます。名前は`star-half`→`StarHalf`、`menu-2`→`Menu2`のように変換しています。

大きさは`size`で幅・高さをまとめて指定でき、既定は`1em`です。`width`・`height`を個別に指定した場合はそちらを優先します。色は`currentColor`で周囲の文字色を引き継ぎます。線幅の既定は`1.5`で、Reactでは`strokeWidth`、Astroでは`stroke-width`で指定できます。Astroでは`strokeWidth`も受け付け、両方あれば`stroke-width`を優先します。

`StarHalf`は左半分の塗りと外周の線を組み合わせており、線幅の変更は外周に反映されます。`StarHalfFill`など名前が`Fill`で終わるアイコンは塗りだけで描かれ、線幅では太さが変わりません。

通常は装飾として読み上げ対象から外します。アイコン単体に意味を持たせる場合は`aria-label`か`aria-labelledby`を指定してください。標準のSVG属性を渡せるほか、Reactでは`ref`と子要素、Astroではslotも使用できます。

## SVGデータ

`@lism-css/icons/data`から、全アイコンの`icons`、名前の型`IconName`、コア候補の名前一覧`coreIconNames`を読み込めます。各アイコンは`viewBox`、ルート属性の`attributes`、内部マークアップの`body`を持ちます。属性名は`stroke-width`などSVGの表記です。

## 制作データとライセンス

収録アイコンの多くは、[Phosphor Iconsの制作データ](https://github.com/phosphor-icons/core/tree/main/raw)をコピーし、Lism CSS向けにサイズや点の描画方法などを調整したものです。また、`menu-2`などのオリジナルアイコンも追加しています。

Phosphor Icons由来のデータはMITライセンスに基づいて使用しています。アイコン名とウェイトの対応は[Phosphor Iconsとの対応表](https://github.com/lism-css/lism-css/blob/main/packages/icons/scripts/mapping.json)、著作権表示とライセンス全文は[THIRD_PARTY_LICENSES](./THIRD_PARTY_LICENSES)をご覧ください。

アイコンの編集元は`design/lism-icons.ai`です。追加や修正はIllustratorで行い、SVGを書き出してください。書き出したSVGを変更する場合も、Illustratorファイルを編集してから再度書き出します。

`src/svg/`には、Illustratorから書き出したSVGをそのまま保存しています。アイコンデータやコンポーネントを生成する際の入力に使用します。

`design/raw/`には、各アイコンの制作開始時に使用した元のSVGを保存しています。`star-half`は、Phosphor Icons由来の`star`に左半分の塗りを加えて作成したデータです。これらは初期形状を再現するための資料で、その後Illustratorで加えた変更は含まれません。パッケージのビルドには、編集元のIllustratorファイルから書き出したSVGを使用します。

書き出しや初期形状の再作成については[スクリプトの使い方](https://github.com/lism-css/lism-css/blob/main/packages/icons/scripts/README.md)、Illustratorの自動操作については[自動化の注意点](https://github.com/lism-css/lism-css/blob/main/documents/illustrator-automation.md)で説明しています。
