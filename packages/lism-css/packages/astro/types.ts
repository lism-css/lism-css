// export interface LismClass {
// 	b?: string;
// 	c?: string;
// 	l?: string;
// 	e?: string;
// }
export interface LismStyle {
	[key: string]: number | string; // 任意のプロパティを受け取る
}

export interface exProps {
	[key: string]: any;
}

export interface LismProps {
	lismClass?: string;
	_lismClass?: string[];
	lismStyle?: LismStyle;
	lismState?: string[];
	skipState?: boolean;
	as?: any;
	tag?: string;
	variant?: string;
	// lismState?: ;
	// style
	exProps?: exProps;
	[key: string]: any;
}
