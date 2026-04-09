/**
 * React版 Detailsコンポーネント
 */
import type { ElementType } from 'react';
import getLismProps from 'lism-css/lib/getLismProps';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { getDetailsProps, getTitleProps, defaultProps } from '../getProps';

// スタイルのインポート
import '../_style.css';

type DetailsRootProps = LismComponentProps<'details'> & { open?: boolean };

/**
 * Details - ルートコンポーネント
 * details要素をレンダリング
 */
export function Details({ children, open, ...props }: DetailsRootProps) {
  const lismProps = getLismProps(getDetailsProps(props));

  return (
    <details open={open} {...lismProps}>
      {children}
    </details>
  );
}

/**
 * Summary - サマリーコンポーネント
 * details要素のsummary部分
 */
export function Summary<T extends ElementType = 'summary'>({ children, ...props }: LismComponentProps<T>) {
  return (
    <Lism as="summary" {...(defaultProps.summary as object)} {...(props as object)}>
      {children}
    </Lism>
  );
}

/**
 * Title - タイトルコンポーネント
 */
export function Title<T extends ElementType = 'span'>({ children, ...props }: LismComponentProps<T>) {
  return <Lism {...(getTitleProps(props as Record<string, unknown>) as object)}>{children}</Lism>;
}

/**
 * Icon - アイコンコンポーネント
 */
export function Icon<T extends ElementType = 'span'>({ children, ...props }: LismComponentProps<T>) {
  return (
    <Lism {...(defaultProps.icon as object)} {...(props as object)}>
      {children}
    </Lism>
  );
}

/**
 * Content - コンテンツコンポーネント
 */
export function Content<T extends ElementType = 'div'>({ children, ...props }: LismComponentProps<T>) {
  return (
    <Lism {...defaultProps.body}>
      <Lism {...(defaultProps.content as object)} {...(props as object)}>
        {children}
      </Lism>
    </Lism>
  );
}
