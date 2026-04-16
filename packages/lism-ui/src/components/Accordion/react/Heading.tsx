import type { ElementType } from 'react';
import atts from 'lism-css/lib/helper/atts';
import { Lism, type LismComponentProps } from 'lism-css/react';

/**
 * 見出しエリアのラッパー（デフォルトは <div role="heading">）
 * as に h2〜h6 を指定すると role は付与されない
 */
export default function Heading<T extends ElementType = 'div'>({
  children,
  className,
  as,
  role,
  ...props
}: LismComponentProps<T> & { role?: string }) {
  const isDiv = !as || as === 'div';
  return (
    <Lism
      as={(as ?? 'div') as 'div'}
      className={atts(className, 'c--accordion_heading')}
      set="plain"
      role={isDiv ? (role ?? 'heading') : role}
      {...(props as object)}
    >
      {children}
    </Lism>
  );
}
