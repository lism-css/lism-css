import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../Lism';
import type { BoxProps } from '../../lib/types/LayoutProps';

export default function Box<T extends ElementType = 'div'>(props: LayoutComponentProps<T, BoxProps>) {
  return <Lism layout="box" {...props} />;
}
