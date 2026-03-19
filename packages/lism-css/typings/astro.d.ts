declare module '*.astro' {
	const component: (props: Record<string, unknown>) => unknown;
	export default component;
}
