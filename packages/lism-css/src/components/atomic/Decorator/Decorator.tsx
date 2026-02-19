// import React from 'react';
import { Lism } from '../../Lism';
import getProps, { type DecoratorProps } from './getProps';

export default function Decorator(props: DecoratorProps) {
	return <Lism {...getProps(props)} />;
}
