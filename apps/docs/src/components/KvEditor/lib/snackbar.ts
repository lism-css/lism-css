// エディター右下に表示するスナックバー風の通知。2つの variant を持つ:
// - show:       テキストのみ・自動クローズ・非インタラクティブ（warning トーン）
// - showAction: ボタン付き・hide されるまで永続・クリック可能（info トーン）
//
// 一般的なスナックバー同様、複数を縦にスタック表示する。これにより、例えば
// 「空のときのリセット提案（永続）」の上に「上限到達の警告（自動クローズ）」が
// 積まれても、提案が上書きで消えず Restore 手段が失われない。
//
// スタックの出入りは「折りたたみラッパー（.c--kvEditor_snackbarRow）」の height だけを
// アニメーションさせる。隙間（gap）はカード側の margin-top で持たせ、ラッパーの
// overflow: hidden（BFC 化）で height に内包しているため、「カード＋隙間」を
// 1つの height トランジションで滑らかに畳める（詳細は _kv-editor.scss のコメント参照）。

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
  message: string;
  buttonLabel?: string; // アクション付きのみ
  onAction?: () => void; // アクション付きのみ（復帰時に差し替えられるよう item 経由で呼ぶ）
  timer?: ReturnType<typeof setTimeout>;
  enterRaf?: number; // createEl が予約した入場アニメの rAF id（発火前に row を取り除く場合はキャンセルする）
  exiting?: boolean; // 退場アニメの実行中（DOM には残っているが「表示中」ではない）
  settleCancel?: () => void; // 進行中の height トランジションの完了待ちを取り消す
}

