# l--frame / `<Frame>`

直下のメディア要素（`img`, `video`, `iframe`）を自身のサイズにフィットさせて表示するクラス。アスペクト比固定のメディア枠を簡単に作れます。

公式ドキュメント（使い方・コード例）: https://lism-css.com/docs/primitives/l--frame.md

## 既定の挙動

- `overflow:hidden`を既定で持ちます。通常`ov="hidden"`は足しません。
- 直下の`img`/`video`/`iframe`を`display:block;width:100%;height:100%;object-fit:cover`でフレームにフィットさせます。
- 直下メディアへ`w`/`h`/`object-fit:cover`を重ねないでください。`object-fit:contain`や`object-position`など既定と違う意図がある場合だけ追加します。

## 専用Props

| Prop | 説明 |
|------|------|
| `ar` | フレームのアスペクト比を指定（`16/9` など）。`ar` 自体はどのコンポーネントにも指定できる汎用 CSS Prop |

## 関連プリミティブ

- [is--layer](../trait-class/is--layer.md) — `l--frame` 内のオーバーレイ配置に使用
- [l--center](./l--center.md) — フレーム内でテキストを中央配置する時に組み合わせる
- [a--icon](./a--icon.md) — アイコン画像の表示（`src` 指定）
