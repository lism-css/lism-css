// パネル・スナックバーの文言は両言語とも英語で共通
export const STRINGS = {
  invalidHtml: 'Invalid HTML syntax',
  invalidJsx: 'Invalid JSX syntax',
  characterLimit: (limit: number): string => `Character limit reached (${limit.toLocaleString('en-US')})`,
  restoreInitialCode: 'Restore initial code',
  interrupted: 'Interrupted',
  resume: 'Resume',
  done: 'Done',
  stopDemo: 'Stop the AI demo',
  liveDemo: 'Live Demo',
  playDemo: 'Play the live demo',
  pauseDemo: 'Pause the live demo',
} as const;
