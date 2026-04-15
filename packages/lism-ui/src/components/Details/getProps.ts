import mergeSet from 'lism-css/lib/helper/mergeSet';

export function getTitleProps({ set, ...props }: { set?: unknown; [key: string]: unknown }) {
  return {
    as: 'span',
    fx: '1',
    set: mergeSet('plain', set),
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
