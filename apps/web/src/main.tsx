// Sentry deferred — loads after first paint to reduce initial bundle impact.
const idleCallback = window.requestIdleCallback || ((cb: () => void) => setTimeout(cb, 1));
idleCallback(() => { import('./lib/sentry-init').then(({ initSentry }) => initSentry()); });

import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
createRoot(document.getElementById('root')!).render(
  <App />
);
