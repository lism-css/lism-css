// KVエディターデモのコントローラ。
// - HTML文字列を唯一のモデルとし、エディター編集 → ヒーロー描画をライブ同期する
// - HTML / JSX タブは同一モデルの2つのビュー（双方向変換）
// - shiki は遅延ロードし、読み込み前はプレーンテキストにフォールバック
// - スクロールは textarea だけが行い、ハイライトレイヤーは transform で 1:1 追従する
//   （scrollTop の同期はクランプや innerHTML 差し替え時のリセットでズレるため使わない）
import { INITIAL_HTML } from '../initial-code';
import { htmlToJsx, jsxToHtml } from './convert';
import { sanitize } from './sanitize';
import { MAX_CODE_LENGTH, findHtmlIssue } from './validate';
import { createSnackbar } from './snackbar';
import type { EditorLang, highlightSync as HighlightSyncFn } from './highlight';
import { createPlayer } from './player';

// 構文チェックはタイピングが止まってから評価する（タグの書きかけを即エラー扱いしないため）
const SYNTAX_CHECK_DEBOUNCE_MS = 800;

const escapeHtml = (text: string): string => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// 末尾が改行だと pre 側で最終行が潰れて textarea とズレるため、空白でパディングする
const padTrailingNewline = (code: string): string => (code.endsWith('\n') ? `${code} ` : code);

/** プレイヤーから操作するためのエディターAPI */
export interface EditorApi {
  /** コード全文を置き換える（ヒーロー・ハイライトも更新）。viewText は JSXタブに表示する表記（HTMLタブでは不要） */
  setCode(code: string, viewText?: string): void;
  getCode(): string;
  getActiveTab(): EditorLang;
  /** アクティブタブに表示中の生テキスト */
  getViewText(): string;
  /** タイピングアニメの1フレームを反映する（モデルの確定は setCode で行う） */
  setViewText(text: string): void;
  /** 編集位置（行番号と行内の先行テキスト）を可視範囲へスクロールする。スクロールが発生したら true */
  revealPosition(line: number, linePrefix: string): boolean;
  textarea: HTMLTextAreaElement;
  tabButtons: HTMLButtonElement[];
}

