// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AbortedError, createCodeAnimator } from './code-anim';
import { htmlToJsx, jsxToHtml } from './convert';
import type { CodeRange } from './diff';
import type { EditorApi } from './editor';

describe('code animation highlights', () => {
  let reducedMotion = false;

  beforeEach(() => {
    vi.useFakeTimers();
    reducedMotion = false;
    vi.stubGlobal('matchMedia', () => ({
      get matches() {
        return reducedMotion;
      },
    }));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const setup = (initialHtml: string, tab: 'html' | 'jsx' = 'html', withPreview = true) => {
    let html = initialHtml;
    let text = tab === 'jsx' ? htmlToJsx(html) : html;
    const shown: { phase: 'before' | 'applied'; text: string; ranges: readonly CodeRange[] }[] = [];
    const editor = {
      setCode: vi.fn((code: string) => {
        html = code;
        text = tab === 'jsx' ? htmlToJsx(code) : code;
      }),
      getCode: () => html,
      getActiveTab: () => tab,
      switchTab: vi.fn(),
      getViewText: () => text,
      setViewText: vi.fn((value: string) => {
        text = value;
      }),
      commitView: vi.fn(),
      canCommitView: () => tab === 'html' || jsxToHtml(text) !== null,
      highlightRanges: (ranges, phase) => {
        shown.push({ phase, text, ranges });
      },
      clearHighlights: vi.fn(),
      revealPosition: vi.fn(() => false),
      resetSyntaxCheck: vi.fn(),
      syncRestorePrompt: vi.fn(),
      textarea: document.createElement('textarea'),
      tabButtons: [],
    } satisfies EditorApi;
    const animator = createCodeAnimator(editor, {
      scrollWindowOnReveal: false,
      scrollWindowOnRestore: false,
      ...(withPreview ? { onBeforeEdit: (range: CodeRange) => editor.highlightRanges([range], 'before') } : {}),
      onApply: (ranges) => editor.highlightRanges(ranges, 'applied'),
      onClearHighlights: () => editor.clearHighlights(),
    });
    return { animator, editor, shown };
  };

  it('shows the old value for 400ms before editing, then flashes only the new value before committing', async () => {
    const initial = '<h1 class="-fw:700">Hello</h1>';
    const target = initial.replace('700', '800');
    const { animator, editor, shown } = setup(initial);
    const running = animator.animateCode(target, initial, new AbortController().signal);
    expect(shown).toEqual([{ phase: 'before', text: initial, ranges: [{ start: 15, end: 18 }] }]);
    await vi.advanceTimersByTimeAsync(399);
    expect(editor.setViewText).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(editor.clearHighlights).toHaveBeenCalledTimes(1);
    expect(editor.setViewText).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(312);
    expect(shown.at(-1)).toEqual({ phase: 'applied', text: target, ranges: [{ start: 15, end: 18 }] });
    expect(editor.commitView).not.toHaveBeenCalled();
    await vi.runAllTimersAsync();
    await running;
    expect(editor.commitView).toHaveBeenCalledTimes(1);
    expect(editor.clearHighlights).toHaveBeenCalledTimes(1);
  });

  it('keeps separate changes precise after a preceding edit changes the text length', async () => {
    const initial = '<div class="l--flex -jc:center -g:15">Hello</div>';
    const target = '<div class="l--stack -g:20">Hello</div>';
    const { animator, editor, shown } = setup(initial);
    const running = animator.animateCode(target, initial, new AbortController().signal);
    await vi.runAllTimersAsync();
    await running;
    const applied = shown.find((entry) => entry.phase === 'applied')!;
    expect(applied.ranges.map(({ start, end }) => applied.text.slice(start, end))).toEqual(['stack', '', '20']);
    expect(applied.ranges[1].start).toBe(target.indexOf(' -g:'));
    expect(shown.filter((entry) => entry.phase === 'before').map((entry) => entry.text.slice(entry.ranges[0].start, entry.ranges[0].end))).toEqual([
      'flex',
      ' -jc:center',
      '15',
    ]);
    expect(editor.revealPosition).toHaveBeenCalledTimes(3);
  });

  it('uses insertion and deletion markers, including a deleted final line', async () => {
    const initial = 'first\nlast';
    const target = 'first';
    const { animator, shown } = setup(initial);
    const running = animator.animateCode(target, initial, new AbortController().signal);
    await vi.runAllTimersAsync();
    await running;
    expect(shown.at(-1)).toEqual({ phase: 'applied', text: target, ranges: [{ start: 5, end: 5 }] });

    const insertion = setup(target);
    const inserting = insertion.animator.animateCode(initial, target, new AbortController().signal);
    expect(insertion.shown[0].ranges[0]).toEqual({ start: 5, end: 5 });
    await vi.runAllTimersAsync();
    await inserting;
    const applied = insertion.shown.at(-1)!;
    expect(applied.text.slice(applied.ranges[0].start, applied.ranges[0].end)).toBe('last');
  });

  it('keeps offsets correct across line insertions and later hunks', async () => {
    const initial = '<div>first</div>\n<p>same</p>\n<b>700</b>';
    const target = '<div>first</div>\n<i>added</i>\n<p>same</p>\n<b>800</b>';
    const { animator, shown } = setup(initial);
    const running = animator.animateCode(target, initial, new AbortController().signal);
    await vi.runAllTimersAsync();
    await running;
    const applied = shown.filter((entry) => entry.phase === 'applied');
    expect(applied).toHaveLength(2);
    expect(applied[1].ranges).toEqual([{ start: target.indexOf('800'), end: target.indexOf('800') + 3 }]);
    expect(applied[1].text).toBe(target);
  });

  it('clears a canceled preview synchronously without clearing a new run afterward', async () => {
    const initial = '<h1 class="-fw:700">Hello</h1>';
    const { animator, editor } = setup(initial);
    const first = new AbortController();
    const canceled = animator.animateCode(initial.replace('700', '800'), initial, first.signal).catch((error: unknown) => error);
    first.abort();
    expect(editor.clearHighlights).toHaveBeenCalledTimes(1);
    const second = animator.animateCode(initial.replace('700', '400'), initial, new AbortController().signal);
    expect(await canceled).toBeInstanceOf(AbortedError);
    expect(editor.clearHighlights).toHaveBeenCalledTimes(1);
    expect(editor.setViewText).not.toHaveBeenCalled();
    await vi.runAllTimersAsync();
    await second;
  });

  it('does not flash a JSX hunk until the current code can be committed', async () => {
    const initial = '<div class="l--flex">\n  <p>Hello</p>\n</div>';
    const target = initial.replace('l--flex', 'l--stack');
    const { animator, editor, shown } = setup(initial, 'jsx');
    const running = animator.animateCode(target, initial, new AbortController().signal);
    await vi.runAllTimersAsync();
    await running;
    expect(shown.filter((entry) => entry.phase === 'before')).toHaveLength(2);
    const applied = shown.filter((entry) => entry.phase === 'applied');
    expect(applied).toHaveLength(1);
    expect(applied[0].ranges.map(({ start, end }) => applied[0].text.slice(start, end))).toEqual(['Stack', 'Stack']);
    expect(editor.commitView).toHaveBeenCalledTimes(1);
  });

  it('skips preview delay when no preview callback is provided', async () => {
    const initial = '<b>700</b>';
    const { animator, editor, shown } = setup(initial, 'html', false);
    const running = animator.animateCode('<b>800</b>', initial, new AbortController().signal);
    expect(editor.setViewText).toHaveBeenCalledTimes(1);
    expect(shown).toHaveLength(0);
    await vi.runAllTimersAsync();
    await running;
  });

  it('does not animate or show highlights with reduced motion', async () => {
    reducedMotion = true;
    const { animator, editor, shown } = setup('<b>700</b>');
    await animator.animateCode('<b>800</b>', '<b>700</b>', new AbortController().signal);
    expect(shown).toHaveLength(0);
    expect(editor.setViewText).not.toHaveBeenCalled();
    expect(editor.getViewText()).toBe('<b>800</b>');
  });
});
