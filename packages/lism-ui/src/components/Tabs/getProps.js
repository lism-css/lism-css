import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';

export default function getTabsProps({ lismClass, ...props }) {
  return {
    lismClass: atts(lismClass, 'c--tabs'),
    ...props,
  };
}

export function getTabProps({ set, unset, ...props }) {
  return {
    as: 'button',
    lismClass: 'c--tabs_tab',
    set: mergeSet('plain', set, unset),
    ...props,
  };
}
