import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// VITE_API_URL → set this to your deployed API server URL on Vercel/Railway/Render
// e.g. https://your-api.railway.app
// If not set (local dev), API calls go to the same origin (proxied by Vite dev server).
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (apiUrl) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
