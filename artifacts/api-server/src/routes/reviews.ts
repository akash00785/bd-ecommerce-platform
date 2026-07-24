import { Router } from "express";
import { eq, desc, avg, count, sql } from "drizzle-orm";
import { db, reviewsTable, productsTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// -----------------------------------------------------------------------
// Input sanitisation helpers
// -----------------------------------------------------------------------

/** Strip all control characters and common XSS-prone sequences from a string. */
function sanitiseText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  // Remove control characters (except newlines) and trim
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/** Validates a Bangladeshi mobile number (01XXXXXXXXX) or returns null. */
function sanitisePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/\s+/g, "");
  if (/^01[3-9]\d{8}$/.test(cleaned)) return cleaned;
  return null;
}

// -----------------------------------------------------------------------
// Public: get approved reviews for a product
// -----------------------------------------------------------------------
router.get("/products/:id/reviews", async (req, res): Promise<void> => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(sql`${reviewsTable.productId} = ${productId} AND ${reviewsTable.isApproved} = true`)
    .orderBy(desc(reviewsTable.createdAt))
    .limit(50);

  const [stats] = await db
    .select({
      avgRating: avg(reviewsTable.rating),
      total: count(),
    })
    .from(reviewsTable)
    .where(sql`${reviewsTable.productId} = ${productId} AND ${reviewsTable.isApproved} = true`);

  res.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      customerName: r.customerName,
      rating: r.rating,
      comment: r.comment,
      isVerified: r.isVerified,
      createdAt: r.createdAt.toISOString(),
    })),
    avgRating: stats.avgRating ? Number(Number(stats.avgRating).toFixed(1)) : 0,
    total: Number(stats.total),
  });
});

// -----------------------------------------------------------------------
// Public: submit a review (goes to moderation queue)
// -----------------------------------------------------------------------
router.post("/products/:id/reviews", async (req, res): Promise<void> => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId <= 0) {
    res.status(400).json({ error: "Invalid product id" });
    return;
  }

  // Sanitise all user-supplied inputs before saving
  const customerName = sanitiseText(req.body?.customerName, 100);
  const comment = sanitiseText(req.body?.comment, 1000);
  const customerPhone = sanitisePhone(req.body?.customerPhone);
  const rating = Number(req.body?.rating);

  if (!customerName) {
    res.status(400).json({ error: "নাম আবশ্যক" });
    return;
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ error: "রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে" });
    return;
  }

  const [review] = await db
    .insert(reviewsTable)
    .values({
      productId,
      customerName,
      customerPhone,
      rating,
      comment: comment || null,
      isVerified: false,
      isApproved: false,
    })
    .returning();

  // Recalculate product rating from approved reviews only
  const [stats] = await db
    .select({ avgRating: avg(reviewsTable.rating), total: count() })
    .from(reviewsTable)
    .where(sql`${reviewsTable.productId} = ${productId} AND ${reviewsTable.isApproved} = true`);

  await db
    .update(productsTable)
    .set({
      rating: String(Number(Number(stats.avgRating ?? 0).toFixed(2))),
      reviewCount: Number(stats.total),
    })
    .where(eq(productsTable.id, productId));

  res.status(201).json({
    id: review.id,
    productId: review.productId,
    customerName: review.customerName,
    rating: review.rating,
    comment: review.comment,
    isVerified: review.isVerified,
    createdAt: review.createdAt.toISOString(),
  });
});

// -----------------------------------------------------------------------
// Admin: moderation queue (pending reviews)
// -----------------------------------------------------------------------
router.get("/reviews/admin", requireAdmin, async (_req, res): Promise<void> => {
  const reviews = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.isApproved, false))
    .orderBy(desc(reviewsTable.createdAt));

  res.json({
    reviews: reviews.map((review) => ({
      ...review,
      createdAt: review.createdAt.toISOString(),
    })),
  });
});

// -----------------------------------------------------------------------
// Admin: approve or reject a review
// -----------------------------------------------------------------------
router.patch("/reviews/:id/moderation", requireAdmin, async (req, res): Promise<void> => {
  const id = Number(req.params.id);
  const approved = req.body?.approved;

  if (!Number.isInteger(id) || id <= 0 || typeof approved !== "boolean") {
    res.status(400).json({ error: "Invalid review moderation request" });
    return;
  }

  const [review] = approved
    ? await db.update(reviewsTable).set({ isApproved: true }).where(eq(reviewsTable.id, id)).returning()
    : await db.delete(reviewsTable).where(eq(reviewsTable.id, id)).returning();

  if (!review) {
    res.status(404).json({ error: "Review not found" });
    return;
  }

  // Recalculate product rating after moderation
  if (review.productId) {
    const [stats] = await db
      .select({ avgRating: avg(reviewsTable.rating), total: count() })
      .from(reviewsTable)
      .where(sql`${reviewsTable.productId} = ${review.productId} AND ${reviewsTable.isApproved} = true`);

    await db
      .update(productsTable)
      .set({
        rating: String(Number(Number(stats.avgRating ?? 0).toFixed(2))),
        reviewCount: Number(stats.total),
      })
      .where(eq(productsTable.id, review.productId));
  }

  res.json({ ...review, createdAt: review.createdAt.toISOString() });
});

export default router;
