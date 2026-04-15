# @lism-css/ui

[English](./README.md) | [日本語](./README.ja.md)

[![npm version](https://img.shields.io/npm/v/@lism-css/ui.svg)](https://www.npmjs.com/package/@lism-css/ui)
[![License: MIT](https://img.shields.io/npm/l/@lism-css/ui.svg)](https://github.com/lism-css/lism-css/blob/main/LICENSE)

## What is @lism-css/ui?

`@lism-css/ui` is an interactive UI component library built on top of [lism-css](https://www.npmjs.com/package/lism-css). It provides React and Astro components for frequently used UI patterns such as accordions, modals, and tabs.

All components are based on the layout system and design tokens of Lism CSS.

## Available Components

| Component | Description |
|-----------|-------------|
| **Accordion** | Expandable content sections using native `<details>` element |
| **Alert** | Contextual feedback messages with icon and color variants |
| **Avatar** | Circular image display for user profiles |
| **Badge** | Small status labels and counters |
| **Button** | Styled button with variants and sizes |
| **Callout** | Highlighted content blocks for tips, warnings, and notes |
| **Chat** | Chat bubble UI for conversational layouts |
| **Details** | Styled native `<details>` / `<summary>` element |
| **Modal** | Dialog overlay with backdrop |
| **NavMenu** | Navigation menu with nested item support |
| **ShapeDivider** | Decorative section dividers with SVG shapes |
| **Tabs** | Tabbed content panels |
| **DummyText** | Placeholder text for prototyping |
| **DummyImage** | Placeholder image for prototyping |

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

For **Astro**, also add the following to `astro.config.js`:

```js
export default defineConfig({
  vite: {
    ssr: {
      noExternal: ['lism-css', '@lism-css/ui'],
    },
  },
});
```

## Usage

### React

```jsx
import { Accordion, Modal, Tabs, Button } from '@lism-css/ui/react';
import { Stack, Text } from 'lism-css/react';

<Stack g="20">
  <Accordion>
    <Accordion.Heading>FAQ Question</Accordion.Heading>
    <Accordion.Body>
      <Text>Answer content goes here.</Text>
    </Accordion.Body>
  </Accordion>

  <Button href="/about" variant="outline">
    Learn More
  </Button>
</Stack>
```

### Astro

```astro
---
import { Accordion, Modal, Tabs, Button } from '@lism-css/ui/astro';
import { Stack, Text } from 'lism-css/astro';
---

<Stack g="20">
  <Accordion>
    <Accordion.Heading>FAQ Question</Accordion.Heading>
    <Accordion.Body>
      <Text>Answer content goes here.</Text>
    </Accordion.Body>
  </Accordion>

  <Button href="/about" variant="outline">
    Learn More
  </Button>
</Stack>
```

## Relationship to lism-css

Lism CSS is organized into two packages:

- **[lism-css](https://www.npmjs.com/package/lism-css)** — Core CSS framework providing layout components (Box, Flex, Stack, Grid, etc.), design tokens, property classes, and the responsive system.
- **@lism-css/ui** (this package) — Interactive UI components (Accordion, Modal, Tabs, etc.) that extend the core layout system with ready-to-use interface patterns.

You need `lism-css` installed to use `@lism-css/ui`.

## AI Tool Integration

An MCP server is available for AI coding tools to reference Lism CSS documentation:

```bash
claude mcp add lism-css -- npx -y @lism-css/mcp
```

For more setup options, see the [lism-css README](https://www.npmjs.com/package/lism-css#ai-tool-integration).

## Documentation

For full documentation, visit [lism-css.com](https://lism-css.com).

## License

MIT
