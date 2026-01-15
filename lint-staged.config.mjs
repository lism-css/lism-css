/** @type {import('lint-staged').Config} */
export default {
	'packages/lism-css/**/*.{ts,tsx}': [() => 'tsc --noEmit -p packages/lism-css/tsconfig.json'],
	'*.{js,mjs,cjs,ts,tsx,jsx}': ['eslint --fix', 'prettier --write'],
	'*.{scss,css}': ['stylelint --fix'],
	'*.astro': ['eslint --fix', 'prettier --write'],
	'*.{md,mdx,json,yaml,yml}': ['prettier --write'],
};
