import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, bannersTable } from "@workspace/db";
import { CreateBannerBody, DeleteBannerParams } from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Public: list active banners
router.get("/banners", async (_req, res): Promise<void> => {
  const banners = await db.select().from(bannersTable).where(eq(bannersTable.active, true));
  res.json(banners.map((b) => ({ ...b, active: b.active ?? true })));
});

// Admin: create banner
router.post("/banners", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBannerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [created] = await db.insert(bannersTable).values(parsed.data).returning();
  res.status(201).json({ ...created, active: created.active ?? true });
});

// Admin: delete banner
router.delete("/banners/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeleteBannerParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(bannersTable).where(eq(bannersTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
