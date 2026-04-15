import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';
import type { LismProps } from 'lism-css/lib/getLismProps';

export type DetailsProps = {
  className?: string;
  [key: string]: unknown;
};

/**
 * Detailsコンポーネントのルート要素用プロパティを生成
 */
export function getDetailsProps({ className, ...props }: DetailsProps): LismProps {
  props.className = atts(className, 'c--details');
  return props;
}

export function getTitleProps({ className, set, ...props }: { className?: string; set?: unknown; [key: string]: unknown }) {
  return {
    className: atts(className, 'c--details_title'),
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
  summary: { className: 'c--details_summary', layout: 'flex', g: '10', ai: 'center' },
  icon: { className: 'c--details_icon', atomic: 'icon', as: 'span', 'aria-hidden': 'true' },
  body: { className: 'c--details_body' },
  content: { className: 'c--details_content', layout: 'flow', flow: 's' },
} as const;
