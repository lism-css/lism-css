import type { StyleWithCustomProps } from '../lib/types';

export interface TransformStyleProps {
	translate?: string;
	rotate?: string;
	scale?: string;
	transform?: string;
}

type TransformKeys = keyof TransformStyleProps;

export default function setMaybeTransformStyles<P extends object>(props: P): Omit<P, TransformKeys> & { style: StyleWithCustomProps } {
	// P extends object の制約のままでは transform 系プロパティにアクセスできないため内部でキャスト
	const { translate, rotate, scale, transform, style: inputStyle, ...rest } = props as P & TransformStyleProps & { style?: StyleWithCustomProps };
	const style: StyleWithCustomProps = inputStyle ?? {};

	if (translate) {
		style.translate = translate;
	}
	if (rotate) {
		style.rotate = rotate;
	}
	if (scale) {
		style.scale = scale;
	}
	if (transform) {
		style.transform = transform;
	}

	// スプレッド結果の型がジェネリクスの戻り値型と一致しないためキャスト
	return { ...rest, style } as Omit<P, TransformKeys> & { style: StyleWithCustomProps };
}
