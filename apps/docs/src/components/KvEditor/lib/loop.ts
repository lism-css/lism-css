// ライブループ再生エンジン（mode: 'live'）。
// チャット演出（player.ts）は使わず、シナリオのコード編集だけを自動でループ再生する。
// - 各ステップの resultCode へ順に diff タイピングし、最後に「初期コードへ戻す編集」もアニメして循環する
//   （チャット文言との整合が不要なため、編集を巻き戻す演出がそのままループの継ぎ目になる）
// - 自動一時停止: エディターへのホバー（マウス系ポインターのみ）/ 画面外 / 非アクティブタブ。
//   条件が戻れば少し間を置いて、止まった位置の続きから自動再開する
// - 完全停止: エディターへの focus / pointerdown / 入力、または ⏸ ボタン。自動では再開しない。
//   ▶ での再開は「停止時からコードが変わっていなければ続きから、変わっていれば初期コードへ戻して最初から」
//   （ユーザーの編集を出発点に diff すると編集内容をアニメで上書きする動きになるため、編集後は必ずリセットする）
// - タブ切替はループを止めない: 切替後の表記（HTML / JSX）で同じステップの続きを再生する
// - 自動開始の抑制: prefers-reduced-motion では自動開始しない（▶ で明示的に開始した場合のみ、
//   タイピングを省略した即時適用で再生する）。開始はハイライター（shiki）の準備完了も待つ
//   （プレーンテキストでタイピングが始まるのを防ぐ）
// - バーの ▶/⏸ ボタンは常設(live モードのマークアップ)。自動で動き続けるコンテンツの
//   停止手段（WCAG 2.2.2）と、ホバーを持たないタッチデバイスの再開導線を兼ねる
// - SR のライブリージョンへは何も流さない（無限ループの告知は騒音になるため。
//   SR ユーザーがエディターへフォーカスすれば完全停止する）
import type { ScenarioStep } from '../scenario';
import { AbortedError, createCodeAnimator, sleep } from './code-anim';
import type { EditorApi } from './editor';
import { STRINGS } from './strings';

// ポーズ設定（ms）
const PAUSE_BETWEEN_STEPS = 1600; // 編集と次の編集の「間」
const PAUSE_AFTER_CYCLE = 2800; // 初期コードへ戻ってから次の周回を始めるまでの「間」
const RESUME_DELAY = 600; // ホバー解除・再表示から自動再開するまでの「間」
const TAB_RESUME_DELAY = 800; // タブ切替後に新しい表記で再開するまでの「間」

interface LoopPlayerOptions {
  editor: EditorApi;
  /** エディターコンポーネントのルート（ホバー・可視判定の対象） */
  root: HTMLElement;
  /** バーの ▶/⏸ トグルボタン */
  toggleButtons: HTMLButtonElement[];
  /** ハイライターの準備完了（読み込み失敗時も resolve される）。自動開始はこれを待つ */
  ready: Promise<void>;
  // 言語別のデータは editor.ts が解決して注入する（このモジュールは言語を知らない）
  initialHtml: string;
  scenario: ScenarioStep[];
}

