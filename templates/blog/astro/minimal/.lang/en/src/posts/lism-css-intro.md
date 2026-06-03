---
title: Lism CSS overview
excerpt: Lism CSS is a lightweight CSS framework that brings together @layer-based layer management, design tokens, property classes, layout primitives, and React/Astro components. This post walks through its main building blocks.
date: '2026-04-20'
tags: [Lism CSS]
---

Lism CSS is a CSS framework that combines utility classes, components, design tokens, and `@layer`-based cascade control. The `lism-css` package provides the core CSS and layout components for React and Astro, while the `@lism-css/ui` package provides UI components such as Accordion, Modal, Tabs, and Button.

Here we walk through the main layers that make up Lism CSS, one at a time.

## CSS Layers

Lism CSS styles are split across several `@layer`s, and the order in which the layers are declared determines their priority. They are stacked in the order `lism-base` → `lism-component` → `lism-utility`, so you can override styles with property classes without worrying about specificity.

When you add custom CSS, place it in whichever layer fits its purpose.

```css
@layer lism-base {
  :root {
    --base: #fbfaf7;
    --text: #1a1a1a;
    --brand: #c8553d;
  }
}

@layer lism-component {
  .c--postList > li {
    border-block-end: 1px solid var(--divider);
  }
}
```

## Design tokens

Almost every design value — colors, spacing, font sizes, line heights, letter spacing, border radii, shadows, and more — is exposed as a CSS variable. Spacing tokens range from `--s5` to `--s80` (based on the Fibonacci sequence), font sizes from `--fz--2xs` to `--fz--5xl` (based on a harmonic sequence), border radii as the `--bdrs--10` family, and colors under semantic names such as `--base` / `--base-2` / `--text` / `--text-2` / `--divider` / `--link` / `--brand` / `--accent`.

To adjust the overall tone of your site, you only need to override these variables on `:root`.

Note that `--keycolor` plays a different role from the regular color tokens: it's a variable for specifying a "base color" per box, used together with utilities such as `u--cbox`.

## Property Class

Lism provides classes that map to a single CSS property, in the form `-{prop}:{value}`. The value is a token key (`p="20"` refers to `--s20`, and `fz="s"` refers to `--fz--s`).

```html
<div class="-p:20 -bgc:base-2 -bdrs:10 -fz:s">…</div>
```

To switch values per breakpoint, add a `_{bp}` suffix. Because this is based on container queries, an ancestor element needs `is--container`.

```html
<div class="-d:none -d:flex_md">…</div>
```

## Layout primitives

Lism provides `l--{name}` classes and matching React / Astro components for layout. The most common ones:

| Component | Purpose |
| --- | --- |
| `Stack` | Vertical stacking |
| `Flex` | Horizontal row (wraps) |
| `Cluster` | Inline grouping |
| `Grid` | Grid |
| `Columns` | Responsive columns |
| `WithSide` | Two columns with a sidebar |
| `Center` | Centering |
| `Frame` | Fixed aspect-ratio frame |
| `Flow` | Flows top margins onto direct children |

```astro
---
import { Stack, Flex, Heading, Text } from 'lism-css/astro';
---

<Stack g="20">
  <Flex g="10" ai="center">
    <Heading level="2" fz="l">{title}</Heading>
    <Text fz="xs" c="text-2">{date}</Text>
  </Flex>
  <Text c="text-2">{excerpt}</Text>
</Stack>
```

## Trait classes

Lism provides classes with the `is--{name}` prefix that declare a "role".

- `is--container` — the origin for container queries
- `is--wrapper` — controls max width and inner padding
- `is--layer` — a base for stacking children with `position: absolute`
- `is--boxLink` — expands a child `<a>` into a link covering the whole block

Don't use them for state changes (such as active) or variations. Express state with `data-*` attributes, and variations with BEM modifiers in the form `c--{name}--{variant}`.

## Component classes (c--)

Define project-specific components with classes using the `c--{name}` prefix. Move any declaration you can express with a property class into the markup, and leave only CSS-only declarations — pseudo-classes, state changes, descendant selectors, and the like — in the CSS.

```html
<span class="c--tag -fz:xs -px:10 -py:5 -bgc:base-2 -bdrs:10">React</span>
```

```css
@layer lism-component {
  .c--tag:hover {
    background-color: var(--divider);
  }
}
```

## Installation

You can load just the CSS via CDN, or install it as an npm package.

```bash
pnpm add lism-css @lism-css/ui
```

```js
import 'lism-css/main.css';
```

```jsx
// React
import { Stack, Flex, Grid } from 'lism-css/react';
import { Accordion } from '@lism-css/ui/react/Accordion';
import { Modal } from '@lism-css/ui/react/Modal';
import { Tabs } from '@lism-css/ui/react/Tabs';

// Astro
import { Stack, Flex, Grid } from 'lism-css/astro';
import { Accordion } from '@lism-css/ui/astro/Accordion';
import { Modal } from '@lism-css/ui/astro/Modal';
import { Tabs } from '@lism-css/ui/astro/Tabs';
```

See the [official documentation](https://lism-css.com/en/) for details.
