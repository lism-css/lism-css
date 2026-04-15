import PRESETS from './presets';
import atts from 'lism-css/lib/helper/atts';
import type { IconProps } from 'lism-css/react';

export type CalloutProps = {
  type?: string;
  keycolor?: string;
  icon?: IconProps['icon'];
  title?: string;
  flow?: string;
  className?: string;
  [key: string]: unknown;
};

export default function getCalloutProps({ type = 'note', keycolor, icon, title, flow = 's', className, ...props }: CalloutProps) {
  const presetData = type ? PRESETS[type] : null;
  const _icon = (icon || presetData?.icon || 'note') as IconProps['icon'];
  const _keycolor = keycolor || presetData?.color || null;

  return {
    icon: _icon,
    title,
    flow,
    className: atts(className, 'c--callout'),
    util: 'cbox',
    set: 'shadow',
    keycolor: _keycolor,
    p: '20',
    g: '10',
    bdc: 'keycolor',
    'bd-x-s': '-',
    bdw: '3px',
    bxsh: '10',
    ...props,
  };
}
