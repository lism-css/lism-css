import { Lism } from 'lism-css/react';
import { defaultProps } from '../getProps';

// CSS疑似要素（::before / ::after）でアイコンを描画するコンポーネント
export default function AccIcon(props) {
	return <Lism {...defaultProps.icon} {...props} />;
}
