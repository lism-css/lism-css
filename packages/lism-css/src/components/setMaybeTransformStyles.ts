import type { StyleWithCustomProps } from '../lib/types';

export type TransformStyleProps = {
	translate?: string;
	rotate?: string;
	scale?: string;
	transform?: string;
};

type TransformKeys = keyof TransformStyleProps;

export default function setMaybeTransformStyles<P extends object>(props: P): Omit<P, TransformKeys> & { style: StyleWithCustomProps } {
	const { translate, rotate, scale, transform, style: inputStyle, ...rest } = props as P & TransformStyleProps & { style?: StyleWithCustomProps };
	const style: StyleWithCustomProps = inputStyle ?? {};

	if (translate) style.translate = translate;
	if (rotate) style.rotate = rotate;
	if (scale) style.scale = scale;
	if (transform) style.transform = transform;

	return { ...rest, style } as Omit<P, TransformKeys> & { style: StyleWithCustomProps };
}
