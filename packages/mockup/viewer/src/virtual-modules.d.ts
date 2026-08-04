/**
 * Ambient declarations for the virtual modules that the `lism-mockup` vite plugins
 * supply to the bundled viewer.
 *
 * The viewer never reads the data directory directly: everything it knows about
 * a mockup comes through these two modules.
 */

declare module 'virtual:lism-mockup/pages' {
  /** A single mockup page, ready to be rendered by the viewer. */
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

  /** `title` from `mockup.config.json`. Undefined when the mockup does not set one. */
  export const title: string | undefined;
}

/** Token CSS generated from the mockup's `tokens.json`. Imported for its side effect. */
declare module 'virtual:lism-mockup/tokens.css';

declare module 'virtual:lism-mockup/tokens' {
  /** One resolved design token, mirroring what the generated token CSS declares. */
  export interface ViewerToken {
    /** Token key inside its group (e.g. `brand`, `20`). */
    key: string;
    /** CSS custom property name (e.g. `--brand`). */
    varName: string;
    /** Value as it appears in the generated token CSS (numbers are stringified). */
    value: string;
    /** How the mockup's `tokens.json` affected this token. */
    source: 'default' | 'overridden' | 'custom';
  }

  /** A token group (e.g. `color`, `space`). */
  export interface ViewerTokenGroup {
    group: string;
    tokens: ViewerToken[];
  }

  /**
   * Groups in merged-config order, holding every token the viewer's CSS actually
   * defines. Keys whose value is the `'-'` sentinel (or empty) are omitted, the
   * same rule the token CSS generation applies.
   */
  export const tokenGroups: ViewerTokenGroup[];
}

/** Plain CSS imports (`lism-css/full.css`, `@lism-css/ui/style.css`, local files). */
declare module '*.css';
