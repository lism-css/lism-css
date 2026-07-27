// AIシナリオの再生エンジン。
// 「Ask AI to...」クリックで全ステップを順に一気に再生する。
// - 各ステップ: ユーザー発話（入力欄でタイピング → 送信で吹き出しに一括表示）→ AI発話（タイピング）→ コード書き換え（変更行のハンクごとの diffタイピング）
// - アクティブタブの表記で再生する（シナリオの resultCode は HTML。JSXタブでは htmlToJsx で変換してタイピング）
// - コードは「現在のエディター内容 → resultCode」の diff で書き換えるため、再生開始時にスナップしない（再生前のユーザー編集が出発点になる）
//   ただしエディターが空のときは、初期コード全文のタイピングは冗長なため初期コード（initialHtml）へ即時復元してから再生する
// - 再生中にエディターへ focus / pointerdown / タブ切替 → その場で即中断（書きかけのまま残す）し、チャットに "Interrupted" + Resume ボタンを表示
// - Resume ボタン（または再生トリガー）→ 中断した瞬間の続きから再生する（吹き出しの途中テキスト・書きかけコードをそのまま残し、
//   AI発話は止まった文字位置から続け、コードは現在のビュー → 目標コードの差分で残りを書き換える）
// - 全ステップ完了 → チャット末尾に "Done" ステータス行を表示。再クリックでチャットをクリアし初期コードへ戻して最初から
// - prefers-reduced-motion: タイピングを省略し、結果を即時適用する
import type { ScenarioStep } from '../scenario';
import { htmlToJsx } from './convert';
import { diffCode, diffLineHunks } from './diff';
import type { EditorApi } from './editor';
import { initScrollHint } from './scroll-hint';

// idle は初期状態（未再生）。全ステップを再生し終えると done になる
type PlayerStatus = 'idle' | 'playing' | 'interrupted' | 'done';

// ステップ内のフェーズ。中断→再開で「止まった瞬間」の続きから再生するために使う
type StepPhase = 'user' | 'ai' | 'code';

// タイピング・ポーズの速度設定（ms）
const USER_TYPE_INTERVAL = 30;
const AI_TYPE_INTERVAL = 22;
const CODE_DELETE_INTERVAL = 12;
const CODE_INSERT_INTERVAL = 18;
const CODE_DELETE_CHUNK = 2;
const PAUSE_BEFORE_SEND = 300; // 入力欄タイピング完了 → 送信までの「間」
const PAUSE_BEFORE_AI = 400;
const PAUSE_BEFORE_CODE = 500;
const PAUSE_BETWEEN_EDITS = 350; // 離れた編集箇所（ハンク）へ移る間
const PAUSE_AFTER_REVEAL = 300; // 編集位置へのスクロールを見せてから書き換え始めるまでの間
const PAUSE_BETWEEN_STEPS = 1400; // ステップ間の「間」（最後のステップの後には置かない）
const PAUSE_REDUCED_MOTION = 900; // reduced-motion 時のステップ間の「間」

interface PlayerOptions {
  editor: EditorApi;
  messages: HTMLElement;
  placeholder: HTMLElement;
  askText: HTMLElement;
  playButtons: HTMLButtonElement[];
  // 言語別のデータは editor.ts が解決して注入する（このモジュールは言語を知らない）
  initialHtml: string;
  scenario: ScenarioStep[];
}

class AbortedError extends Error {}

const sleep = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new AbortedError());
      return;
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new AbortedError());
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });

/** 変更ブロック（複数行の文字列）を前後の行に挟んで全文を組み立てる。空文字は行として出力しない */
const joinBlocks = (before: string[], middle: string, after: string[]): string =>
  [...before, ...(middle === '' ? [] : [middle]), ...after].join('\n');

