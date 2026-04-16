export default {
  isContainer: 'is--container',
  isWrapper: {
    className: 'is--wrapper',
    preset: ['s', 'l'],
    presetClass: '-contentSize',
    customVar: '--contentSize',
    tokenKey: 'sz',
  },
  isLayer: 'is--layer',
  isBoxLink: 'is--boxLink',
  isCoverLink: 'is--coverLink',
  isSide: 'is--side',
  isSkipFlow: 'is--skipFlow',
} as const;
