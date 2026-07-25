import { getBaseUrl } from '@workspace/api-client-react';

/**
 * Returns the API base URL (without trailing slash) for raw fetch() calls.
 *
 * Single source of truth — reads from the same place as the generated API
 * client (setBaseUrl / getBaseUrl), so both systems always agree on the URL.
 *
 * Resolution order:
 *   1. VITE_API_URL build-time env var (set this in Vercel when the API is
 *      deployed on a separate domain, e.g. VITE_API_URL=https://api.myshop.vercel.app)
 *   2. Runtime base URL set via setBaseUrl() (same value as above, applied to
 *      the generated client in main.tsx — kept in sync automatically)
 *   3. '' (empty string) — fetch calls become relative /api/... paths that hit
 *      the same origin.  Works in local dev via Vite proxy.
 */
export function getApiBase(): string {
  // Build-time env var — available at compile time and always reliable.
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/+$/, '');

  // Runtime value — set by setBaseUrl() in main.tsx from the same env var.
  // Exists as a safety net; in practice both resolve to the same string.
  const runtimeUrl = getBaseUrl();
  if (runtimeUrl) return runtimeUrl;

  // No API URL configured — use same-origin relative paths (local dev / monorepo deploy).
  return '';
}
