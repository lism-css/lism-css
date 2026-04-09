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
  isLinkBox: 'is--linkBox',
  isSide: 'is--side',
  isSkipFlow: 'is--skipFlow',
  isVertical: 'is--vertical',
} as const;
