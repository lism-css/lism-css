import { Lism } from '../../Lism';
import type { LismComponentProps } from '../../Lism/Lism';
import type { CssValue } from '../../../lib/types/LayoutProps';

export interface DecoratorOwnProps {
  size?: CssValue;
}

export type DecoratorProps = LismComponentProps & DecoratorOwnProps;

export default function Decorator(props: DecoratorProps) {
  return <Lism atomic="decorator" aria-hidden="true" {...props} />;
}
