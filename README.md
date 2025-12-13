<h1 align="center">
  <a href="https://lism-css.com" target="_blank">
    Lism CSS
  </a>
</h1>

<p align="center">
    <a href="https://www.npmjs.com/package/lism-css"><img src="https://img.shields.io/npm/v/lism-css.svg" alt="Latest Release"></a>
    <a href="https://github.com/lism-css/lism-css/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/lism-css.svg" alt="License"></a>
</p>

Lism CSS is a lightweight and modern CSS framework. Based on a unique CSS Methodologies, it combines layout modules, utility classes, and design tokens to provide flexible and consistent styling.

## Documentation

For full documentation, visit [lism-css.com](https://lism-css.com).

## Features

- Lightweight & Simple: Starts from ~30KB, no build process required. Available via CDN or npm.
- Clear Layered Structure: Using `@layer`⁠ for maintainability.
- Layout-First Approach: Build efficiently with layout modules and utility classes.
- Design Tokens: Centrally manage colors, spacing, typography, etc. with CSS variables.
- Flexible Utility Classes: `-{prop}:{value}`⁠ syntax.
- Unique Responsive System: Combine CSS variables, classes, and container queries for parent-based responsiveness.
- Supports React/Astro: Dedicated components boost development efficiency.

## Installation

CDN:

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css/dist/css/main.css" rel="stylesheet" />
```


npm:
```bash
npm i lism-css
```

```js
import "lism-css/main.css";
import { Box, Stack, Flex, Grid,... } from "lism-css/react";
```


## Main Class Examples
- Layout State: `is--container`, `l--flow`, `is--layer`, etc.
- Layout Module: `⁠l--flex⁠`, `⁠l--grid⁠`, `⁠l--center⁠`, `⁠l--columns⁠`, `⁠l--withSide⁠`, etc.
- Prop Class: `⁠-p:20`, `⁠-bgc:base-2`⁠, `⁠-fz:l⁠`, etc.
- Decoration Utility: `⁠u-cbox⁠`, etc.



## Responsive Example

HTML: 
```html
<div class="-p:20 -p_sm -p_md" style="--p_sm:var(--s30);--p_md:var(--s40)">
  <p>Example</p>
</div>
```

JSX:
```jsx
<Lism p={['20', '30', '40']}>
  <p>Example</p>
</Lism>
```


## Playgrounds 

https://github.com/lism-css/lism-playgrounds


## Community

For feedback or questions, [Join the Lism CSS Discord Server](https://discord.gg/6PMcFHvc4h)

