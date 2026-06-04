
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const rootElement = document.getElementById('sansarplus-app');
if (!rootElement) {
  throw new Error("Could not find root element 'sansarplus-app' to mount to");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register the service worker to enable strictly offline capabilities.
serviceWorkerRegistration.register();
