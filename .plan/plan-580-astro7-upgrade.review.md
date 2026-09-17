## Plan Review (by GPT-6)

対象: `.plan/plan-580-astro7-upgrade.md`

### 判定: Ready

### Blocking

なし。依存・設定・plugin・Markdown変換・目次・docs-mdの実装と公式仕様を照合した。PR2は記載どおり、本実装前にspikeでCalloutの変換方式を確定する前提。

### Advisory

1. **PR1のdist比較は、ランダムID以外の差分も分類して判定する。** RustコンパイラではCSSの色表記やURLの引用符が変わり得ると[公式移行ガイド](https://docs.astro.build/en/guides/upgrade-to/v7/#css-output-differences)に明記されている。Viteも更新するため、「差分がランダムIDだけ」を必須にすると正常な更新でも未完了になる。全件diffは維持し、本文・DOM・CSSの意味・リンク先の維持を合格条件にして、生成アセットのハッシュや同値の表記差は根拠付きで受容できるようにするとよい。
2. **FOUC検証は、Astro/Viteが収集するCSSを対象にする。** `apps/site/src/components/Preview/Preview.astro`は、`css`指定時に`<style set:html={scopedCss}>`を本文側へ出力する。すべてのstyleを数えると意図したインラインCSSまで失敗扱いになる。`data-vite-dev-id`等で対象CSSを識別し、必要なCSSがheadに存在することと、それがbodyへ漏れないことを確認する。別ページの確認も、各ページを起動後の最初のリクエストにするとコールドスタート条件を維持できる。
3. **CalloutのHAST代替案は、directive情報の引き継ぎとCSSもspike対象にする。** Sätteriの[既定変換はdirectiveノードを破棄する](https://satteri.bruits.org/docs/features/#directives)ため、HAST段階で組み立てる場合もMDAST側から種類・タイトル・本文を残す手段が必要になる。また、`apps/site/src/components/mdx/Callout.astro`にはscoped CSSがある。色・アイコンの共有に加え、HAST生成要素へのスタイル適用方法まで成立条件に含めるとよい。
