# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the documentation site for Lism CSS, a lightweight CSS framework and component library. Built with Astro and Starlight, it provides comprehensive documentation, live demos, and code examples for the Lism CSS framework.

## Essential Commands

```bash
# Development
npm run dev          # Start dev server at localhost:4321

# Build & Preview
npm run build        # Build production site to ./dist/
npm run preview      # Preview production build locally
```

## Architecture & Key Patterns

### Project Structure

- **Documentation Content**: All docs are MDX files in `src/content/docs/`
- **Component Examples**: Interactive examples in `src/components/ex/` (React/Astro components)
- **Preview System**: Custom preview components in `src/components/Preview/` for live code demos
- **Styling**: SCSS files in `src/styles/` with custom Lism CSS implementation

### Key Component Patterns

1. **Example Components** (`src/components/ex/`):

    - Each component has its own directory with `index.jsx` (React) and/or `index.astro` files
    - Components may include component-specific styles and presets
    - Examples: Avatar, Badge, Button, Card, Chat, Timeline, etc.

2. **Preview System**:

    - `Preview.astro` wrapper for all component demos
    - `PreviewFrame.astro` provides isolated iframe for CSS testing
    - `PreviewCode.astro` shows syntax-highlighted code examples

3. **Documentation Components**:
    - `ImportPackage.astro`, `ImportSource.astro` for installation instructions
    - Custom Starlight overrides in `src/starlight/` for theme customization

### Important Configuration

- **Monorepo**: Part of a workspace, uses local `lism-css` package via `workspace:*`
- **TypeScript**: Path alias `~/*` maps to `src/*`
- **Astro Config**: Custom sidebar and locale configuration in `astro-configs/`
- **React Integration**: JSX components require `.jsx` extension and React imports

### Development Guidelines

1. **Adding Documentation**: Create MDX files in appropriate subdirectory under `src/content/docs/`
2. **Creating Examples**: Add new example components in `src/components/ex/[ComponentName]/`
3. **Styling**: Follow existing SCSS patterns in `src/styles/`, use Lism CSS utilities where possible
4. **Preview Components**: Use the existing Preview component system for interactive demos

### Testing Components

When working on component examples:

1. Use the dev server to see live changes
2. Test in the Preview iframe to ensure CSS isolation
3. Verify both React and Astro versions work correctly (if both exist)
