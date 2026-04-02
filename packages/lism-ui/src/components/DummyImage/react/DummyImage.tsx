import { Lism, type LismComponentProps } from 'lism-css/react';

export default function DummyImage(props: LismComponentProps<'img'>) {
  return <Lism as="img" src="https://cdn.lism-css.com/dummy-image.jpg" width={600} height={400} alt="" {...props} />;
}
