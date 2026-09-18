import type { HTMLAttributes } from 'astro/types';
import type { LocalImageProps, RemoteImageProps } from 'astro:assets';
import type { ImageOutputFormat } from 'astro';
import type { MediaAllowedTag } from 'lism-css/lib/types/allowedTags';

// Astro の OmitIndexSignature を再現（インデックスシグネチャを除去して型を具体化する）
// Astro の Polymorphic 内の OmitIndexSignature は単一オブジェクト型に適用されるため非分配版で問題ないが、
// ここでは ImageProps = LocalImageProps | RemoteImageProps という union に適用されるため、
// T extends unknown で union の各メンバーに個別適用させる必要がある（distributive conditional type）
// これにより inferSize (RemoteImageProps のみ) など片方にしかない props も正しく型解決される
//
// 非分配: F<{ [k: string]: any; a: 1 } | { [k: string]: any; a: 1; b: 2 }> → keyof で共通キーだけ残る → { a: 1 }
// 分配:   F<{ [k: string]: any; a: 1 } | { [k: string]: any; a: 1; b: 2 }> → { a: 1 } | { a: 1; b: 2 }
type OmitIndexSignature<T> = T extends unknown
  ? {
      // object extends Record<K, unknown> で「任意の object がキー K を持つか」を判定
      // インデックスシグネチャ由来のキー（string, number 等）→ true → never で除外
      // 具体的なリテラルキー（"src", "alt" 等）→ false → K を保持
      [K in keyof T as object extends Record<K, unknown> ? never : K]: T[K];
    }
  : never;

// union の各メンバーに個別に Omit を適用するヘルパー（OmitIndexSignature と同じ理由）
// Omit<{ a: 1 } | { a: 1; b: 2 }, never>             → { a: 1 }（b が消える）
// DistributiveOmit<{ a: 1 } | { a: 1; b: 2 }, never> → { a: 1 } | { a: 1; b: 2 }（b が残る）
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

// Astro <Image /> / <Picture /> の props
type ImageProps = LocalImageProps | RemoteImageProps;

// Astro <Picture /> 固有の追加 props
type PictureExtraProps = {
  formats?: ImageOutputFormat[];
  fallbackFormat?: ImageOutputFormat;
  pictureAttributes?: HTMLAttributes<'picture'>;
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
} & DistributiveOmit<OmitIndexSignature<MediaIntrinsicElements[P['as']]>, AstroBuiltinAttributeKeys>;

export type MediaPolymorphic<P extends { as: MediaAllowedTag }> = MediaPolymorphicAttributes<Omit<P, 'as'> & { as: NonNullable<P['as']> }>;
