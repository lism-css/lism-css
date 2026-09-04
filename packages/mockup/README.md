# @lism-css/mockup

[English](./README.md) | [日本語](./README.ja.md)

CLI for creating, validating, and previewing [Lism CSS](https://lism-css.com) mockups.

Build mockups as **data files** — one component file per screen, plus a
small config and an optional token override file. The preview app (the *viewer*)
ships inside this package, so a mockup directory needs no bundler, no
`package.json` and no dependencies of its own.

This is the same split [Zenn CLI](https://zenn.dev/zenn/articles/zenn-cli-guide)
uses for articles: the app is part of the CLI, you only own the content.

## Requirements

Node.js `^20.19.0 || >=22.12.0`.

## Usage

No installation needed:

```bash
npx @lism-css/mockup init ./mockup    # scaffold a data directory
npx @lism-css/mockup check ./mockup   # validate it (non-interactive)
npx @lism-css/mockup dev ./mockup     # start the preview server
```

Installed locally, the binary is `lism-mockup`:

```bash
pnpm add -D @lism-css/mockup
npx lism-mockup dev ./mockup
```

| Command | What it does |
| --- | --- |
| `lism-mockup init [dir]` | Copies sample pages, `tokens.json`, `mockup.config.json` and a contract guide into `dir`. Refuses to touch existing files unless `--force` is passed. |
| `lism-mockup dev [dir]` | Starts the preview dev server for browsing the screens. Long-running; meant for humans. |
| `lism-mockup check [dir]` | Validates the directory and exits non-zero on any violation. Meant for agents and CI. |

`[dir]` defaults to the current directory.

### For AI agents

1. Run `lism-mockup init <dir>` first, then read the generated `README.md`.
2. Use the [`lism-css-guide`](https://github.com/lism-css/lism-css/tree/main/skills)
   skill for the markup itself (`npx lism-cli skill add`). This package defines
   *what files exist*; the skill defines *how to write Lism CSS*.
3. Verify your own work with `lism-mockup check`. Never report a mockup as finished
   while `check` fails.
4. `lism-mockup dev` never exits. Start it in the background or let the user start
   it. Browser review is the user's job (see
   [What `check` guarantees](#what-check-guarantees)).

## Data contract

A data directory looks like this:

```
mockup/
├── mockup.config.json      # required
├── tokens.json             # optional
├── tokens.dark.json        # optional, dark values
└── pages/                  # required, at least one page
    ├── landing.jsx
    └── admin/
        ├── dashboard.jsx
        ├── settings.jsx
        └── settings.css
```

### `pages/`

Every `.jsx` / `.tsx` file under `pages/` is one screen.

- The file must `export default` a React component that takes no props.
- **Page id** = the path relative to `pages/` with the extension removed.
  `pages/admin/dashboard.jsx` → `admin/dashboard`. Sub-directories are supported
  and the id is what `mockup.config.json` and the viewer URL refer to, so a shared
  link does not depend on the discovery order.
- Screens are discovered from the file system. Adding a file is enough; there is
  no registration step (which is why a config entry can never go stale).
- Two files that produce the same id (`foo.jsx` and `foo.tsx`) are an id
  collision and stop `dev` and `check`.
- Files that are not `.jsx` / `.tsx` (for example a co-located `.css`) are not
  screens; import them from a page.
- `.tsx` is accepted, but **types are stripped, not checked**. Run your own
  `tsc` if you need type safety — see [Type checking](#type-checking).

Page conventions:

- `useState` and event handlers are fine.
- API calls, authentication, persistence and business logic are out of scope.
- A page is ordinary JSX and therefore ordinary code execution. There is no
  sandbox — **only run mockups you trust**.

### `mockup.config.json`

Required. Holds the schema version, the extra import allowlist and display
metadata only.

```json
{
  "schemaVersion": 2,
  "title": "Lism Mockup",
  "imports": ["lucide-react"],
  "pages": {
    "landing": { "label": "Landing", "category": "Marketing", "order": 10 },
    "admin/dashboard": { "label": "Dashboard", "category": "Admin", "order": 20 }
  }
}
```

| Key | Required | Description |
| --- | --- | --- |
| `schemaVersion` | yes | Must be `2`. Validated before anything else runs. |
| `title` | no | Shown in the viewer. |
| `imports` | no | Extra packages pages may import. See [Imports](#imports). |
| `pages` | no | Per page id: `label`, `category`, `order`. |

- Default sort order is `order` ascending, then page id alphabetically. The
  default label is the page id.
- `components` is a **reserved page id**: the viewer pins it next to its own
  screens as **UI Parts** and leaves it out of the gallery. It needs no entry
  here at all — a `label`, `category` or `order` written for it is ignored.
- A `pages` entry whose id does not exist on disk is a contract violation, not a
  warning: since discovery is the source of truth, a stale entry means a typo or
  a leftover.
- Unknown top-level keys are rejected, so future additions always arrive with a
  `schemaVersion` bump.

### `tokens.json`

Optional. A Lism config compatible `tokens` object — the same shape you would
put under `tokens` in `lism.config.js`.

```json
{
  "color": {
    "brand": "#2f6f5e",
    "accent": "#e0653f",
    "success": "oklch(62% 0.14 152)",
    "canvas": "oklch(98% 0.012 152)"
  },
  "space": {
    "60": "calc(var(--s-unit) * 12)"
  }
}
```

Rules:

| Rule | Detail |
| --- | --- |
| Known groups only | The top-level keys must be token groups that Lism CSS defines (`color`, `space`, `fz`, `bdrs`, `bxsh`, `lts`, …). |
| New keys: `color` only | `color` may gain project-specific semantic colors. Every other group accepts value overrides of existing keys only. |
| Values | `string` or `number` (any valid CSS value, including `calc()` and `var()`). |
| Violations are errors | `dev` and `check` both exit non-zero. Token problems are never downgraded to warnings, otherwise a passing `check` would mean nothing. |

**Constraint — new color keys have no Property Class.** Property Classes such as
`-bgc:brand` are generated from the built-in token set, so a key you add (for
example `success`) has a CSS variable but no class. Use it through component
props or through the variable:

```jsx
<Group bgc="canvas">…</Group>     {/* → class="-bgc" style="--bgc: var(--canvas)" */}
<Icon as={Check} c="success" />
```

```css
.c--saveStatus::before { background-color: var(--success); }
```

Writing `className="-bgc:canvas"` produces a class that has no CSS behind it.

### `tokens.dark.json`

Optional. Holds the dark values only. It has the same shape as `tokens.json` — a
Lism config compatible `tokens` object — and **the presence of the file is the
dark support**: without it, no dark CSS is emitted at all.

```json
{
  "color": {
    "base": "oklch(24% 0.015 152)",
    "text": "oklch(92% 0.01 152)",
    "canvas": "oklch(20% 0.015 152)"
  }
}
```

These values are declared inside a `.set--dark` class — not `:root.set--dark` —
so adding `className="set--dark"` anywhere (a whole page, a part of a page, any
box) makes the dark values apply inside it:

```jsx
<Group className="set--dark" bgc="base" c="text">…</Group>
```

`@media (prefers-color-scheme: dark)` is never emitted. To follow the OS setting,
write the condition that applies `.set--dark` in your own mockup CSS. The viewer
has no color mode switch either, so a toggle is something the page provides.

Rules:

| Rule | Detail |
| --- | --- |
| Overrides of light tokens only | Only tokens that **the light side really has as a CSS variable** can be overridden. The source of truth is the merged light side: the Lism CSS defaults plus the keys `tokens.json` added. So `color.base` or `color.text` can be set here even when `tokens.json` never mentions them. |
| No new keys | The new-key exception `tokens.json` grants to `color` does not apply here. A key that does not exist on the light side is an error. |
| Keys without a CSS variable are out | Keys whose light value carries no real value (`bdrs.inner`, `flow.s`, `palette.keycolor`, …) cannot be overridden and are an error — unless `tokens.json` gave that key a real value. |
| No group restriction | Every group the light side has (`color`, `palette`, `space`, `fz`, `bxsh`, `vars`, …) may be overridden. |
| Violations are errors | Like `tokens.json`, `dev` and `check` both exit non-zero. |

**Overriding `vars` re-declares the tokens that reference it.** Change `--L` for
dark, for example, and every light token built from it (`palette.*`, `space.*`,
`fz.*`, `hl.*`, …) is re-declared into the same `.set--dark` block automatically.
A CSS custom property `var()` resolves when the computed value of the declaring
element is built, so `.set--dark { --L: 70% }` alone would leave the already
resolved `--red: oklch(var(--L) …)` from `:root` untouched. Reference chains are
followed too, so multi-step dependencies are covered as well.

In the viewer's token list (`?view=tokens`), a group whose values change in dark
gains a section such as `color (dark)` **right after** the light one (the outline
lists it too). It contains what the `.set--dark` block defines: the tokens you
declared plus the ones re-declared as dependencies. That section is drawn inside
a `.set--dark` scoped box, so shadows and swatches close to the base color can be
checked in a dark context. Rows in a dark section carry no `Custom` / `New`
badge, since by definition all of them are diffs from light.

`lism-mockup init` does not scaffold this file — create it when the mockup needs
dark support.

### Imports

Pages may import from an allowlist. Bare specifiers are checked against the real
`exports` map of each package, so a path that the package does not export is
rejected up front instead of failing later in the bundler.

**Standard packages** need no configuration:

| Package | Notes |
| --- | --- |
| `react`, `react-dom` | Including `react/jsx-runtime`. |
| `lism-css` | `lism-css/react`, `lism-css/lib/*`, … |
| `@lism-css/ui` | No root export — use `@lism-css/ui/react/<Component>`. |

These resolve to the copies owned by `@lism-css/mockup`, so a data directory never
needs its own `node_modules`, and a `react` sitting in a parent directory cannot
shadow them.

**Extra packages** are opt-in through `imports` in `mockup.config.json`:

```json
{ "schemaVersion": 2, "imports": ["lucide-react", "some-ui-library"] }
```

- List package names only — not subpaths (`"lucide-react"`, not
  `"lucide-react/icons"`). Which subpaths are importable still comes from the
  package's own `exports` map.
- Install them in the project that contains the data directory. A declared
  package that is not installed stops `dev` and `check` before anything is
  bundled.
- `lucide-react` is the exception that needs no install: `@lism-css/mockup`
  provides it, so the scaffold that `init` writes works as-is. It still has to be
  declared in `imports`. See [The `lucide-react` it provides](#the-lucide-react-it-provides)
  for what that copy contains.
- Adding a standard package to `imports` is an error — they are always available.
- `dev` builds the allowlist once at startup, so restart it after editing
  `imports`.

Relative imports must resolve **inside the data directory** and point at one of:

`.jsx` `.tsx` `.css` `.png` `.jpg` `.jpeg` `.gif` `.svg` `.webp`

Everything else is rejected with an explicit contract error: absolute paths,
`/@fs/` paths, `../` escapes out of the data directory, relative paths that reach
into a `node_modules` directory (import the package by name through `imports`
instead), and bare imports outside the allowlist. Query suffixes (`?raw`, `?url`)
are checked against the path in front of the query.

### The `lucide-react` it provides

The real `lucide-react` package is 45MB of icon modules, which npx would download
on every run. `@lism-css/mockup` therefore builds the module itself out of
[`@iconify-json/lucide`](https://www.npmjs.com/package/@iconify-json/lucide)
(about 570KB of plain icon data) and resolves `lucide-react` to it. Nothing about how
you write the import changes, and unused icons still drop out of the bundle.

What that module exports from its root:

| Export | Provided | Notes |
| --- | --- | --- |
| Icon components | yes | Every lucide icon, in both the `Bell` and `BellIcon` spelling, plus lucide's own aliases (`Sidebar`). |
| `Icon` | yes | The generic component that draws the `iconNode` data you hand it. |
| `createLucideIcon` | yes | Builds an icon component out of `iconNode` data. |
| `icons` | **no** | The record of every icon. Reading it would pull all ~1,800 icons into the bundle, which is what the generated module exists to avoid — import the icons you need by name instead. |

Subpaths (`lucide-react/icons/bell`, `lucide-react/dynamic`) are not available
either. Both this and `icons` are reported by `check` as a contract error naming
what is missing, so nothing fails silently.

Rendering matches lucide-react 0.577.0 attribute for attribute, including the
`lucide lucide-<name>` class names.

## Type checking

`check` does not type-check pages: `.tsx` is transformed with types stripped, not
verified. Running `tsc` yourself is opt-in and needs a little setup, because a data
directory owns no dependencies — at build time the packages a page imports come
from inside `@lism-css/mockup`, which is not where the compiler looks for them.

In the project that holds the data directory, install the packages your pages
import, plus the compiler itself:

```bash
pnpm add -D typescript @types/react lism-css @lism-css/ui @lism-css/mockup
```

`lucide-react` is the one that cannot be installed for this — the CLI generates it,
so no such package exists on disk. `@lism-css/mockup` ships the declarations for it
instead; point your tsconfig at that file:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "noEmit": true,
    "strict": true
  },
  "files": ["node_modules/@lism-css/mockup/types/lucide-react.d.ts"],
  "include": ["mockup/**/*"]
}
```

`files` is used rather than `include` because TypeScript excludes `node_modules`
from `include` by default.

Those declarations are generated from the same icon data as the module itself, so
they describe exactly what a mockup can import: `icons` and package subpaths fail
to type-check for the same reason they fail `check`. Installing the real
`lucide-react` for its types instead would undo that — it declares exports the
mockup cannot use.

## What `check` guarantees

`check` runs the same discovery, validation and import rules as `dev`, so the two
can never disagree. It verifies:

1. `mockup.config.json`, `tokens.json` and `tokens.dark.json` schemas (including
   `schemaVersion`).
2. The import boundary described above.
3. That every page bundles — syntax errors, unresolved imports and transform
   errors are reported with the offending file and reason.

When a dark theme is declared, the output gains a `dark tokens: N override(s)`
line.

It does **not** render anything. Out of scope for `check`:

- a default export that is not a React component,
- exceptions thrown during the first render,
- anything that depends on browser APIs or on how the screen actually looks.

Those need `dev` and a human looking at the browser. Treat `check` as "this mockup
is well-formed and builds", not "this mockup is correct".

## The dev server

`lism-mockup dev` runs a Vite dev server bound to localhost, serving the bundled
viewer. It only exposes the data directory, the viewer and this package's own
`node_modules`. It reloads when a page, `mockup.config.json`, `tokens.json` or
`tokens.dark.json` changes.

Because it never exits, an agent should start it in the background or hand the
command to the user, and use `check` for its own verification.

## License

MIT
