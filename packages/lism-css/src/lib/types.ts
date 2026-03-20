import { type CSSProperties } from 'react';

// CSS Custom Properties を含むスタイル型
export type StyleWithCustomProps = CSSProperties & Record<string, string | number | undefined>;
