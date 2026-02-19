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
export type ColumnsProps = { layout: 'columns' };
export type FlexProps = { layout: 'flex' };
export type FrameProps = { layout: 'frame' };
export type GridLayoutProps = { layout: 'grid' };
export type StackProps = { layout: 'stack' };

// layout 固有の extra props を持つ型
export type FlowLayoutProps = { layout: 'flow'; flow?: CssValue };
export type FluidColsProps = { layout: 'fluidCols'; autoFill?: boolean };
export type SideMainProps = { layout: 'sideMain'; sideW?: CssValue; mainW?: CssValue };
export type SwitchColsProps = { layout: 'switchCols'; breakSize?: CssValue };

// ユニオン型の複雑性を抑えるため、固有 props なしのレイアウトはまとめる
type SimpleLayoutProps = {
	layout: 'box' | 'center' | 'cluster' | 'columns' | 'flex' | 'frame' | 'grid' | 'stack';
};

// 判別可能ユニオン（6メンバー）
export type LayoutSpecificProps = NoLayoutProps | SimpleLayoutProps | FlowLayoutProps | FluidColsProps | SideMainProps | SwitchColsProps;

// LayoutType は LayoutSpecificProps から導出（NoLayoutProps を除く）
export type LayoutType = Exclude<LayoutSpecificProps, NoLayoutProps>['layout'];

// LismProps に extends させるためのフラットなレイアウト関連 Props
export interface LayoutProps {
	layout?: LayoutType;
	// layout='sideMain' 固有 props
	sideW?: CssValue;
	mainW?: CssValue;
	// layout='fluidCols' 固有 props
	autoFill?: boolean;
	// layout='flow' 固有 props
	flow?: CssValue;
	// layout='switchCols' 固有 props
	breakSize?: CssValue;
}
