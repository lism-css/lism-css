import type { ElementType } from 'react';
import { Lism, type LayoutComponentProps } from '../../Lism';
import type { SwitchColumnsProps } from '../../../lib/types/LayoutProps';

export default function SwitchColumns<T extends ElementType = 'div'>(props: LayoutComponentProps<T, SwitchColumnsProps>) {
  return <Lism layout="switchColumns" {...props} />;
}
