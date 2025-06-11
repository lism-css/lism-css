## Installation

For details, see [Docs](https://lism-css.com/)

### 1. Installation

```bash
npm i lism-css
```

or

```bash
pnpm add lism-css
```

### 2. Loading CSS

Please import CSS as a global style.

```js
import 'lism-css/main.css';
```

(For example, if it is Next.js, load it with `_app.js` or `layout.js`.)

For HTML sites, you can also load CSS via CDN.

```html
<link href="https://cdn.jsdelivr.net/npm/lism-css/dist/css/main.css" rel="stylesheet" />
```

### 3. Using Components

```jsx
import { Box, Text, ... } from 'lism-css/react';

// ...
<Box p='20' bgc="base-2">
	<Text fz="l">Lorem ipsum text...</Text>
</Box>
// ...
```

---

## include package

© Phosphor Icons
Website: https://phosphoricons.com/
Source: https://github.com/phosphor-icons
License: MIT License, https://opensource.org/licenses/MIT
