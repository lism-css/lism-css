/**
 * lism-css/react および lism-css/astro の型定義オーバーライド（暫定対策）
 *
 * 現状、lism-css のコンポーネント（JSX）から自動生成される型定義では、
 * children, as, exProps などのプロパティが必須として推論されてしまう。
 * これにより lism-ui 側で型エラー（TS2739, TS2741）が発生する。
 *
 * lism-css 本体のTypeScript化が完了したら、このファイルは削除すること。
 *
 * @see packages/lism-css - TypeScript化の進捗を確認
 */
import type { ReactNode, JSX } from 'react';

declare module 'lism-css/react' {
  interface LismProps {
    [x: string]: unknown;
    children?: ReactNode;
    as?: unknown;
    exProps?: Record<string, unknown>;
    layout?: string;
    lismClass?: string;
  }

  interface IconProps {
    [x: string]: unknown;
    children?: ReactNode;
    icon?: string;
  }

  interface CenterProps {
    [x: string]: unknown;
    children?: ReactNode;
    isSide?: boolean;
  }

  interface FlowProps {
    [x: string]: unknown;
    children?: ReactNode;
    flow?: string;
  }

  export function Lism(props: LismProps): JSX.Element;
  export function Icon(props: IconProps): JSX.Element;
  export function Center(props: CenterProps): JSX.Element;
  export function Flow(props: FlowProps): JSX.Element;
}

/**
 * lism-css/astro の型定義オーバーライド（暫定対策）
 *
 * Astro コンポーネントにも lismClass などの Lism Props を渡せるようにする。
 */
declare module 'lism-css/astro' {
  // Astro コンポーネントの基本型
  type AstroComponent<Props = Record<string, unknown>> = (props: Props) => unknown;

  // 共通の Lism Props（任意のプロパティを許容）
  interface LismProps {
    [x: string]: unknown;
    as?: unknown;
    exProps?: Record<string, unknown>;
    layout?: string;
    lismClass?: string;
    variant?: string;
  }

  export const Lism: AstroComponent<LismProps>;
  export const Grid: AstroComponent<LismProps>;
  export const Flex: AstroComponent<LismProps>;
  export const Stack: AstroComponent<LismProps>;
  export const Flow: AstroComponent<LismProps & { flow?: string }>;
  export const Frame: AstroComponent<LismProps>;
  export const Decorator: AstroComponent<LismProps>;
  export const Center: AstroComponent<LismProps>;
  export const Cluster: AstroComponent<LismProps>;
  export const Box: AstroComponent<LismProps>;
  export const Layer: AstroComponent<LismProps>;
  export const Container: AstroComponent<LismProps>;
  export const Wrapper: AstroComponent<LismProps>;
  export const Columns: AstroComponent<LismProps>;
  export const SideMain: AstroComponent<LismProps>;
  export const SwitchCols: AstroComponent<LismProps>;
  export const FluidCols: AstroComponent<LismProps>;
  export const LinkBox: AstroComponent<LismProps>;
  export const OverlayLink: AstroComponent<LismProps>;
  export const Media: AstroComponent<LismProps>;
  export const Icon: AstroComponent<LismProps & { icon?: string }>;
  export const Spacer: AstroComponent<LismProps>;
  export const Divider: AstroComponent<LismProps>;
  export const Dummy: AstroComponent<LismProps>;
}
