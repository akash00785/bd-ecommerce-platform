import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, categoriesTable, productsTable } from "@workspace/db";
import {
  CreateCategoryBody,
  UpdateCategoryBody,
  UpdateCategoryParams,
  DeleteCategoryParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Public: list categories
router.get("/categories", async (_req, res): Promise<void> => {
  const categories = await db.select().from(categoriesTable);
  const counts = await db
    .select({ categoryId: productsTable.categoryId, count: sql<number>`count(*)` })
    .from(productsTable)
    .groupBy(productsTable.categoryId);
  const countMap = Object.fromEntries(counts.map((c) => [c.categoryId, Number(c.count)]));

  res.json(categories.map((c) => ({ ...c, productCount: countMap[c.id] ?? 0 })));
});

// Admin: create category
router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [created] = await db.insert(categoriesTable).values(parsed.data).returning();
  res.status(201).json({ ...created, productCount: 0 });
});

// Admin: update category
router.patch("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramParsed = UpdateCategoryParams.safeParse({ id: parseInt(rawId, 10) });
  if (!paramParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const bodyParsed = UpdateCategoryBody.safeParse(req.body);
  if (!bodyParsed.success) { res.status(400).json({ error: bodyParsed.error.message }); return; }
  const [updated] = await db.update(categoriesTable).set(bodyParsed.data).where(eq(categoriesTable.id, paramParsed.data.id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...updated, productCount: 0 });
});

// Admin: delete category
router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = DeleteCategoryParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(categoriesTable).where(eq(categoriesTable.id, parsed.data.id));
  res.status(204).send();
});

export default router;
