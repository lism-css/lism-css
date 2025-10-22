import * as React from 'react';

// Base types
export interface LismCSSValue {
	base?: string | number;
	sm?: string | number;
	md?: string | number;
	lg?: string | number;
	xl?: string | number;
	[key: string]: string | number | undefined;
}

export type ResponsiveValue<T> = T | LismCSSValue | (T | null)[];

export interface LismBaseProps {
	// Layout
	p?: ResponsiveValue<string | number>;
	px?: ResponsiveValue<string | number>;
	py?: ResponsiveValue<string | number>;
	pl?: ResponsiveValue<string | number>;
	pr?: ResponsiveValue<string | number>;
	pt?: ResponsiveValue<string | number>;
	pb?: ResponsiveValue<string | number>;
	'px-s'?: ResponsiveValue<string | number>;
	'px-e'?: ResponsiveValue<string | number>;
	'py-s'?: ResponsiveValue<string | number>;
	'py-e'?: ResponsiveValue<string | number>;

	m?: ResponsiveValue<string | number>;
	mx?: ResponsiveValue<string | number>;
	my?: ResponsiveValue<string | number>;
	ml?: ResponsiveValue<string | number>;
	mr?: ResponsiveValue<string | number>;
	mt?: ResponsiveValue<string | number>;
	mb?: ResponsiveValue<string | number>;
	'mx-s'?: ResponsiveValue<string | number>;
	'mx-e'?: ResponsiveValue<string | number>;
	'my-s'?: ResponsiveValue<string | number>;
	'my-e'?: ResponsiveValue<string | number>;

	// Sizing
	w?: ResponsiveValue<string | number>;
	h?: ResponsiveValue<string | number>;
	'min-w'?: ResponsiveValue<string | number>;
	'min-h'?: ResponsiveValue<string | number>;
	'max-w'?: ResponsiveValue<string | number>;
	'max-h'?: ResponsiveValue<string | number>;

	// Display
	d?: ResponsiveValue<string>;
	pos?: ResponsiveValue<string>;
	z?: ResponsiveValue<string | number>;
	inset?: ResponsiveValue<string | number>;
	t?: ResponsiveValue<string | number>;
	b?: ResponsiveValue<string | number>;
	l?: ResponsiveValue<string | number>;
	r?: ResponsiveValue<string | number>;

	// Flexbox & Grid
	gap?: ResponsiveValue<string | number>;
	g?: ResponsiveValue<string | number>;
	'g-x'?: ResponsiveValue<string | number>;
	'g-y'?: ResponsiveValue<string | number>;
	ai?: ResponsiveValue<string>;
	jc?: ResponsiveValue<string>;
	ac?: ResponsiveValue<string>;
	ji?: ResponsiveValue<string>;
	pi?: ResponsiveValue<string>;
	pc?: ResponsiveValue<string>;
	as?: ResponsiveValue<string>;
	js?: ResponsiveValue<string>;
	aslf?: ResponsiveValue<string>;
	jslf?: ResponsiveValue<string>;
	ord?: ResponsiveValue<string | number>;

	// Typography
	fz?: ResponsiveValue<string | number>;
	lh?: ResponsiveValue<string | number>;
	ff?: ResponsiveValue<string>;
	fw?: ResponsiveValue<string | number>;
	ta?: ResponsiveValue<string>;
	td?: ResponsiveValue<string>;
	tt?: ResponsiveValue<string>;
	ts?: ResponsiveValue<string>;
	tsh?: ResponsiveValue<string>;
	lts?: ResponsiveValue<string | number>;
	whs?: ResponsiveValue<string>;
	wbr?: ResponsiveValue<string>;

	// Colors
	c?: ResponsiveValue<string>;
	bgc?: ResponsiveValue<string>;
	bdc?: ResponsiveValue<string>;
	keycolor?: ResponsiveValue<string>;

