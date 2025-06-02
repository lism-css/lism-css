// import React from 'react';
import { Lism } from '../Lism';
import getProps from './getProps';

// 縦書きの時どうする？
export default function Spacer(props) {
	return <Lism skipState {...getProps(props)} />;
}
