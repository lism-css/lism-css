import atts from '../../../lib/helper/atts';
import getFilterProps, { type FilterProps } from '../../getFilterProps';
import setMaybeTransformStyles, { type TransformStyleProps } from '../../setMaybeTransformStyles';
import type { LismProps } from '../../../lib/getLismProps';
import type { StyleWithCustomProps } from '../../../lib/types';

export type DecoratorOwnProps = {
	size?: string;
	clipPath?: string;
	boxSizing?: string;
};

export type DecoratorProps = LismProps & TransformStyleProps & FilterProps & DecoratorOwnProps;

// translate → rotate → scale
export default function getDecoratorProps({ lismClass, size, clipPath, boxSizing, style: outerStyle, ...rest }: DecoratorProps): LismProps {
	const style: StyleWithCustomProps = outerStyle ?? {};

	// rest の型が複雑な union になり TS2590 が発生するため、object にキャストしてから渡す
	const props = getFilterProps(setMaybeTransformStyles(rest as object) as unknown as LismProps & FilterProps);

	if (clipPath) {
		style.clipPath = clipPath;
	}
	if (boxSizing) {
		style.boxSizing = boxSizing as StyleWithCustomProps['boxSizing'];
	}

	if (size) {
		props.ar = '1/1';
		props.w = size;
		// style['--size'] = size;
	}

	props.style = style;

	const defaultProps: LismProps = {
		lismClass: atts(lismClass, `a--decorator`),
		'aria-hidden': 'true',
	};

	return Object.assign(defaultProps, props);
}
