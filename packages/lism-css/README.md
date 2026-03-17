# lism-css

A lightweight, layout-first CSS framework for websites.
Provides CSS utilities, design tokens, and React / Astro layout components.

For details, see [Documentation](https://lism-css.com/).

## Installation

```bash
npm i lism-css
```

or

```bash
pnpm add lism-css
```

## Setup

Import CSS as a global style.

```js
import 'lism-css/main.css';
```

For Next.js, load it in `layout.js` (App Router) or `_app.js` (Pages Router).

For HTML sites, you can load CSS via CDN:

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css/dist/css/main.css" rel="stylesheet" />
```

## Usage

### React

```jsx
import { Box, Flex, Stack, HTML } from 'lism-css/react';

<Stack g="20">
  <Box p="20" bgc="base-2">
    <HTML.p fz="l">Lorem ipsum text...</HTML.p>
  </Box>
</Stack>
```

### Astro

```astro
---
import { Box, Flex, Stack, HTML } from 'lism-css/astro';
---

<Stack g="20">
  <Box p="20" bgc="base-2">
    <HTML.p fz="l">Lorem ipsum text...</HTML.p>
  </Box>
</Stack>
```

## UI Components

For interactive UI components (Accordion, Modal, Tabs, etc.), see [@lism-css/ui](https://www.npmjs.com/package/@lism-css/ui).

## Credits

- [Phosphor Icons](https://phosphoricons.com/) — MIT License ([source](https://github.com/phosphor-icons))

## License

MIT
