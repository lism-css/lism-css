/**
 * Ambient declaration for `lucide-react`.
 *
 * `@lism-css/mockup` does not depend on the real `lucide-react` package (37MB of icon
 * modules that npx would download on every run). The CLI resolves the specifier to a
 * virtual module built from `@iconify-json/lucide` instead (`src/vite/lucide-icons.ts`),
 * so the import stays exactly the same but there is no package on disk to read types from.
 *
 * At runtime **every** lucide icon name works, in both the `Bell` and `BellIcon` spelling.
 * Only the names listed below are declared here, because TypeScript cannot express
 * "any named export has this type" and generating all ~4,000 of them would be a large
 * file that silently goes stale. The list only has to cover what the bundled viewer
 * imports: when a viewer component starts using another icon, add one line to the list
 * below — the compiler points straight at the missing name, and nothing else changes.
 */
declare module 'lucide-react' {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react';

  /** Props every icon accepts: any SVG attribute plus lucide's own sizing props. */
  export interface LucideProps extends Partial<SVGProps<SVGSVGElement>> {
    /** Rendered as both `width` and `height`. Defaults to `24`. */
    size?: string | number;
    /** Shorthand for the `stroke` attribute. Defaults to `currentColor`. */
    color?: string;
    /** Keeps the stroke visually the same thickness when `size` changes. */
    absoluteStrokeWidth?: boolean;
  }

  export type LucideIcon = ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;

  /** Icons the bundled viewer imports. */
  export const ComponentIcon: LucideIcon;
  export const GalleryVerticalEndIcon: LucideIcon;
  export const PaletteIcon: LucideIcon;
  export const PanelLeftIcon: LucideIcon;
}
