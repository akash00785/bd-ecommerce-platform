import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import { CreateCouponBody, ValidateCouponBody } from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Admin: list all coupons
// Fix #6C: Include usageLimit and usedCount in response
router.get("/coupons", requireAdmin, async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable);
  res.json(coupons.map((c) => ({
    ...c,
    discountAmount: parseFloat(c.discountAmount),
    minOrderAmount: c.minOrderAmount ? parseFloat(c.minOrderAmount) : null,
    usageLimit: c.usageLimit ?? null,
    usedCount: c.usedCount ?? 0,
  })));
});

// Public: validate a coupon (used during checkout)
// Fix #3: Add usageLimit check; include usageLimit & usedCount in response
router.post("/coupons/validate", async (req, res): Promise<void> => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const coupon = await db.select().from(couponsTable).where(eq(couponsTable.code, parsed.data.code)).limit(1);
  if (!coupon[0] || !coupon[0].active) { res.status(400).json({ error: "Invalid or expired coupon" }); return; }

  const c = coupon[0];
  if (c.expiryDate && new Date(c.expiryDate) < new Date()) {
    res.status(400).json({ error: "Coupon has expired" }); return;
  }

  // usageLimit check — prevent validating an exhausted coupon
  if (c.usageLimit != null && (c.usedCount ?? 0) >= c.usageLimit) {
    res.status(400).json({ error: "এই কুপন কোডের ব্যবহার সীমা শেষ হয়ে গেছে।" }); return;
  }

  if (c.minOrderAmount && parsed.data.orderAmount != null && parsed.data.orderAmount < parseFloat(c.minOrderAmount)) {
    res.status(400).json({ error: `Minimum order amount is ৳${c.minOrderAmount}` }); return;
  }

  res.json({
    id: c.id,
    code: c.code,
    discountType: c.discountType,
    discountAmount: parseFloat(c.discountAmount),
    minOrderAmount: c.minOrderAmount ? parseFloat(c.minOrderAmount) : null,
    expiryDate: c.expiryDate,
    active: c.active,
    usageLimit: c.usageLimit ?? null,
    usedCount: c.usedCount ?? 0,
  });
});

// Admin: create coupon
// Fix #6A: Check for duplicate code before insert
// Fix #11: Reject percentage discount > 100
router.post("/coupons", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCouponBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  // percentage cap validation
  if (parsed.data.discountType === "percentage" && Number(parsed.data.discountAmount) > 100) {
    res.status(400).json({ error: "Percentage ডিসকাউন্ট সর্বোচ্চ ১০০% হতে পারে।" }); return;
  }

  // duplicate code check
  const existing = await db
    .select({ id: couponsTable.id })
    .from(couponsTable)
    .where(eq(couponsTable.code, parsed.data.code))
    .limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "এই কোডের কুপন আগে থেকেই আছে।" }); return;
  }

  const { discountAmount, minOrderAmount, ...rest } = parsed.data;
  const [created] = await db.insert(couponsTable).values({
    ...rest,
    discountAmount: String(discountAmount),
    minOrderAmount: minOrderAmount != null ? String(minOrderAmount) : null,
  }).returning();

  res.status(201).json({
    ...created,
    discountAmount: parseFloat(created.discountAmount),
    minOrderAmount: created.minOrderAmount ? parseFloat(created.minOrderAmount) : null,
    usageLimit: created.usageLimit ?? null,
    usedCount: created.usedCount ?? 0,
  });
});

// Admin: delete coupon
// Fix #6B: New DELETE endpoint
router.delete("/coupons/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "Invalid id" }); return;
  }
  const deleted = await db
    .delete(couponsTable)
    .where(eq(couponsTable.id, id))
    .returning({ id: couponsTable.id });
  if (deleted.length === 0) {
    res.status(404).json({ error: "Coupon not found" }); return;
  }
  res.status(204).send();
});

export default router;
