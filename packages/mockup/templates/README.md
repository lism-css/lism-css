# Lism Mockup — data contract

This directory is a **data directory** for `@lism-css/mockup`. You only write data
files here; the preview app (viewer) ships with the CLI.

> **Read this with the `lism-css-guide` skill.**
> This file describes *what files this directory may contain*. How to actually
> write Lism CSS markup — which primitive to pick, which token to use, which
> Property Class exists — is covered by the `lism-css-guide` skill, and using it
> is required. Install every Lism skill with `npx lism-cli skill add`.
> If the skill is not available, mirror the sample pages in `pages/` and check
> <https://lism-css.com/en/docs/>.

## Commands

```bash
npx @lism-css/mockup check .   # validate this directory (agents: use this)
npx @lism-css/mockup dev .     # start the preview server (humans, in a browser)
```

`check` is the self-verification step. `dev` starts a long-running server, so
run it in the background or ask the user to run it — an agent must never block
on it.

## Files

```
.
├── mockup.config.json      # required — schema version + page metadata
├── tokens.json             # optional — design token overrides
├── pages/                  # required — one file per screen
│   ├── landing.jsx
│   └── admin/
│       ├── dashboard.jsx
│       ├── settings.jsx
│       └── settings.css  # page-scoped CSS, imported by settings.jsx
├── README.md             # this file
└── AGENTS.md
```

### `pages/*.jsx` / `pages/*.tsx`

- One screen per file, `export default` a React component that takes no props.
- **Page id** = the path under `pages/` without the extension
  (`pages/admin/dashboard.jsx` → `admin/dashboard`). Sub-directories are allowed.
- Adding a file is enough — pages are discovered from disk, not from
  `mockup.config.json`. Two files with the same id (`foo.jsx` + `foo.tsx`) is an error.
- `.tsx` is accepted but **not type-checked** (types are stripped, not verified).

Allowed inside a page:

- Local UI state (`useState`) and event handlers.
- Static sample data defined in the file.

Not allowed: API calls, authentication, persistence, business logic. A mockup is a
picture of a screen, not an app.

### `mockup.config.json` (required)

```json
{
  "schemaVersion": 1,
  "title": "Acme Console Mockup",
  "pages": {
    "landing": { "label": "Landing", "category": "Marketing", "order": 10 }
  }
}
```

- `schemaVersion` must be `1`.
- `title` (optional) is shown in the viewer.
- `pages` (optional) only overrides display metadata: `label`, `category`, `order`.
  Default order is the page id, alphabetically.
- Referencing a page id that does not exist on disk is an error (it usually means
  a typo or a leftover entry). Unknown top-level keys are an error too.

### `tokens.json` (optional)

Lism config compatible token overrides:

```json
{
  "color": { "brand": "#2f6f5e", "success": "oklch(62% 0.14 152)" },
  "space": { "60": "calc(var(--s-unit) * 12)" }
}
```

- Only token groups that exist in Lism CSS (`color`, `space`, `fz`, `bdrs`,
  `bxsh`, …) may appear.
- **New keys may only be added under `color`.** Every other group accepts value
  overrides of existing keys only.
- Violations stop `dev` and `check` with a non-zero exit code — they are never
  warnings.

**New color keys have no Property Class.** `-bgc:canvas` does not exist, so use
them as component props (`<Group bgc="canvas">`, `<Icon c="success">`) or as a
CSS variable (`var(--success)`). See `pages/landing.jsx` and
`pages/admin/settings.css` for both forms.

## Imports

Bare imports are limited to these packages (only paths they really export):

| Package | Example |
| --- | --- |
| `react` / `react-dom` | `import { useState } from 'react'` |
| `lism-css` | `import { Stack, Group } from 'lism-css/react'` |
| `@lism-css/ui` | `import { Button } from '@lism-css/ui/react/Button'` |
| `lucide-react` | `import { Check } from 'lucide-react'` |

Note that `@lism-css/ui` has no root export: import each component from
`@lism-css/ui/react/<Component>`.

Relative imports must stay inside this directory and point at `.jsx`, `.tsx`,
`.css` or an image (`.png` / `.jpg` / `.jpeg` / `.gif` / `.svg` / `.webp`).
Absolute paths, `/@fs/` paths and `../` escapes are rejected.

## What `check` does and does not guarantee

`check` verifies the schema of `mockup.config.json` and `tokens.json`, the import
rules above, and that every page bundles (syntax, unresolved imports, transform
errors). It does **not** render the pages, so a component that throws while
rendering is only caught by opening `dev` in a browser. "check passed" is not the
same as "the screen looks right".

Pages are plain JSX, so they run as ordinary code. Only run mockups you trust.

## Requirements

Node.js `^20.19.0 || >=22.12.0`.
