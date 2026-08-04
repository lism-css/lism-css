/*
 * Viewer entry point.
 *
 * The CSS import order below is part of the contract and must not be reordered:
 *   1. `lism-css/main.css`        — framework base, primitives and property classes
 *   2. `@lism-css/ui/style.css`   — `@lism-css/ui` component styles
 *   3. `virtual:lism-mockup/tokens.css` — tokens built from the mockup's `tokens.json`
 *   4. page code                  — page-owned CSS is imported by the page modules
 *
 * Token overrides only take effect when they come after the framework CSS.
 *
 * The viewer ships no stylesheet of its own: its chrome is written with Lism Props
 * / Property Classes, so it follows the mockup's tokens instead of overriding them.
 */
import 'lism-css/main.css';
import '@lism-css/ui/style.css';
import 'virtual:lism-mockup/tokens.css';

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
