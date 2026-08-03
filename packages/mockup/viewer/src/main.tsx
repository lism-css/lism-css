/*
 * Viewer entry point.
 *
 * The CSS import order below is part of the contract and must not be reordered:
 *   1. `lism-css/full.css`        — framework base, primitives and property classes
 *   2. `@lism-css/ui/style.css`   — `@lism-css/ui` component styles
 *   3. `virtual:lism-mockup/tokens.css` — tokens built from the mockup's `tokens.json`
 *   4. viewer / page code         — page-owned CSS is imported by the page modules
 *
 * Token overrides only take effect when they come after the framework CSS.
 */
import 'lism-css/full.css';
import '@lism-css/ui/style.css';
import 'virtual:lism-mockup/tokens.css';
import './viewer.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const container = document.getElementById('root');
if (!container) {
  throw new Error('[lism-mockup] Viewer root element (#root) was not found in index.html.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
