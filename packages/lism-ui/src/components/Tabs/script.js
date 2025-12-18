import setEvent from './setEvent.js';

document.addEventListener('DOMContentLoaded', function () {
	const tabsAll = document.querySelectorAll('.d--tabs');
	tabsAll.forEach((tabs) => {
		setEvent(tabs);
	});
});
