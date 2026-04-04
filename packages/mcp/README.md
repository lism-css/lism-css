# @lism-css/mcp

[English](./README.md) | [日本語](./README.ja.md)

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server for [Lism CSS](https://lism-css.com).
Enables AI tools (Claude Code, Cursor, etc.) to accurately reference the latest Lism CSS documentation and API.

## Available Tools

| Tool | Description |
|------|-------------|
| `get_overview` | Framework overview (architecture, design philosophy, packages, breakpoints, installation guide, CSS Layers) |
| `get_tokens` | List and filter design tokens (colors, spacing, font sizes, shadows, radii, etc.) |
| `get_props_system` | Props system reference — how React/Astro props map to CSS classes and styles. Supports reverse lookup by CSS property name (e.g. `padding` → `p`) and Prop Class notation (e.g. `-g:5`) |
| `get_component` | Component details (props, usage examples, sub-component structure). Optionally filter by package (`lism-css` or `@lism-css/ui`) |
| `search_docs` | Full-text documentation search with relevance scoring. Supports category filtering and CSS property name expansion |
| `convert_css` | Convert CSS code to lism-css props and component suggestions. Useful for migrating existing CSS to Lism CSS |

## Example Queries

- "What is the basic architecture of Lism CSS?" → `get_overview`
- "Show me the spacing tokens" → `get_tokens(category: "spacing")`
- "What do shorthand props like `p` or `fz` map to?" → `get_props_system(prop: "p")`
- "What does the class `-g:5` mean?" → `get_props_system(prop: "-g:5")`
- "What CSS property does `fz` correspond to?" → `get_props_system(prop: "font-size")`
- "How do I use the Accordion component?" → `get_component(name: "Accordion")`
- "Show me only UI components" → `get_component(name: "Accordion", package: "@lism-css/ui")`
- "How does responsive design work?" → `search_docs(query: "responsive")`
- "Search only guide docs" → `search_docs(query: "responsive", category: "guide")`
- "Convert `display: flex; gap: 1rem;` to Lism" → `convert_css(css: "display: flex; gap: 1rem;")`

## Setup

### Claude Code

```bash
claude mcp add lism-css -- npx -y @lism-css/mcp
```

### Cursor

`.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "npx",
      "args": ["-y", "@lism-css/mcp"]
    }
  }
}
```

### Windsurf

`.windsurf/mcp.json`:

```json
{
  "mcpServers": {
    "lism-css": {
      "command": "npx",
      "args": ["-y", "@lism-css/mcp"]
    }
  }
}
```

### VS Code (GitHub Copilot)

`.vscode/mcp.json`:

```json
{
  "servers": {
    "lism-css": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@lism-css/mcp"]
    }
  }
}
```
