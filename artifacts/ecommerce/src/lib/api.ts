/**
 * Returns the API base URL (without trailing slash).
 *
 * Priority:
 *   1. VITE_API_URL env var — set this in production when the API server is
 *      deployed separately (e.g. VITE_API_URL=https://api.myshop.vercel.app).
 *   2. Empty string — fetch calls become relative URLs (/api/...) which hit
 *      the same origin. Works in development via Vite proxy and in any
 *      deployment where the frontend and API share the same domain.
 *
 * NOTE: BASE_URL is intentionally NOT used as a fallback here because it
 * represents the Vite frontend base path (e.g. /ecommerce/), not the API
 * server address. Using it would produce broken URLs like /ecommerce/api/...
 * which the SPA catch-all rewrites to index.html (HTML, not JSON).
 */
export function getApiBase(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) return apiUrl.replace(/\/+$/, '');
  return '';
}
