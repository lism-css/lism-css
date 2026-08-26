import type { MouseEvent } from 'react';

/**
 * Returns true when the browser should handle the click itself (new tab, new
 * window, download …).
 *
 * Viewer links always carry a real `href`, so a modified click has to fall
 * through instead of being turned into an in-page navigation.
 */
export function isModifiedClick(event: MouseEvent<HTMLElement>): boolean {
  return event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}
