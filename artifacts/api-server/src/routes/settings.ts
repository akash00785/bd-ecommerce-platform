import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { UpdateSiteSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public: read site settings — only keys explicitly marked as public_ are returned
// Fix #4: Filter to public_ prefix only to prevent leaking sensitive config values
router.get("/settings", async (_req, res): Promise<void> => {
  const settings = await db.select().from(siteSettingsTable);
  // Only expose keys that are explicitly marked as public
  const publicSettings = settings.filter((s) => s.key.startsWith("public_"));
  res.json(publicSettings.map((s) => ({ key: s.key, value: s.value })));
});

// Admin: read all settings (including non-public ones)
router.get("/settings/all", requireAdmin, async (_req, res): Promise<void> => {
  const settings = await db.select().from(siteSettingsTable);
  res.json(settings.map((s) => ({ key: s.key, value: s.value })));
});

// Admin: update settings
router.patch("/settings", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateSiteSettingsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  for (const { key, value } of parsed.data.settings) {
    await db
      .insert(siteSettingsTable)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteSettingsTable.key, set: { value } });
  }

  const updated = await db.select().from(siteSettingsTable);
  res.json(updated.map((s) => ({ key: s.key, value: s.value })));
});

export default router;
