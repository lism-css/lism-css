/**
 * 見出しに ID を付け、h2 / h3 の末尾に `#` アンカーリンクを追加する HAST プラグイン。
 *
 *   <h2 id="slug">見出し<a class="c--headingAnchor" aria-label="Link to this section" href="#slug"></a></h2>
 *
 * Astro の見出し ID プラグインはユーザープラグインより後に走るため、アンカーの href を組み立てる時点では
 * 見出しに id が無い。同じ github-slugger と同じテキスト抽出で先に id を付けておくと、Astro 側はそれを
 * そのまま採用し、`render()` の headings.slug とも一致する。
 * "#" は CSS の ::after で描く。アンカーにテキストを入れると Astro 側の見出しテキスト抽出に混入する。
 */
import { defineHastPlugin } from 'satteri';
import GithubSlugger from 'github-slugger';

const ANCHOR_TAGS = ['h2', 'h3'];

// プラグインファクトリ: 文書ごとに slugger を作り直し、連番が文書間で引き継がれないようにする
export const headingAnchor = () => {
  const slugger = new GithubSlugger();

  return defineHastPlugin({
    name: 'heading-anchor',
    element: {
      filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      visit(node, ctx) {
        let id = node.properties?.id;
        if (typeof id !== 'string') {
          id = slugger.slug(ctx.textContent(node));
          ctx.setProperty(node, 'id', id);
        }
        if (!ANCHOR_TAGS.includes(node.tagName)) return;
        ctx.appendChild(node, {
          type: 'element',
          tagName: 'a',
          properties: { class: 'c--headingAnchor', 'aria-label': 'Link to this section', href: `#${id}` },
          children: [],
        });
      },
    },
  });
};