export function initKvEditorDemo(): void {
  const hero = document.querySelector<HTMLElement>('[data-kv-hero]');
  const demo = document.querySelector<HTMLElement>('[data-kv-demo]');
  const textarea = demo?.querySelector<HTMLTextAreaElement>('[data-kv-input]') ?? null;
  const preInner = demo?.querySelector<HTMLElement>('[data-kv-pre-inner]') ?? null;
  if (!hero || !demo || !textarea || !preInner) return;

  const snackbarEl = demo.querySelector<HTMLElement>('[data-kv-snackbar]');
  const snackbar = snackbarEl ? createSnackbar(snackbarEl) : null;

  const tabButtons = [...demo.querySelectorAll<HTMLButtonElement>('[data-kv-tab]')];
  const jsxTabButton = tabButtons.find((b) => b.dataset.kvTab === 'jsx') ?? null;

  // ---- 状態 --------------------------------------------------------------
  const state = {
    html: INITIAL_HTML, // 唯一のモデル（常にHTML表記）
    activeTab: 'html' as EditorLang,
    // 各タブの生テキスト（ユーザーの整形を保持する）。stale = モデルから再生成が必要
    tabText: { html: INITIAL_HTML, jsx: '' },
    stale: { html: false, jsx: true },
  };

  // ---- ヒーロー描画（rAFスロットル） --------------------------------------
  let heroRenderQueued = false;
  const renderHero = (): void => {
    if (heroRenderQueued) return;
    heroRenderQueued = true;
    requestAnimationFrame(() => {
      heroRenderQueued = false;
      hero.innerHTML = sanitize(state.html);
    });
  };

  // ---- スクロール追従（textarea → ハイライトレイヤー） ----------------------
  // textarea は iOS の自動ズーム回避のため font-size: 16px を scale で縮小している（_kv-demo.scss 参照）。
  // scrollTop / scrollLeft は変形前のローカル座標で返るため、
  // computed transform から縮小率を読み取り、視覚上の移動量へ換算して追従させる
  const syncScroll = (): void => {
    const transform = getComputedStyle(textarea).transform;
    const scale = transform === 'none' ? 1 : new DOMMatrixReadOnly(transform).a;
    preInner.style.transform = `translate3d(${-textarea.scrollLeft * scale}px, ${-textarea.scrollTop * scale}px, 0)`;
  };
  textarea.addEventListener('scroll', syncScroll, { passive: true });

  // ---- 再生アニメの編集位置を可視範囲へスクロール ---------------------------
  // モバイルでは書き換え箇所がスクロール範囲外にあり演出が見えないことがあるため、
  // プレイヤーがハンクの書き換え前に呼ぶ。scrollTop/Left・clientWidth/Height・
  // フォント計測はすべて scale 変形前のローカル座標系で一貫しているのでそのまま計算できる
  let measureCtx: CanvasRenderingContext2D | null = null;
  const measureTextWidth = (text: string): number => {
    if (text === '') return 0;
    measureCtx ??= document.createElement('canvas').getContext('2d');
    if (!measureCtx) return 0;
    const cs = getComputedStyle(textarea);
    // 等幅前提にせず実測する（行の先行部分に日本語等が混ざっても正確な x を得るため）
    measureCtx.font = `${cs.fontSize} ${cs.fontFamily}`;
    return measureCtx.measureText(text).width;
  };

  const revealPosition = (line: number, linePrefix: string): boolean => {
    const cs = getComputedStyle(textarea);
    const lineHeight = parseFloat(cs.lineHeight);
    const x = parseFloat(cs.paddingLeft) + measureTextWidth(linePrefix);
    const y = parseFloat(cs.paddingTop) + line * lineHeight;
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

    // 縦: 上下2行分の余裕を持って見えていなければ、編集行が画面の上1/3に来る位置へ
    let top = textarea.scrollTop;
    const vMargin = lineHeight * 2;
    if (y < top + vMargin || y + lineHeight > top + textarea.clientHeight - vMargin) {
      top = Math.max(0, y - textarea.clientHeight / 3);
    }
    // 横: 編集は開始位置から右へ伸びていくため、開始位置が幅の 60% より右
    //（= 編集の続きを見せる余白が足りない）なら、左 1/4 の位置に来るようスクロールする
    let left = textarea.scrollLeft;
    if (x < left + 24 || x > left + textarea.clientWidth * 0.6) {
      left = Math.max(0, x - textarea.clientWidth / 4);
    }

    let scrolled = false;
    if (top !== textarea.scrollTop || left !== textarea.scrollLeft) {
      textarea.scrollTo({ top, left, behavior });
      scrolled = true;
    }

    // ページ側のスクロール: SP ではエディターの下の AI パネルを見ている間に
    // 編集行がページのビューポート外へ出ていることがあるため、window 側も追従させる。
    // 編集行の視覚位置 = textarea の画面上の位置 + （内部スクロール適用後の行オフセット × scale）
    const rect = textarea.getBoundingClientRect();
    const scale = rect.width / textarea.offsetWidth;
    const visualY = rect.top + (y - top) * scale;
    const visualLineH = lineHeight * scale;
    if (visualY < 0 || visualY + visualLineH > window.innerHeight) {
      window.scrollBy({ top: visualY - window.innerHeight * 0.35, behavior });
      scrolled = true;
    }
    return scrolled;
  };

  // ---- シンタックスハイライト（遅延ロード、初期化後は同期実行） --------------
  let highlightSyncFn: typeof HighlightSyncFn | null = null;

  const renderHighlight = (): void => {
    const code = padTrailingNewline(textarea.value);
    const out = highlightSyncFn?.(code, state.activeTab) ?? null;
    preInner.innerHTML = out ?? `<span class="fallback">${escapeHtml(code)}</span>`;
    // innerHTML 差し替え後もスクロール位置を必ず一致させる
    syncScroll();
  };

  // 初期表示はSSR済みなので、shiki本体はアイドル時に読み込む
  const loadHighlighter = (): void => {
    void import('./highlight').then(async (mod) => {
      await mod.preloadHighlighter();
      highlightSyncFn = mod.highlightSync;
      renderHighlight();
    });
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadHighlighter);
  } else {
    setTimeout(loadHighlighter, 1500);
  }

  // ---- 入力・タブ切替 -----------------------------------------------------
  const setJsxInvalid = (invalid: boolean): void => {
    if (!jsxTabButton) return;
    if (invalid) {
      jsxTabButton.setAttribute('data-invalid', '');
    } else {
      jsxTabButton.removeAttribute('data-invalid');
    }
  };

  // ---- 入力上限（直前の状態へ巻き戻して受け付けない） ------------------------
  // beforeinput 時点（＝変更前）の値とカーソル位置を控えておき、超過したら復元する
  let snapshot = { value: textarea.value, selStart: 0, selEnd: 0 };
  const saveSnapshot = (): void => {
    snapshot = { value: textarea.value, selStart: textarea.selectionStart, selEnd: textarea.selectionEnd };
  };
  const enforceLimit = (): boolean => {
    if (textarea.value.length <= MAX_CODE_LENGTH) return false;
    textarea.value = snapshot.value;
    textarea.setSelectionRange(snapshot.selStart, snapshot.selEnd);
    snackbar?.show(`Character limit reached (${MAX_CODE_LENGTH.toLocaleString('en-US')})`);
    return true;
  };
  textarea.addEventListener('beforeinput', (e) => {
    if (!e.isComposing) saveSnapshot();
  });
  // IME変換中の巻き戻しは入力を壊すため、確定時にまとめて判定する
  textarea.addEventListener('compositionstart', saveSnapshot);
  textarea.addEventListener('compositionend', () => {
    if (enforceLimit()) processInput();
  });

  // ---- 構文チェック・空チェック（デバウンス評価 → スナックバー） -------------
  let syntaxTimer: ReturnType<typeof setTimeout> | undefined;
  let jsxInvalidNow = false; // onInput での即時判定結果（デバウンス時に再パースしないため）
  let syntaxReported = false; // 正常→不正の遷移時だけ表示する（不正のまま連発させない）
  let emptyPromptShown = false; // 空提案スナックバーの表示中フラグ（入力再開で即時に消すため）
  // 実体は後段で定義（setCode に依存するため）。呼び出しはデバウンス発火時なので初期化済み
  let restoreInitialCode: () => void = () => {};

  const scheduleSyntaxCheck = (): void => {
    clearTimeout(syntaxTimer);
    syntaxTimer = setTimeout(() => {
      // 空になったらリセット提案（ボタン付き・入力再開かリセットまで表示）
      if (textarea.value.trim() === '') {
        snackbar?.showAction('The editor is empty.', 'Restore initial code', () => restoreInitialCode());
        emptyPromptShown = true;
        syntaxReported = false;
        return;
      }
      // 表示は端的に（findHtmlIssue の詳細理由はテスト・デバッグ用で、表示には使わない）
      let issue: string | null = null;
      if (state.activeTab === 'html') {
        issue = findHtmlIssue(textarea.value) ? 'Invalid HTML syntax' : null;
      } else {
        issue = jsxInvalidNow ? 'Invalid JSX syntax' : null;
      }
      if (issue && !syntaxReported) snackbar?.show(issue);
      syntaxReported = issue !== null;
    }, SYNTAX_CHECK_DEBOUNCE_MS);
  };
  // タブ切替・プログラム的な書き換え時は評価を破棄する（古いメッセージの誤表示防止）
  const resetSyntaxCheck = (): void => {
    clearTimeout(syntaxTimer);
    syntaxReported = false;
    jsxInvalidNow = false;
    emptyPromptShown = false;
    snackbar?.hide();
  };

  const processInput = (): void => {
    const text = textarea.value;
    state.tabText[state.activeTab] = text;
    // 空提案の表示中に入力が再開されたら即座に閉じる（デバウンスを待たない）
    if (emptyPromptShown && text.trim() !== '') {
      emptyPromptShown = false;
      snackbar?.hide();
    }
    scheduleSyntaxCheck();

    if (state.activeTab === 'html') {
      state.html = text;
      state.stale.jsx = true;
    } else {
      const converted = jsxToHtml(text);
      jsxInvalidNow = converted === null;
      if (converted === null) {
        // 不正なJSXの間は last-good モデルを維持する
        setJsxInvalid(true);
        renderHighlight();
        return;
      }
      setJsxInvalid(false);
      state.html = converted;
      state.stale.html = true;
    }
    renderHero();
    renderHighlight();
  };
  textarea.addEventListener('input', (e) => {
    if (!e.isComposing && enforceLimit()) return;
    processInput();
  });

  const switchTab = (tab: EditorLang): void => {
    if (tab === state.activeTab) return;
    state.activeTab = tab;

    // モデルから再生成が必要なタブはここで変換する
    if (state.stale[tab]) {
      state.tabText[tab] = tab === 'jsx' ? htmlToJsx(state.html) : state.html;
      state.stale[tab] = false;
    }
    textarea.value = state.tabText[tab];
    setJsxInvalid(false);
    resetSyntaxCheck();
    saveSnapshot();

    for (const button of tabButtons) {
      button.setAttribute('aria-selected', String(button.dataset.kvTab === tab));
    }
    renderHighlight();
    syncScroll();
  };
  for (const button of tabButtons) {
    button.addEventListener('click', () => switchTab(button.dataset.kvTab as EditorLang));
  }

  // ---- 検索モーダルのデリゲーション ----------------------------------------
  // lism-ui の setModal は初期化時に [data-modal-open] へ直接バインドするため、
  // ヒーローを innerHTML で書き換えるとリスナーが失われる。
  // クリックをヒーロー外の常設トリガー（ヘッダー）へ転送して機能を維持する。
  hero.addEventListener('click', (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-modal-open]');
    if (!trigger || !hero.contains(trigger)) return;
    const modalId = trigger.getAttribute('data-modal-open');
    if (!modalId) return;
    const persistent = [...document.querySelectorAll<HTMLElement>(`[data-modal-open="${modalId}"]`)].find((el) => !hero.contains(el));
    if (!persistent) return;
    e.preventDefault();
    persistent.click();
  });

  // ---- コードのプログラム的な書き換え --------------------------------------
  // viewText: JSXタブがアクティブなときに表示する JSX 表記（HTMLタブでは code をそのまま表示する）
  const setCode = (code: string, viewText?: string): void => {
    state.html = code;
    state.tabText.html = code;
    state.stale.html = false;
    if (state.activeTab === 'jsx' && viewText !== undefined) {
      state.tabText.jsx = viewText;
      state.stale.jsx = false;
      textarea.value = viewText;
    } else {
      state.stale.jsx = true;
      if (state.activeTab === 'html') {
        textarea.value = code;
      }
    }
    setJsxInvalid(false);
    resetSyntaxCheck();
    saveSnapshot();
    renderHero();
    renderHighlight();
  };

  // タイピングアニメの1フレーム反映。
  // HTMLタブは部分的なHTMLでも描画できるためモデル・ヒーローへ同期し、
  // JSXタブはタイピング途中が不正なJSXになるため表示のみ更新する（モデルの確定は setCode で行う）
  const setViewText = (text: string): void => {
    state.tabText[state.activeTab] = text;
    textarea.value = text;
    if (state.activeTab === 'html') {
      state.html = text;
      state.stale.jsx = true;
      renderHero();
    }
    saveSnapshot();
    renderHighlight();
  };

  // 空提案スナックバーの「Restore initial code」ボタン
  // NOTE: scheduleSyntaxCheck から参照されるが、呼び出しは常に初期化完了後（デバウンス発火時）
  restoreInitialCode = (): void => {
    // JSXタブで空にした場合は、初期コードのJSX表記で表示を復元する
    setCode(INITIAL_HTML, state.activeTab === 'jsx' ? htmlToJsx(INITIAL_HTML) : undefined);
    // フォーカスを非表示になったボタンに残さず、編集を続けられるようエディターへ戻す
    textarea.focus({ preventScroll: true });
  };

  // ---- プレイヤー接続 ------------------------------------------------------
  const editorApi: EditorApi = {
    setCode,
    getCode: () => state.html,
    getActiveTab: () => state.activeTab,
    getViewText: () => textarea.value,
    setViewText,
    revealPosition,
    textarea,
    tabButtons,
  };

  const messages = demo.querySelector<HTMLElement>('[data-kv-messages]');
  const placeholder = demo.querySelector<HTMLElement>('[data-kv-placeholder]');
  const askText = demo.querySelector<HTMLElement>('[data-kv-ask-text]');
  const playButtons = [...demo.querySelectorAll<HTMLButtonElement>('[data-kv-play]')];
  if (messages && placeholder && askText && playButtons.length > 0) {
    createPlayer({ editor: editorApi, messages, placeholder, askText, playButtons });
  }
}
