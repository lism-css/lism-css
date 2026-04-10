import PRESETS from './presets';
import type { LayoutType } from 'lism-css/lib/getLismProps';
import type { IconProps } from 'lism-css/react';

export type AlertProps = {
  type?: string;
  keycolor?: string;
  layout?: LayoutType;
  icon?: IconProps['icon'];
  flow?: string;
  [key: string]: unknown;
};

export default function getAlertProps({ type = 'alert', keycolor, layout = 'flex', icon, flow = 's', ...props }: AlertProps) {
  const presetData = type ? PRESETS[type] : null;
  const _icon = (icon || presetData?.icon || 'info') as IconProps['icon'];
  const _color = keycolor || presetData?.color || 'currentColor';

  return {
    icon: _icon,
    layout,
    flow,
    lismClass: 'c--alert u--cbox',
    keycolor: _color,
    ai: 'center',
    p: '15',
    g: '15',
    bd: true,
    bdrs: '10',
    ...props,
  };
}
