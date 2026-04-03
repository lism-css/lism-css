import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../Lism';

type GroupAllowedTag = 'div' | 'section' | 'article' | 'figure' | 'nav' | 'aside' | 'header' | 'footer' | 'main' | 'fieldset' | 'hgroup';

export default function Group<T extends GroupAllowedTag | Exclude<ElementType, string> = 'div'>({ as, ...props }: LismComponentProps<T>) {
  return <Lism as={as ?? 'div'} {...props} />;
}
