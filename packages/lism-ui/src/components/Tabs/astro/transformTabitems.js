// <lism-placeholder-tabitem> → div.tabitem へ 変換
export default function transformHTML(htmlString, tabID, defaultIndex) {
	let index = 1; // 1スタート
	let btns = [];
	let panels = [];

	// <lism-placeholder-tabitem>でコンテンツを囲んでいるので中身を解析する。
	const regex = /<lism-placeholder-tabitem(.*?)>(.*?)<\/lism-placeholder-tabitem>/gs;
	const matches = [...htmlString.matchAll(regex)];

	// console.log(matches);
	matches.forEach((match) => {
		// const tabItemAttrs = match[1]; // 使わないがdata-astro-source-file属性が自動でついてきたりするので、属性値があっても問題ないようにしている。
		const tabItemContent = match[2];

		const controlId = `${tabID}-${index}`;
		const isActive = index === defaultIndex;
		index++;

		// <lism-placeholder-tabtbn>からタブボタンを生成
		const btnMatch = tabItemContent.match(/<button(.*?)>(.*?)<\/button>(.*)/s);
		if (!btnMatch) return;
		let btnAtts = btnMatch[1];
		let btnContent = btnMatch[2];
		let panel = btnMatch[3];

		// btnContent = btnContent.replace(` slot="tab"`, '');
		btnAtts = btnAtts.replace(`aria-controls="tab-0"`, `aria-controls="${controlId}"`);
		panel = panel.replace(`id="tab-0"`, `id="${controlId}"`);
		if (isActive) {
			btnAtts = btnAtts.replace(/aria-selected="false"/, 'aria-selected="true"');
			panel = panel.replace(/aria-hidden="true"/, 'aria-hidden="false"');
		}

		btns.push(`<button${btnAtts}>${btnContent}</button>`);
		panels.push(panel);
	});

	return { btns, panels };
}
