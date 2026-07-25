import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { UpdateSiteSettingsBody } from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public: read site settings (used by storefront for branding, contact, etc.)
router.get("/settings", async (_req, res): Promise<void> => {
  const SENSITIVE_KEYS = ["smtp_password", "api_secret", "webhook_secret", "payment_key"];
  const settings = await db.select().from(siteSettingsTable);
  res.json(
    settings
      .filter((s) => !SENSITIVE_KEYS.includes(s.key))
      .map((s) => ({ key: s.key, value: s.value }))
  );
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
