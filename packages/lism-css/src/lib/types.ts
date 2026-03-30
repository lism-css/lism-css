import type * as CSS from 'csstype';

// CSS Custom Properties を含むスタイル型（camelCase / kebab-case 両対応）
export type StyleWithCustomProps = CSS.Properties<string | number> &
	CSS.PropertiesHyphen<string | number> &
	Record<`--${string}`, string | number | undefined>;
