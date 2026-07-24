// エディター右下に表示するスナックバー風の通知。2つの variant を持つ:
// - show:       テキストのみ・自動クローズ・非インタラクティブ（warning トーン）
// - showAction: ボタン付き・hide されるまで永続・クリック可能（info トーン）
//
// 一般的なスナックバー同様、複数を縦にスタック表示する。これにより、例えば
// 「空のときのリセット提案（永続）」の上に「上限到達の警告（自動クローズ）」が
// 積まれても、提案が上書きで消えず Restore 手段が失われない。
//
// スタックの出入りは「折りたたみラッパー（.c--kvDemo_snackbarRow）」の height だけを
// アニメーションさせる。隙間（gap）はラッパーの padding-top で height に内包しているため、
// margin を触らずに「カード＋隙間」を1つの height トランジションで滑らかに畳める。

const AUTO_HIDE_MS = 4000;
// height トランジション（0.2s）完了を待つ処理のフォールバック。
// reduced-motion 等で transitionend が発火しないケースに備える。
const TRANSITION_FALLBACK_MS = 350;

export interface Snackbar {
  /** 自動クローズの通知を表示する */
  show(message: string): void;
  /** アクションボタン付きの提案を表示する（hide されるまで消えない） */
  showAction(message: string, buttonLabel: string, onAction: () => void): void;
  hide(): void;
}

interface Item {
  row: HTMLElement; // 折りたたみラッパー（height をアニメーション）
  card: HTMLElement; // 見た目のカード（opacity/transform でフェード）
  timer?: ReturnType<typeof setTimeout>;
}

export function createSnackbar(container: HTMLElement): Snackbar {
  // 表示中アイテムを key で管理し、重複を抑止する:
  //  - 警告(show):      key = メッセージ（同一文言は積み増さずタイマーを更新）
  //  - アクション(action): key = 'action'（常に1つだけのシングルトン）
  const ACTION_KEY = 'action';
  const items = new Map<string, Item>();

  // row の height の transitionend（または fallback）で一度だけコールバックを呼ぶ
  const onHeightSettled = (row: HTMLElement, done: () => void): void => {
    let called = false;
    const run = (): void => {
      if (called) return;
      called = true;
      row.removeEventListener('transitionend', handler);
      done();
    };
    const handler = (e: TransitionEvent): void => {
      if (e.target === row && e.propertyName === 'height') run();
    };
    row.addEventListener('transitionend', handler);
    setTimeout(run, TRANSITION_FALLBACK_MS);
  };

  const remove = (key: string): void => {
    const item = items.get(key);
    if (!item) return;
    clearTimeout(item.timer);
    items.delete(key);
    const { row, card } = item;
    // 現在の高さ（隙間の padding-top 込み）を固定してから 0 へ折りたたむ。
    // これで上のスナックバーが一気に落ちず、隙間ごと滑らかに詰まる。
    row.style.height = `${row.getBoundingClientRect().height}px`;
    void row.offsetHeight; // 固定した height を確定させてから遷移を開始
    card.classList.remove('is--show'); // カードはフェード＆スライドアウト
    row.style.height = '0'; // ラッパーは高さを 0 へ（隙間 padding-top ごと畳む）
    onHeightSettled(row, () => row.remove());
  };

  const createEl = (message: string, button?: HTMLButtonElement): Item => {
    const row = document.createElement('div');
    row.className = 'c--kvDemo_snackbarRow';
    const card = document.createElement('div');
    card.className = 'c--kvDemo_snackbar';
    const text = document.createElement('span');
    text.textContent = message;
    card.appendChild(text);
    if (button) card.appendChild(button);
    row.appendChild(card);
    container.appendChild(row);

    // 入場も height 0 → 実寸（隙間込み）でアニメーションし、上のバーを滑らかに押し上げる。
    // 実寸は追加直後（描画前）に測るため、全高フレームは表示されない。
    const target = row.getBoundingClientRect().height;
    row.style.height = '0';
    void row.offsetHeight; // height 0 を確定
    requestAnimationFrame(() => {
      card.classList.add('is--show');
      row.style.height = `${target}px`;
      // 遷移後は auto へ戻し、内容の折り返し変化に追従できるようにする
      onHeightSettled(row, () => {
        row.style.height = '';
      });
    });
    return { row, card };
  };

  const show = (message: string): void => {
    const existing = items.get(message);
    if (existing) {
      // 同一文言は積み増さず、末尾（最前面）へ寄せてタイマーを延長する
      clearTimeout(existing.timer);
      container.appendChild(existing.row);
      existing.timer = setTimeout(() => remove(message), AUTO_HIDE_MS);
      return;
    }
    const item = createEl(message);
    item.timer = setTimeout(() => remove(message), AUTO_HIDE_MS);
    items.set(message, item);
  };

  const showAction = (message: string, buttonLabel: string, onAction: () => void): void => {
    // 既存のアクション提案は即時に差し替える（シングルトン）
    const existing = items.get(ACTION_KEY);
    if (existing) {
      clearTimeout(existing.timer);
      existing.row.remove();
      items.delete(ACTION_KEY);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c--kvDemo_snackbar_btn';
    button.textContent = buttonLabel;
    button.addEventListener('click', onAction);
    const item = createEl(message, button);
    item.card.classList.add('is--action');
    items.set(ACTION_KEY, item);
  };

  const hide = (): void => {
    for (const key of [...items.keys()]) remove(key);
  };

  return { show, showAction, hide };
}
