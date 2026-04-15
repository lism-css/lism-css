import atts from 'lism-css/lib/helper/atts';
import mergeSet from 'lism-css/lib/helper/mergeSet';
import buildModifierClass from '../../helper/buildModifierClass';

type TabsProps = {
  className?: string;
  variant?: string;
  [key: string]: unknown;
};

export default function getTabsProps({ className, variant, ...props }: TabsProps) {
  return {
    className: atts(className, buildModifierClass('c--tabs', { variant })),
    ...props,
  };
}

export function getTabProps({ className, set, ...props }: { className?: string; set?: unknown; [key: string]: unknown }) {
  return {
    as: 'button',
    className: atts(className, 'c--tabs_tab'),
    set: mergeSet('plain', set),
    ...props,
  };
}
