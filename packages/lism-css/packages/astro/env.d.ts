/// <reference types="astro/client" />

declare module '*.astro' {
	const component: (props: Record<string, unknown>) => unknown;
	export default component;
}

declare module 'astro:assets' {
	export const Image: typeof import('astro/components/Image.astro').default;
}
