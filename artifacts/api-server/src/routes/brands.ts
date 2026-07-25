import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, brandsTable } from "@workspace/db";
import { CreateBrandBody } from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/brands", async (_req, res): Promise<void> => {
  const brands = await db.select().from(brandsTable);
  res.json(brands);
});

router.post("/brands", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateBrandBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [created] = await db.insert(brandsTable).values(parsed.data).returning();
  res.status(201).json(created);
});

router.patch("/brands/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) { res.status(400).json({ error: "Invalid id" }); return; }
  const { name, slug, logo, description } = req.body;
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (logo !== undefined) updateData.logo = logo;
  if (description !== undefined) updateData.description = description;
  if (Object.keys(updateData).length === 0) { res.status(400).json({ error: "No fields to update" }); return; }
  const [updated] = await db.update(brandsTable).set(updateData).where(eq(brandsTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(updated);
});

router.delete("/brands/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(brandsTable).where(eq(brandsTable.id, id));
  res.status(204).send();
});

export default router;
