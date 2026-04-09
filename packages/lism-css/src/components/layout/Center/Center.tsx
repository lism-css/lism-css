import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { CenterProps } from '../../../lib/types/LayoutProps';

export default function Center<T extends ElementType = 'div'>(props: LayoutComponentProps<T, CenterProps>) {
  return <Lism layout="center" {...props} />;
}