	// Border
	bd?: ResponsiveValue<string>;
	bdw?: ResponsiveValue<string | number>;
	bds?: ResponsiveValue<string>;
	bdl?: ResponsiveValue<string>;
	bdr?: ResponsiveValue<string>;
	bdt?: ResponsiveValue<string>;
	bdb?: ResponsiveValue<string>;
	bdx?: ResponsiveValue<string>;
	bdy?: ResponsiveValue<string>;

	// Border Radius
	bdrs?: ResponsiveValue<string | number>;
	radius?: ResponsiveValue<string | number>;
	radii?: ResponsiveValue<string | number>;

	// Other
	aspect?: ResponsiveValue<string>;
	ar?: ResponsiveValue<string>;
	op?: ResponsiveValue<string | number>;
	of?: ResponsiveValue<string>;
	ov?: ResponsiveValue<string>;
	transform?: ResponsiveValue<string>;
	trs?: ResponsiveValue<string>;
	filter?: ResponsiveValue<string>;
	bxsh?: ResponsiveValue<string>;
	v?: ResponsiveValue<string>;

	gc?: ResponsiveValue<string>;
	gr?: ResponsiveValue<string>;
	ga?: ResponsiveValue<string>;
	gcs?: ResponsiveValue<string | number>;
	gce?: ResponsiveValue<string | number>;
	grs?: ResponsiveValue<string | number>;
	gre?: ResponsiveValue<string | number>;

	// Logical properties
	is?: ResponsiveValue<string | number>;
	ie?: ResponsiveValue<string | number>;
	bs?: ResponsiveValue<string | number>;
	be?: ResponsiveValue<string | number>;

	// Hover
	hov?: string | Record<string, any>;

	// Context props
	css?: Record<string, any>;
	// passVars?: string | string[];

	// Utility classes
	_?: string | string[];

	// State classes
	flowGap?: boolean | string;
	hasGutter?: boolean | string;
	isContainer?: boolean | string;
	isLayer?: boolean;
	isLinkBox?: boolean;

	// HTML attributes
	className?: string;
	style?: React.CSSProperties;
	id?: string;

	// Other HTML attributes
	[key: string]: any;
}

export interface LismProps extends LismBaseProps {
	as?: React.ElementType;
	tag?: string;
	exProps?: Record<string, any>;
	children?: React.ReactNode;
	variant?: string;
	lismClass?: string;
	setClass?: string;
	lismState?: string[];
	forwardedRef?: React.Ref<any>;
}

// Component Props
export interface BoxProps extends LismProps {}
export interface FlexProps extends LismProps {
	_flex?: string;
	fxw?: ResponsiveValue<string>;
	fxd?: ResponsiveValue<string>;
	fxf?: ResponsiveValue<string>;
}

export interface StackProps extends LismProps {}
export interface GridProps extends LismProps {
	_grid?: string;
	gd?: ResponsiveValue<string>;
	gt?: ResponsiveValue<string>;
	gta?: ResponsiveValue<string>;
	gtc?: ResponsiveValue<string>;
	gtr?: ResponsiveValue<string>;
	gaf?: ResponsiveValue<string>;
	gar?: ResponsiveValue<string>;
	gac?: ResponsiveValue<string>;
}

export interface WithSideProps extends LismProps {
	sideW?: ResponsiveValue<string>;
	mainW?: ResponsiveValue<string>;
}
export interface CenterProps extends GridProps {}
export interface ColumnsProps extends GridProps {
	colSize?: ResponsiveValue<string>;
	autoType?: ResponsiveValue<string>;
}
export interface FrameProps extends LismProps {}
export interface ContainerProps extends LismProps {
	size?: ResponsiveValue<string | boolean>;
	layout?: React.ElementType;
}
export interface LayerProps extends LismProps {
	layout?: React.ElementType;
	backdropFilter?: ResponsiveValue<string>;
}
export interface LinkBoxProps extends LismProps {
	layout?: React.ElementType;
	href?: string;
}
export interface IconProps extends LismProps {
	icon?: string | { as: React.ElementType } | React.ReactNode;
	scale?: ResponsiveValue<string | number>;
	offset?: ResponsiveValue<string | number>;
	label?: string;
	viewBox?: string;
}
export interface SpacerProps {
	h?: ResponsiveValue<string | number>;
	w?: ResponsiveValue<string | number>;
}
export interface DecoratorProps extends LismProps {
	size?: ResponsiveValue<string | number>;
}
export interface DividerProps extends LismProps {}

