export function getTitleProps({ set = 'plain', ...props }: { set?: unknown; [key: string]: unknown }) {
  return {
    as: 'span',
    fx: '1',
    set,
    ...props,
  };
}

/**
 * 各サブコンポーネント用のデフォルトプロパティ
 */
export const defaultProps = {
  summary: { layout: 'flex', g: '10', ai: 'center' },
  icon: { atomic: 'icon', as: 'span', 'aria-hidden': 'true' },
  content: { layout: 'flow', flow: 's' },
} as const;
