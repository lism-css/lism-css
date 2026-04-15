/**
 * 各サブコンポーネント用のデフォルトプロパティ
 */
export const defaultProps = {
  summary: { layout: 'flex', g: '10', ai: 'center' },
  title: { as: 'span', fx: '1', set: 'plain' },
  icon: { atomic: 'icon', as: 'span', 'aria-hidden': 'true' },
  content: { layout: 'flow', flow: 's' },
} as const;
