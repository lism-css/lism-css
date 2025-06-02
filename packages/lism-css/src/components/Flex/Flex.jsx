// import React from 'react';
import { Lism } from '../Lism';
import { getFlexProps } from './getProps';

export default function Flex(props) {
	return <Lism {...getFlexProps(props)} />;
}
