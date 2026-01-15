/** @type {import('lint-staged').Config} */
export default {
	// 現時点では lism-css のみ typecheck スクリプトを持つため、
	// TypeScript ファイルの型チェック対象はこのパッケージに限定している。
	// 他のパッケージ（例: lism-ui）に TypeScript ファイルや typecheck スクリプトを追加した場合は、
	// 対象パターンやコマンドを見直し、必要に応じて型チェック対象を拡張すること。
	'packages/lism-css/**/*.{ts,tsx}': [() => 'pnpm --filter lism-css run typecheck'],
	'*.{js,mjs,cjs,jsx,ts,tsx}': ['pnpm exec eslint --fix', 'pnpm exec prettier --write'],
	'*.{scss,css}': ['pnpm exec stylelint --fix'],
	'*.astro': ['pnpm exec eslint --fix', 'pnpm exec prettier --write'],
	'*.{md,mdx,json,yaml,yml}': ['pnpm exec prettier --write'],
};
