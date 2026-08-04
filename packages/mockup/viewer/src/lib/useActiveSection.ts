import { useEffect, useState } from 'react';

/**
 * Where the "currently read" line sits, as a fraction of the viewport height.
 * A section becomes current once its top edge has passed this line.
 */
const READING_LINE = 0.3;

/**
 * Tracks which of the given sections the reader is on.
 *
 * `ids` must be a stable array (a module constant or a memoized value): it is
 * the effect's dependency, so a new array on every render would re-subscribe
 * every render.
 *
 * @param ids DOM ids of the sections, in document order.
 * @returns The id of the current section, or null when none of them exists.
 */
export function useActiveSection(ids: readonly string[]): string | null {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const line = window.innerHeight * READING_LINE;

      // The current section is the last one that started above the reading
      // line. Before the first one reaches it, the first section stays current.
      let current = ids[0];
      for (const id of ids) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }

      // The last section can be too short to ever reach the reading line, so it
      // also counts as current once its end is on screen.
      const last = ids[ids.length - 1];
      const lastBottom = document.getElementById(last)?.getBoundingClientRect().bottom;
      if (lastBottom !== undefined && lastBottom <= window.innerHeight) current = last;

      setActiveId(current ?? null);
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    // `scroll` does not bubble, so the capture phase is what catches it from the
    // viewer's scroll container without this hook having to know about it.
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, [ids]);

  return activeId;
}
