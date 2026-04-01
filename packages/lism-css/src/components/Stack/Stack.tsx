import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../Lism';
import type { StackProps } from '../../lib/types/LayoutProps';

export default function Stack<T extends ElementType = 'div'>(props: LayoutComponentProps<T, StackProps>) {
  return <Lism layout="stack" {...props} />;
}