export function createSnackbar(container: HTMLElement): Snackbar {
  // 表示中アイテムを key で管理し、重複を抑止する:
  //  - 警告(show):      key = メッセージ（同一文言は積み増さずタイマーを更新）
  //  - アクション(action): key = 'action'（常に1つだけのシングルトン）
  const ACTION_KEY = 'action';
  const items = new Map<string, Item>();

  // row の height の transitionend（または fallback）で一度だけコールバックを呼ぶ。
  // 戻り値で待機を取り消せる。次の height トランジションを始める側は必ず取り消すこと
  // （取り消さないと、入場の完了待ちが退場アニメの最中に発火して height を戻してしまう）
  const onHeightSettled = (row: HTMLElement, done: () => void): (() => void) => {
    let finished = false;
    const cancel = (): void => {
      if (finished) return;
      finished = true;
      clearTimeout(fallback);
      row.removeEventListener('transitionend', handler);
    };
    const run = (): void => {
      if (finished) return;
      cancel();
      done();
    };
    const handler = (e: TransitionEvent): void => {
      if (e.target === row && e.propertyName === 'height') run();
    };
    row.addEventListener('transitionend', handler);
    const fallback = setTimeout(run, TRANSITION_FALLBACK_MS);
    return cancel;
  };

  const remove = (key: string): void => {
    const item = items.get(key);
    if (!item || item.exiting) return;
    clearTimeout(item.timer);
    // 入場 rAF が未発火なら取り消す（発火すると height を再設定して一瞬ゾンビ化するため）
    if (item.enterRaf !== undefined) cancelAnimationFrame(item.enterRaf);
    item.settleCancel?.();
    // items からは退場アニメの完了時に消す。畳んでいる間も「その key の行は存在する」と扱い、
    // 同じ通知が再表示されたときに二重に積まないようにする
    item.exiting = true;
    const { row, card } = item;
    // 現在の高さ（隙間の margin 込み）を固定してから 0 へ折りたたむ。
    // これで上のスナックバーが一気に落ちず、隙間ごと滑らかに詰まる。
    row.style.height = `${row.getBoundingClientRect().height}px`;
    void row.offsetHeight; // 固定した height を確定させてから遷移を開始
    card.classList.remove('is--show'); // カードはフェード＆スライドアウト
    row.style.height = '0'; // ラッパーは高さを 0 へ（カードの margin ごと畳む）
    item.settleCancel = onHeightSettled(row, () => {
      row.remove();
      // 畳んでいる間に同じ key が差し替えられていれば、そちらは消さない
      if (items.get(key) === item) items.delete(key);
    });
  };

  /** 退場アニメ中の行を元の高さへ戻す（同じ通知が再表示されたとき、二重に積まないため） */
  const revive = (item: Item): void => {
    item.settleCancel?.();
    const { row, card } = item;
    const current = row.getBoundingClientRect().height;
    row.style.height = ''; // 自然高さ（隙間込み）を測る
    const target = row.getBoundingClientRect().height;
    row.style.height = `${current}px`; // 畳みかけの高さへ戻す
    void row.offsetHeight; // 固定した height を確定させてから遷移を開始
    item.exiting = false;
    card.classList.add('is--show');
    row.style.height = `${target}px`;
    item.settleCancel = onHeightSettled(row, () => {
      row.style.height = '';
    });
  };

  const createEl = (message: string, button?: HTMLButtonElement): Item => {
    const row = document.createElement('div');
    row.className = 'c--kvEditor_snackbarRow';
    const card = document.createElement('div');
    card.className = 'c--kvEditor_snackbar';
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
    const item: Item = { row, card, message };
    // rAF id を控え、発火前に row を取り除く側（remove / showAction の差し替え）がキャンセルできるようにする
    item.enterRaf = requestAnimationFrame(() => {
      item.enterRaf = undefined;
      card.classList.add('is--show');
      row.style.height = `${target}px`;
      // 遷移後は auto へ戻し、内容の折り返し変化に追従できるようにする
      item.settleCancel = onHeightSettled(row, () => {
        row.style.height = '';
      });
    });
    return item;
  };

  const show = (message: string): void => {
    const existing = items.get(message);
    if (existing) {
      // 同一文言は積み増さず、末尾（最前面）へ寄せてタイマーを延長する
      clearTimeout(existing.timer);
      // 畳んでいる最中なら元の高さへ戻す（移動させると測り直した高さが崩れるため寄せない）
      if (existing.exiting) revive(existing);
      else container.appendChild(existing.row);
      existing.timer = setTimeout(() => remove(message), AUTO_HIDE_MS);
      return;
    }
    const item = createEl(message);
    item.timer = setTimeout(() => remove(message), AUTO_HIDE_MS);
    items.set(message, item);
  };

  const showAction = (message: string, buttonLabel: string, onAction: () => void): void => {
    const existing = items.get(ACTION_KEY);
    // 畳んでいる最中の同じ提案なら、積み直さず元へ戻す
    // （タブ切替のように「消してすぐ出し直す」経路で二重に見えるのを防ぐ）
    if (existing?.exiting && existing.message === message && existing.buttonLabel === buttonLabel) {
      existing.onAction = onAction;
      revive(existing);
      return;
    }
    // 内容の異なる既存のアクション提案は即時に差し替える（シングルトン）
    if (existing) {
      clearTimeout(existing.timer);
      // 入場 rAF が未発火なら取り消してから取り除く（発火すると height を再設定して一瞬ゾンビ化するため）
      if (existing.enterRaf !== undefined) cancelAnimationFrame(existing.enterRaf);
      existing.settleCancel?.();
      existing.row.remove();
      items.delete(ACTION_KEY);
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c--kvEditor_snackbar_btn';
    button.textContent = buttonLabel;
    const item = createEl(message, button);
    item.buttonLabel = buttonLabel;
    item.onAction = onAction;
    // 復帰時に差し替えられるよう item 経由で呼ぶ（リスナーは張り直さない）
    button.addEventListener('click', () => item.onAction?.());
    item.card.classList.add('is--action');
    items.set(ACTION_KEY, item);
  };

  const hide = (): void => {
    for (const key of [...items.keys()]) remove(key);
  };

  return { show, showAction, hide };
}
