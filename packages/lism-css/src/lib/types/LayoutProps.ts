// ------------------------------------------------------------
// レイアウト固有 Props 型 & 判別可能ユニオン
// ------------------------------------------------------------

export type CssValue = string | number;

// layout なし
export type NoLayoutProps = { layout?: undefined };

// 固有 props なし（個別エクスポート用）
export type BoxProps = { layout: 'box' };
export type CenterProps = { layout: 'center' };
export type ClusterProps = { layout: 'cluster' };
export type FlexProps = { layout: 'flex' };
export type FrameProps = { layout: 'frame' };
export type GridLayoutProps = { layout: 'grid' };
export type StackProps = { layout: 'stack' };
export type ColumnsProps = { layout: 'columns' };

// layout 固有の extra props を持つ型
export type FlowLayoutProps = { layout: 'flow'; flow?: CssValue };
export type FluidColsProps = { layout: 'fluidCols'; autoFill?: boolean };

export type SideMainProps = { layout: 'sideMain'; sideW?: CssValue; mainW?: CssValue };
export type SwitchColsProps = { layout: 'switchCols'; breakSize?: CssValue };

// 判別可能ユニオン
export type LayoutSpecificProps =
	| NoLayoutProps
	| BoxProps
	| CenterProps
	| ClusterProps
	| ColumnsProps
	| FlexProps
	| FlowLayoutProps
	| FluidColsProps
	| FrameProps
	| GridLayoutProps
	| StackProps
	| SideMainProps
	| SwitchColsProps;

// LayoutType は LayoutSpecificProps から導出（NoLayoutProps を除く）
export type LayoutType = Exclude<LayoutSpecificProps, NoLayoutProps>['layout'];

// LismProps に extends させるためのフラットなレイアウト関連 Props
// 固有 props は LayoutSpecificProps（discriminated union）側で型付けするため、ここでは layout のみ定義
export interface LayoutProps {
	layout?: LayoutType;
}
