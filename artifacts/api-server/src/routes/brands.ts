import { Router } from "express";
import { db, brandsTable } from "@workspace/db";
import { CreateBrandBody } from "@workspace/api-zod";

const router = Router();

router.get("/brands", async (_req, res): Promise<void> => {
  const brands = await db.select().from(brandsTable);
  res.json(brands);
});

router.post("/brands", async (req, res): Promise<void> => {
  const parsed = CreateBrandBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [created] = await db.insert(brandsTable).values(parsed.data).returning();
  res.status(201).json(created);
});

export default router;
