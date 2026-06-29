---
title: 'Inside the blog-astro-minimal template'
excerpt: A summary of the minimal Astro blog template bundled with the Lism CSS repository.
date: '2026-04-10'
tags: [Astro, Lism CSS, Template]
---

`templates/blog/astro/minimal/` is a minimal Astro blog template built with Lism CSS and `@lism-css/ui`. It includes only a post list, post detail, per-tag list, About, sitemap, and robots.txt. If you need monthly archives, categories, a table of contents, or search, start from a different template instead.

## Dependencies

On top of Astro and Lism CSS / `@lism-css/ui`, it adds `@astrojs/sitemap`. `astro.config.mjs` only sets up the sitemap integration and the `@` → `/src` alias. Posts are `.md` files.

## Directory structure

```
src/
├── components/      # Astro components
├── config/site.ts   # Site config (nav, social links, etc.)
├── content.config.ts
├── layouts/         # Layout / ArchiveLayout
├── lib/             # Tag helpers
├── pages/           # Routing
├── posts/           # Post Markdown (flat layout)
└── styles/global.css
```

## Posts are organized by tags only

Posts are organized with the `tags` field in the frontmatter. There is no hierarchy such as categories. Per-tag archives are generated at `/tags/{tag}/`, and the footer holds a `TagCloud` that lists every tag.

```yaml
---
title: My morning routine
date: '2026-03-28'
tags: [habits, lifestyle]
---
```

## Routing

| Path | Contents |
| --- | --- |
| `[...page].astro` | Top (all posts) + pagination |
| `posts/[slug].astro` | Post detail |
| `tags/[tag]/[...page].astro` | Per-tag list + pagination |
| `about.astro` | About |
| `robots.txt.ts` | robots.txt |
| `404.astro` | 404 |

The post filename (without extension) is used directly as the URL slug. The number of posts per page is `siteConfig.pagination.postsPerPage` (6 by default).

## Sitemap

`@astrojs/sitemap` generates the sitemap at build time. The `site` value in `astro.config.mjs` is the base for the sitemap and robots.txt, so change it to your deployment domain before publishing.

## Layout

- `Layout.astro` — stacks Header / Main / Footer vertically with `<Stack min-h="100svh">` inside a `<Container>`.
- `ArchiveLayout.astro` — a list layout built on `Layout` that wraps the body in `<Group isWrapper isContainer hasGutter><Stack g="50">`.
- The post detail (`posts/[slug].astro`) is a simple layout that places the post header (Date, Heading, tags), the body (`Flow.c--articleBody`), and the previous/next post navigation (`ArticleNav`) inside `<Group as="article" isWrapper isContainer hasGutter>`. It has no share buttons or table of contents.

## Where to customize

- `src/config/site.ts` — site name, tagline, navigation, social links, copyright, and so on
- `src/styles/global.css` — overrides for Lism CSS tokens. By default only `--base` and `--lts--xl` are enabled; the rest are left as commented-out candidates.
- Typography for the post body (`blockquote`, `pre`, `table`, etc.) is written as descendant selectors under `.c--articleBody` in `@layer lism-custom`, because you can't attach classes directly to elements generated from Markdown.
