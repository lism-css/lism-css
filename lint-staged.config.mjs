/** @type {import('lint-staged').Config} */
export default {
	'packages/lism-css/**/*.{ts,tsx}': [() => 'pnpm --filter lism-css exec tsc --noEmit'],
	'*.{js,mjs,cjs,ts,tsx,jsx}': ['pnpm exec eslint --fix', 'pnpm exec prettier --write'],
	'*.{scss,css}': ['pnpm exec stylelint --fix'],
	'*.astro': ['pnpm exec eslint --fix', 'pnpm exec prettier --write'],
	'*.{md,mdx,json,yaml,yml}': ['pnpm exec prettier --write'],
};
