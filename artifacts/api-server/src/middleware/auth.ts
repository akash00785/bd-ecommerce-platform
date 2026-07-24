import { RequestHandler } from "express";
import { logger } from "../lib/logger";
import admin from "firebase-admin";

// -----------------------------------------------------------------------
// Firebase Admin initialisation (lazy, safe to call multiple times)
// -----------------------------------------------------------------------

let _adminReady = false;

function ensureAdmin(): void {
  if (_adminReady || admin.apps.length > 0) {
    _adminReady = true;
    return;
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  try {
    if (raw) {
      const cert = JSON.parse(raw);
      admin.initializeApp({ credential: admin.credential.cert(cert) });
    } else if (projectId) {
      // Works when GOOGLE_APPLICATION_CREDENTIALS is set or running on GCP
      admin.initializeApp({ projectId });
    } else {
      logger.warn(
        "Firebase Admin not configured. Set FIREBASE_SERVICE_ACCOUNT (JSON) " +
        "or FIREBASE_PROJECT_ID + GOOGLE_APPLICATION_CREDENTIALS. " +
        "Admin-protected endpoints will reject all requests."
      );
    }
    _adminReady = true;
  } catch (err) {
    logger.error({ err }, "Failed to initialise Firebase Admin SDK");
    _adminReady = true; // mark true so we don't retry on every request
  }
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function getAdminUids(): string[] {
  return (process.env.ADMIN_UIDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

type DecodedToken = admin.auth.DecodedIdToken;

async function verifyToken(authHeader: string | undefined): Promise<DecodedToken | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  if (!token) return null;

  ensureAdmin();

  if (admin.apps.length === 0) return null; // SDK not configured

  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    return null;
  }
}

function isAdmin(decoded: DecodedToken): boolean {
  // Support Firebase Custom Claims  { admin: true }
  if ((decoded as any).admin === true) return true;
  // Support ADMIN_UIDS env var
  return getAdminUids().includes(decoded.uid);
}

// -----------------------------------------------------------------------
// Middleware: requireAuth
// Attaches req.user (DecodedIdToken) or responds 401.
// -----------------------------------------------------------------------

export const requireAuth: RequestHandler = async (req, res, next) => {
  const decoded = await verifyToken(req.headers.authorization);
  if (!decoded) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  (req as any).user = decoded;
  next();
};

// -----------------------------------------------------------------------
// Middleware: requireAdmin
// Verifies auth AND checks admin claim / ADMIN_UIDS list.
// -----------------------------------------------------------------------

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const decoded = await verifyToken(req.headers.authorization);
  if (!decoded) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (!isAdmin(decoded)) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  (req as any).user = decoded;
  next();
};
