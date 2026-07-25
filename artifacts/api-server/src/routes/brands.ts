import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, brandsTable, productsTable } from "@workspace/db";
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

// Admin: delete brand
router.delete("/brands/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }

  // Safety check: prevent orphaning products that belong to this brand
  const productCheck = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(eq(productsTable.brandId, id))
    .limit(1);
  if (productCheck.length > 0) {
    res.status(409).json({ error: "এই ব্র্যান্ডে প্রোডাক্ট আছে। আগে প্রোডাক্টগুলো সরান বা অন্য ব্র্যান্ডে নিন।" });
    return;
  }

  await db.delete(brandsTable).where(eq(brandsTable.id, id));
  res.status(204).send();
});

export default router;