export function createPlayer({ editor, messages, placeholder, askText, playButtons, initialHtml, scenario }: PlayerOptions): void {
  let status: PlayerStatus = 'idle';
  let currentStep = 0;
  let controller: AbortController | null = null;
  // 中断時にどのフェーズにいたか（再開はここから続ける）
  let resumePhase: StepPhase = 'user';
  // 中断→再開で継続する吹き出し（新規生成か途中継続かを判断するために参照を保持）
  let userBubble: HTMLElement | null = null;
  let aiBubble: HTMLElement | null = null;
  // "Interrupted" ステータス行。再開時にこの行だけを取り除く
  let interruptedRow: HTMLElement | null = null;
  // 入力欄トリガーのプレースホルダー文言（送信・中断時にここへ戻す）
  const askPlaceholder = askText.textContent ?? '';

  const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isJsxTab = (): boolean => editor.getActiveTab() === 'jsx';

  /** HTMLモデルとアクティブタブの表示を同時に確定する */
  const snapTo = (html: string): void => {
    editor.setCode(html, isJsxTab() ? htmlToJsx(html) : undefined);
  };

  const appendBubble = (kind: 'user' | 'ai'): HTMLElement => {
    const bubble = document.createElement('p');
    bubble.className = `c--kvEditor_msg is--${kind}`;
    messages.appendChild(bubble);
    return bubble;
  };

  // スクロール余地を示す上下端のフェード。手動スクロールは scroll イベントで追従する
  const updateScrollHint = initScrollHint(messages);

  const scrollMessages = (): void => {
    messages.scrollTop = messages.scrollHeight;
    // 既に末尾にいる状態でコンテンツが増えると scroll イベントが発火しないため明示的に更新する
    updateScrollHint();
  };

  /** 入力欄トリガーに1文字ずつタイピングする（送信前の演出） */
  const typeIntoAsk = async (text: string, signal: AbortSignal): Promise<void> => {
    askText.classList.add('is--typing');
    askText.textContent = '';
    for (const char of text) {
      askText.textContent += char;
      await sleep(USER_TYPE_INTERVAL, signal);
    }
  };

  /** 入力欄トリガーをプレースホルダー表示に戻す */
  const resetAsk = (): void => {
    askText.classList.remove('is--typing');
    askText.textContent = askPlaceholder;
  };

  const typeMessage = async (bubble: HTMLElement, text: string, interval: number, signal: AbortSignal): Promise<void> => {
    if (prefersReducedMotion()) {
      bubble.textContent = text;
      scrollMessages();
      return;
    }
    // 既存テキストが目標の先頭一致なら続き（中断からの再開）、不一致（タブ切替等）なら打ち直す
    if (!text.startsWith(bubble.textContent ?? '')) bubble.textContent = '';
    for (let i = (bubble.textContent ?? '').length; i < text.length; i++) {
      bubble.textContent += text[i];
      scrollMessages();
      await sleep(interval, signal);
    }
  };

  /** 1ハンク分の書き換えアニメ。前後の行（before / after）は固定し、変更ブロックだけをタイピングする */
  const animateHunk = async (before: string[], after: string[], fromBlock: string, toBlock: string, signal: AbortSignal): Promise<void> => {
    // ハンク内でも共通の先頭・末尾は保持して、実際に変わる文字だけを書き換える
    const { head, removed, inserted, tail } = diffCode(fromBlock, toBlock);
    const frame = (middle: string): void => editor.setViewText(joinBlocks(before, middle, after));

    // 編集開始位置がスクロール範囲外だと演出が見えない（特にモバイル）ため、
    // 書き換え前に可視範囲へスクロールする。位置は head（ブロック内の共通 prefix）の末尾
    const headLines = head.split('\n');
    const scrolled = editor.revealPosition(before.length + headLines.length - 1, headLines[headLines.length - 1]);
    if (scrolled) await sleep(PAUSE_AFTER_REVEAL, signal);

    // 削除フェーズ（後ろから消す）
    for (let len = removed.length - CODE_DELETE_CHUNK; len > 0; len -= CODE_DELETE_CHUNK) {
      frame(head + removed.slice(0, len) + tail);
      await sleep(CODE_DELETE_INTERVAL, signal);
    }
    if (removed.length > 0) {
      frame(head + tail);
      await sleep(CODE_DELETE_INTERVAL, signal);
    }
    // 挿入フェーズ（1文字ずつタイピング）
    for (let len = 1; len <= inserted.length; len++) {
      frame(head + inserted.slice(0, len) + tail);
      await sleep(CODE_INSERT_INTERVAL, signal);
    }
  };

  const animateCode = async (targetHtml: string, signal: AbortSignal): Promise<void> => {
    // タイピングはアクティブタブの表記で行い、完了時に snapTo でHTMLモデルを確定する
    // （JSXタブではタイピング途中が不正なJSXになるため、フレーム反映は setViewText = 表示のみ）
    const target = isJsxTab() ? htmlToJsx(targetHtml) : targetHtml;
    const from = editor.getViewText();

    if (from === target || prefersReducedMotion()) {
      snapTo(targetHtml);
      return;
    }

    // 変更された行のまとまり（ハンク）だけを上から順に書き換える。
    // <Flex>→<Stack> のように開始タグと閉じタグが離れて変わっても、間の子要素は再タイプしない
    const fromLines = from.split('\n');
    const toLines = target.split('\n');
    const hunks = diffLineHunks(fromLines, toLines);

    let lines = fromLines;
    let lineShift = 0; // 適用済みハンクによる行番号のズレ
    for (const [index, hunk] of hunks.entries()) {
      if (index > 0) await sleep(PAUSE_BETWEEN_EDITS, signal);
      const start = hunk.fromStart + lineShift;
      const end = hunk.fromEnd + lineShift;
      const before = lines.slice(0, start);
      const after = lines.slice(end);
      const toBlock = toLines.slice(hunk.toStart, hunk.toEnd);
      await animateHunk(before, after, lines.slice(start, end).join('\n'), toBlock.join('\n'), signal);
      lines = [...before, ...toBlock, ...after];
      lineShift += hunk.toEnd - hunk.toStart - (hunk.fromEnd - hunk.fromStart);
    }
    snapTo(targetHtml);
  };

  // resume: このステップをどのフェーズから始めるか。中断→再開で「止まった瞬間」の続きを再生する
  const playStep = async (stepIndex: number, signal: AbortSignal, resume: StepPhase): Promise<void> => {
    const step = scenario[stepIndex];

    // ユーザー発話フェーズ: 入力欄でタイピング → 送信（プレースホルダーに戻し、吹き出しへ全文一括表示）
    // 再開が 'ai' / 'code' の場合は既に完了済みなのでスキップし、吹き出しはそのまま残す
    if (resume === 'user') {
      userBubble = null;
      aiBubble = null;
      if (!prefersReducedMotion()) {
        await typeIntoAsk(step.userMessage, signal);
        await sleep(PAUSE_BEFORE_SEND, signal);
        resetAsk();
      }
      userBubble = appendBubble('user');
      userBubble.textContent = step.userMessage;
      scrollMessages();
      // ユーザー吹き出しを出した時点で user フェーズは完了。以降のポーズ中の中断は ai から再開する
      // （ポーズ後に更新すると、ポーズ中の中断で user 吹き出しを二重生成してしまう）
      resumePhase = 'ai';
      await sleep(PAUSE_BEFORE_AI, signal);
    }

    // AI発話フェーズ: タブの表記に合わせた文言を使う（JSX版が未定義ならHTML版で代用）
    if (resume === 'user' || resume === 'ai') {
      // 中断で途中まで打った吹き出しがあれば再利用し、なければ生成する
      aiBubble ??= appendBubble('ai');
      const aiText = isJsxTab() ? (step.aiMessageJsx ?? step.aiMessage) : step.aiMessage;
      await typeMessage(aiBubble, aiText, AI_TYPE_INTERVAL, signal);
      // AI発話を打ち終えた時点で ai フェーズは完了。以降のポーズ中の中断は code から再開する
      resumePhase = 'code';
      await sleep(PAUSE_BEFORE_CODE, signal);
    }

    // コード書き換えフェーズ: animateCode は「現在のビュー → 目標コード」の差分で書き換えるため、
    // 中断で残った部分コードから呼び直すだけで続きから再生される（snapTo で巻き戻さない）
    await animateCode(step.resultCode, signal);
  };

  // 中断ステータス行の Resume ボタンから参照するため先に器だけ用意する
  // NOTE: 実体は後段で定義（run と相互参照のため）。呼び出しは常にユーザー操作時なので初期化済み
  let onPlayClick: () => void = () => {};

  /** ステータス行（吹き出しではないシステム表示）をチャット末尾に追加する */
  const appendStatusRow = (labelText: string): HTMLElement => {
    const row = document.createElement('p');
    row.className = 'c--kvEditor_status';
    const label = document.createElement('span');
    label.className = 'c--kvEditor_statusLabel';
    label.textContent = labelText;
    row.appendChild(label);
    messages.appendChild(row);
    return row;
  };

  /** 中断ステータス行（"Interrupted" + Resume ボタン）をチャット末尾に追加する */
  const showInterrupted = (): void => {
    const row = appendStatusRow('Interrupted');
    row.classList.add('is--interrupted');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c--kvEditor_statusBtn';
    button.textContent = 'Resume';
    button.addEventListener('click', () => onPlayClick());
    row.appendChild(button);
    // 再開時にこの行だけを取り除く（吹き出し・書きかけコードは残す）
    interruptedRow = row;
    scrollMessages();
  };

  const run = async (fromStep: number, fromPhase: StepPhase): Promise<void> => {
    controller = new AbortController();
    const { signal } = controller;
    status = 'playing';
    placeholder.hidden = true;

    try {
      for (let i = fromStep; i < scenario.length; i++) {
        // 位置は「間」の前に確定する。ステップ間ポーズ中に中断しても、再開時に次ステップ i を保持するため
        currentStep = i;
        if (i === fromStep) {
          // 再開する最初のステップは中断フェーズから続ける
          resumePhase = fromPhase;
        } else {
          // 次ステップは頭から。間の中断に備えて先にフェーズを確定してからポーズを置く
          resumePhase = 'user';
          await sleep(prefersReducedMotion() ? PAUSE_REDUCED_MOTION : PAUSE_BETWEEN_STEPS, signal);
        }
        await playStep(i, signal, resumePhase);
      }
      // 完了の明示。done 後の再クリックでチャットごとクリアされる
      appendStatusRow('Done');
      scrollMessages();
      status = 'done';
    } catch (e) {
      if (!(e instanceof AbortedError)) throw e;
      // 中断: エディターは書きかけの状態をそのまま残す（仕様）。
      // 入力欄はプレースホルダーへ戻し、チャットへ Resume の導線を出す
      resetAsk();
      showInterrupted();
    }
  };

  const interrupt = (): void => {
    if (status !== 'playing') return;
    controller?.abort();
    status = 'interrupted';
  };

  // 再生中のエディター操作・タブ切替で即中断する
  editor.textarea.addEventListener('pointerdown', interrupt);
  editor.textarea.addEventListener('focus', interrupt);
  for (const button of editor.tabButtons) {
    button.addEventListener('click', interrupt);
  }

  onPlayClick = (): void => {
    if (status === 'playing') return;

    if (status === 'interrupted') {
      // "Interrupted" 行だけを取り除き、吹き出し・書きかけコードは残したまま
      // 中断したフェーズの続きから再生する（止まった瞬間から再開）
      interruptedRow?.remove();
      interruptedRow = null;
      void run(currentStep, resumePhase);
      return;
    }

    if (status === 'done') {
      // 全ステップ完了後: チャットをクリアし初期コードへ戻して最初から
      messages.innerHTML = '';
      updateScrollHint(); // クリアでフェード高さを 0 に戻す（前回分の残留を防ぐ）
      snapTo(initialHtml);
      void run(0, 'user');
      return;
    }

    // idle（初回）: 最初から一気に再生する。
    // コードはスナップせず、現在のエディター内容から resultCode へ diff タイピングする
    // （ただしエディターが空のときは、全文タイピングの冗長さを避けるため初期コードへ即時復元してから再生する）
    if (editor.getViewText().trim() === '') {
      snapTo(initialHtml);
    }
    void run(0, 'user');
  };
  for (const button of playButtons) {
    button.addEventListener('click', onPlayClick);
  }
}
