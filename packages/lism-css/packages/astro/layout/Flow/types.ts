import type { AstroLismFixedLayoutProps } from '../../types';
import type { FlowLayoutProps } from 'lism-css/lib/types/LayoutProps';

export type AstroFlowProps = AstroLismFixedLayoutProps & Omit<FlowLayoutProps, 'layout'>;
