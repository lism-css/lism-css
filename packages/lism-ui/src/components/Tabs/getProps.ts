import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';

type TabsProps = {
  lismClass?: string;
  [key: string]: unknown;
};

export default function getTabsProps({ lismClass, ...props }: TabsProps) {
  return {
    lismClass: atts(lismClass, 'c--tabs'),
    ...props,
  };
}

export function getTabProps({ set, ...props }: Record<string, unknown>) {
  return {
    as: 'button',
    lismClass: 'c--tabs_tab',
    set: mergeSet('plain', set).join(' '),
    ...props,
  };
}
