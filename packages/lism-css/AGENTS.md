# CSS

## ファイル構造

ソース: /src/scss/
出力: /dist/css

## 生成ファイル

-   all.css
-   all_with_layout.css

## 設定ファイル

-   `_setting.scss`: Propクラス（`.-{prop}:{val}`）として出力したいプロパティと値のペア設定一覧
-   `_query.scss`: コンテナクエリのブレイクポイント定義など
-   `_auto_output.scss`:　上記二つをもとにスタイルを出力する処理

この auto_outoput を props/index.scss で読み込んでいる。
