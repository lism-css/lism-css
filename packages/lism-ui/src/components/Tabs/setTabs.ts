/**
 * タブ
 */
function tabControl(e: MouseEvent): void {
  e.preventDefault();
  const clickedButton = e.currentTarget as HTMLButtonElement;
  toggleAriaData(clickedButton);
}

const toggleAriaData = (clickedButton: HTMLButtonElement): void => {
  const isOpend = 'true' === clickedButton.getAttribute('aria-selected');
  if (isOpend) return;

  const targetID = clickedButton.getAttribute('aria-controls');
  if (!targetID) return;
  const targetBody = document.getElementById(targetID);
  if (null === targetBody) return;

  const parentTabList = clickedButton.parentNode?.parentNode as HTMLElement | null;
  if (!parentTabList) return;

  const selectedButton = parentTabList.querySelector<HTMLButtonElement>('[aria-selected="true"]');
  if (!selectedButton) return;

  const displayedID = selectedButton.getAttribute('aria-controls');
  if (!displayedID) return;
  const displayedBody = document.getElementById(displayedID);

  clickedButton.setAttribute('aria-selected', 'true');
  selectedButton.setAttribute('aria-selected', 'false');
  displayedBody?.setAttribute('aria-hidden', 'true');
  targetBody.setAttribute('aria-hidden', 'false');
};

function setTabs(tabs: HTMLElement): void {
  const tabBtns = tabs.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
  tabBtns.forEach((tabBtn) => {
    tabBtn.addEventListener('click', function (e) {
      tabControl(e);
    });
  });

  const nowUrl = window?.location?.href;
  if (!nowUrl) return;

  const hasTabLink = -1 !== nowUrl.indexOf('?lism-tab=');
  if (!hasTabLink) return;

  const url = new URL(nowUrl);
  const params = url.searchParams;

  const targetTabId = params.get('lism-tab');
  if (!targetTabId) return;

  const target = tabs.querySelector<HTMLButtonElement>(`[aria-controls="${targetTabId}"]`);
  if (target) {
    tabs.dataset.hasTabLink = '1';
    toggleAriaData(target);
    setTimeout(() => {
      delete tabs.dataset.hasTabLink;
    }, 10);
  }
}

export default setTabs;