// Text components
export interface TextProps extends LismProps {
	tag?: string;
}
export interface LinkProps extends LismProps {
	href?: string;
	target?: string;
	rel?: string;
	openNewTab?: boolean;
}
export interface MediaProps extends LismProps {
	src?: string;
	alt?: string;
	width?: string | number;
	height?: string | number;
	loading?: 'lazy' | 'eager';
	decoding?: 'sync' | 'async' | 'auto';
}

// Dummy component
export interface DummyProps extends LismProps {
	tag?: string;
	pre?: string;
	length?: 's' | 'm' | 'l';
	lang?: 'en' | 'ja';
	offset?: number;
}

// Accordion
export interface AccordionProps extends LismProps {
	allowMultiple?: boolean;
	defaultIndex?: number | number[];
	duration?: number;
}

export interface AccordionHeaderProps extends FlexProps {}
export interface AccordionLabelProps extends LismProps {}
export interface AccordionBodyProps extends LismProps {
	flowGap?: boolean | string;
	innerProps?: LismProps;
}

// Tabs
export interface TabsProps extends LismProps {
	tabId?: string;
	defaultIndex?: number;
	listProps?: LismProps;
}

export interface TabListProps extends LismProps {}
export interface TabProps extends LismProps {}
export interface TabPanelProps extends LismProps {}

// Modal
export interface ModalProps extends LismProps {
	layout?: React.ElementType;
	duration?: ResponsiveValue<string | number>;
	offset?: ResponsiveValue<string | number>;
}

// Export components
export const Lism: React.FC<LismProps>;
export const HTML: React.FC<LismProps>;
export const Box: React.FC<LismProps>;
export const Flow: React.FC<LismProps>;
export const Flex: React.FC<FlexProps>;
export const FlexItem: React.FC<FlexItemProps>;
export const Cluster: React.FC<FlexProps>;
export const Stack: React.FC<StackProps>;
export const Grid: React.FC<GridProps>;
export const WithSide: React.FC<WithSideProps>;
export const Center: React.FC<CenterProps>;
export const Columns: React.FC<ColumnsProps>;
export const Frame: React.FC<FrameProps>;
export const Container: React.FC<ContainerProps>;
export const Layer: React.FC<LayerProps>;
export const LinkBox: React.FC<LinkBoxProps>;
export const Icon: React.FC<IconProps>;
export const Spacer: React.FC<SpacerProps>;
export const Decorator: React.FC<DecoratorProps>;
export const Divider: React.FC<DividerProps>;
export const Text: React.FC<TextProps>;
export const Link: React.FC<LinkProps>;
export const Media: React.FC<MediaProps>;
export const Dummy: React.FC<DummyProps>;

export const Accordion: React.FC<AccordionProps> & {
	Header: React.FC<AccordionHeaderProps>;
	Label: React.FC<AccordionLabelProps>;
	Body: React.FC<AccordionBodyProps>;
};
export const Tabs: React.FC<TabsProps> & {
	List: React.FC<TabListProps>;
	Tab: React.FC<TabProps>;
	Panel: React.FC<TabPanelProps>;
};
export const Modal: React.FC<ModalProps>;

// Re-export all as default
export default {
	Lism,
	HTML,
	Box,
	Flex,
	FlexItem,
	Cluster,
	Stack,
	Grid,
	WithSide,
	Center,
	Columns,
	Frame,
	Container,
	Layer,
	LinkBox,
	Icon,
	Spacer,
	Decorator,
	Divider,
	Text,
	Link,
	Media,
	Dummy,
	Accordion,
	Tabs,
	Modal,
};
