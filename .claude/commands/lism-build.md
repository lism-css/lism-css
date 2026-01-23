# Lism CSS Build

lism-css パッケージで lint、build、test を順番に実行してください。

## 実行手順

1. **lint 実行**: `cd packages/lism-css && pnpm lint:style` を実行
2. **build 実行**: lint が成功したら `pnpm build` を実行（同ディレクトリで継続）
3. **test 実行**: build が成功したら `pnpm test` を実行（同ディレクトリで継続）

## 注意事項

- 各ステップの実行結果を報告してください
- エラーが発生した場合は、エラー内容を確認して対応を提案してください
- 前のステップが失敗した場合は、次のステップに進まずエラー内容を報告してください
