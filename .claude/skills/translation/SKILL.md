---
name: translation
description: ドキュメントの翻訳、英語版作成、i18n対応
---

# 翻訳作業ガイド

## ディレクトリ構造

```
src/content/
├── ja/            # 日本語記事（root 言語）
└── en/            # 英語記事（非 root 言語）
```

## 翻訳手順

1. **元ファイルを確認**: `src/content/ja/{slug}.mdx`
2. **翻訳先を作成**: `src/content/en/{slug}.mdx`（同じディレクトリ構造を維持）
3. **Frontmatter を翻訳**: `title`, `description` を英語に
4. **本文を翻訳**: Markdown 構文は維持、コード例もそのまま維持

## 注意事項

- 未翻訳ページは ja にフォールバックされる
- ファイル名（slug）は変更しない
- コンポーネント名（`<Callout>`, `<Preview>` など）やHTMLタグ、CSSプロパティなどは翻訳しない。
- コード例内のコメントは翻訳してもよい

## URL 構造

| 言語 | URL |
|------|-----|
| ja（root） | `/docs/xxx/` |
| en | `/en/docs/xxx/` |

## 翻訳チェック

翻訳後は以下を確認：
- Frontmatter の必須フィールド（title, description, date）
- リンク先が正しいか（言語プレフィックス）
- コードブロックが崩れていないか
