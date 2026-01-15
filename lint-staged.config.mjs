/** @type {import('lint-staged').Config} */
export default {
	'packages/lism-css/**/*.{ts,tsx}': [() => 'pnpm --filter lism-css run typecheck'],
	'*.{js,mjs,cjs,jsx,ts,tsx}': ['pnpm exec eslint --fix', 'pnpm exec prettier --write'],
	'*.{scss,css}': ['pnpm exec stylelint --fix'],
	'*.astro': ['pnpm exec eslint --fix', 'pnpm exec prettier --write'],
	'*.{md,mdx,json,yaml,yml}': ['pnpm exec prettier --write'],
};
