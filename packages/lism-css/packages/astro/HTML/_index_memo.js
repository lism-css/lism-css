// コンポーネントを動的に生成するユーティリティを使った方法.( Astro アプデで動かなくなるリスクあり)

import { createComponent, renderComponent } from 'astro/runtime/server/index.js';
import Lism from '../Lism/Lism.astro';

// <Lism tag="*"> の薄いラッパーを動的に生成するユーティリティ
const createHTMLComponent = (tag, baseProps = {}) =>
	createComponent((result, props = {}, slots = {}) => {
		return renderComponent(result, 'Lism', Lism, { tag, ...baseProps, ...props }, slots);
	});

// 見出しだけ lv でタグ名を変える
const createHeadingComponent = () =>
	createComponent((result, props = {}, slots = {}) => {
		const { lv = '1', ...rest } = props;
		return renderComponent(result, 'Lism', Lism, { tag: `h${lv}`, ...rest }, slots);
	});

// よく使うタグをまとめてラップ
const tags = ['div', 'p', 'span', 'a', 'img', 'ul', 'ol', 'li'];
const HTML = Object.fromEntries(tags.map((tag) => [tag, createHTMLComponent(tag)]));

// button だけ setPlain を付与
HTML.button = createHTMLComponent('button', { setPlain: true });

// h1~h6 を lv で分岐
HTML.h = createHeadingComponent();

export default HTML;
