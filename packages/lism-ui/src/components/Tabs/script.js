import setTabs from './setTabs.js';

document.addEventListener('DOMContentLoaded', function () {
	const tabsAll = document.querySelectorAll('.c--tabs');
	tabsAll.forEach((tabs) => {
		setTabs(tabs);
	});
});
