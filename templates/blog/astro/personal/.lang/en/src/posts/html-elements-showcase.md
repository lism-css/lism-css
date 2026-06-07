---
title: HTML elements showcase
excerpt: A placeholder post that lays out the basic HTML elements you'll see in blog posts — headings, paragraphs, lists, blockquotes, code, tables, and more — for checking their styles.
date: '2026-04-28'
tags: [HTML, Design]
---

This post is placeholder content for checking how the blog body is styled. It lays out a comprehensive set of the typical HTML elements generated from Markdown.

It's meant for checking, all in one place, how this template's default CSS applies to headings, paragraphs, lists, blockquotes, code, tables, and more.

## Paragraphs and inline elements

This is a normal paragraph of text.

Within a paragraph you can mix decorations such as **bold (strong)**, *italic (em)*, inline code (`code`), [links (a)](#), and ~~strikethrough (del / s)~~.


Post content is rendered directly inside `l--flow`. The spacing between elements is managed with margins, and the space above headings is larger than usual.

A longer placeholder paragraph: Lorem ipsum dolor sit amet. Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut. Labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### Combining emphasis

Check nested decorations too, such as **`code` inside bold text**, *a [link](#) inside italics*, **a [link](#) inside bold text**, and [`code` inside a link](/#).

## Lists

### Unordered list (ul)

- First item
- Second item
- Item with nesting
  - Child item A
  - Child item B
    - Grandchild item
- Last item

### Ordered list (ol)

1. Step one
2. Step two
3. Step with nesting
   1. Substep A
   2. Substep B
4. Step four


## Blockquote

> A short, single-sentence quote.

> Let's also check a quote that spans multiple lines.
>
> When it crosses paragraphs, check that the quote as a whole has proper spacing and that the paragraphs inside the block aren't too tightly packed.
>
> *— Source name*

## Code

Inline: `const value = 42;`

Here are some code blocks.

```ts
// TypeScript sample
type Post = {
  title: string;
  tags: string[];
  publishedAt: Date;
};

export function formatTags(post: Post): string {
  return post.tags.map((t) => `#${t}`).join(' ');
}
```

```css
/* CSS sample */
.c--articleBody {
  font-size: var(--fz--s);
  line-height: 1.95;

  & h2 {
    font-size: var(--fz--xl);
    border-block-end: 1px solid var(--divider);
  }
}
```

```bash
# Shell command sample
pnpm install
pnpm dev
```

## Tables

A plain table
| Element | Purpose | Notes |
| --- | --- | --- |
| `h2` | Major heading | Underlined |
| `p` | Paragraph | Justified |
| `blockquote` | Quote | Left border + italic |
| `pre` / `code` | Code | Monospace font |

Right-aligned numbers

| Plan | Monthly | Yearly |
| --- | ---: | ---: |
| Free | $0 | $0 |
| Pro | $12 | $120 |
| Team | $99 | $1,188 |

## Horizontal rule

Check how the `<hr>` used between sections looks.

---

If the paragraph spacing before and after the rule isn't broken, you're good.

## Images

![Placeholder image](https://placehold.jp/1200x600.png)

![Placeholder image](https://placehold.jp/300x200.png)

This text is here to check the spacing between an image and the paragraph that follows it.

## Summary

Once you've confirmed that all the elements on this page render without issues, you're ready to publish your blog.
