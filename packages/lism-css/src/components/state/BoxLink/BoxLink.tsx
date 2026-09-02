import type { ElementType } from 'react';
import { Lism, type LismComponentProps } from '../../Lism';

type BoxLinkProps<T extends ElementType = 'a'> = LismComponentProps<T>;

export default function BoxLink<T extends ElementType = 'a'>({ as, children, ...props }: BoxLinkProps<T>) {
  const hasHref = !!(props as Record<string, unknown>).href;
  // hrefのない既定のa要素はdivへ置き換える。
  const tag: ElementType = !hasHref && (as ?? 'a') === 'a' ? 'div' : (as ?? 'a');

  return (
    <Lism isBoxLink as={tag} {...(props as LismComponentProps<ElementType>)}>
      {children}
    </Lism>
  );
}
