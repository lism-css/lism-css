import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { SideMainProps } from '../../../lib/types/LayoutProps';

export default function SideMain<T extends ElementType = 'div'>(props: LayoutComponentProps<T, SideMainProps>) {
  return <Lism layout="sideMain" {...props} />;
}
