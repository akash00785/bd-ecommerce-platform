import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, newsletterTable } from "@workspace/db";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// Public: subscribe
router.post("/newsletter/subscribe", async (req, res): Promise<void> => {
  const { email } = req.body;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "সঠিক ইমেইল দিন" });
    return;
  }

  const existing = await db.select().from(newsletterTable).where(eq(newsletterTable.email, email));
  if (existing.length > 0) {
    if (existing[0].isActive) {
      res.status(200).json({ message: "আপনি আগে থেকেই সাবস্ক্রাইব করা আছেন" });
    } else {
      await db.update(newsletterTable).set({ isActive: true }).where(eq(newsletterTable.email, email));
      res.status(200).json({ message: "সাবস্ক্রিপশন পুনরায় সক্রিয় হয়েছে!" });
    }
    return;
  }

  await db.insert(newsletterTable).values({ email, isActive: true });
  res.status(201).json({ message: "সফলভাবে সাবস্ক্রাইব করা হয়েছে!" });
});

// Admin: list subscribers
router.get("/newsletter/subscribers", requireAdmin, async (_req, res): Promise<void> => {
  const subscribers = await db
    .select()
    .from(newsletterTable)
    .where(eq(newsletterTable.isActive, true))
    .orderBy(desc(newsletterTable.subscribedAt));

  res.json({
    total: subscribers.length,
    subscribers: subscribers.map(s => ({ id: s.id, email: s.email, subscribedAt: s.subscribedAt.toISOString() })),
  });
});

export default router;
