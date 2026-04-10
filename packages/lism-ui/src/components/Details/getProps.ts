import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';
import type { LismProps } from 'lism-css/lib/getLismProps';

export type DetailsProps = {
  lismClass?: string;
  [key: string]: unknown;
};

/**
 * Detailsコンポーネントのルート要素用プロパティを生成
 */
export function getDetailsProps({ lismClass, ...props }: DetailsProps): LismProps {
  props.lismClass = atts(lismClass, 'c--details');
  return props;
}

export function getTitleProps({ set, unset, ...props }: Record<string, unknown>) {
  return {
    lismClass: 'c--details_title',
    as: 'span',
    fx: '1',
    set: mergeSet('plain', set, unset),
    ...props,
  };
}

/**
 * 各サブコンポーネント用のデフォルトプロパティ
 */
export const defaultProps = {
  summary: { lismClass: 'c--details_summary', layout: 'flex', g: '10', ai: 'center' },
  icon: { lismClass: 'c--details_icon a--icon', as: 'span', 'aria-hidden': 'true' },
  body: { lismClass: 'c--details_body' },
  content: { lismClass: 'c--details_content', layout: 'flow', flow: 's' },
} as const;
