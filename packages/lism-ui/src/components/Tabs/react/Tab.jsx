// import React from 'react';
import { Lism } from 'lism-css/react';

export default function Tab({ tabId = 'tab', index = 0, isActive = false, ...props }) {
  const controlId = `${tabId}-${index}`;

  return (
    <Lism as="button" lismClass="c--tabs_tab" set="plain" role="tab" aria-controls={controlId} aria-selected={isActive ? 'true' : 'false'} {...props} />
  );
}
