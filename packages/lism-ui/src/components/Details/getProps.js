import atts from 'lism-css/lib/helper/atts';

/**
 * Detailsコンポーネントのルート要素用プロパティを生成
 * @param {Object} props - コンポーネントのプロパティ
 * @param {string} props.lismClass - 追加のLismクラス
 * @returns {Object} 処理済みプロパティ
 */
export function getDetailsProps({ lismClass, ...props }) {
  props.lismClass = atts(lismClass, 'c--details');
  return props;
}

/**
 * 各サブコンポーネント用のデフォルトプロパティ
 */
export const defaultProps = {
  summary: { lismClass: 'c--details_summary', layout: 'flex', g: '10', ai: 'center' },
  title: { lismClass: 'c--details_title', as: 'span', fx: '1', set: 'plain' },
  icon: { lismClass: 'c--details_icon a--icon', as: 'span', 'aria-hidden': 'true' },
  body: { lismClass: 'c--details_body' },
  content: { lismClass: 'c--details_content', layout: 'flow', flow: 's' },
};
