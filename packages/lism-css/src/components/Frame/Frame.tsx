import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../Lism';
import type { FrameProps } from '../../lib/types/LayoutProps';

export default function Frame<T extends ElementType = 'div'>(props: LayoutComponentProps<T, FrameProps>) {
  return <Lism layout="frame" {...props} />;
}
