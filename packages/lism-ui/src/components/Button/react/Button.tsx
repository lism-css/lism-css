import type { ElementType } from 'react';
import { Flex, type LismComponentProps } from 'lism-css/react';
import atts from 'lism-css/lib/helper/atts';
import buildModifierClass from '../../../helper/buildModifierClass';
import '../_style.css';

type ButtonOwnProps = { variant?: string };

export default function Button<T extends ElementType = 'a'>(props: LismComponentProps<T> & ButtonOwnProps) {
  const { variant, className, ...rest } = props as { variant?: string; className?: string } & Record<string, unknown>;
  return <Flex as="a" lh="s" py="10" px="20" hov="-o" className={atts(className, buildModifierClass('c--button', { variant }))} {...rest} />;
}
