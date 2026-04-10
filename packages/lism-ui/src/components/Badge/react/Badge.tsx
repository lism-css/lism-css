import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from 'lism-css/react';
import '../_style.css';

export default function Badge<T extends ElementType = 'span'>(props: LismComponentProps<T>) {
  return <Lism lismClass="c--badge" as="span" d="inline-flex" fz="xs" lh="xs" py="5" px="10" bdrs="10" {...props} />;
}
