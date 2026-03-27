/// <reference types="astro/client" />

declare module 'astro:assets' {
	export const Image: typeof import('astro/components/Image.astro').default;
}
