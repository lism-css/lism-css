/// <reference types="astro/client" />

declare module '*.astro' {
	import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
	const component: AstroComponentFactory;
	export default component;
}
