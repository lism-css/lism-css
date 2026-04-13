// ------------------------------------------------------------
// Atomic 固有 Props 型 & 判別可能ユニオン
// ------------------------------------------------------------

import type { CssValue } from './LayoutProps';

// atomic なし
export interface NoAtomicProps {
  atomic?: undefined;
}

// divider
export interface DividerAtomicProps {
  atomic: 'divider';
}

// spacer（w/h は LismPropsBase 基底にあるため再宣言不要）
export interface SpacerAtomicProps {
  atomic: 'spacer';
}

// decorator
export interface DecoratorAtomicProps {
  atomic: 'decorator';
  size?: CssValue;
  clipPath?: string;
  boxSizing?: string;
}

// icon（内部用。user-facing では案内しない）
export interface IconAtomicProps {
  atomic: 'icon';
}

// 判別可能ユニオン
export type AtomicSpecificProps = NoAtomicProps | DividerAtomicProps | SpacerAtomicProps | DecoratorAtomicProps | IconAtomicProps;

// AtomicType は AtomicSpecificProps から導出（NoAtomicProps を除く）
export type AtomicType = Exclude<AtomicSpecificProps, NoAtomicProps>['atomic'];

// LismProps に extends させるためのフラットな atomic 関連 Props
// 固有 props は AtomicSpecificProps（discriminated union）側で型付けするため、ここでは atomic のみ定義
export interface AtomicProps {
  atomic?: AtomicType;
}
