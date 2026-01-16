declare module '*.astro' {
	type AstroComponentFactory = import('astro/runtime/server/index.js').AstroComponentFactory;
	const component: AstroComponentFactory;
	export default component;
}
