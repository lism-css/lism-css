// import React from 'react';
import { Lism } from '../Lism';
import getProps from './getProps';

export default function Decorator(props) {
	return <Lism {...getProps(props)} />;
}
