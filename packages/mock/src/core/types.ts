/**
 * Shared contract types for the lism-mock data directory.
 *
 * The data contract is documented in the package README. Everything `dev` and
 * `check` validate flows through these types so the two commands can never
 * disagree about what a valid data directory looks like.
 */

/** Supported `mock.config.json` schema version. Bump when the contract changes. */
export const SCHEMA_VERSION = 1;

/** Per-page metadata overrides in `mock.config.json` (`pages` field). */
export interface MockConfigPageMeta {
  label?: string;
  category?: string;
  order?: number;
}

/**
 * Parsed shape of `mock.config.json`.
 *
 * Page discovery is file-system based (`pages/` is the source of truth);
 * this file only overrides display metadata. Referencing a page id that does
 * not exist on disk is a contract violation. Unknown top-level keys are
 * rejected so that future schema additions always go through a
 * `schemaVersion` bump.
 */
export interface MockConfigFile {
  schemaVersion: number;
  title?: string;
  pages?: Record<string, MockConfigPageMeta>;
}

/** A discovered page after merging `mock.config.json` metadata. */
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
export type MockTokens = Record<string, Record<string, string | number>>;

/** Fully validated data directory, shared by `dev` and `check`. */
export interface MockData {
  /** Absolute path to the data directory. */
  dataDir: string;
  config: MockConfigFile;
  /** Sorted for display: `order` ascending, then id lexicographic. */
  pages: PageEntry[];
  tokens: MockTokens;
}

/**
 * A data-contract violation (invalid schema, forbidden import, etc.).
 * Commands catch this, print `file` + `message`, and exit non-zero.
 */
export class MockContractError extends Error {
  /** Absolute path of the offending file, when known. */
  file?: string;

  constructor(message: string, options: { file?: string } = {}) {
    super(message);
    this.name = 'MockContractError';
    this.file = options.file;
  }
}
