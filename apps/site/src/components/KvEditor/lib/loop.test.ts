import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ScenarioStep } from '../scenario';
import type { EditorApi } from './editor';

const mocks = vi.hoisted(() => ({
  animateCode: vi.fn(async () => {}),
  createCodeAnimator: vi.fn(),
}));

vi.mock('./code-anim', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./code-anim')>();
  return {
    ...actual,
    createCodeAnimator: mocks.createCodeAnimator,
  };
});

import { createLoopPlayer } from './loop';

describe('createLoopPlayer', () => {
  let intersectionCallback!: IntersectionObserverCallback;

  beforeEach(() => {
    vi.useFakeTimers();
    mocks.animateCode.mockClear();
    mocks.createCodeAnimator.mockReset().mockReturnValue({
      prefersReducedMotion: () => false,
      snapTo: vi.fn(),
      ensureEditorVisible: vi.fn(),
      animateCode: mocks.animateCode,
    });

    const documentTarget = new EventTarget();
    Object.defineProperty(documentTarget, 'visibilityState', { value: 'visible' });
    vi.stubGlobal('document', documentTarget);
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback;
        }

        observe(): void {}
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const setup = (): { resolveReady: () => void; showRoot: () => void } => {
    let resolveReady = (): void => {};
    const ready = new Promise<void>((resolve) => {
      resolveReady = resolve;
    });
    const textarea = new EventTarget();
    const editor = {
      textarea,
      tabButtons: [],
      getActiveTab: () => 'html',
      getViewText: () => '<div>initial</div>',
      highlightRanges: vi.fn(),
      clearHighlights: vi.fn(),
      syncRestorePrompt: vi.fn(),
    } as unknown as EditorApi;

    createLoopPlayer({
      editor,
      root: new EventTarget() as unknown as HTMLElement,
      hoverTarget: new EventTarget() as unknown as HTMLElement,
      toggleButtons: [],
      ready,
      initialHtml: '<div>initial</div>',
      scenario: [{ resultCode: '<div>next</div>' } as ScenarioStep],
    });

    return {
      resolveReady,
      showRoot: () => intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver),
    };
  };

  it.each(['highlight first', 'intersection first'])('waits four seconds after both initial gates pass: %s', async (order) => {
    const { resolveReady, showRoot } = setup();

    if (order === 'highlight first') {
      resolveReady();
      await Promise.resolve();
      showRoot();
    } else {
      showRoot();
      resolveReady();
      await Promise.resolve();
    }

    await vi.advanceTimersByTimeAsync(3999);
    expect(mocks.animateCode).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(mocks.animateCode).toHaveBeenCalledTimes(1);
    expect(mocks.createCodeAnimator.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ scrollWindowOnReveal: false, scrollWindowOnRestore: false })
    );
  });
});
