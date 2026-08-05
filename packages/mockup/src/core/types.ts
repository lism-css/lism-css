/**
 * Shared contract types for the lism-mockup data directory.
 *
 * The data contract is documented in the package README. Everything `dev` and
 * `check` validate flows through these types so the two commands can never
 * disagree about what a valid data directory looks like.
 */

/** Supported `mockup.config.json` schema version. Bump when the contract changes. */
export const SCHEMA_VERSION = 2;

/**
 * Packages every page may import without any configuration.
 *
 * These are the standard building blocks of a Lism mockup, so they are resolved
 * from the copies `@lism-css/mockup` owns and can never be turned into an opt-in
 * dependency of the data directory. Anything else goes through the `imports`
 * field of `mockup.config.json`.
 */
export const STANDARD_PACKAGES = ['react', 'react-dom', 'lism-css', '@lism-css/ui'] as const;

/**
 * Whether a parsed JSON value is an object the validators can walk key by key.
 *
 * Shared by every validator so `mockup.config.json` and `tokens.json` can never
 * disagree about what counts as an object.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Per-page metadata overrides in `mockup.config.json` (`pages` field). */
export interface MockupConfigPageMeta {
  label?: string;
  category?: string;
  order?: number;
}

/**
 * Parsed shape of `mockup.config.json`.
 *
 * Page discovery is file-system based (`pages/` is the source of truth);
 * this file only overrides display metadata. Referencing a page id that does
 * not exist on disk is a contract violation. Unknown top-level keys are
 * rejected so that future schema additions always go through a
 * `schemaVersion` bump.
 */
export interface MockupConfigFile {
  schemaVersion: number;
  title?: string;
  /**
   * Extra packages pages may import, on top of {@link STANDARD_PACKAGES}.
   * Resolved from the project that contains the data directory.
   */
  imports?: string[];
  pages?: Record<string, MockupConfigPageMeta>;
}

/** A discovered page after merging `mockup.config.json` metadata. */
export interface PageEntry {
  /** Page id: path relative to `pages/` without extension (e.g. `admin/users`). */
  id: string;
  /** Absolute path to the page source file. */
  file: string;
  /** Display label (defaults to the page id). */
  label: string;
  category?: string;
  order?: number;
}

/** `tokens.json` content: lism.config-compatible `tokens` object. */
export type MockupTokens = Record<string, Record<string, string | number>>;

/**
 * One resolved design token for the viewer's tokens view.
 * Mirrors `ViewerToken` in `viewer/src/virtual-modules.d.ts` — keep both in sync.
 */
export interface TokenEntry {
  /** Token key inside its group (e.g. `brand`, `20`). */
  key: string;
  /** CSS custom property name (e.g. `--brand`). */
  varName: string;
  /** Value as it appears in the generated token CSS (numbers are stringified). */
  value: string;
  /** How the mockup's `tokens.json` affected this token. */
  source: 'default' | 'overridden' | 'custom';
}

/** A token group in merged-config order (`virtual:lism-mockup/tokens`). */
export interface TokenGroupEntry {
  group: string;
  tokens: TokenEntry[];
}

/** Fully validated data directory, shared by `dev` and `check`. */
export interface MockupData {
  /** Absolute path to the data directory. */
  dataDir: string;
  config: MockupConfigFile;
  /** Sorted for display: `order` ascending, then id lexicographic. */
  pages: PageEntry[];
  tokens: MockupTokens;
}

/**
 * A data-contract violation (invalid schema, forbidden import, etc.).
 * Commands catch this, print `file` + `message`, and exit non-zero.
 */
export class MockupContractError extends Error {
  /** Absolute path of the offending file, when known. */
  file?: string;

  constructor(message: string, options: { file?: string } = {}) {
    super(message);
    this.name = 'MockupContractError';
    this.file = options.file;
  }
}
