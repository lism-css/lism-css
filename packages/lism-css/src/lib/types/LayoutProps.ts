// ------------------------------------------------------------
// レイアウト固有 Props 型 & 判別可能ユニオン
// ------------------------------------------------------------

export type CssValue = string | number;

// layout なし
export interface NoLayoutProps {
	layout?: undefined;
}

// 固有 props なし（個別エクスポート用）
export interface BoxProps {
	layout: 'box';
}
export interface CenterProps {
	layout: 'center';
}
export interface ClusterProps {
	layout: 'cluster';
}
export interface FlexProps {
	layout: 'flex';
}
export interface FrameProps {
	layout: 'frame';
}
export interface GridLayoutProps {
	layout: 'grid';
}
export interface StackProps {
	layout: 'stack';
}
export interface ColumnsProps {
	layout: 'columns';
}

// layout 固有の extra props を持つ型
export interface FlowLayoutProps {
	layout: 'flow';
	flow?: CssValue;
}
export interface FluidColsProps {
	layout: 'fluidCols';
	autoFill?: boolean;
}

export interface SideMainProps {
	layout: 'sideMain';
	sideW?: CssValue;
	mainW?: CssValue;
}
export interface SwitchColsProps {
	layout: 'switchCols';
	breakSize?: CssValue;
}

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
