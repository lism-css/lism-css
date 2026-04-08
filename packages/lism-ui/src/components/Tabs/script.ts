import setTabs from './setTabs';

document.addEventListener('DOMContentLoaded', function () {
  const tabsAll = document.querySelectorAll<HTMLElement>('.c--tabs');
  tabsAll.forEach((tabs) => {
    setTabs(tabs);
  });
});
