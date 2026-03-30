import { dirname } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
	return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
	stories: [
		'../stories/**/*.mdx',
		'../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
		'../../../packages/lism-css/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
		'../../../packages/lism-ui/src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)',
	],
	addons: [
		getAbsolutePath('@chromatic-com/storybook'),
		getAbsolutePath('@storybook/addon-vitest'),
		getAbsolutePath('@storybook/addon-a11y'),
		getAbsolutePath('@storybook/addon-docs'),
		getAbsolutePath('@storybook/addon-onboarding'),
	],
	framework: getAbsolutePath('@storybook/react-vite'),
	core: {
		builder: '@storybook/builder-vite',
	},
	viteFinal: (config) => {
		config.plugins = config.plugins || [];
		config.plugins.push(react());
		return config;
	},
};
export default config;
