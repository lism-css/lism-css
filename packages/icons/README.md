基準日: 2026-09-10・コミットd8b6ba43

# Lism Icons

Lism CSSで使用するアイコンの制作データと、SVGの書き出し・検証を行うスクリプトを管理しています。

収録アイコンの多くは、[Phosphor Iconsの制作データ](https://github.com/phosphor-icons/core/tree/main/raw)をコピーし、Lism CSS向けにサイズや点の描画方法などを調整したものです。また、`menu-2`などのオリジナルアイコンも追加しています。

Phosphor Icons由来のデータはMITライセンスに基づいて使用しています。アイコン名とウェイトの対応は[scripts/mapping.json](./scripts/mapping.json)、著作権表示とライセンス全文は[THIRD_PARTY_LICENSES](./THIRD_PARTY_LICENSES)をご覧ください。

アイコンの編集元は`design/lism-icons.ai`です。追加や修正はIllustratorで行い、SVGを書き出してください。書き出したSVGを変更する場合も、Illustratorファイルを編集してから再度書き出します。

`design/raw/`には、制作開始時に使用した元のSVGを保存しています。これらは初期形状を再現するための資料で、その後Illustratorで加えた変更は含まれません。パッケージのビルドには、編集元のIllustratorファイルから書き出したSVGを使用します。

書き出しや初期形状の再作成については[スクリプトの使い方](./scripts/README.md)、Illustratorの自動操作については[自動化の注意点](../../documents/illustrator-automation.md)で説明しています。
