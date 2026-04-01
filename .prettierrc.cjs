// 各種オプションについて：https://prettier.io/docs/en/options.html
module.exports = {
  useTabs: false,
  tabWidth: 2,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'es5',
  printWidth: 150,
  semi: true,
  bracketSpacing: true,
  arrowParens: 'always',

  plugins: ['prettier-plugin-astro'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro',
      },
    },
  ],
};
