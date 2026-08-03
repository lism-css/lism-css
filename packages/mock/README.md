# @lism-css/mock

Design mock preview CLI for [Lism CSS](https://lism-css.com).

Build design mocks as **data files** — one component file per screen, plus a
small config and an optional token override file. The preview app (the *viewer*)
ships inside this package, so a mock directory needs no bundler, no
`package.json` and no dependencies of its own.

This is the same split [Zenn CLI](https://zenn.dev/zenn/articles/zenn-cli-guide)
uses for articles: the app is part of the CLI, you only own the content.

## Requirements

Node.js `^20.19.0 || >=22.12.0`.

## Usage

No installation needed:

```bash
npx @lism-css/mock init ./mock    # scaffold a data directory
npx @lism-css/mock check ./mock   # validate it (non-interactive)
npx @lism-css/mock dev ./mock     # start the preview server
```

Installed locally, the binary is `lism-mock`:

```bash
pnpm add -D @lism-css/mock
npx lism-mock dev ./mock
```

| Command | What it does |
| --- | --- |
| `lism-mock init [dir]` | Copies sample pages, `tokens.json`, `mock.config.json` and a contract guide into `dir`. Refuses to touch existing files unless `--force` is passed. |
| `lism-mock dev [dir]` | Starts the preview dev server for browsing the screens. Long-running; meant for humans. |
| `lism-mock check [dir]` | Validates the directory and exits non-zero on any violation. Meant for agents and CI. |

`[dir]` defaults to the current directory.

### For AI agents

1. Run `lism-mock init <dir>` first, then read the generated `README.md`.
2. Use the [`lism-css-guide`](https://github.com/lism-css/lism-css/tree/main/skills)
   skill for the markup itself (`npx lism-cli skill add`). This package defines
   *what files exist*; the skill defines *how to write Lism CSS*.
3. Verify your own work with `lism-mock check`. Never report a mock as finished
   while `check` fails.
4. `lism-mock dev` never exits. Start it in the background or let the user start
   it. Browser review is the user's job (see
   [What `check` guarantees](#what-check-guarantees)).

## Data contract

A data directory looks like this:

```
mock/
├── mock.config.json      # required
├── tokens.json           # optional
└── pages/                # required, at least one page
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
  and the id is what `mock.config.json` and the viewer URL refer to, so a shared
  link does not depend on the discovery order.
- Screens are discovered from the file system. Adding a file is enough; there is
  no registration step (which is why a config entry can never go stale).
- Two files that produce the same id (`foo.jsx` and `foo.tsx`) are an id
  collision and stop `dev` and `check`.
- Files that are not `.jsx` / `.tsx` (for example a co-located `.css`) are not
  screens; import them from a page.
- `.tsx` is accepted, but **types are stripped, not checked**. Run your own
  `tsc` if you need type safety.

Page conventions:

- `useState` and event handlers are fine.
- API calls, authentication, persistence and business logic are out of scope.
- A page is ordinary JSX and therefore ordinary code execution. There is no
  sandbox — **only run mocks you trust**.

### `mock.config.json`

Required. Holds the schema version and display metadata only.

```json
{
  "schemaVersion": 1,
  "title": "Acme Console Mock",
  "pages": {
    "landing": { "label": "Landing", "category": "Marketing", "order": 10 },
    "admin/dashboard": { "label": "Dashboard", "category": "Admin", "order": 20 }
  }
}
```

| Key | Required | Description |
| --- | --- | --- |
| `schemaVersion` | yes | Must be `1`. Validated before anything else runs. |
| `title` | no | Shown in the viewer. |
| `pages` | no | Per page id: `label`, `category`, `order`. |

- Default sort order is `order` ascending, then page id alphabetically. The
  default label is the page id.
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

### Imports

Pages may import from a fixed allowlist. Bare specifiers are checked against the
real `exports` map of each package, so a path that the package does not export is
rejected up front instead of failing later in the bundler.

| Package | Notes |
| --- | --- |
| `react`, `react-dom` | Including `react/jsx-runtime`. |
| `lism-css` | `lism-css/react`, `lism-css/lib/*`, … |
| `@lism-css/ui` | No root export — use `@lism-css/ui/react/<Component>`. |
| `lucide-react` | Icons. |

These resolve to the copies owned by `@lism-css/mock`, so a data directory never
needs its own `node_modules`, and a `react` sitting in a parent directory cannot
shadow them.

Relative imports must resolve **inside the data directory** and point at one of:

`.jsx` `.tsx` `.css` `.png` `.jpg` `.jpeg` `.gif` `.svg` `.webp`

Everything else is rejected with an explicit contract error: absolute paths,
`/@fs/` paths, `../` escapes out of the data directory, and bare imports outside
the allowlist. Query suffixes (`?raw`, `?url`) are checked against the path in
front of the query.

## What `check` guarantees

`check` runs the same discovery, validation and import rules as `dev`, so the two
can never disagree. It verifies:

1. `mock.config.json` and `tokens.json` schemas (including `schemaVersion`).
2. The import boundary described above.
3. That every page bundles — syntax errors, unresolved imports and transform
   errors are reported with the offending file and reason.

It does **not** render anything. Out of scope for `check`:

- a default export that is not a React component,
- exceptions thrown during the first render,
- anything that depends on browser APIs or on how the screen actually looks.

Those need `dev` and a human looking at the browser. Treat `check` as "this mock
is well-formed and builds", not "this mock is correct".

## The dev server

`lism-mock dev` runs a Vite dev server bound to localhost, serving the bundled
viewer. It only exposes the data directory, the viewer and this package's own
`node_modules`. It reloads when a page, `mock.config.json` or `tokens.json`
changes.

Because it never exits, an agent should start it in the background or hand the
command to the user, and use `check` for its own verification.

## License

MIT
