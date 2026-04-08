/**
 * React版 Detailsコンポーネント
 */
import getLismProps from 'lism-css/lib/getLismProps';
import { Lism, type LismComponentProps } from 'lism-css/react';
import { getDetailsProps, defaultProps } from '../getProps';

// スタイルのインポート
import '../_style.css';

type DetailsRootProps = LismComponentProps & { open?: boolean };

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
export function Summary({ children, ...props }: LismComponentProps) {
  return (
    <Lism as="summary" {...defaultProps.summary} {...props}>
      {children}
    </Lism>
  );
}

/**
 * Title - タイトルコンポーネント
 */
export function Title({ children, ...props }: LismComponentProps) {
  return (
    <Lism {...defaultProps.title} {...props}>
      {children}
    </Lism>
  );
}

/**
 * Icon - アイコンコンポーネント
 */
export function Icon({ children, ...props }: LismComponentProps) {
  return (
    <Lism {...defaultProps.icon} {...props}>
      {children}
    </Lism>
  );
}

/**
 * Content - コンテンツコンポーネント
 */
export function Content({ children, ...props }: LismComponentProps) {
  return (
    <Lism {...defaultProps.body}>
      <Lism {...defaultProps.content} {...props}>
        {children}
      </Lism>
    </Lism>
  );
}
