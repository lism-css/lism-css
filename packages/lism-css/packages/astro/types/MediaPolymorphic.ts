import type { HTMLAttributes } from 'astro/types';
import type { LocalImageProps, RemoteImageProps } from 'astro:assets';
import type { ImageOutputFormat } from 'astro';
import type { MediaAllowedTag } from 'lism-css/lib/types/allowedTags';

// Astro <Image /> / <Picture /> の props
type ImageProps = LocalImageProps | RemoteImageProps;

// Astro <Picture /> 固有の追加 props
type PictureExtraProps = {
  formats?: ImageOutputFormat[];
  fallbackFormat?: ImageOutputFormat;
  pictureAttributes?: HTMLAttributes<'picture'>;
};

// Astro の OmitIndexSignature を再現（インデックスシグネチャを除去して型を具体化する）
type OmitIndexSignature<T> = {
  [K in keyof T as object extends Record<K, unknown> ? never : K]: T[K];
};

// Polymorphic が除外する Astro 固有属性のキー（class:list は Polymorphic の挙動に合わせて残す）
type AstroBuiltinAttributeKeys = keyof Omit<astroHTML.JSX.AstroBuiltinAttributes, 'class:list'>;

// img / picture エントリを Astro コンポーネントの props で拡張した DefinedIntrinsicElements
type MediaIntrinsicElements = Omit<astroHTML.JSX.DefinedIntrinsicElements, 'img' | 'picture'> & {
  img: ImageProps;
  picture: ImageProps & PictureExtraProps;
};

type MediaPolymorphicAttributes<P extends { as: MediaAllowedTag }> = Omit<P, 'as'> & {
  as?: P['as'];
} & Omit<OmitIndexSignature<MediaIntrinsicElements[P['as']]>, AstroBuiltinAttributeKeys>;

export type MediaPolymorphic<P extends { as: MediaAllowedTag }> = MediaPolymorphicAttributes<Omit<P, 'as'> & { as: NonNullable<P['as']> }>;
