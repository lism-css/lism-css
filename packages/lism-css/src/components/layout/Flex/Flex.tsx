import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { FlexProps } from '../../../lib/types/LayoutProps';

export default function Flex<T extends ElementType = 'div'>(props: LayoutComponentProps<T, FlexProps>) {
  return <Lism layout="flex" {...props} />;
}
