export type AvatarProps = {
  size?: string;
  src?: string;
  /** イニシャルの生成元。alt 未指定時は代替テキストにも使う */
  name?: string;
  /** 代替テキスト。指定時は name より優先。'' で装飾扱い */
  alt?: string;
};

/** name / alt から、img の alt と src 未指定時のイニシャル表示に必要な値を求める */
export default function getAvatarProps({ name, alt }: Pick<AvatarProps, 'name' | 'alt'>) {
  const label = alt ?? name ?? '';
  // charAt(0) はサロゲートペア（絵文字等）を壊すためコードポイント単位で取る
  const initial = name ? ([...name][0] ?? '') : '';
  return {
    label,
    initial,
    // 表示する initial と label の両方があるときだけ画像として公開。空の span に aria-label だけ付けない
    initialAtts: initial && label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': 'true' as const },
  };
}