export function createLoopPlayer({ editor, root, toggleButtons, ready, initialHtml, scenario }: LoopPlayerOptions): void {
  // 自動再生がユーザーのスクロール位置を奪わないよう、reveal のページスクロールは無効にする
  const animator = createCodeAnimator(editor, { scrollWindowOnReveal: false });

  // 再生ターゲットの循環列: 各ステップの resultCode + 末尾に「初期コードへ戻す」ステップ
  const targets = [...scenario.map((step) => step.resultCode), initialHtml];
  // ステップ開始コード（アニメが長すぎる場合の復元先）。先頭ステップの開始 = 初期コード = 循環列の末尾
  const startCodeOf = (index: number): string => (index === 0 ? initialHtml : targets[index - 1]);

  let controller: AbortController | null = null;
  let running = false;
  let started = false; // 一度でも再生を開始したか（▶ の「続きから / 最初から」判定に使う）
  let manualStop = false; // ⏸・エディター操作による停止。自動では再開しない（▶ でのみ解除）
  let currentIndex = 0; // 再生中・中断中のターゲット位置
  // 停止時点の表示テキスト。▶ でこれと一致すれば続きから、違えば（=編集されていれば）最初から
  let pausedViewText: string | null = null;
  // 自動開始・自動再開の抑制（reduced-motion）。▶ での明示的な開始で解除する
  let autoBlocked = animator.prefersReducedMotion();
  let readyFlag = false;
  let hoverPaused = false;
  let offscreen = true; // IntersectionObserver の初期コールバックで必ず実際の値に更新される
  let resumeTimer: ReturnType<typeof setTimeout> | undefined;

  const syncButtons = (): void => {
    for (const button of toggleButtons) {
      button.setAttribute('data-kv-loop-state', running ? 'playing' : 'paused');
      button.setAttribute('aria-label', running ? STRINGS.pauseDemo : STRINGS.playDemo);
    }
  };

  /** 再生を止め、停止時点の表示テキストを控える（すべての停止経路がここを通る） */
  const abortRun = (): void => {
    controller?.abort();
    controller = null;
    running = false;
    pausedViewText = editor.getViewText();
    syncButtons();
  };

  const run = async (fromIndex: number): Promise<void> => {
    controller = new AbortController();
    const { signal } = controller;
    running = true;
    started = true;
    syncButtons();
    try {
      // 無限ループ（脱出は中断のみ）。中断（abort）は sleep / animateCode 内から AbortedError で抜ける
      for (let i = fromIndex; ; i = (i + 1) % targets.length) {
        currentIndex = i;
        await animator.animateCode(targets[i], startCodeOf(i), signal);
        const cycleEnd = i === targets.length - 1;
        await sleep(cycleEnd ? PAUSE_AFTER_CYCLE : PAUSE_BETWEEN_STEPS, signal);
      }
    } catch (e) {
      if (!(e instanceof AbortedError)) {
        // 想定外の例外: 自動再開を止めて ▶ での再試行に委ね、握り潰さず throw する（開発中に気づくため）
        running = false;
        manualStop = true;
        pausedViewText = editor.getViewText();
        syncButtons();
        throw e;
      }
    }
  };

  const gatesBlocked = (): boolean => hoverPaused || offscreen || document.visibilityState === 'hidden';

  /** 自動再開（少し間を置く）。手動停止中・条件不成立なら何もしない */
  const tryResume = (delayMs: number): void => {
    clearTimeout(resumeTimer);
    if (!readyFlag || running || manualStop || autoBlocked || gatesBlocked()) return;
    resumeTimer = setTimeout(() => {
      if (!readyFlag || running || manualStop || autoBlocked || gatesBlocked()) return;
      void run(started ? currentIndex : 0);
    }, delayMs);
  };

  /** 自動一時停止（ホバー・画面外・非アクティブタブ）。位置を保ち、条件が戻れば tryResume で続きから */
  const pauseAuto = (): void => {
    clearTimeout(resumeTimer);
    if (running) abortRun();
  };

  /** ユーザーによる完全停止（エディター操作）。編集へ明け渡し、自動では再開しない */
  const takeOver = (): void => {
    if (manualStop) return;
    manualStop = true;
    clearTimeout(resumeTimer);
    if (running) abortRun();
    syncButtons();
    // デモが書き換えたコードを戻せるよう、リセット提案を出す（初期コードのままなら出ない）
    editor.syncRestorePrompt();
  };

  // ---- 停止・再開のトリガー配線 -------------------------------------------

  // エディターへの操作 = 編集意図とみなして完全停止する
  editor.textarea.addEventListener('pointerdown', takeOver);
  editor.textarea.addEventListener('focus', takeOver);
  // 再生開始時に textarea へフォーカスが残っていると focus / pointerdown は発火しないため、
  // キー入力そのものも停止トリガーにする（デモの書き換えは value への代入なので beforeinput は発火しない）
  editor.textarea.addEventListener('beforeinput', takeOver);

  // ホバー（マウス系ポインターのみ）: 覗き込み・編集への導線として一時停止し、離れたら続きから再開する。
  // タッチはタップで pointerenter が発火し leave が来ないことがあるため対象外
  //（タッチの停止は textarea への pointerdown = 完全停止が担う）
  root.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'touch') return;
    hoverPaused = true;
    pauseAuto();
  });
  root.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'touch') return;
    hoverPaused = false;
    tryResume(RESUME_DELAY);
  });

  // タブ切替はループを止めず、切替後の表記で同じステップの続きを再生する。
  // editor.ts のリスナー（switchTab）が先に登録されているため、ここでは切替済みの状態が見える
  let knownTab = editor.getActiveTab();
  for (const button of editor.tabButtons) {
    button.addEventListener('click', () => {
      const tab = editor.getActiveTab();
      if (tab === knownTab) return; // 同じタブの再クリック（切替なし）は無視
      knownTab = tab;
      // 完全停止中のタブ切替はループに関与しない（表記が変わるため、▶ は「最初から」になる）
      if (manualStop) return;
      if (running) abortRun();
      // 切替後の表記を比較基準にして続きから再開する
      pausedViewText = editor.getViewText();
      tryResume(TAB_RESUME_DELAY);
    });
  }

  // 画面外・非アクティブタブでは再生しない（CPU・バッテリーへの配慮）
  new IntersectionObserver((entries) => {
    for (const entry of entries) {
      offscreen = !entry.isIntersecting;
    }
    if (offscreen) pauseAuto();
    else tryResume(RESUME_DELAY);
  }).observe(root);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') pauseAuto();
    else tryResume(RESUME_DELAY);
  });

  // ▶/⏸ トグル
  const onToggle = (): void => {
    clearTimeout(resumeTimer);
    if (running) {
      // ⏸: 手動停止。ホバー解除等でも自動再開しない（▶ でのみ再開）
      manualStop = true;
      abortRun();
      // デモが書き換えたコードを戻せるよう、リセット提案を出す
      editor.syncRestorePrompt();
      return;
    }
    // ▶: 明示的な再生要求。reduced-motion の自動開始抑制もここで解除する
    //（以降はタイピング省略の即時適用で再生され、自動再開も働く）
    manualStop = false;
    autoBlocked = false;
    if (started && editor.getViewText() === pausedViewText) {
      // 停止時からコードが変わっていない → 続きから
      void run(currentIndex);
      return;
    }
    // 編集されている（または未開始）→ 初期コードへ戻して最初から。
    // ユーザーの編集を出発点に diff すると編集内容をアニメで上書きする動きになるため必ずリセットする
    animator.snapTo(initialHtml);
    animator.ensureEditorVisible();
    void run(0);
  };
  for (const button of toggleButtons) {
    button.addEventListener('click', onToggle);
  }

  // ---- 自動開始 -----------------------------------------------------------
  // ハイライターの準備完了を待ってから開始する（ゲート不成立ならイベント駆動の tryResume に委ねる）
  void ready.then(() => {
    readyFlag = true;
    tryResume(0);
  });
}
