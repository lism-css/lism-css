/// <reference types="astro/client" />

// Google Analytics の dataLayer 用
interface Window {
	dataLayer: unknown[];
}

declare module '*.astro' {
	import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
	const component: AstroComponentFactory;
	export default component;
}
