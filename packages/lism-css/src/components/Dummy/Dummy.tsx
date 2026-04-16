import { Lism, type LismComponentProps } from '../Lism';

/**
 * @deprecated DummyText (@lism-css/ui) を使用してください。
 */
export default function Dummy({ lang = 'en', ...props }: LismComponentProps & { lang?: string }) {
  const message =
    lang === 'ja'
      ? 'Lorem ipsum dolor sit amet... ⚠️Dummy は非推奨コンポーネントです。@lism-css/ui のDummyTextをご利用ください'
      : 'Lorem ipsum dolor sit amet... ⚠️Dummy is deprecated. Please use DummyText from @lism-css/ui';

  return (
    <Lism as="p" {...(props as LismComponentProps)}>
      {message}
    </Lism>
  );
}
