import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, couponsTable } from "@workspace/db";
import { CreateCouponBody, ValidateCouponBody } from "@workspace/api-zod";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Admin: list all coupons
router.get("/coupons", requireAdmin, async (_req, res): Promise<void> => {
  const coupons = await db.select().from(couponsTable);
  res.json(coupons.map((c) => ({
    ...c,
    discountAmount: parseFloat(c.discountAmount),
    minOrderAmount: c.minOrderAmount ? parseFloat(c.minOrderAmount) : null,
  })));
});

// Public: validate a coupon (used during checkout)
router.post("/coupons/validate", async (req, res): Promise<void> => {
  const parsed = ValidateCouponBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const coupon = await db.select().from(couponsTable).where(eq(couponsTable.code, parsed.data.code)).limit(1);
  if (!coupon[0] || !coupon[0].active) { res.status(400).json({ error: "Invalid or expired coupon" }); return; }

  const c = coupon[0];
  if (c.expiryDate && new Date(c.expiryDate) < new Date()) {
    res.status(400).json({ error: "Coupon has expired" }); return;
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
  });
});

// Admin: create coupon
router.post("/coupons", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCouponBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

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
  });
});

export default router;
