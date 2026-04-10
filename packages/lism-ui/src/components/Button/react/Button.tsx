import type { ElementType } from 'react';
import { Flex, type LismComponentProps } from 'lism-css/react';
import '../_style.css';

export default function Button<T extends ElementType = 'a'>(props: LismComponentProps<T>) {
  return <Flex lismClass="c--button" as="a" lh="s" py="10" px="20" hov="o" {...props} />;
}
