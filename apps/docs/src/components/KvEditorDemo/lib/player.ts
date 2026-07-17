// AIシナリオの再生エンジン。
// 「Ask AI to...」クリックで全ステップを順に一気に再生する。
// - 各ステップ: ユーザー発話（入力欄でタイピング → 送信で吹き出しに一括表示）→ AI発話（タイピング）→ コード書き換え（変更行のハンクごとの diffタイピング）
// - アクティブタブの表記で再生する（シナリオの resultCode は HTML。JSXタブでは htmlToJsx で変換してタイピング）
// - コードは「現在のエディター内容 → resultCode」の diff で書き換えるため、再生開始時にスナップしない（再生前のユーザー編集が出発点になる）
//   ただしエディターが空のときは、初期コード全文のタイピングは冗長なため INITIAL_HTML へ即時復元してから再生する
// - 再生中にエディターへ focus / pointerdown / タブ切替 → その場で即中断（書きかけのまま残す）し、チャットに "Interrupted" + Resume ボタンを表示
// - Resume ボタン（または再生トリガー）→ 中断したステップの開始コードにスナップして、そのステップ頭から残りのステップを再生
// - 全ステップ完了後の再クリック → チャットをクリアし初期コードへ戻して最初から
// - prefers-reduced-motion: タイピングを省略し、結果を即時適用する
import { INITIAL_HTML } from '../initial-code';
import { SCENARIO } from '../scenario';
import { htmlToJsx } from './convert';
import { diffCode, diffLineHunks } from './diff';
import type { EditorApi } from './editor';
import { initScrollHint } from './scroll-hint';

// idle は初期状態（未再生）。全ステップを再生し終えると done になる
type PlayerStatus = 'idle' | 'playing' | 'interrupted' | 'done';

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

export function createPlayer({ editor, messages, placeholder, askText, playButtons }: PlayerOptions): void {
  let status: PlayerStatus = 'idle';
  let currentStep = 0;
  let controller: AbortController | null = null;
  // 中断時に取り除く「再生中ステップの吹き出し」を追跡する
  let currentStepBubbles: HTMLElement[] = [];
  // 入力欄トリガーのプレースホルダー文言（送信・中断時にここへ戻す）
  const askPlaceholder = askText.textContent ?? '';

  const prefersReducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isJsxTab = (): boolean => editor.getActiveTab() === 'jsx';

  /** ステップ i 開始時点のコード（i=0 は初期コード。常にHTML表記） */
  const stepStartCode = (i: number): string => (i === 0 ? INITIAL_HTML : SCENARIO[i - 1].resultCode);

  /** HTMLモデルとアクティブタブの表示を同時に確定する */
  const snapTo = (html: string): void => {
    editor.setCode(html, isJsxTab() ? htmlToJsx(html) : undefined);
  };

  const appendBubble = (kind: 'user' | 'ai'): HTMLElement => {
    const bubble = document.createElement('p');
    bubble.className = `c--kvDemo_msg is--${kind}`;
    messages.appendChild(bubble);
    currentStepBubbles.push(bubble);
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
    for (const char of text) {
      bubble.textContent += char;
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

  const playStep = async (stepIndex: number, signal: AbortSignal): Promise<void> => {
    const step = SCENARIO[stepIndex];
    currentStepBubbles = [];

    // ユーザー発話: 入力欄でタイピング → 送信（プレースホルダーに戻し、吹き出しへ全文一括表示）
    if (!prefersReducedMotion()) {
      await typeIntoAsk(step.userMessage, signal);
      await sleep(PAUSE_BEFORE_SEND, signal);
      resetAsk();
    }
    const userBubble = appendBubble('user');
    userBubble.textContent = step.userMessage;
    scrollMessages();
    await sleep(PAUSE_BEFORE_AI, signal);

    // AI発話はタブの表記に合わせた文言を使う（JSX版が未定義ならHTML版で代用）
    const aiBubble = appendBubble('ai');
    const aiText = isJsxTab() ? (step.aiMessageJsx ?? step.aiMessage) : step.aiMessage;
    await typeMessage(aiBubble, aiText, AI_TYPE_INTERVAL, signal);
    await sleep(PAUSE_BEFORE_CODE, signal);

    await animateCode(step.resultCode, signal);
  };

  // 中断ステータス行の Resume ボタンから参照するため先に器だけ用意する
  // NOTE: 実体は後段で定義（run と相互参照のため）。呼び出しは常にユーザー操作時なので初期化済み
  let onPlayClick: () => void = () => {};

  /** 中断ステータス行（"Interrupted" + Resume ボタン）をチャット末尾に追加する */
  const showInterrupted = (): void => {
    const row = document.createElement('p');
    row.className = 'c--kvDemo_status';
    const label = document.createElement('span');
    label.className = 'c--kvDemo_statusLabel';
    label.textContent = 'Interrupted';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c--kvDemo_statusBtn';
    button.textContent = 'Resume';
    button.addEventListener('click', () => onPlayClick());
    row.append(label, button);
    messages.appendChild(row);
    // 再開時に中断ステップの吹き出しと一緒に取り除く
    currentStepBubbles.push(row);
    scrollMessages();
  };

  const run = async (fromStep: number): Promise<void> => {
    controller = new AbortController();
    const { signal } = controller;
    status = 'playing';
    placeholder.hidden = true;

    try {
      for (let i = fromStep; i < SCENARIO.length; i++) {
        // ステップの切り替わりに「間」を置く（最後のステップの後には置かない）
        if (i > fromStep) await sleep(prefersReducedMotion() ? PAUSE_REDUCED_MOTION : PAUSE_BETWEEN_STEPS, signal);
        currentStep = i;
        await playStep(i, signal);
      }
      currentStepBubbles = [];
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
      // 中断したステップの吹き出し・ステータス行を取り除き、開始コードへスナップして
      // そのステップの頭から残りのステップを再生する
      // （中断後にタブを切り替えていた場合も、snapTo が現在のタブの表記で復元する）
      for (const bubble of currentStepBubbles) bubble.remove();
      snapTo(stepStartCode(currentStep));
      void run(currentStep);
      return;
    }

    if (status === 'done') {
      // 全ステップ完了後: チャットをクリアし初期コードへ戻して最初から
      messages.innerHTML = '';
      updateScrollHint(); // クリアでフェード高さを 0 に戻す（前回分の残留を防ぐ）
      snapTo(INITIAL_HTML);
      void run(0);
      return;
    }

    // idle（初回）: 最初から一気に再生する。
    // コードはスナップせず、現在のエディター内容から resultCode へ diff タイピングする
    // （ただしエディターが空のときは、全文タイピングの冗長さを避けるため初期コードへ即時復元してから再生する）
    if (editor.getViewText().trim() === '') {
      snapTo(INITIAL_HTML);
    }
    void run(0);
  };
  for (const button of playButtons) {
    button.addEventListener('click', onPlayClick);
  }
}
