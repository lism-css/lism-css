// エディター右下に表示するスナックバー風の通知。2つの variant を持つ:
// - show:       テキストのみ・自動クローズ・非インタラクティブ（warning トーン）
// - showAction: ボタン付き・hide されるまで永続・クリック可能（info トーン）
//   「空になったのでリセットするか」のような、ユーザーの操作を待つ提案に使う。

const AUTO_HIDE_MS = 4000;

export interface Snackbar {
  /** 自動クローズの通知を表示する */
  show(message: string): void;
  /** アクションボタン付きの提案を表示する（hide されるまで消えない） */
  showAction(message: string, buttonLabel: string, onAction: () => void): void;
  hide(): void;
}

export function createSnackbar(el: HTMLElement): Snackbar {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const hide = (): void => {
    clearTimeout(timer);
    el.classList.remove('is--show', 'is--action');
  };

  const render = (message: string, button?: HTMLButtonElement): void => {
    el.textContent = '';
    const text = document.createElement('span');
    text.textContent = message;
    el.appendChild(text);
    if (button) el.appendChild(button);
  };

  const show = (message: string): void => {
    clearTimeout(timer);
    el.classList.remove('is--action');
    render(message);
    el.classList.add('is--show');
    timer = setTimeout(hide, AUTO_HIDE_MS);
  };

  const showAction = (message: string, buttonLabel: string, onAction: () => void): void => {
    clearTimeout(timer);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c--kvDemo_snackbar_btn';
    button.textContent = buttonLabel;
    button.addEventListener('click', onAction);
    render(message, button);
    el.classList.add('is--show', 'is--action');
  };

  return { show, showAction, hide };
}
