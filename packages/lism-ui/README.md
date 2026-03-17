# @lism-css/ui

Interactive UI components built on top of [lism-css](https://www.npmjs.com/package/lism-css).
Provides both **React** and **Astro** components.

For details, see [Documentation](https://lism-css.com/).

## Installation

```bash
npm i @lism-css/ui lism-css
```

or

```bash
pnpm add @lism-css/ui lism-css
```

> `lism-css` is a required peer dependency.

## Setup

Import the CSS as a global style:

```js
import 'lism-css/main.css';
import '@lism-css/ui/style.css';
```

## Usage

### React

```jsx
import { Accordion, Modal } from '@lism-css/ui/react';
```

### Astro

```astro
---
import { Accordion, Modal } from '@lism-css/ui/astro';
---
```

## License

MIT
