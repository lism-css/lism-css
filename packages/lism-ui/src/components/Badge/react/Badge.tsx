import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import buildModifierClass from '../../../helper/buildModifierClass';
import '../_style.css';

type BadgeOwnProps = { variant?: string };

export default function Badge<T extends ElementType = 'span'>(props: LismComponentProps<T> & BadgeOwnProps) {
  const { variant, className, ...rest } = props as { variant?: string; className?: string } & Record<string, unknown>;
  return (
    <Lism
      as="span"
      d="inline-flex"
      fz="xs"
      lh="xs"
      py="5"
      px="10"
      bdrs="10"
      {...rest}
      className={atts(className, buildModifierClass('c--badge', { variant }))}
    />
  );
}
