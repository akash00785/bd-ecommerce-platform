// Plain JS entry — Vercel deploys this as the serverless handler.
// We import from the pre-built dist/app.mjs so Vercel never needs to
// TypeScript-compile our source (eliminating all TS2339 Response conflicts).
import app from '../dist/app.mjs';
export default app;
