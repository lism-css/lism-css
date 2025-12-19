import setTabs from './setTabs.js';

document.addEventListener('DOMContentLoaded', function () {
	const tabsAll = document.querySelectorAll('.d--tabs');
	tabsAll.forEach((tabs) => {
		setTabs(tabs);
	});
});
