import { resolveTabNavKey, toTabOrientation } from './tabsKeyNav';

/**
 * タブ
 */

// タブリスト内のタブボタン一覧
const getTabBtns = (root: HTMLElement): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>('[role="tab"]'));

// 同じタブリスト内の全タブを走査して選択状態を同期する
const selectTab = (targetBtn: HTMLElement): void => {
  const tabList = targetBtn.closest<HTMLElement>('[role="tablist"]');
  if (!tabList) return;

  getTabBtns(tabList).forEach((tabBtn) => {
    const isSelected = tabBtn === targetBtn;
    tabBtn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
    tabBtn.setAttribute('tabindex', isSelected ? '0' : '-1');

    const panelId = tabBtn.getAttribute('aria-controls');
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    if (isSelected) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  });
};

function tabControl(e: MouseEvent): void {
  e.preventDefault();
  selectTab(e.currentTarget as HTMLElement);
}

// 矢印 / Home / End でのタブ移動（フォーカス移動と選択を連動させる自動アクティベーション）
function tabKeyControl(e: KeyboardEvent): void {
  const currentBtn = e.currentTarget as HTMLElement;
  const tabList = currentBtn.closest<HTMLElement>('[role="tablist"]');
  if (!tabList) return;

  const tabBtns = getTabBtns(tabList);
  const currentIndex = tabBtns.indexOf(currentBtn) + 1; // 1始まり
  if (currentIndex < 1) return;

  const orientation = toTabOrientation(tabList.getAttribute('aria-orientation'));
  const nextIndex = resolveTabNavKey(e.key, currentIndex, tabBtns.length, orientation);
  if (null === nextIndex) return;

  const nextBtn = tabBtns[nextIndex - 1];
  if (!nextBtn) return;

  e.preventDefault();
  selectTab(nextBtn);
  nextBtn.focus();
}

function setTabs(tabs: HTMLElement): void {
  const tabBtns = getTabBtns(tabs);
  tabBtns.forEach((tabBtn) => {
    tabBtn.addEventListener('click', tabControl);
    tabBtn.addEventListener('keydown', tabKeyControl);
  });

  // ディープリンク（?lism-tab={パネルのID}）
  const nowUrl = window?.location?.href;
  if (!nowUrl) return;

  const targetPanelId = new URL(nowUrl).searchParams.get('lism-tab');
  if (!targetPanelId) return;

  const target = tabBtns.find((tabBtn) => tabBtn.getAttribute('aria-controls') === targetPanelId);
  if (target) selectTab(target);
}

export default setTabs;
