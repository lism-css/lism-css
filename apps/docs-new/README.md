# Astro Blog Project

This is a blog built with Astro, TypeScript, MDX, and Pagefind, without using Starlight.

## Features

- **Astro + TypeScript**: Core framework.
- **MDX**: Content authoring with component support.
- **Expressive Code**: Syntax highlighting for code blocks.
- **Pagefind**: Static search library.
- **OG Image Generation**: Automatically generates social media images using `satori` and `sharp`.
- **Table of Contents**: Automatically generated from headings.
- **No Tailwind**: Custom CSS using CSS variables and Grid layout.

## Project Structure

- `src/content/posts`: Blog posts (MDX).
- `src/pages`: Routes (index, posts, OG images).
- `src/components`: UI components (Header, Footer, Sidebar, TOC, Search).
- `src/layouts`: Base layout.
- `src/lib`: Utilities (TOC generation, OG image generation).
- `src/styles`: CSS files.

## Development

1. Install dependencies:

    ```bash
    pnpm install
    ```

2. Start development server:

    ```bash
    pnpm dev
    ```

3. Build for production:
    ```bash
    pnpm build
    ```
    This will also generate the search index.

## Configuration

- `astro.config.ts`: Astro configuration.
- `src/content/config.ts`: Content collections schema.
- `src/lib/expressive-code.config.ts`: Code block styling.
