// import React from 'react';
import { Lism } from 'lism-css/react';
import { getTabProps } from '../getProps';

export default function Tab({ tabId = 'tab', index = 0, isActive = false, ...props }) {
  const controlId = `${tabId}-${index}`;

  return <Lism {...getTabProps(props)} role="tab" aria-controls={controlId} aria-selected={isActive ? 'true' : 'false'} />;
}
