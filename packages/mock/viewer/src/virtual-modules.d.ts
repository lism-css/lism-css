/**
 * Ambient declarations for the virtual modules that the `lism-mock` vite plugins
 * supply to the bundled viewer.
 *
 * The viewer never reads the data directory directly: everything it knows about
 * a mock comes through these two modules.
 */

declare module 'virtual:lism-mock/pages' {
  /** A single mock page, ready to be rendered by the viewer. */
  export interface ViewerPage {
    /** Page id: path relative to `pages/` without extension (e.g. `admin/users`). */
    id: string;
    /** Display label (defaults to the page id on the CLI side). */
    label: string;
    /** Optional nav group. Pages without a category share a default group. */
    category?: string;
    /** Dynamic import of the page module. Its default export is the component. */
    load: () => Promise<{ default: import('react').ComponentType }>;
  }

  /** Pages in display order (`order` ascending, then id lexicographic). */
  export const pages: ViewerPage[];

  /** `title` from `mock.config.json`. Undefined when the mock does not set one. */
  export const title: string | undefined;
}

/** Token CSS generated from the mock's `tokens.json`. Imported for its side effect. */
declare module 'virtual:lism-mock/tokens.css';

/** Plain CSS imports (`lism-css/full.css`, `@lism-css/ui/style.css`, local files). */
declare module '*.css';
