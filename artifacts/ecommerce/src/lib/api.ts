/**
 * Returns the API base URL (without trailing slash).
 *
 * In development (Replit), the shared proxy routes /api → API server, so
 * relative paths work and this returns ''.
 *
 * In production where the API server is deployed separately, set
 * VITE_API_URL to the full API server URL:
 *   e.g. VITE_API_URL=https://api.myshop.vercel.app
 */
export function getApiBase(): string {
  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl) return apiUrl.replace(/\/+$/, '');
  return import.meta.env.BASE_URL.replace(/\/$/, '');
}
