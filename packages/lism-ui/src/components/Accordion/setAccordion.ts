import { waitFrame, waitAnimation, maybePauseAnimation } from '../../helper/animation';

// hidden を付け外しする時の値
let ACCORDION_HIDDEN_VALUE = 'until-found';

type AccordionElements = {
  heading: HTMLElement;
  button: HTMLButtonElement;
  panel: HTMLElement;
  content: HTMLElement;
};

// アコーディオン要素から必要な要素を取得
const getAccordionElements = (accordionItem: HTMLElement): AccordionElements => {
  const heading = accordionItem.querySelector<HTMLElement>('.c--accordion_heading')!;
  const panel = accordionItem.querySelector<HTMLElement>('.c--accordion_panel')!;
  return {
    heading,
    button: heading.querySelector('button')!,
    panel,
    content: panel.querySelector<HTMLElement>('.c--accordion_content')!,
  };
};

// 親に data-allow-multiple がついていなければ、展開中のアコーディオンを閉じる
const maybeCloseOpenedItems = (accordionItem: HTMLElement): void => {
  const parent = accordionItem.parentNode as HTMLElement | null;
  if (!parent) return;

  if (parent.hasAttribute('data-allow-multiple')) return;

  parent.querySelectorAll<HTMLElement>(':scope > [data-opened]').forEach((_a) => void closeAccordion(_a));
};

async function openAccordion(accordionItem: HTMLElement): Promise<void> {
  const { panel, content, button } = getAccordionElements(accordionItem);

  maybePauseAnimation(panel);
  panel.removeAttribute('hidden');
  await waitFrame();

  accordionItem.style.setProperty('--_panel-h', `${content.offsetHeight}px`);
  await waitFrame();

  accordionItem.setAttribute('data-opened', '');
  button.setAttribute('aria-expanded', 'true');

  const status = await waitAnimation(panel);

  if ('canceled' !== status) {
    accordionItem.style.removeProperty('--_panel-h');
  }
}

async function closeAccordion(accordionItem: HTMLElement): Promise<void> {
  const { panel, button } = getAccordionElements(accordionItem);

  maybePauseAnimation(panel);
  accordionItem.style.setProperty('--_panel-h', `${panel.offsetHeight}px`);
  await waitFrame();

  accordionItem.removeAttribute('data-opened');
  button.setAttribute('aria-expanded', 'false');
  accordionItem.style.removeProperty('--_panel-h');

  const status = await waitAnimation(panel);

  if ('canceled' !== status) {
    panel.setAttribute('hidden', ACCORDION_HIDDEN_VALUE);
  }
}

function toggleAccordion(accordionItem: HTMLElement): void {
  if (accordionItem.hasAttribute('data-opened')) {
    void closeAccordion(accordionItem);
  } else {
    maybeCloseOpenedItems(accordionItem);
    void openAccordion(accordionItem);
  }
}

/**
 * 個別のアコーディオンにイベントをセット（React用にクリーンアップ関数を返す）
 */
export const setEvent = (accordionItem: HTMLElement): (() => void) => {
  const { button, panel } = getAccordionElements(accordionItem);

  if (panel.hasAttribute('hidden')) {
    ACCORDION_HIDDEN_VALUE = panel.getAttribute('hidden') ?? 'until-found';
  }

  const _clickEvent = (e: Event): void => {
    e.preventDefault();
    toggleAccordion(accordionItem);
  };

  const _beforematchEvent = (e: Event): void => {
    e.preventDefault();
    toggleAccordion(accordionItem);
  };

  button.addEventListener('click', _clickEvent);
  panel.addEventListener('beforematch', _beforematchEvent);

  return () => {
    button.removeEventListener('click', _clickEvent);
    panel.removeEventListener('beforematch', _beforematchEvent);
  };
};

/**
 * ページ内の全アコーディオンにイベントをセット（Astro用）
 */
const setAccordion = (): void => {
  const accordionAll = document.querySelectorAll<HTMLElement>('.c--accordion_item');
  accordionAll.forEach((accordionItem) => {
    setEvent(accordionItem);
  });
};
export default setAccordion;
