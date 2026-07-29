// KvEditor の UI 文言。パネル・スナックバーの文言は両言語とも英語で共通（README の i18n 節参照）
export const STRINGS = {
  invalidHtml: 'Invalid HTML syntax',
  invalidJsx: 'Invalid JSX syntax',
  characterLimit: (limit: number): string => `Character limit reached (${limit.toLocaleString('en-US')})`,
  emptyEditor: 'The editor is empty.',
  restoreInitialCode: 'Restore initial code',
  interrupted: 'Interrupted',
  resume: 'Resume',
  done: 'Done',
  stopDemo: 'Stop the AI demo',
} as const;
